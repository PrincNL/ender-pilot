import React, { useState, useRef, useEffect } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { Button } from '../components/shared/Button'
import { usePrinter } from '../context/PrinterContext'

const quickCommands = [
  { label: 'M105', cmd: 'M105', desc: 'Report Temps' },
  { label: 'G28', cmd: 'G28', desc: 'Home All' },
  { label: 'M114', cmd: 'M114', desc: 'Position' },
  { label: 'M503', cmd: 'M503', desc: 'Settings' },
  { label: 'M84', cmd: 'M84', desc: 'Motors Off' },
]

const lineColors = {
  sent: 'var(--accent-primary)',
  received: 'var(--text-secondary)',
  error: 'var(--accent-error)',
}

export function TerminalPage() {
  const { terminalLines, sendCommand, connectionStatus } = usePrinter()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef<HTMLDivElement>(null)
  const isConnected = connectionStatus === 'connected'

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [terminalLines])

  const handleSend = () => {
    const cmd = input.trim().toUpperCase()
    if (!cmd || !isConnected) return
    sendCommand(cmd)
    setHistory((prev) => [cmd, ...prev.slice(0, 49)])
    setHistoryIndex(-1)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const next = Math.min(historyIndex + 1, history.length - 1)
        setHistoryIndex(next)
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const next = historyIndex - 1
        setHistoryIndex(next)
        setInput(history[next])
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  return (
    <PageLayout title="Terminal" subtitle="Send raw G-code commands">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', gap: 'var(--space-md)' }}>
        {/* Quick Commands */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
          {quickCommands.map((qc) => (
            <Button
              key={qc.cmd}
              variant="secondary"
              small
              onClick={() => sendCommand(qc.cmd)}
              disabled={!isConnected}
              style={{ fontSize: '0.75rem' }}
            >
              {qc.label}
            </Button>
          ))}
        </div>

        {/* Console Output */}
        <div
          ref={outputRef}
          style={{
            flex: 1,
            background: 'var(--bg-sidebar)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            padding: 'var(--space-md)',
            overflow: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
          }}
        >
          {terminalLines.length === 0 ? (
            <div style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>
              {isConnected ? 'Terminal ready. Type a G-code command below.' : 'Connect to printer to start.'}
            </div>
          ) : (
            terminalLines.map((line, i) => (
              <div key={i} style={{ color: lineColors[line.type] }}>
                <span style={{ color: 'var(--text-disabled)', marginRight: 8 }}>
                  {new Date(line.time).toLocaleTimeString()}
                </span>
                {line.type === 'sent' ? '>>> ' : line.type === 'error' ? '!!! ' : '<<< '}
                {line.text}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Type G-code command...' : 'Connect to printer first'}
            disabled={!isConnected}
            style={{
              flex: 1,
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <Button onClick={handleSend} disabled={!isConnected || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
