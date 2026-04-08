interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type PrintState = 'idle' | 'printing' | 'pausing' | 'paused' | 'cancelling' | 'error' | 'completed'

interface TemperatureReading {
  timestamp: number
  hotend: number
  hotendTarget: number
  bed: number
  bedTarget: number
}

interface Position {
  x: number
  y: number
  z: number
  e: number
}

interface PrintProgress {
  currentLine: number
  totalLines: number
  percentage: number
  currentLayer: number
  totalLayers: number
  elapsedSeconds: number
  estimatedSecondsRemaining: number
  fileName: string
}

interface RecoveryState {
  version: 1
  timestamp: string
  filePath: string
  fileHash: string
  currentLine: number
  totalLines: number
  hotendTemp: number
  bedTemp: number
  position: Position
  currentLayer: number
  fanSpeed: number
  feedRate: number
  flowRate: number
  absoluteExtrusion: boolean
  startedAt: string
  elapsedSeconds: number
  fileName: string
}

interface GCodeAnalysis {
  filePath: string
  fileName: string
  totalLines: number
  printableLines: number
  totalLayers: number
  estimatedSeconds: number
  filamentUsedMm: number
  filamentUsedG: number
  slicerName: string
  bedTemp: number
  hotendTemp: number
}

interface PrintHistoryEntry {
  id: string
  fileName: string
  filePath: string
  startedAt: string
  finishedAt: string
  durationSeconds: number
  result: 'completed' | 'cancelled' | 'failed'
  totalLayers: number
  filamentUsedMm: number
}

interface AppSettings {
  comPort: string
  baudRate: number
  printerName: string
  bedSizeX: number
  bedSizeY: number
  maxZ: number
  recoveryEnabled: boolean
  recoveryIntervalSeconds: number
  tempPollingIntervalMs: number
}

interface ElectronAPI {
  serial: {
    listPorts(): Promise<PortInfo[]>
    findCreality(): Promise<string | null>
    connect(port: string, baudRate: number): Promise<void>
    disconnect(): Promise<void>
    sendCommand(cmd: string): Promise<boolean>
    getStatus(): Promise<ConnectionStatus>
    onStatusChanged(cb: (status: ConnectionStatus) => void): () => void
    onDataReceived(cb: (data: string) => void): () => void
    onCommandSent(cb: (cmd: string) => void): () => void
  }
  printer: {
    onTempsUpdated(cb: (temps: TemperatureReading) => void): () => void
    onPositionUpdated(cb: (pos: Position) => void): () => void
    onError(cb: (msg: string) => void): () => void
    onFirmwareInfo(cb: (info: unknown) => void): () => void
    onEndstopStatus(cb: (status: unknown) => void): () => void
    onZOffset(cb: (offset: unknown) => void): () => void
    onStepsPerMm(cb: (steps: unknown) => void): () => void
    onAcceleration(cb: (accel: unknown) => void): () => void
    onMaxFeedrate(cb: (rates: unknown) => void): () => void
    onPidHotend(cb: (pid: unknown) => void): () => void
    onPidBed(cb: (pid: unknown) => void): () => void
    onMeshPoint(cb: (point: unknown) => void): () => void
    onFanPower(cb: (power: unknown) => void): () => void
    onSpeedOverride(cb: (speed: unknown) => void): () => void
  }
  print: {
    start(filePath: string): Promise<void>
    pause(): Promise<void>
    resume(): Promise<void>
    cancel(): Promise<void>
    getState(): Promise<PrintState>
    checkRecovery(): Promise<RecoveryState | null>
    resumeRecovery(): Promise<void>
    discardRecovery(): Promise<void>
    onProgressUpdated(cb: (progress: PrintProgress) => void): () => void
    onStateChanged(cb: (state: PrintState) => void): () => void
    onError(cb: (msg: string) => void): () => void
  }
  files: {
    openDialog(): Promise<string | null>
    analyzeGCode(filePath: string): Promise<GCodeAnalysis>
  }
  settings: {
    get(): Promise<AppSettings>
    set(key: string, value: unknown): Promise<void>
  }
  history: {
    getAll(): Promise<PrintHistoryEntry[]>
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

export {}
