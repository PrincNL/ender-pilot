import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrinter } from '../context/PrinterContext'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { connectionStatus, printState, emergencyStop, pausePrint, resumePrint, homeAxes } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return
      }

      // Navigation shortcuts (Ctrl+number)
      if (e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
          case '1': e.preventDefault(); navigate('/'); break
          case '2': e.preventDefault(); navigate('/controls'); break
          case '3': e.preventDefault(); navigate('/files'); break
          case '4': e.preventDefault(); navigate('/leveling'); break
          case '5': e.preventDefault(); navigate('/terminal'); break
          case '6': e.preventDefault(); navigate('/history'); break
          case '7': e.preventDefault(); navigate('/settings'); break
        }
      }

      // Printer shortcuts
      if (!e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case 'Escape':
            // Emergency stop on Escape (when connected)
            if (isConnected && e.shiftKey) {
              e.preventDefault()
              emergencyStop()
            }
            break
          case ' ':
            // Space = pause/resume
            if (isConnected) {
              e.preventDefault()
              if (printState === 'printing') pausePrint()
              else if (printState === 'paused') resumePrint()
            }
            break
        }
      }

      // Ctrl+H = Home all
      if (e.ctrlKey && e.key === 'h' && isConnected) {
        e.preventDefault()
        homeAxes()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, isConnected, printState, emergencyStop, pausePrint, resumePrint, homeAxes])
}
