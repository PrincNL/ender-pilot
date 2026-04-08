import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', dot: '#10b981' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', dot: '#ef4444' },
  info: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', dot: '#3b82f6' },
  neutral: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', dot: '#94a3b8' },
}

export function Badge({ children, variant = 'neutral', dot }: BadgeProps) {
  const colors = variantColors[variant]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: colors.bg,
        color: colors.text,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.dot,
          }}
        />
      )}
      {children}
    </span>
  )
}
