export interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
  friendlyName?: string
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface TemperatureReading {
  timestamp: number
  hotend: number
  hotendTarget: number
  bed: number
  bedTarget: number
}

export interface Position {
  x: number
  y: number
  z: number
  e: number
}

export interface PrintProgress {
  currentLine: number
  totalLines: number
  percentage: number
  currentLayer: number
  totalLayers: number
  elapsedSeconds: number
  estimatedSecondsRemaining: number
  fileName: string
}

export type PrintState = 'idle' | 'printing' | 'pausing' | 'paused' | 'cancelling' | 'error' | 'completed'

export interface RecoveryState {
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

export interface GCodeAnalysis {
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

export interface PrintHistoryEntry {
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

export interface AppSettings {
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

export const DEFAULT_SETTINGS: AppSettings = {
  comPort: 'auto',
  baudRate: 115200,
  printerName: 'Creality Ender 3 V3 SE',
  bedSizeX: 220,
  bedSizeY: 220,
  maxZ: 250,
  recoveryEnabled: true,
  recoveryIntervalSeconds: 30,
  tempPollingIntervalMs: 2000,
}
