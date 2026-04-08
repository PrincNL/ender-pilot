import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const styles = {
  card: {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    padding: 'var(--space-lg)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 'var(--space-md)',
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 'var(--space-sm)',
  },
  title: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  icon: {
    color: 'var(--accent-primary)',
    fontSize: '1rem',
  },
}

export function Card({ children, title, icon, className, style }: CardProps) {
  return (
    <div style={{ ...styles.card, ...style }} className={className}>
      {title && (
        <div style={styles.header}>
          {icon && <span style={styles.icon}>{icon}</span>}
          <span style={styles.title}>{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}
