import React, { useState, useEffect } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { Badge } from '../components/shared/Badge'
import { formatDuration, formatDate } from '../lib/formatters'

const resultBadge: Record<string, { text: string; variant: 'success' | 'warning' | 'error' }> = {
  completed: { text: 'Completed', variant: 'success' },
  cancelled: { text: 'Cancelled', variant: 'warning' },
  failed: { text: 'Failed', variant: 'error' },
}

export function HistoryPage() {
  const [history, setHistory] = useState<PrintHistoryEntry[]>([])

  useEffect(() => {
    if (!window.api) return
    window.api.history.getAll().then(setHistory)
  }, [])

  return (
    <PageLayout title="Print History" subtitle="Past print jobs">
      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--text-disabled)',
            padding: '80px 0',
            fontSize: '0.9rem',
          }}
        >
          No print history yet. Start your first print!
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  color: 'var(--text-disabled)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>File</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Duration</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => {
                const badge = resultBadge[entry.result] || resultBadge.failed
                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {entry.fileName}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {formatDate(entry.startedAt)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {formatDuration(entry.durationSeconds)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  )
}
