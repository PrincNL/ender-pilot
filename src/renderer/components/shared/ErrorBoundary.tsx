import React, { Component, ErrorInfo } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ender Pilot error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>&#9888;</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 500 }}>
            Ender Pilot encountered an unexpected error. Your printer connection and any active print are unaffected.
          </p>
          <pre
            style={{
              background: 'var(--bg-sidebar)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              fontSize: '0.8rem',
              color: 'var(--accent-error)',
              maxWidth: 600,
              overflow: 'auto',
              marginBottom: 24,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.hash = '/'
            }}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#0d1117',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
