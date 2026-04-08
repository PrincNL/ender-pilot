import React from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { ProgressBar } from '../shared/ProgressBar'
import { usePrinter } from '../../context/PrinterContext'
import { formatDuration, formatDate, formatTemp } from '../../lib/formatters'

export function ResumeDialog() {
  const { recovery, resumeRecovery, discardRecovery, connectionStatus } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  if (!recovery) return null

  const percentage = recovery.totalLines > 0 ? (recovery.currentLine / recovery.totalLines) * 100 : 0
  const fileMissing = !recovery.filePath

  return (
    <Modal open={true} onClose={discardRecovery} title="Resume Interrupted Print?" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* File info */}
        <div
          style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            {recovery.fileName}
          </div>
          <ProgressBar value={percentage} showLabel />
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Last Active</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {formatDate(recovery.timestamp)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Print Time</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {formatDuration(recovery.elapsedSeconds)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Layer</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{recovery.currentLayer}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Position</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              Z: {recovery.position.z.toFixed(1)}mm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Hotend</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--chart-hotend)' }}>
              {formatTemp(recovery.hotendTemp)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>Bed</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--chart-bed)' }}>
              {formatTemp(recovery.bedTemp)}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {fileMissing && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-error)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              fontSize: '0.8rem',
              color: 'var(--accent-error)',
            }}
          >
            G-code file not found. The original file may have been moved or deleted.
          </div>
        )}

        {!isConnected && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--accent-warning)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              fontSize: '0.8rem',
              color: 'var(--accent-warning)',
            }}
          >
            Connect to printer first before resuming.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={discardRecovery}>
            Discard
          </Button>
          <Button onClick={resumeRecovery} disabled={fileMissing || !isConnected}>
            Resume Print
          </Button>
        </div>
      </div>
    </Modal>
  )
}
