import { EventEmitter } from 'events'
import * as fs from 'fs'
import { SerialManager } from './SerialManager'

export type StreamerState = 'idle' | 'streaming' | 'paused' | 'waitingForOk' | 'completed' | 'error'

export class GCodeStreamer extends EventEmitter {
  private lines: string[] = []
  private currentLine = 0
  private state: StreamerState = 'idle'
  private serialManager: SerialManager
  private currentLayer = 0
  private totalLayers = 0
  private lastZ = 0
  private startTime = 0
  private okTimeout: ReturnType<typeof setTimeout> | null = null
  private retryCount = 0
  private maxRetries = 3
  private okTimeoutMs = 10000
  private fileName = ''
  private filePath = ''

  // Track printer state for recovery
  private hotendTarget = 0
  private bedTarget = 0
  private fanSpeed = 0
  private feedRate = 100
  private flowRate = 100
  private absoluteExtrusion = true
  private lastPosition = { x: 0, y: 0, z: 0, e: 0 }

  constructor(serialManager: SerialManager) {
    super()
    this.serialManager = serialManager

    this.serialManager.on('ok', () => this.onOkReceived())
    this.serialManager.on('resend', (lineNum: number) => this.onResendRequested(lineNum))
    this.serialManager.on('temperature', (t: { hotendTarget: number; bedTarget: number }) => {
      this.hotendTarget = t.hotendTarget
      this.bedTarget = t.bedTarget
    })
    this.serialManager.on('position', (p: { x: number; y: number; z: number; e: number }) => {
      this.lastPosition = { ...p }
    })
  }

  load(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8')
    this.filePath = filePath
    this.fileName = filePath.split(/[\\/]/).pop() || 'unknown.gcode'
    this.lines = content.split('\n')
    this.currentLine = 0
    this.currentLayer = 0
    this.totalLayers = this.countLayers()
    this.state = 'idle'
  }

