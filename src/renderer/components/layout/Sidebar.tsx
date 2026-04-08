import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePrinter } from '../../context/PrinterContext'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/controls', label: 'Controls', icon: '🕹' },
  { path: '/files', label: 'Files', icon: '📁' },
  { path: '/leveling', label: 'Leveling', icon: '📐' },
  { path: '/terminal', label: 'Terminal', icon: '⌨' },
  { path: '/history', label: 'History', icon: '⏱' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

const statusColors: Record<ConnectionStatus, string> = {
  connected: 'var(--accent-success)',
  connecting: 'var(--accent-warning)',
  disconnected: 'var(--text-disabled)',
  error: 'var(--accent-error)',
}

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
  error: 'Error',
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { connectionStatus } = usePrinter()

  return (
    <div
      style={{
        width: 200,
        minWidth: 200,
        height: '100%',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 36, // Account for title bar overlay
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0d1117',
            }}
          >
            E3
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Ender Pro
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>V3 SE</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Connection Status */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[connectionStatus],
            boxShadow: connectionStatus === 'connected' ? `0 0 8px ${statusColors.connected}` : 'none',
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {statusLabels[connectionStatus]}
        </span>
      </div>
    </div>
  )
}
