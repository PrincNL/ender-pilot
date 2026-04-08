import { EventEmitter } from 'events'
import { SerialManager } from '../serial/SerialManager'
import { GCodeStreamer } from '../serial/GCodeStreamer'
import { CrashRecovery } from './CrashRecovery'
import { PrintState, PrintProgress, RecoveryState } from '../types'

export class PrintJobManager extends EventEmitter {
  private serialManager: SerialManager
  private streamer: GCodeStreamer
  private crashRecovery: CrashRecovery
  private state: PrintState = 'idle'
  private snapshotTimer: ReturnType<typeof setInterval> | null = null
  private snapshotIntervalMs = 30000

  constructor(serialManager: SerialManager) {
    super()
    this.serialManager = serialManager
    this.streamer = new GCodeStreamer(serialManager)
    this.crashRecovery = new CrashRecovery()

    this.streamer.on('progress', (progress: PrintProgress) => {
      this.emit('progress', progress)
    })

    this.streamer.on('state-changed', (streamerState: string) => {
      if (streamerState === 'completed') {
        this.setState('completed')
        this.stopSnapshotTimer()
        this.crashRecovery.deleteState()
        this.emit('completed')
      } else if (streamerState === 'error') {
        this.setState('error')
        this.saveSnapshot() // Save state on error for recovery
      } else if (streamerState === 'paused') {
        this.setState('paused')
        this.saveSnapshot()
      } else if (streamerState === 'streaming') {
        this.setState('printing')
      }
    })

    this.streamer.on('error', (msg: string) => {
      this.emit('error', msg)
    })

    // Save snapshot on disconnect
    this.serialManager.on('status-changed', (status: string) => {
      if (status === 'disconnected' && this.state === 'printing') {
        this.saveSnapshot()
        this.setState('error')
      }
    })
  }

  async startPrint(filePath: string): Promise<void> {
    if (!this.serialManager.isConnected()) {
      throw new Error('Printer not connected')
    }

    this.streamer.load(filePath)
    this.setState('printing')
    this.startSnapshotTimer()
    this.streamer.start()
  }

  pause(): void {
    if (this.state === 'printing') {
      this.setState('pausing')
      this.streamer.pause()
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.startSnapshotTimer()
      this.streamer.resume()
    }
  }

  async cancel(): Promise<void> {
    if (this.state === 'printing' || this.state === 'paused') {
      this.setState('cancelling')
      this.stopSnapshotTimer()
      await this.streamer.cancel()
      this.crashRecovery.deleteState()
      this.setState('idle')
      this.emit('cancelled')
    }
  }

  checkRecovery(): RecoveryState | null {
    return this.crashRecovery.loadState()
  }

  async resumeFromRecovery(): Promise<void> {
    const state = this.crashRecovery.loadState()
    if (!state) throw new Error('No recovery state found')
    if (!this.serialManager.isConnected()) throw new Error('Printer not connected')

    this.setState('printing')

    // Generate and send resume G-code sequence
    const resumeCommands = this.crashRecovery.generateResumeCommands(state)
    for (const cmd of resumeCommands) {
      this.serialManager.write(cmd)
      // Wait for each command, especially heating commands
      if (cmd.startsWith('M109') || cmd.startsWith('M190')) {
        await this.waitForOk(120000) // 2 min timeout for heating
      } else {
        await this.waitForOk(10000)
      }
    }

    // Load and start streaming from saved line
    this.streamer.load(state.filePath)
    this.startSnapshotTimer()
    this.streamer.startFromLine(state.currentLine)
  }

  discardRecovery(): void {
    this.crashRecovery.deleteState()
  }

  getState(): PrintState {
    return this.state
  }

  private setState(state: PrintState): void {
    this.state = state
    this.emit('state-changed', state)
  }

  private saveSnapshot(): void {
    if (this.state !== 'printing' && this.state !== 'paused') return
    const data = this.streamer.getRecoveryData()
    this.crashRecovery.saveState({
      version: 1,
      timestamp: new Date().toISOString(),
      fileHash: '', // TODO: compute hash
      startedAt: new Date(Date.now() - data.elapsedSeconds * 1000).toISOString(),
      ...data,
    })
  }

  private startSnapshotTimer(): void {
    this.stopSnapshotTimer()
    this.snapshotTimer = setInterval(() => this.saveSnapshot(), this.snapshotIntervalMs)
  }

  private stopSnapshotTimer(): void {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer)
      this.snapshotTimer = null
    }
  }

  private waitForOk(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.serialManager.removeListener('ok', handler)
        reject(new Error('Timeout waiting for ok'))
      }, timeout)

      const handler = () => {
        clearTimeout(timer)
        resolve()
      }

      this.serialManager.once('ok', handler)
    })
  }

  setSnapshotInterval(ms: number): void {
    this.snapshotIntervalMs = ms
  }
}
