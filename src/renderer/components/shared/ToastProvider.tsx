import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast(message: string, type?: ToastType): void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

const typeStyles: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'var(--accent-success)', color: 'var(--accent-success)' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'var(--accent-error)', color: 'var(--accent-error)' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'var(--accent-warning)', color: 'var(--accent-warning)' },
  info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'var(--accent-info)', color: 'var(--accent-info)' },
}

const typeIcons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
}

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const s = typeStyles[t.type]
          return (
            <div
              key={t.id}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: s.color,
                fontSize: '0.85rem',
                fontWeight: 500,
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-elevated)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animation: 'slideUp 0.2s ease-out',
                pointerEvents: 'auto',
                maxWidth: 360,
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{typeIcons[t.type]}</span>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
