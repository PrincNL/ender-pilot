import { EventEmitter } from 'events'
import { TemperatureReading, Position } from '../types'

export interface EndstopStatus {
  xMin: boolean
  yMin: boolean
  zMin: boolean
  zProbe?: boolean
}

export interface FirmwareInfo {
  name: string
  version: string
  machineType: string
  extruderCount: number
  uuid: string
}

export class MarlinParser extends EventEmitter {
  // Regex patterns for Marlin responses
  private tempRegex = /T:(\d+\.?\d*)\s*\/(\d+\.?\d*).*?B:(\d+\.?\d*)\s*\/(\d+\.?\d*)/
  private posRegex = /X:([\d.-]+)\s*Y:([\d.-]+)\s*Z:([\d.-]+)\s*E:([\d.-]+)/
  private resendRegex = /Resend:\s*(\d+)/i
  private errorRegex = /^Error:(.*)/i
  private fanRegex = /M106 S(\d+)/
  private speedRegex = /FR:(\d+)%/
  private flowRegex = /E\d*\s*Flow:\s*(\d+)%/

  // M115 firmware info
  private fwNameRegex = /FIRMWARE_NAME:(.*?)(?:\s+SOURCE_CODE|$)/
  private fwVersionRegex = /FIRMWARE_VERSION:([\d.]+)/
  private machineRegex = /MACHINE_TYPE:(.*?)(?:\s|$)/
  private extruderRegex = /EXTRUDER_COUNT:(\d+)/
  private uuidRegex = /UUID:([\w-]+)/

  // M119 endstop
  private endstopRegex = /(\w+_\w+):\s*(TRIGGERED|open)/gi

  // Bed leveling data
  private meshPointRegex = /Bed\s+X:\s*([\d.-]+)\s+Y:\s*([\d.-]+)\s+Z:\s*([\d.-]+)/

  // Z-offset
  private zOffsetRegex = /M851.*?Z([\d.-]+)/
  private probeOffsetRegex = /Probe Offset.*?Z:\s*([\d.-]+)/i

  // Steps per mm
  private stepsRegex = /M92.*?X([\d.]+).*?Y([\d.]+).*?Z([\d.]+).*?E([\d.]+)/

  // Acceleration
  private accelRegex = /M204.*?P([\d.]+).*?R([\d.]+).*?T([\d.]+)/

  // Max feedrate
  private maxFeedRegex = /M203.*?X([\d.]+).*?Y([\d.]+).*?Z([\d.]+).*?E([\d.]+)/

  // PID values
  private pidRegex = /M301.*?P([\d.]+).*?I([\d.]+).*?D([\d.]+)/
  private bedPidRegex = /M304.*?P([\d.]+).*?I([\d.]+).*?D([\d.]+)/

  // SD card progress
  private sdProgressRegex = /SD printing byte (\d+)\/(\d+)/

  // Layer from action comments
  private actionLayerRegex = /\/\/action:notification Layer (\d+)/

