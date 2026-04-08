import { ipcMain } from 'electron'
import { getSettings, setSetting, getAllSettings } from '../storage/SettingsStore'
import { AppSettings } from '../types'

export function registerSettingsIPC(): void {
  ipcMain.handle('settings:get', () => {
    return getAllSettings()
  })

  ipcMain.handle('settings:set', (_event, key: keyof AppSettings, value: unknown) => {
    setSetting(key, value)
  })
}
