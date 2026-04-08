import React from 'react'
import { Card } from '../shared/Card'
import { usePrinter } from '../../context/PrinterContext'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  color: string
  onChange: (val: number) => void
  disabled: boolean
  displayValue?: string
}

function ControlSlider({ label, value, min, max, unit, color, onChange, disabled, displayValue }: SliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>
          {displayValue ?? `${Math.round(value)}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          accentColor: color,
          height: 6,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-disabled)' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export function SpeedFanControls() {
  const { connectionStatus, fanPower, speedOverride, flowOverride, setFanSpeed, setPrintSpeed, setFlowRate } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  return (
    <Card title="Speed & Fan" icon="💨">
      <ControlSlider
        label="Print Speed"
        value={speedOverride}
        min={10}
        max={300}
        unit="%"
        color="var(--accent-primary)"
        onChange={setPrintSpeed}
        disabled={!isConnected}
      />
      <ControlSlider
        label="Flow Rate"
        value={flowOverride}
        min={50}
        max={200}
        unit="%"
        color="var(--accent-info)"
        onChange={setFlowRate}
        disabled={!isConnected}
      />
      <ControlSlider
        label="Fan Speed"
        value={fanPower}
        min={0}
        max={255}
        unit=""
        color="var(--accent-secondary)"
        onChange={setFanSpeed}
        disabled={!isConnected}
        displayValue={`${Math.round((fanPower / 255) * 100)}% (${fanPower})`}
      />

      {/* Quick fan presets */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
        {[
          { label: 'Off', val: 0 },
          { label: '25%', val: 64 },
          { label: '50%', val: 128 },
          { label: '75%', val: 191 },
          { label: '100%', val: 255 },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => setFanSpeed(p.val)}
            disabled={!isConnected}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${fanPower === p.val ? 'var(--accent-primary)' : 'var(--border)'}`,
              background: fanPower === p.val ? 'var(--accent-primary)' : 'transparent',
              color: fanPower === p.val ? '#0d1117' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.4,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </Card>
  )
}
