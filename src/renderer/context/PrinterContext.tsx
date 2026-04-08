import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const isElectron = typeof window !== 'undefined' && !!window.api

interface FirmwareInfo {
  name?: string
  version?: string
  machineType?: string
  extruderCount?: number
  uuid?: string
}

interface PidValues {
  p: number
  i: number
  d: number
}

interface PrinterState {
  connectionStatus: ConnectionStatus
  printState: PrintState
  temperatures: TemperatureReading | null
  position: Position | null
  progress: PrintProgress | null
  recovery: RecoveryState | null
  terminalLines: { type: 'sent' | 'received' | 'error'; text: string; time: number }[]
  tempHistory: TemperatureReading[]
  // Extended data
  firmwareInfo: FirmwareInfo | null
  endstopStatus: Record<string, boolean> | null
  zOffset: number
  stepsPerMm: Position | null
  acceleration: { print: number; retract: number; travel: number } | null
  maxFeedrate: Position | null
  pidHotend: PidValues | null
  pidBed: PidValues | null
  fanPower: number
  speedOverride: number
  flowOverride: number
}

interface PrinterActions {
  connect(port: string, baudRate: number): Promise<void>
  disconnect(): Promise<void>
  sendCommand(cmd: string): Promise<void>
  startPrint(filePath: string): Promise<void>
  pausePrint(): Promise<void>
  resumePrint(): Promise<void>
  cancelPrint(): Promise<void>
  resumeRecovery(): Promise<void>
  discardRecovery(): void
  checkRecovery(): Promise<void>
  // Extended actions
  jogMove(axis: string, distance: number, speed: number): void
  setFanSpeed(speed: number): void
  setPrintSpeed(percent: number): void
  setFlowRate(percent: number): void
  setHotendTemp(temp: number): void
  setBedTemp(temp: number): void
  adjustZOffset(delta: number): void
  homeAxes(axes?: string): void
  emergencyStop(): void
  disableMotors(): void
  startAutoLevel(): void
  loadFilament(temp: number, length: number): void
  unloadFilament(temp: number, length: number): void
  savePrinterSettings(): void
  queryEndstops(): void
  queryPosition(): void
  pidAutotuneHotend(temp: number): void
  pidAutotuneBed(temp: number): void
  refreshPrinterInfo(): void
}

const PrinterContext = createContext<(PrinterState & PrinterActions) | null>(null)

