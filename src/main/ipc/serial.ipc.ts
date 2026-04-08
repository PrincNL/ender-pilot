import { ipcMain, BrowserWindow } from 'electron'
import { SerialManager } from '../serial/SerialManager'
import { PortScanner } from '../serial/PortScanner'

export function registerSerialIPC(serialManager: SerialManager, getWindow: () => BrowserWindow | null): void {
  const portScanner = new PortScanner()

  ipcMain.handle('serial:list-ports', async () => {
    return portScanner.listPorts()
  })

  ipcMain.handle('serial:find-creality', async () => {
    return portScanner.findCrealityPort()
  })

  ipcMain.handle('serial:connect', async (_event, port: string, baudRate: number) => {
    await serialManager.connect(port, baudRate)
  })

  ipcMain.handle('serial:disconnect', async () => {
    await serialManager.disconnect()
  })

  ipcMain.handle('serial:send-command', async (_event, cmd: string) => {
    return serialManager.sendCommand(cmd)
  })

  ipcMain.handle('serial:get-status', () => {
    return serialManager.getStatus()
  })

  // Forward all events to renderer
  const forwardEvent = (eventName: string, channel: string) => {
    serialManager.on(eventName, (...args) => {
      getWindow()?.webContents.send(channel, ...args)
    })
  }

  // Core events
  forwardEvent('status-changed', 'serial:status-changed')
  forwardEvent('data', 'serial:data-received')
  forwardEvent('sent', 'serial:command-sent')
  forwardEvent('temperature', 'printer:temps-updated')
  forwardEvent('position', 'printer:position-updated')
  forwardEvent('printer-error', 'printer:error')

  // Extended data events
  forwardEvent('firmware-info', 'printer:firmware-info')
  forwardEvent('endstop-status', 'printer:endstop-status')
  forwardEvent('z-offset', 'printer:z-offset')
  forwardEvent('steps-per-mm', 'printer:steps-per-mm')
  forwardEvent('acceleration', 'printer:acceleration')
  forwardEvent('max-feedrate', 'printer:max-feedrate')
  forwardEvent('pid-hotend', 'printer:pid-hotend')
  forwardEvent('pid-bed', 'printer:pid-bed')
  forwardEvent('mesh-point', 'printer:mesh-point')
  forwardEvent('fan-power', 'printer:fan-power')
  forwardEvent('speed-override', 'printer:speed-override')
}
