import React, { useState, useEffect } from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { Badge } from '../shared/Badge'
import { usePrinter } from '../../context/PrinterContext'

// Known 3D printer USB chip identifiers
const PRINTER_CHIPS: Record<string, string> = {
  '1a86': 'CH340',   // Most Creality printers
  '0403': 'FTDI',    // Some older printers
  '2341': 'Arduino',
  '1d50': 'Marlin',
}

function getPortLabel(p: PortInfo): { label: string; isPrinter: boolean } {
  const vid = p.vendorId?.toLowerCase() || ''
  const pid = p.productId?.toLowerCase() || ''
  const mfg = p.manufacturer?.toLowerCase() || ''

  // CH340 = Creality Ender 3 V3 SE
  if (vid === '1a86' && pid === '7523') {
    return { label: `${p.path} - Ender 3 V3 SE (CH340)`, isPrinter: true }
  }
  if (mfg.includes('ch340') || mfg.includes('wch')) {
    return { label: `${p.path} - 3D Printer (CH340)`, isPrinter: true }
  }
  if (PRINTER_CHIPS[vid]) {
    return { label: `${p.path} - ${PRINTER_CHIPS[vid]} (${p.manufacturer || 'Unknown'})`, isPrinter: true }
  }

  return { label: `${p.path} - ${p.manufacturer || p.friendlyName || 'Unknown device'}`, isPrinter: false }
}

// Extend PortInfo to include friendlyName from serialport
declare global {
  interface PortInfo {
    friendlyName?: string
  }
}

export function ConnectionCard() {
  const { connectionStatus, connect, disconnect } = usePrinter()
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [selectedPort, setSelectedPort] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoDetected, setAutoDetected] = useState<string | null>(null)

  const refreshPorts = async () => {
    if (!window.api) return
    const list = await window.api.serial.listPorts()
    setPorts(list)

    // Auto-detect and select Creality port
    const creality = await window.api.serial.findCreality()
    setAutoDetected(creality)
    if (creality && !selectedPort) {
      setSelectedPort(creality)
    } else if (list.length > 0 && !selectedPort) {
      setSelectedPort(list[0].path)
    }
  }

  useEffect(() => {
    refreshPorts()
  }, [])

  const handleConnect = async () => {
    if (!selectedPort) return
    setLoading(true)
    try {
      await connect(selectedPort, 115200)
    } catch (err) {
      console.error('Connection failed:', err)
    }
    setLoading(false)
  }

  const handleDisconnect = async () => {
    setLoading(true)
    await disconnect()
    setLoading(false)
  }

  const isConnected = connectionStatus === 'connected'
  const badgeVariant = isConnected ? 'success' : connectionStatus === 'connecting' ? 'warning' : connectionStatus === 'error' ? 'error' : 'neutral'

  return (
    <Card title="Connection" icon="🔌">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge variant={badgeVariant} dot>
          {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting' : connectionStatus === 'error' ? 'Error' : 'Offline'}
        </Badge>
        {autoDetected && !isConnected && (
          <Badge variant="success">Printer detected</Badge>
        )}
      </div>

      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: `1px solid ${autoDetected === selectedPort ? 'var(--accent-success)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {ports.length === 0 && <option value="">No ports found</option>}
              {ports.map((p) => {
                const { label, isPrinter } = getPortLabel(p)
                return (
                  <option key={p.path} value={p.path}>
                    {isPrinter ? '🖨 ' : ''}{label}
                  </option>
                )
              })}
            </select>
            <Button variant="ghost" onClick={refreshPorts} small>
              ↻
            </Button>
          </div>
          {autoDetected && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Auto-detected Ender 3 V3 SE on {autoDetected}
            </div>
          )}
          <Button onClick={handleConnect} disabled={!selectedPort || loading}>
            {loading ? 'Connecting...' : `Connect to ${selectedPort || 'printer'}`}
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>Ender 3 V3 SE</span>
            <span style={{ color: 'var(--text-disabled)', marginLeft: 8 }}>{selectedPort} @ 115200</span>
          </div>
          <Button variant="secondary" onClick={handleDisconnect} disabled={loading}>
            Disconnect
          </Button>
        </div>
      )}
    </Card>
  )
}
