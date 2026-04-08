import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageLayout({ children, title, subtitle, actions }: PageLayoutProps) {
  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Page Header */}
      <div
        className="drag-region"
        style={{
          padding: '20px 28px 16px',
          paddingTop: 48, // Account for title bar
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
        {actions && <div className="no-drag">{actions}</div>}
      </div>

      {/* Page Content */}
      <div
        style={{
          flex: 1,
          padding: '0 28px 28px',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