  private countLayers(): number {
    let layers = 0
    for (const line of this.lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith(';LAYER:') || trimmed.startsWith(';LAYER_CHANGE')) {
        layers++
      }
    }
    // Fallback: count Z changes if no layer comments
    if (layers === 0) {
      let lastZ = -1
      for (const line of this.lines) {
        const match = line.match(/G[01]\s.*Z([\d.]+)/)
        if (match) {
          const z = parseFloat(match[1])
          if (z > lastZ) {
            layers++
            lastZ = z
          }
        }
      }
    }
    return layers
  }

  start(): void {
    if (this.lines.length === 0) return
    this.currentLine = 0
    this.currentLayer = 0
    this.lastZ = 0
    this.startTime = Date.now()
    this.retryCount = 0
    this.state = 'streaming'
    this.sendNextLine()
  }

  startFromLine(lineIndex: number): void {
    if (this.lines.length === 0) return
    this.currentLine = lineIndex
    this.startTime = Date.now()
    this.retryCount = 0
    this.state = 'streaming'
    this.sendNextLine()
  }

  pause(): void {
    if (this.state === 'streaming' || this.state === 'waitingForOk') {
      this.state = 'paused'
      this.clearOkTimeout()
      this.emit('state-changed', 'paused')
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'streaming'
      this.emit('state-changed', 'streaming')
      this.sendNextLine()
    }
  }

  async cancel(): Promise<void> {
    this.state = 'idle'
    this.clearOkTimeout()

    // Safe cancel sequence
    const cancelCommands = [
      'M108',        // Break out of heating wait
      'M104 S0',     // Hotend off
      'M140 S0',     // Bed off
      'M107',        // Fan off
      'G91',         // Relative positioning
      'G1 Z5 F300',  // Raise nozzle 5mm
      'G90',         // Absolute positioning
      'G28 X Y',     // Home X and Y
      'M84',         // Disable steppers
    ]

    for (const cmd of cancelCommands) {
      this.serialManager.write(cmd)
      await new Promise((r) => setTimeout(r, 200))
    }

    this.emit('state-changed', 'idle')
    this.emit('cancelled')
  }

  private sendNextLine(): void {
    if (this.state !== 'streaming') return

    // Skip empty lines and comments
    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine].split(';')[0].trim()

      // Track layer from comments
      const fullLine = this.lines[this.currentLine].trim()
      if (fullLine.startsWith(';LAYER:') || fullLine.startsWith(';LAYER_CHANGE')) {
        this.currentLayer++
      }

      if (line === '') {
        this.currentLine++
        this.emitProgress()
        continue
      }

      // Track state for recovery
      this.trackState(line)

      // Track Z for layer detection (fallback)
      const zMatch = line.match(/G[01]\s.*Z([\d.]+)/)
      if (zMatch) {
        const z = parseFloat(zMatch[1])
        if (z > this.lastZ && this.totalLayers === 0) {
          this.currentLayer++
        }
        this.lastZ = z
      }

      // Send the line
      this.state = 'waitingForOk'
      this.serialManager.write(line)
      this.currentLine++
      this.retryCount = 0
      this.startOkTimeout()
      this.emitProgress()
      return
    }

    // All lines sent
    this.state = 'completed'
    this.emit('state-changed', 'completed')
    this.emit('completed')
  }

  private trackState(line: string): void {
    const upper = line.toUpperCase()
    if (upper.startsWith('M104') || upper.startsWith('M109')) {
      const match = line.match(/S(\d+)/i)
      if (match) this.hotendTarget = parseInt(match[1], 10)
    }
    if (upper.startsWith('M140') || upper.startsWith('M190')) {
      const match = line.match(/S(\d+)/i)
      if (match) this.bedTarget = parseInt(match[1], 10)
    }
    if (upper.startsWith('M106')) {
      const match = line.match(/S(\d+)/i)
      if (match) this.fanSpeed = parseInt(match[1], 10)
    }
    if (upper.startsWith('M107')) this.fanSpeed = 0
    if (upper.startsWith('M220')) {
      const match = line.match(/S(\d+)/i)
      if (match) this.feedRate = parseInt(match[1], 10)
    }
    if (upper.startsWith('M221')) {
      const match = line.match(/S(\d+)/i)
      if (match) this.flowRate = parseInt(match[1], 10)
    }
    if (upper === 'M82') this.absoluteExtrusion = true
    if (upper === 'M83') this.absoluteExtrusion = false
  }

  private onOkReceived(): void {
    this.clearOkTimeout()
    this.retryCount = 0

    if (this.state === 'waitingForOk') {
      this.state = 'streaming'
      this.sendNextLine()
    }
  }

  private onResendRequested(lineNum: number): void {
    this.clearOkTimeout()
    // lineNum is the Marlin line number, we need to map it back
    // For simplicity, resend the last sent line
    if (this.currentLine > 0) {
      this.currentLine--
    }
    this.state = 'streaming'
    this.sendNextLine()
  }

  private startOkTimeout(): void {
    this.clearOkTimeout()
    this.okTimeout = setTimeout(() => {
      this.retryCount++
      if (this.retryCount >= this.maxRetries) {
        this.state = 'error'
        this.emit('state-changed', 'error')
        this.emit('error', 'Printer not responding (timeout after 3 retries)')
        return
      }
      // Resend last line
      if (this.currentLine > 0) {
        this.currentLine--
      }
      this.state = 'streaming'
      this.sendNextLine()
    }, this.okTimeoutMs)
  }

  private clearOkTimeout(): void {
    if (this.okTimeout) {
      clearTimeout(this.okTimeout)
      this.okTimeout = null
    }
  }

  private emitProgress(): void {
    const elapsed = (Date.now() - this.startTime) / 1000
    const percentage = this.lines.length > 0 ? (this.currentLine / this.lines.length) * 100 : 0
    const linesPerSecond = elapsed > 0 ? this.currentLine / elapsed : 0
    const remainingLines = this.lines.length - this.currentLine
    const estimatedRemaining = linesPerSecond > 0 ? remainingLines / linesPerSecond : 0

    this.emit('progress', {
      currentLine: this.currentLine,
      totalLines: this.lines.length,
      percentage: Math.min(percentage, 100),
      currentLayer: this.currentLayer,
      totalLayers: this.totalLayers,
      elapsedSeconds: elapsed,
      estimatedSecondsRemaining: estimatedRemaining,
      fileName: this.fileName,
    })
  }

  getState(): StreamerState {
    return this.state
  }

  getCurrentLine(): number {
    return this.currentLine
  }

  getTotalLines(): number {
    return this.lines.length
  }

  getRecoveryData() {
    return {
      filePath: this.filePath,
      currentLine: this.currentLine,
      totalLines: this.lines.length,
      hotendTemp: this.hotendTarget,
      bedTemp: this.bedTarget,
      position: { ...this.lastPosition },
      currentLayer: this.currentLayer,
      fanSpeed: this.fanSpeed,
      feedRate: this.feedRate,
      flowRate: this.flowRate,
      absoluteExtrusion: this.absoluteExtrusion,
      elapsedSeconds: (Date.now() - this.startTime) / 1000,
      fileName: this.fileName,
    }
  }
}
