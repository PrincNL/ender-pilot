import { contextBridge, ipcRenderer } from 'electron'

function on(channel: string) {
  return (callback: (...args: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  }
}

contextBridge.exposeInMainWorld('api', {
  serial: {
    listPorts: () => ipcRenderer.invoke('serial:list-ports'),
    findCreality: () => ipcRenderer.invoke('serial:find-creality'),
    connect: (port: string, baudRate: number) => ipcRenderer.invoke('serial:connect', port, baudRate),
    disconnect: () => ipcRenderer.invoke('serial:disconnect'),
    sendCommand: (cmd: string) => ipcRenderer.invoke('serial:send-command', cmd),
    getStatus: () => ipcRenderer.invoke('serial:get-status'),
    onStatusChanged: on('serial:status-changed'),
    onDataReceived: on('serial:data-received'),
    onCommandSent: on('serial:command-sent'),
  },
  printer: {
    onTempsUpdated: on('printer:temps-updated'),
    onPositionUpdated: on('printer:position-updated'),
    onError: on('printer:error'),
    onFirmwareInfo: on('printer:firmware-info'),
    onEndstopStatus: on('printer:endstop-status'),
    onZOffset: on('printer:z-offset'),
    onStepsPerMm: on('printer:steps-per-mm'),
    onAcceleration: on('printer:acceleration'),
    onMaxFeedrate: on('printer:max-feedrate'),
    onPidHotend: on('printer:pid-hotend'),
    onPidBed: on('printer:pid-bed'),
    onMeshPoint: on('printer:mesh-point'),
    onFanPower: on('printer:fan-power'),
    onSpeedOverride: on('printer:speed-override'),
  },
  print: {
    start: (filePath: string) => ipcRenderer.invoke('print:start', filePath),
    pause: () => ipcRenderer.invoke('print:pause'),
    resume: () => ipcRenderer.invoke('print:resume'),
    cancel: () => ipcRenderer.invoke('print:cancel'),
    getState: () => ipcRenderer.invoke('print:get-state'),
    checkRecovery: () => ipcRenderer.invoke('print:check-recovery'),
    resumeRecovery: () => ipcRenderer.invoke('print:resume-recovery'),
    discardRecovery: () => ipcRenderer.invoke('print:discard-recovery'),
    onProgressUpdated: on('print:progress-updated'),
    onStateChanged: on('print:state-changed'),
    onError: on('print:error'),
  },
  files: {
    openDialog: () => ipcRenderer.invoke('files:open-dialog'),
    analyzeGCode: (filePath: string) => ipcRenderer.invoke('files:analyze-gcode', filePath),
    readGCode: (filePath: string) => ipcRenderer.invoke('files:read-gcode', filePath),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  },
  history: {
    getAll: () => ipcRenderer.invoke('history:get-all'),
  },
})
