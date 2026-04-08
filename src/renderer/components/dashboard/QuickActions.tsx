import React from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

export function QuickActions() {
  const { connectionStatus, sendCommand } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  const actions = [
    { label: 'Home All', cmd: 'G28', icon: '🏠' },
    { label: 'Home X', cmd: 'G28 X', icon: '↔' },
    { label: 'Home Y', cmd: 'G28 Y', icon: '↕' },
    { label: 'Home Z', cmd: 'G28 Z', icon: '⬆' },
    { label: 'Disable Motors', cmd: 'M84', icon: '🔓' },
    { label: 'Report Position', cmd: 'M114', icon: '📍' },
  ]

  return (
    <Card title="Quick Actions" icon="⚡">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
        {actions.map((a) => (
          <Button
            key={a.cmd}
            variant="secondary"
            small
            onClick={() => sendCommand(a.cmd)}
            disabled={!isConnected}
          >
            <span>{a.icon}</span> {a.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
