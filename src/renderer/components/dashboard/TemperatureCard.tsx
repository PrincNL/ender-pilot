import React from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'
import { formatTemp } from '../../lib/formatters'

const presets = [
  { name: 'PLA', hotend: 200, bed: 60 },
  { name: 'PETG', hotend: 230, bed: 80 },
  { name: 'ABS', hotend: 240, bed: 100 },
]

export function TemperatureCard() {
  const { temperatures, connectionStatus, sendCommand } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  const preheat = (hotend: number, bed: number) => {
    sendCommand(`M104 S${hotend}`)
    sendCommand(`M140 S${bed}`)
  }

  const coolDown = () => {
    sendCommand('M104 S0')
    sendCommand('M140 S0')
    sendCommand('M107')
  }

  const TempDisplay = ({
    label,
    current,
    target,
    color,
  }: {
    label: string
    current: number
    target: number
    color: string
  }) => (
    <div
      style={{
        flex: 1,
        padding: 'var(--space-md)',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
        {isConnected ? formatTemp(current) : '--°C'}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: 2 }}>
        Target: {target > 0 ? formatTemp(target) : 'Off'}
      </div>
    </div>
  )

  return (
    <Card title="Temperature" icon="🌡">
      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <TempDisplay
          label="Hotend"
          current={temperatures?.hotend ?? 0}
          target={temperatures?.hotendTarget ?? 0}
          color="var(--chart-hotend)"
        />
        <TempDisplay
          label="Bed"
          current={temperatures?.bed ?? 0}
          target={temperatures?.bedTarget ?? 0}
          color="var(--chart-bed)"
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {presets.map((p) => (
          <Button
            key={p.name}
            variant="secondary"
            small
            onClick={() => preheat(p.hotend, p.bed)}
            disabled={!isConnected}
          >
            {p.name}
          </Button>
        ))}
        <Button variant="ghost" small onClick={coolDown} disabled={!isConnected}>
          Cool Down
        </Button>
      </div>
    </Card>
  )
}