const MAX_TERMINAL_LINES = 5000
const MAX_TEMP_HISTORY = 150

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [printState, setPrintState] = useState<PrintState>('idle')
  const [temperatures, setTemperatures] = useState<TemperatureReading | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [progress, setProgress] = useState<PrintProgress | null>(null)
  const [recovery, setRecovery] = useState<RecoveryState | null>(null)
  const [terminalLines, setTerminalLines] = useState<PrinterState['terminalLines']>([])
  const [tempHistory, setTempHistory] = useState<TemperatureReading[]>([])

  // Extended state
  const [firmwareInfo, setFirmwareInfo] = useState<FirmwareInfo | null>(null)
  const [endstopStatus, setEndstopStatus] = useState<Record<string, boolean> | null>(null)
  const [zOffset, setZOffset] = useState(0)
  const [stepsPerMm, setStepsPerMm] = useState<Position | null>(null)
  const [acceleration, setAcceleration] = useState<PrinterState['acceleration']>(null)
  const [maxFeedrate, setMaxFeedrate] = useState<Position | null>(null)
  const [pidHotend, setPidHotend] = useState<PidValues | null>(null)
  const [pidBed, setPidBed] = useState<PidValues | null>(null)
  const [fanPower, setFanPower] = useState(0)
  const [speedOverride, setSpeedOverride] = useState(100)
  const [flowOverride, setFlowOverride] = useState(100)

  const addTerminalLine = useCallback((type: 'sent' | 'received' | 'error', text: string) => {
    setTerminalLines((prev) => {
      const next = [...prev, { type, text, time: Date.now() }]
      if (next.length > MAX_TERMINAL_LINES) next.splice(0, next.length - MAX_TERMINAL_LINES)
      return next
    })
  }, [])

  useEffect(() => {
    if (!isElectron) return

    const unsubs: (() => void)[] = []

    // Core events
    unsubs.push(window.api.serial.onStatusChanged((s: unknown) => setConnectionStatus(s as ConnectionStatus)))
    unsubs.push(window.api.serial.onDataReceived((d: unknown) => addTerminalLine('received', d as string)))
    unsubs.push(window.api.serial.onCommandSent((c: unknown) => addTerminalLine('sent', c as string)))

    unsubs.push(window.api.printer.onTempsUpdated((t: unknown) => {
      const temps = t as TemperatureReading
      setTemperatures(temps)
      setTempHistory((prev) => {
        const next = [...prev, temps]
        if (next.length > MAX_TEMP_HISTORY) next.splice(0, next.length - MAX_TEMP_HISTORY)
        return next
      })
    }))

    unsubs.push(window.api.printer.onPositionUpdated((p: unknown) => setPosition(p as Position)))
    unsubs.push(window.api.printer.onError((m: unknown) => addTerminalLine('error', `Error: ${m}`)))

    // Extended data events
    unsubs.push(window.api.printer.onFirmwareInfo((i: unknown) => setFirmwareInfo(i as FirmwareInfo)))
    unsubs.push(window.api.printer.onEndstopStatus((s: unknown) => setEndstopStatus(s as Record<string, boolean>)))
    unsubs.push(window.api.printer.onZOffset((o: unknown) => setZOffset(o as number)))
    unsubs.push(window.api.printer.onStepsPerMm((s: unknown) => setStepsPerMm(s as Position)))
    unsubs.push(window.api.printer.onAcceleration((a: unknown) => setAcceleration(a as PrinterState['acceleration'])))
    unsubs.push(window.api.printer.onMaxFeedrate((f: unknown) => setMaxFeedrate(f as Position)))
    unsubs.push(window.api.printer.onPidHotend((p: unknown) => setPidHotend(p as PidValues)))
    unsubs.push(window.api.printer.onPidBed((p: unknown) => setPidBed(p as PidValues)))
    unsubs.push(window.api.printer.onFanPower((p: unknown) => setFanPower(p as number)))
    unsubs.push(window.api.printer.onSpeedOverride((s: unknown) => setSpeedOverride(s as number)))

    // Print events
    unsubs.push(window.api.print.onProgressUpdated((p: unknown) => setProgress(p as PrintProgress)))
    unsubs.push(window.api.print.onStateChanged((s: unknown) => setPrintState(s as PrintState)))
    unsubs.push(window.api.print.onError((m: unknown) => addTerminalLine('error', `Print Error: ${m}`)))

    return () => unsubs.forEach((fn) => fn())
  }, [addTerminalLine])

  useEffect(() => {
    if (!isElectron) return
    window.api.print.checkRecovery().then((s: RecoveryState | null) => { if (s) setRecovery(s) })
  }, [])

  const cmd = (gcode: string) => {
    if (isElectron) window.api.serial.sendCommand(gcode)
  }

  const actions: PrinterActions = {
    connect: async (port, baudRate) => {
      if (!isElectron) return
      setConnectionStatus('connecting')
      await window.api.serial.connect(port, baudRate)
    },
    disconnect: async () => { if (isElectron) await window.api.serial.disconnect() },
    sendCommand: async (c) => { cmd(c) },
    startPrint: async (fp) => { if (isElectron) await window.api.print.start(fp) },
    pausePrint: async () => { if (isElectron) await window.api.print.pause() },
    resumePrint: async () => { if (isElectron) await window.api.print.resume() },
    cancelPrint: async () => { if (isElectron) await window.api.print.cancel() },
    resumeRecovery: async () => { if (!isElectron) return; await window.api.print.resumeRecovery(); setRecovery(null) },
    discardRecovery: () => { if (!isElectron) return; window.api.print.discardRecovery(); setRecovery(null) },
    checkRecovery: async () => { if (!isElectron) return; const s = await window.api.print.checkRecovery(); setRecovery(s) },

    // Movement & controls
    jogMove: (axis, distance, speed) => {
      cmd('G91')  // Relative positioning
      cmd(`G1 ${axis}${distance} F${speed}`)
      cmd('G90')  // Back to absolute
    },
    setFanSpeed: (speed) => {
      const s = Math.round(Math.min(255, Math.max(0, speed)))
      cmd(s > 0 ? `M106 S${s}` : 'M107')
      setFanPower(s)
    },
    setPrintSpeed: (percent) => {
      cmd(`M220 S${Math.round(percent)}`)
      setSpeedOverride(percent)
    },
    setFlowRate: (percent) => {
      cmd(`M221 S${Math.round(percent)}`)
      setFlowOverride(percent)
    },
    setHotendTemp: (temp) => cmd(`M104 S${Math.round(temp)}`),
    setBedTemp: (temp) => cmd(`M140 S${Math.round(temp)}`),
    adjustZOffset: (delta) => {
      const newOffset = Math.round((zOffset + delta) * 100) / 100
      cmd(`M851 Z${newOffset}`)
      setZOffset(newOffset)
    },
    homeAxes: (axes) => cmd(axes ? `G28 ${axes}` : 'G28'),
    emergencyStop: () => cmd('M112'),
    disableMotors: () => cmd('M84'),
    startAutoLevel: () => cmd('G29'),
    loadFilament: (temp, length) => {
      cmd(`M104 S${temp}`)
      cmd(`M109 S${temp}`)
      cmd('G91')
      cmd(`G1 E${length} F300`)
      cmd('G90')
    },
    unloadFilament: (temp, length) => {
      cmd(`M104 S${temp}`)
      cmd(`M109 S${temp}`)
      cmd('G91')
      cmd(`G1 E-${length} F600`)
      cmd('G90')
    },
    savePrinterSettings: () => cmd('M500'),
    queryEndstops: () => cmd('M119'),
    queryPosition: () => cmd('M114'),
    pidAutotuneHotend: (temp) => cmd(`M303 S${temp} C8 U1`),
    pidAutotuneBed: (temp) => cmd(`M303 E-1 S${temp} C8 U1`),
    refreshPrinterInfo: () => {
      cmd('M115')
      cmd('M114')
      cmd('M119')
      cmd('M851')
    },
  }

  return (
    <PrinterContext.Provider
      value={{
        connectionStatus, printState, temperatures, position, progress, recovery,
        terminalLines, tempHistory, firmwareInfo, endstopStatus, zOffset, stepsPerMm,
        acceleration, maxFeedrate, pidHotend, pidBed, fanPower, speedOverride, flowOverride,
        ...actions,
      }}
    >
      {children}
    </PrinterContext.Provider>
  )
}

export function usePrinter() {
  const ctx = useContext(PrinterContext)
  if (!ctx) throw new Error('usePrinter must be used within PrinterProvider')
  return ctx
}