  parseLine(line: string): void {
    const trimmed = line.trim()
    if (!trimmed) return

    // Check for temperature data (can be in ok line or standalone)
    const tempMatch = trimmed.match(this.tempRegex)
    if (tempMatch) {
      // Also try to extract fan speed from temp line (some firmwares include it)
      const fanMatch = trimmed.match(/@:(\d+)/)
      this.emit('temperature', {
        timestamp: Date.now(),
        hotend: parseFloat(tempMatch[1]),
        hotendTarget: parseFloat(tempMatch[2]),
        bed: parseFloat(tempMatch[3]),
        bedTarget: parseFloat(tempMatch[4]),
      } as TemperatureReading)
      if (fanMatch) {
        this.emit('fan-power', parseInt(fanMatch[1], 10))
      }
    }

    // Check for ok
    if (trimmed.startsWith('ok')) {
      this.emit('ok')
      return
    }

    // Check for position
    const posMatch = trimmed.match(this.posRegex)
    if (posMatch) {
      this.emit('position', {
        x: parseFloat(posMatch[1]),
        y: parseFloat(posMatch[2]),
        z: parseFloat(posMatch[3]),
        e: parseFloat(posMatch[4]),
      } as Position)
      return
    }

    // Check for resend request
    const resendMatch = trimmed.match(this.resendRegex)
    if (resendMatch) {
      this.emit('resend', parseInt(resendMatch[1], 10))
      return
    }

    // Check for errors
    const errorMatch = trimmed.match(this.errorRegex)
    if (errorMatch) {
      this.emit('error', errorMatch[1].trim())
      return
    }

    // Firmware info (M115 response)
    if (trimmed.includes('FIRMWARE_NAME:')) {
      const info: Partial<FirmwareInfo> = {}
      const nameMatch = trimmed.match(this.fwNameRegex)
      if (nameMatch) info.name = nameMatch[1].trim()
      const verMatch = trimmed.match(this.fwVersionRegex)
      if (verMatch) info.version = verMatch[1]
      const machMatch = trimmed.match(this.machineRegex)
      if (machMatch) info.machineType = machMatch[1].trim()
      const extMatch = trimmed.match(this.extruderRegex)
      if (extMatch) info.extruderCount = parseInt(extMatch[1], 10)
      const uuidMatch = trimmed.match(this.uuidRegex)
      if (uuidMatch) info.uuid = uuidMatch[1]
      this.emit('firmware-info', info)
      return
    }

    // Endstop status (M119 response)
    if (trimmed.includes('_min:') || trimmed.includes('_max:') || trimmed.includes('_probe:')) {
      const status: Record<string, boolean> = {}
      let match
      const regex = /(\w+):\s*(TRIGGERED|open)/gi
      while ((match = regex.exec(trimmed)) !== null) {
        status[match[1]] = match[2] === 'TRIGGERED'
      }
      if (Object.keys(status).length > 0) {
        this.emit('endstop-status', status)
      }
      return
    }

    // Z-offset
    const zOffMatch = trimmed.match(this.zOffsetRegex)
    if (zOffMatch) {
      this.emit('z-offset', parseFloat(zOffMatch[1]))
      return
    }
    const probeOffMatch = trimmed.match(this.probeOffsetRegex)
    if (probeOffMatch) {
      this.emit('z-offset', parseFloat(probeOffMatch[1]))
      return
    }

    // Steps per mm (M92)
    const stepsMatch = trimmed.match(this.stepsRegex)
    if (stepsMatch) {
      this.emit('steps-per-mm', {
        x: parseFloat(stepsMatch[1]),
        y: parseFloat(stepsMatch[2]),
        z: parseFloat(stepsMatch[3]),
        e: parseFloat(stepsMatch[4]),
      })
      return
    }

    // Acceleration (M204)
    const accelMatch = trimmed.match(this.accelRegex)
    if (accelMatch) {
      this.emit('acceleration', {
        print: parseFloat(accelMatch[1]),
        retract: parseFloat(accelMatch[2]),
        travel: parseFloat(accelMatch[3]),
      })
      return
    }

    // Max feedrate (M203)
    const maxFeedMatch = trimmed.match(this.maxFeedRegex)
    if (maxFeedMatch) {
      this.emit('max-feedrate', {
        x: parseFloat(maxFeedMatch[1]),
        y: parseFloat(maxFeedMatch[2]),
        z: parseFloat(maxFeedMatch[3]),
        e: parseFloat(maxFeedMatch[4]),
      })
      return
    }

    // PID hotend (M301)
    const pidMatch = trimmed.match(this.pidRegex)
    if (pidMatch) {
      this.emit('pid-hotend', {
        p: parseFloat(pidMatch[1]),
        i: parseFloat(pidMatch[2]),
        d: parseFloat(pidMatch[3]),
      })
      return
    }

    // PID bed (M304)
    const bedPidMatch = trimmed.match(this.bedPidRegex)
    if (bedPidMatch) {
      this.emit('pid-bed', {
        p: parseFloat(bedPidMatch[1]),
        i: parseFloat(bedPidMatch[2]),
        d: parseFloat(bedPidMatch[3]),
      })
      return
    }

    // Bed mesh point
    const meshMatch = trimmed.match(this.meshPointRegex)
    if (meshMatch) {
      this.emit('mesh-point', {
        x: parseFloat(meshMatch[1]),
        y: parseFloat(meshMatch[2]),
        z: parseFloat(meshMatch[3]),
      })
      return
    }

    // Feed rate override
    if (trimmed.includes('FR:')) {
      const frMatch = trimmed.match(this.speedRegex)
      if (frMatch) this.emit('speed-override', parseInt(frMatch[1], 10))
    }

    // Generic message
    this.emit('message', trimmed)
  }
}
