import React, { useState } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

export function EmergencyCard() {
  const {
    connectionStatus, emergencyStop, disableMotors, sendCommand,
    setHotendTemp, setBedTemp, setFanSpeed, savePrinterSettings,
  } = usePrinter()
  const isConnected = connectionStatus === 'connected'
  const [confirmReset, setConfirmReset] = useState(false)

  const handleFactoryReset = () => {
    if (confirmReset) {
      sendCommand('M502')  // Factory reset
      sendCommand('M500')  // Save
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <Card title="Controls" icon="🛑">
      {/* Emergency Stop */}
      <button
        onClick={emergencyStop}
        disabled={!isConnected}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--accent-error)',
          background: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--accent-error)',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: isConnected ? 'pointer' : 'not-allowed',
          opacity: isConnected ? 1 : 0.4,
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.05em',
          transition: 'all 0.15s ease',
        }}
      >
        EMERGENCY STOP (M112)
      </button>

      {/* Quick actions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        <Button variant="secondary" small onClick={disableMotors} disabled={!isConnected}>
          🔓 Motors Off
        </Button>
        <Button variant="secondary" small onClick={() => { setHotendTemp(0); setBedTemp(0); setFanSpeed(0) }} disabled={!isConnected}>
          ❄ Cool Down All
        </Button>
        <Button variant="secondary" small onClick={() => sendCommand('M106 S255')} disabled={!isConnected}>
          💨 Fan Max
        </Button>
        <Button variant="secondary" small onClick={() => sendCommand('M107')} disabled={!isConnected}>
          🔇 Fan Off
        </Button>
        <Button variant="secondary" small onClick={() => sendCommand('M600')} disabled={!isConnected}>
          🔄 Filament Change
        </Button>
        <Button variant="secondary" small onClick={() => sendCommand('M81')} disabled={!isConnected}>
          ⏻ Power Off (PSU)
        </Button>
      </div>

      {/* EEPROM */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
        <Button variant="success" small onClick={savePrinterSettings} disabled={!isConnected} style={{ flex: 1 }}>
          💾 Save to EEPROM
        </Button>
        <Button
          variant="danger"
          small
          onClick={handleFactoryReset}
          disabled={!isConnected}
          style={{ flex: 1 }}
        >
          {confirmReset ? '⚠ Confirm Reset?' : '🔄 Factory Reset'}
        </Button>
      </div>
    </Card>
  )
}
