import React, { useState } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

const STEP_SIZES = [0.1, 1, 10, 50]
const XY_SPEED = 3000  // mm/min
const Z_SPEED = 600

export function JogControls() {
  const { connectionStatus, position, jogMove, homeAxes, queryPosition } = usePrinter()
  const isConnected = connectionStatus === 'connected'
  const [step, setStep] = useState(10)

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    background: active ? 'var(--accent-primary)' : 'var(--bg-input)',
    color: active ? '#0d1117' : 'var(--text-primary)',
    border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    cursor: isConnected ? 'pointer' : 'not-allowed',
    opacity: isConnected ? 1 : 0.4,
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    transition: 'all 0.1s ease',
  })

  return (
    <Card title="Move" icon="🕹">
      {/* Position readout */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--accent-error)', fontWeight: 600 }}>X </span>
          <span style={{ color: 'var(--text-primary)' }}>{position ? position.x.toFixed(1) : '--'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>Y </span>
          <span style={{ color: 'var(--text-primary)' }}>{position ? position.y.toFixed(1) : '--'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--accent-info)', fontWeight: 600 }}>Z </span>
          <span style={{ color: 'var(--text-primary)' }}>{position ? position.z.toFixed(2) : '--'}</span>
        </div>
        <button
          onClick={queryPosition}
          disabled={!isConnected}
          style={{ ...btnStyle(), width: 'auto', height: 24, fontSize: '0.7rem', padding: '0 8px' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        {/* XY Pad */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>XY Axis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 48px 48px', gridTemplateRows: '48px 48px 48px', gap: 4 }}>
            <div />
            <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('Y', step, XY_SPEED)}>▲</button>
            <div />
            <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('X', -step, XY_SPEED)}>◄</button>
            <button style={{ ...btnStyle(), fontSize: '0.7rem' }} disabled={!isConnected} onClick={() => homeAxes('X Y')}>⌂</button>
            <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('X', step, XY_SPEED)}>►</button>
            <div />
            <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('Y', -step, XY_SPEED)}>▼</button>
            <div />
          </div>
        </div>

        {/* Z Axis */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>Z Axis</div>
          <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('Z', step, Z_SPEED)}>▲</button>
          <button style={{ ...btnStyle(), fontSize: '0.7rem' }} disabled={!isConnected} onClick={() => homeAxes('Z')}>⌂</button>
          <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('Z', -step, Z_SPEED)}>▼</button>
        </div>

        {/* Extruder */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 2 }}>Extruder</div>
          <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('E', step > 10 ? 10 : step, 200)}>▲</button>
          <div style={{ ...btnStyle(), background: 'transparent', border: 'none', fontSize: '0.65rem', color: 'var(--text-disabled)' }}>E</div>
          <button style={btnStyle()} disabled={!isConnected} onClick={() => jogMove('E', -(step > 10 ? 10 : step), 600)}>▼</button>
        </div>
      </div>

      {/* Step size selector */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginRight: 4 }}>Step:</span>
        {STEP_SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${step === s ? 'var(--accent-primary)' : 'var(--border)'}`,
              background: step === s ? 'var(--accent-primary)' : 'transparent',
              color: step === s ? '#0d1117' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {s}mm
          </button>
        ))}
      </div>

      {/* Home buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Button variant="secondary" small onClick={() => homeAxes()} disabled={!isConnected}>Home All</Button>
        <Button variant="secondary" small onClick={() => homeAxes('X')} disabled={!isConnected}>Home X</Button>
        <Button variant="secondary" small onClick={() => homeAxes('Y')} disabled={!isConnected}>Home Y</Button>
        <Button variant="secondary" small onClick={() => homeAxes('Z')} disabled={!isConnected}>Home Z</Button>
      </div>
    </Card>
  )
}
