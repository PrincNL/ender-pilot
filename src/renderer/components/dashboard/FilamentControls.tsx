import React, { useState } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

const FILAMENT_PRESETS = [
  { name: 'PLA', temp: 200, color: '#10b981' },
  { name: 'PETG', temp: 230, color: '#3b82f6' },
  { name: 'ABS', temp: 240, color: '#f59e0b' },
  { name: 'TPU', temp: 220, color: '#8b5cf6' },
]

export function FilamentControls() {
  const { connectionStatus, temperatures, loadFilament, unloadFilament, setHotendTemp } = usePrinter()
  const isConnected = connectionStatus === 'connected'
  const [selectedPreset, setSelectedPreset] = useState(FILAMENT_PRESETS[0])
  const [loadLength, setLoadLength] = useState(50)
  const hotendTemp = temperatures?.hotend ?? 0

  const isHotEnough = hotendTemp >= selectedPreset.temp - 10

  return (
    <Card title="Filament" icon="🧵">
      {/* Material selector */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        {FILAMENT_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setSelectedPreset(p)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${selectedPreset.name === p.name ? p.color : 'var(--border)'}`,
              background: selectedPreset.name === p.name ? `${p.color}20` : 'var(--bg-input)',
              color: selectedPreset.name === p.name ? p.color : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              textAlign: 'center',
            }}
          >
            <div>{p.name}</div>
            <div style={{ fontSize: '0.65rem', marginTop: 2, opacity: 0.7 }}>{p.temp}°C</div>
          </button>
        ))}
      </div>

      {/* Load length */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Length</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {loadLength}mm
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={150}
          step={10}
          value={loadLength}
          onChange={(e) => setLoadLength(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: selectedPreset.color }}
        />
      </div>

      {/* Status indicator */}
      {isConnected && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          background: isHotEnough ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${isHotEnough ? 'var(--accent-success)' : 'var(--accent-warning)'}`,
          fontSize: '0.8rem',
          color: isHotEnough ? 'var(--accent-success)' : 'var(--accent-warning)',
        }}>
          {isHotEnough
            ? `Hotend ready at ${Math.round(hotendTemp)}°C`
            : `Hotend at ${Math.round(hotendTemp)}°C - needs ${selectedPreset.temp}°C (will preheat automatically)`
          }
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Button
          variant="primary"
          onClick={() => loadFilament(selectedPreset.temp, loadLength)}
          disabled={!isConnected}
          style={{ flex: 1 }}
        >
          ▼ Load
        </Button>
        <Button
          variant="secondary"
          onClick={() => unloadFilament(selectedPreset.temp, loadLength)}
          disabled={!isConnected}
          style={{ flex: 1 }}
        >
          ▲ Unload
        </Button>
      </div>

      {/* Preheat only */}
      <Button
        variant="ghost"
        small
        onClick={() => setHotendTemp(selectedPreset.temp)}
        disabled={!isConnected}
      >
        Preheat to {selectedPreset.temp}°C
      </Button>
    </Card>
  )
}
