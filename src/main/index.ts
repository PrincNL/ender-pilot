import { app, BrowserWindow } from 'electron'
import path from 'path'
import { SerialManager } from './serial/SerialManager'
import { PrintJobManager } from './print/PrintJobManager'
import { registerSerialIPC } from './ipc/serial.ipc'
import { registerPrintIPC } from './ipc/print.ipc'
import { registerFilesIPC } from './ipc/files.ipc'
import { registerSettingsIPC } from './ipc/settings.ipc'
import { registerHistoryIPC } from './ipc/history.ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Creality Ender Pro',
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d1117',
      symbolColor: '#e2e8f0',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // In dev, load Vite dev server; in production, load built files
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function getWindow(): BrowserWindow | null {
  return mainWindow
}

app.whenReady().then(() => {
  // Initialize after app is ready (needed for app.getPath, electron-store, etc.)
  const serialManager = new SerialManager()
  const printManager = new PrintJobManager(serialManager)

  // Register all IPC handlers
  registerSerialIPC(serialManager, getWindow)
  registerPrintIPC(printManager, getWindow)
  registerFilesIPC()
  registerSettingsIPC()
  registerHistoryIPC()

  createWindow()

  app.on('window-all-closed', () => {
    serialManager.disconnect()
    app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
