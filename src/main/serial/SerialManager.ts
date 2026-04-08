import { EventEmitter } from 'events'
import { SerialPort } from 'serialport'
import { ReadlineParser } from 'serialport'
import { MarlinParser } from './MarlinParser'
import { ConnectionStatus, TemperatureReading, Position } from '../types'

export class SerialManager extends EventEmitter {
  private port: SerialPort | null = null
  private lineParser: ReadlineParser | null = null
  private marlinParser: MarlinParser
  private status: ConnectionStatus = 'disconnected'
  private tempPollTimer: ReturnType<typeof setInterval> | null = null
  private tempPollInterval = 2000

  constructor() {
    super()
    this.marlinParser = new MarlinParser()
    this.setupMarlinListeners()
  }

  private setupMarlinListeners(): void {
    // Core events
    this.marlinParser.on('ok', () => this.emit('ok'))
    this.marlinParser.on('temperature', (t: TemperatureReading) => this.emit('temperature', t))
    this.marlinParser.on('position', (p: Position) => this.emit('position', p))
    this.marlinParser.on('error', (msg: string) => this.emit('printer-error', msg))
    this.marlinParser.on('resend', (line: number) => this.emit('resend', line))
    this.marlinParser.on('message', (msg: string) => this.emit('message', msg))

    // Extended data events
    this.marlinParser.on('firmware-info', (info) => this.emit('firmware-info', info))
    this.marlinParser.on('endstop-status', (status) => this.emit('endstop-status', status))
    this.marlinParser.on('z-offset', (offset) => this.emit('z-offset', offset))
    this.marlinParser.on('steps-per-mm', (steps) => this.emit('steps-per-mm', steps))
    this.marlinParser.on('acceleration', (accel) => this.emit('acceleration', accel))
    this.marlinParser.on('max-feedrate', (rates) => this.emit('max-feedrate', rates))
    this.marlinParser.on('pid-hotend', (pid) => this.emit('pid-hotend', pid))
    this.marlinParser.on('pid-bed', (pid) => this.emit('pid-bed', pid))
    this.marlinParser.on('mesh-point', (point) => this.emit('mesh-point', point))
    this.marlinParser.on('fan-power', (power) => this.emit('fan-power', power))
    this.marlinParser.on('speed-override', (pct) => this.emit('speed-override', pct))
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  async connect(portPath: string, baudRate: number): Promise<void> {
    if (this.port?.isOpen) {
      await this.disconnect()
    }

    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      this.port = new SerialPort({
        path: portPath,
        baudRate,
        autoOpen: false,
      })

      this.lineParser = new ReadlineParser({ delimiter: '\n' })
      this.port.pipe(this.lineParser)

      this.lineParser.on('data', (line: string) => {
        this.emit('data', line)
        this.marlinParser.parseLine(line)
      })

      this.port.on('close', () => {
        this.setStatus('disconnected')
        this.stopTempPolling()
      })

      this.port.on('error', (err) => {
        this.emit('printer-error', err.message)
        this.setStatus('error')
      })

      this.port.open((err) => {
        if (err) {
          this.setStatus('error')
          reject(new Error(`Failed to open port: ${err.message}`))
          return
        }

        this.setStatus('connected')

        // Initial handshake
        setTimeout(() => {
          this.write('\n')
          setTimeout(() => {
            this.write('M110 N0')  // Reset line numbers
            // Query all printer info on connect
            setTimeout(() => this.queryPrinterInfo(), 500)
            this.startTempPolling()
            resolve()
          }, 500)
        }, 1000)
      })
    })
  }

  // Query all available printer data after connection
  private queryPrinterInfo(): void {
    const queries = [
      'M115',  // Firmware info
      'M114',  // Current position
      'M119',  // Endstop status
      'M851',  // Z-probe offset
      'M503',  // All EEPROM settings (steps, accel, PID, etc.)
    ]
    let delay = 0
    for (const cmd of queries) {
      setTimeout(() => this.write(cmd), delay)
      delay += 300
    }
  }

  async disconnect(): Promise<void> {
    this.stopTempPolling()

    if (this.port?.isOpen) {
      return new Promise((resolve) => {
        this.port!.close(() => {
          this.port = null
          this.lineParser = null
          this.setStatus('disconnected')
          resolve()
        })
      })
    }

    this.setStatus('disconnected')
  }

  write(data: string): boolean {
    if (!this.port?.isOpen) return false
    this.port.write(data + '\n')
    this.emit('sent', data)
    return true
  }

  sendCommand(cmd: string): boolean {
    return this.write(cmd)
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status
    this.emit('status-changed', status)
  }

  private startTempPolling(): void {
    this.stopTempPolling()
    this.tempPollTimer = setInterval(() => {
      if (this.port?.isOpen) {
        this.write('M105')
      }
    }, this.tempPollInterval)
  }

  private stopTempPolling(): void {
    if (this.tempPollTimer) {
      clearInterval(this.tempPollTimer)
      this.tempPollTimer = null
    }
  }

  setTempPollInterval(ms: number): void {
    this.tempPollInterval = ms
    if (this.tempPollTimer) {
      this.startTempPolling()
    }
  }

  isConnected(): boolean {
    return this.status === 'connected' && !!this.port?.isOpen
  }
}
