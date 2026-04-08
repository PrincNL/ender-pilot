import { ipcMain } from 'electron'
import { getHistory } from '../storage/PrintHistory'

export function registerHistoryIPC(): void {
  ipcMain.handle('history:get-all', () => {
    return getHistory()
  })
}
