import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
  small?: boolean
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent-primary)',
    color: '#0d1117',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'var(--accent-error)',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  success: {
    background: 'var(--accent-success)',
    color: '#fff',
    border: 'none',
  },
}

export function Button({ children, variant = 'primary', onClick, disabled, style, small }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: small ? '0.75rem' : '0.85rem',
    fontWeight: 600,
    padding: small ? '6px 12px' : '10px 20px',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...style,
  }

  return (
    <button style={baseStyle} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  )
}
