import React, { useState } from 'react'
import { Button } from '../shared/Button'
import { usePrinter } from '../../context/PrinterContext'

export function PrintControls() {
  const { printState, pausePrint, resumePrint, cancelPrint } = usePrinter()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleCancel = () => {
    if (confirmCancel) {
      cancelPrint()
      setConfirmCancel(false)
    } else {
      setConfirmCancel(true)
      setTimeout(() => setConfirmCancel(false), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
      {printState === 'printing' && (
        <Button variant="secondary" onClick={pausePrint}>
          ⏸ Pause
        </Button>
      )}

      {printState === 'paused' && (
        <Button variant="success" onClick={resumePrint}>
          ▶ Resume
        </Button>
      )}

      {(printState === 'printing' || printState === 'paused') && (
        <Button variant="danger" onClick={handleCancel}>
          {confirmCancel ? '⚠ Confirm Cancel?' : '⏹ Cancel'}
        </Button>
      )}
    </div>
  )
}
