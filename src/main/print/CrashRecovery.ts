import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { RecoveryState } from '../types'

export class CrashRecovery {
  private _stateFilePath: string | null = null

  private get stateFilePath(): string {
    if (!this._stateFilePath) {
      this._stateFilePath = path.join(app.getPath('userData'), 'recovery-state.json')
    }
    return this._stateFilePath
  }

  saveState(state: RecoveryState): void {
    const tempPath = this.stateFilePath + '.tmp'
    try {
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8')
      fs.renameSync(tempPath, this.stateFilePath)
    } catch (err) {
      console.error('Failed to save recovery state:', err)
      // Clean up temp file if it exists
      try { fs.unlinkSync(tempPath) } catch {}
    }
  }

  loadState(): RecoveryState | null {
    try {
      if (!fs.existsSync(this.stateFilePath)) return null
      const data = fs.readFileSync(this.stateFilePath, 'utf-8')
      const state = JSON.parse(data) as RecoveryState

      // Verify the G-code file still exists
      if (!fs.existsSync(state.filePath)) {
        console.warn('Recovery state references missing file:', state.filePath)
        return { ...state, filePath: '' } // Signal file is missing
      }

      return state
    } catch (err) {
      console.error('Failed to load recovery state:', err)
      return null
    }
  }

  deleteState(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        fs.unlinkSync(this.stateFilePath)
      }
    } catch (err) {
      console.error('Failed to delete recovery state:', err)
    }
  }

  generateResumeCommands(state: RecoveryState): string[] {
    const commands: string[] = [
      // Heat up
      `M140 S${state.bedTemp}`,       // Start heating bed
      `M104 S${state.hotendTemp}`,     // Start heating hotend
      `M190 S${state.bedTemp}`,        // Wait for bed
      `M109 S${state.hotendTemp}`,     // Wait for hotend

      // Home
      'G28',                            // Home all axes

      // Restore state
      'G90',                            // Absolute positioning
      state.absoluteExtrusion ? 'M82' : 'M83', // Extrusion mode

      // Move to position safely
      `G1 Z${state.position.z + 2} F300`,    // Move Z up first
      `G1 X${state.position.x} Y${state.position.y} F3000`, // Move to XY
      `G1 Z${state.position.z} F300`,        // Lower to Z

      // Set E position
      `G92 E${state.position.e}`,

      // Restore other settings
      `M106 S${state.fanSpeed}`,       // Fan speed
      `M220 S${state.feedRate}`,       // Feed rate
      `M221 S${state.flowRate}`,       // Flow rate
    ]

    return commands
  }
}
