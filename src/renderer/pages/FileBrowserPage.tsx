import React, { useState, useCallback } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { Badge } from '../components/shared/Badge'
import { GCodePreview } from '../components/files/GCodePreview'
import { usePrinter } from '../context/PrinterContext'
import { formatDuration, formatFilament } from '../lib/formatters'

export function FileBrowserPage() {
  const { connectionStatus, printState, startPrint } = usePrinter()
  const [files, setFiles] = useState<GCodeAnalysis[]>([])
  const [selectedFile, setSelectedFile] = useState<GCodeAnalysis | null>(null)
  const [gcodeLines, setGcodeLines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const isConnected = connectionStatus === 'connected'
  const canPrint = isConnected && printState === 'idle'

  const loadFile = async (filePath: string) => {
    if (!window.api) return
    setLoading(true)
    try {
      const analysis = await window.api.files.analyzeGCode(filePath)
      setFiles((prev) => {
        // Prevent duplicates
        const existing = prev.findIndex((f) => f.filePath === filePath)
        if (existing >= 0) {
          const next = [...prev]
          next[existing] = analysis
          return next
        }
        return [analysis, ...prev]
      })
      setSelectedFile(analysis)
      // Load G-code lines for preview
      if (window.api?.files?.readGCode) {
        const lines = await window.api.files.readGCode(filePath)
        setGcodeLines(lines)
      }
    } catch (err) {
      console.error('Failed to analyze G-code:', err)
    }
    setLoading(false)
  }

  const handleOpenFile = async () => {
    if (!window.api) return
    const filePath = await window.api.files.openDialog()
    if (filePath) loadFile(filePath)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.path) loadFile(file.path)
  }, [])

  const handlePrint = (analysis: GCodeAnalysis) => {
    if (canPrint) startPrint(analysis.filePath)
  }

  return (
    <PageLayout
      title="Files"
      subtitle="Load and manage G-code files"
      actions={
        <Button onClick={handleOpenFile} disabled={loading}>
          + Open File
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: files.length > 0 ? 'var(--space-lg)' : '60px var(--space-lg)',
            textAlign: 'center',
            color: dragOver ? 'var(--accent-primary)' : 'var(--text-disabled)',
            background: dragOver ? 'rgba(0, 210, 211, 0.05)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: files.length > 0 ? '0.85rem' : '1rem' }}>
            {dragOver ? 'Drop G-code file here' : 'Drag & drop G-code files here or click "Open File"'}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {files.map((file) => (
              <Card
                key={file.filePath}
                style={{
                  cursor: 'pointer',
                  border: selectedFile?.filePath === file.filePath
                    ? '1px solid var(--accent-primary)'
                    : '1px solid var(--border)',
                  padding: 'var(--space-md)',
                  gap: 'var(--space-sm)',
                }}
              >
                <div
                  onClick={() => setSelectedFile(file)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.fileName}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{file.totalLayers} layers</span>
                      <span>{formatDuration(file.estimatedSeconds)}</span>
                      <span>{formatFilament(file.filamentUsedMm)}</span>
                      <Badge variant="info">{file.slicerName}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => handlePrint(file)} disabled={!canPrint} small>
                    Print
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Selected File Details */}
        {selectedFile && (
          <Card title="File Details" icon="📄">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              {[
                { label: 'Total Lines', value: selectedFile.totalLines.toLocaleString() },
                { label: 'Printable Lines', value: selectedFile.printableLines.toLocaleString() },
                { label: 'Layers', value: selectedFile.totalLayers.toString() },
                { label: 'Est. Time', value: formatDuration(selectedFile.estimatedSeconds) },
                { label: 'Filament', value: formatFilament(selectedFile.filamentUsedMm) },
                { label: 'Filament Weight', value: `${selectedFile.filamentUsedG}g` },
                { label: 'Slicer', value: selectedFile.slicerName },
                { label: 'Hotend Temp', value: `${selectedFile.hotendTemp}°C` },
                { label: 'Bed Temp', value: `${selectedFile.bedTemp}°C` },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* G-code Preview */}
        {selectedFile && gcodeLines.length > 0 && (
          <GCodePreview lines={gcodeLines} />
        )}
      </div>
    </PageLayout>
  )
}
