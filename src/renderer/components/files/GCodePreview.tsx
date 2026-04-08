import React, { useRef, useEffect, useState } from 'react'
import { Card } from '../shared/Card'

interface GCodePreviewProps {
  lines: string[]
  bedSizeX?: number
  bedSizeY?: number
}

interface GCodeMove {
  x: number
  y: number
  extrude: boolean
}

function parseMovesFromGCode(lines: string[], maxLines = 50000): GCodeMove[] {
  const moves: GCodeMove[] = []
  let x = 0, y = 0, e = 0, lastE = 0, absolute = true

  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    const line = lines[i].split(';')[0].trim()
    if (!line) continue

    if (line === 'G90') { absolute = true; continue }
    if (line === 'G91') { absolute = false; continue }

    if (line.startsWith('G0') || line.startsWith('G1')) {
      const xMatch = line.match(/X([\d.-]+)/)
      const yMatch = line.match(/Y([\d.-]+)/)
      const eMatch = line.match(/E([\d.-]+)/)

      if (xMatch) x = absolute ? parseFloat(xMatch[1]) : x + parseFloat(xMatch[1])
      if (yMatch) y = absolute ? parseFloat(yMatch[1]) : y + parseFloat(yMatch[1])
      if (eMatch) {
        lastE = e
        e = absolute ? parseFloat(eMatch[1]) : e + parseFloat(eMatch[1])
      }

      if (xMatch || yMatch) {
        moves.push({ x, y, extrude: eMatch ? e > lastE : false })
      }
    }
  }

  return moves
}

export function GCodePreview({ lines, bedSizeX = 220, bedSizeY = 220 }: GCodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [layer, setLayer] = useState<'all' | 'first' | 'last'>('all')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || lines.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const padding = 20
    const scaleX = (w - padding * 2) / bedSizeX
    const scaleY = (h - padding * 2) / bedSizeY

    // Clear
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, w, h)

    // Draw bed outline
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.strokeRect(padding, padding, bedSizeX * scaleX, bedSizeY * scaleY)

    // Draw grid
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 0.5
    for (let gx = 0; gx <= bedSizeX; gx += 20) {
      ctx.beginPath()
      ctx.moveTo(padding + gx * scaleX, padding)
      ctx.lineTo(padding + gx * scaleX, padding + bedSizeY * scaleY)
      ctx.stroke()
    }
    for (let gy = 0; gy <= bedSizeY; gy += 20) {
      ctx.beginPath()
      ctx.moveTo(padding, padding + gy * scaleY)
      ctx.lineTo(padding + bedSizeX * scaleX, padding + gy * scaleY)
      ctx.stroke()
    }

    // Parse and draw moves
    const moves = parseMovesFromGCode(lines)
    if (moves.length === 0) return

    ctx.lineWidth = 0.5

    let prevX = 0, prevY = 0
    for (const move of moves) {
      const sx = padding + move.x * scaleX
      const sy = padding + (bedSizeY - move.y) * scaleY // Flip Y

      if (move.extrude) {
        ctx.strokeStyle = '#00d2d3'
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(padding + prevX * scaleX, padding + (bedSizeY - prevY) * scaleY)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      } else {
        ctx.strokeStyle = '#374151'
        ctx.globalAlpha = 0.15
        ctx.beginPath()
        ctx.moveTo(padding + prevX * scaleX, padding + (bedSizeY - prevY) * scaleY)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }

      prevX = move.x
      prevY = move.y
    }

    ctx.globalAlpha = 1

    // Draw origin marker
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(padding, padding + bedSizeY * scaleY, 3, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = '#475569'
    ctx.font = '10px Inter, sans-serif'
    ctx.fillText('0,0', padding - 2, padding + bedSizeY * scaleY + 14)
    ctx.fillText(`${bedSizeX},${bedSizeY}`, padding + bedSizeX * scaleX - 40, padding - 6)

  }, [lines, bedSizeX, bedSizeY, layer])

  if (lines.length === 0) return null

  return (
    <Card title="G-code Preview" icon="🗺">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{
          width: '100%',
          maxHeight: 400,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      />
      <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', textAlign: 'center' }}>
        Top-down toolpath view -- teal = extrusion, gray = travel moves
      </div>
    </Card>
  )
}
