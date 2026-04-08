import React from 'react'
import { Card } from '../shared/Card'
import { Badge } from '../shared/Badge'
import { ProgressBar } from '../shared/ProgressBar'
import { usePrinter } from '../../context/PrinterContext'
import { formatDuration } from '../../lib/formatters'
import { PrintControls } from '../print/PrintControls'

const stateLabels: Record<PrintState, { text: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  idle: { text: 'Idle', variant: 'neutral' },
  printing: { text: 'Printing', variant: 'success' },
  pausing: { text: 'Pausing...', variant: 'warning' },
  paused: { text: 'Paused', variant: 'warning' },
  cancelling: { text: 'Cancelling...', variant: 'error' },
  error: { text: 'Error', variant: 'error' },
  completed: { text: 'Completed', variant: 'info' },
}

export function PrintProgressCard() {
  const { printState, progress } = usePrinter()
  const state = stateLabels[printState]
  const isActive = printState === 'printing' || printState === 'paused' || printState === 'pausing'

  return (
    <Card title="Print Status" icon="🖨">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge variant={state.variant} dot>
          {state.text}
        </Badge>
        {progress && isActive && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progress.fileName}</span>
        )}
      </div>

      {isActive && progress ? (
        <>
          <ProgressBar value={progress.percentage} showLabel />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>Layer</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {progress.currentLayer}/{progress.totalLayers || '?'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>Elapsed</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatDuration(progress.elapsedSeconds)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>Remaining</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {formatDuration(progress.estimatedSecondsRemaining)}
              </div>
            </div>
          </div>

          <PrintControls />
        </>
      ) : (
        <div
          style={{
            padding: 'var(--space-lg)',
            textAlign: 'center',
            color: 'var(--text-disabled)',
            fontSize: '0.85rem',
          }}
        >
          {printState === 'completed' ? 'Print completed successfully!' : 'No active print job'}
        </div>
      )}
    </Card>
  )
}
