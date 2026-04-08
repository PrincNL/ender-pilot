import React, { useState, useEffect } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginBottom: 4,
  display: 'block',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!window.api) {
      // Default settings for browser preview
      setSettings({
        comPort: 'auto', baudRate: 115200, printerName: 'Creality Ender 3 V3 SE',
        bedSizeX: 220, bedSizeY: 220, maxZ: 250, recoveryEnabled: true,
        recoveryIntervalSeconds: 30, tempPollingIntervalMs: 2000,
      })
      return
    }
    window.api.settings.get().then(setSettings)
  }, [])

  const updateSetting = (key: keyof AppSettings, value: unknown) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    window.api?.settings.set(key, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return null

  return (
    <PageLayout title="Settings" subtitle="Configure your printer and application">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: 600 }}>
        {/* Connection Settings */}
        <Card title="Connection" icon="🔌">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>COM Port</label>
              <input
                style={inputStyle}
                value={settings.comPort}
                onChange={(e) => updateSetting('comPort', e.target.value)}
                placeholder="auto or COM3"
              />
            </div>
            <div>
              <label style={labelStyle}>Baud Rate</label>
              <select
                style={inputStyle}
                value={settings.baudRate}
                onChange={(e) => updateSetting('baudRate', parseInt(e.target.value))}
              >
                <option value={115200}>115200 (Default)</option>
                <option value={250000}>250000</option>
                <option value={57600}>57600</option>
                <option value={38400}>38400</option>
                <option value={19200}>19200</option>
                <option value={9600}>9600</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Printer Profile */}
        <Card title="Printer Profile" icon="🖨">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Printer Name</label>
              <input
                style={inputStyle}
                value={settings.printerName}
                onChange={(e) => updateSetting('printerName', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Bed Size X (mm)</label>
              <input
                style={inputStyle}
                type="number"
                value={settings.bedSizeX}
                onChange={(e) => updateSetting('bedSizeX', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label style={labelStyle}>Bed Size Y (mm)</label>
              <input
                style={inputStyle}
                type="number"
                value={settings.bedSizeY}
                onChange={(e) => updateSetting('bedSizeY', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label style={labelStyle}>Max Z Height (mm)</label>
              <input
                style={inputStyle}
                type="number"
                value={settings.maxZ}
                onChange={(e) => updateSetting('maxZ', parseInt(e.target.value))}
              />
            </div>
          </div>
        </Card>

        {/* Recovery Settings */}
        <Card title="Crash Recovery" icon="💾">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={settings.recoveryEnabled}
                  onChange={(e) => updateSetting('recoveryEnabled', e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  Enable crash recovery
                </span>
              </label>
            </div>
            <div>
              <label style={labelStyle}>Snapshot Interval (seconds)</label>
              <input
                style={{ ...inputStyle, maxWidth: 200 }}
                type="number"
                min={10}
                max={300}
                value={settings.recoveryIntervalSeconds}
                onChange={(e) => updateSetting('recoveryIntervalSeconds', parseInt(e.target.value))}
                disabled={!settings.recoveryEnabled}
              />
            </div>
          </div>
        </Card>

        {saved && (
          <div style={{ color: 'var(--accent-success)', fontSize: '0.85rem', textAlign: 'center' }}>
            Settings saved
          </div>
        )}
      </div>
    </PageLayout>
  )
}
