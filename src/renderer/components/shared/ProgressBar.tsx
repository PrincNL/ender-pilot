import React from 'react'

interface ProgressBarProps {
  value: number // 0-100
  color?: string
  height?: number
  showLabel?: boolean
}

export function ProgressBar({ value, color = 'var(--accent-primary)', height = 8, showLabel }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', width: '100%' }}>
      <div
        style={{
          flex: 1,
          height,
          background: 'var(--bg-input)',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius: height / 2,
            transition: 'width 0.5s ease-out',
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: 42, textAlign: 'right' }}>
          {clamped.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
