import React, { useState } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

const PROBE_POINTS = [
  { label: 'Front Left', x: 30, y: 30 },
  { label: 'Front Right', x: 190, y: 30 },
  { label: 'Back Right', x: 190, y: 190 },
  { label: 'Back Left', x: 30, y: 190 },
  { label: 'Center', x: 110, y: 110 },
]

export function BedLevelingCard() {
  const { connectionStatus, zOffset, adjustZOffset, startAutoLevel, homeAxes, jogMove, sendCommand } = usePrinter()
  const isConnected = connectionStatus === 'connected'
  const [leveling, setLeveling] = useState(false)

  const moveToPoint = (x: number, y: number) => {
    sendCommand(`G1 Z5 F600`)
    sendCommand(`G1 X${x} Y${y} F3000`)
    sendCommand(`G1 Z0.2 F300`)
  }

  const handleAutoLevel = async () => {
    setLeveling(true)
    homeAxes()
    setTimeout(() => {
      startAutoLevel()
      // G29 takes a while, auto-reset after 3 min
      setTimeout(() => setLeveling(false), 180000)
    }, 15000)
  }

  return (
    <Card title="Bed Leveling" icon="📐">
      {/* Z-Offset */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-md)',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Z-Offset</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            {zOffset.toFixed(2)}mm
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <Button variant="secondary" small onClick={() => adjustZOffset(-0.05)} disabled={!isConnected}>-0.05</Button>
          <Button variant="secondary" small onClick={() => adjustZOffset(-0.01)} disabled={!isConnected}>-0.01</Button>
          <Button variant="secondary" small onClick={() => adjustZOffset(0.01)} disabled={!isConnected}>+0.01</Button>
          <Button variant="secondary" small onClick={() => adjustZOffset(0.05)} disabled={!isConnected}>+0.05</Button>
        </div>
      </div>

      {/* Auto bed leveling */}
      <Button
        onClick={handleAutoLevel}
        disabled={!isConnected || leveling}
        style={{ width: '100%' }}
      >
        {leveling ? 'Auto Leveling in progress...' : 'Start Auto Bed Leveling (G29)'}
      </Button>

      {/* Manual level points */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: 4 }}>Manual Level Points</div>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxWidth: 200, margin: '0 auto' }}>
        {/* Bed representation */}
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-input)',
        }} />
        {PROBE_POINTS.map((p) => {
          const left = `${(p.x / 220) * 100}%`
          const bottom = `${(p.y / 220) * 100}%`
          return (
            <button
              key={p.label}
              onClick={() => moveToPoint(p.x, p.y)}
              disabled={!isConnected}
              title={p.label}
              style={{
                position: 'absolute',
                left,
                bottom,
                transform: 'translate(-50%, 50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                background: 'var(--bg-secondary)',
                color: 'var(--accent-primary)',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                opacity: isConnected ? 1 : 0.4,
                fontSize: '0.6rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {p.label === 'Center' ? 'C' : p.label.split(' ').map(w => w[0]).join('')}
            </button>
          )
        })}
      </div>

      <Button variant="ghost" small onClick={() => sendCommand('M500')} disabled={!isConnected}>
        Save Z-Offset to EEPROM
      </Button>
    </Card>
  )
}
