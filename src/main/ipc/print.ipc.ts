import { ipcMain, BrowserWindow } from 'electron'
import { PrintJobManager } from '../print/PrintJobManager'
import { addHistoryEntry } from '../storage/PrintHistory'
import { PrintHistoryEntry } from '../types'

export function registerPrintIPC(printManager: PrintJobManager, getWindow: () => BrowserWindow | null): void {
  let currentPrintStart = ''
  let currentFileName = ''
  let currentFilePath = ''

  ipcMain.handle('print:start', async (_event, filePath: string) => {
    currentPrintStart = new Date().toISOString()
    currentFilePath = filePath
    currentFileName = filePath.split(/[\\/]/).pop() || 'unknown.gcode'
    await printManager.startPrint(filePath)
  })

  ipcMain.handle('print:pause', () => {
    printManager.pause()
  })

  ipcMain.handle('print:resume', () => {
    printManager.resume()
  })

  ipcMain.handle('print:cancel', async () => {
    await printManager.cancel()
    saveHistory('cancelled')
  })

  ipcMain.handle('print:get-state', () => {
    return printManager.getState()
  })

  ipcMain.handle('print:check-recovery', () => {
    return printManager.checkRecovery()
  })

  ipcMain.handle('print:resume-recovery', async () => {
    const state = printManager.checkRecovery()
    if (state) {
      currentPrintStart = state.startedAt
      currentFileName = state.fileName
      currentFilePath = state.filePath
    }
    await printManager.resumeFromRecovery()
  })

  ipcMain.handle('print:discard-recovery', () => {
    printManager.discardRecovery()
  })

  // Forward events
  printManager.on('progress', (progress) => {
    getWindow()?.webContents.send('print:progress-updated', progress)
  })

  printManager.on('state-changed', (state) => {
    getWindow()?.webContents.send('print:state-changed', state)
  })

  printManager.on('error', (msg) => {
    getWindow()?.webContents.send('print:error', msg)
  })

  printManager.on('completed', () => {
    saveHistory('completed')
  })

  function saveHistory(result: 'completed' | 'cancelled' | 'failed'): void {
    const entry: PrintHistoryEntry = {
      id: Date.now().toString(36),
      fileName: currentFileName,
      filePath: currentFilePath,
      startedAt: currentPrintStart,
      finishedAt: new Date().toISOString(),
      durationSeconds: (Date.now() - new Date(currentPrintStart).getTime()) / 1000,
      result,
      totalLayers: 0,
      filamentUsedMm: 0,
    }
    addHistoryEntry(entry)
  }
}
