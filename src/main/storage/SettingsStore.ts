import Store from 'electron-store'
import { AppSettings, DEFAULT_SETTINGS } from '../types'

let store: Store<AppSettings> | null = null

function getStore(): Store<AppSettings> {
  if (!store) {
    store = new Store<AppSettings>({
      defaults: DEFAULT_SETTINGS,
    })
  }
  return store
}

export function getSettings(): AppSettings {
  const s = getStore()
  return {
    comPort: s.get('comPort'),
    baudRate: s.get('baudRate'),
    printerName: s.get('printerName'),
    bedSizeX: s.get('bedSizeX'),
    bedSizeY: s.get('bedSizeY'),
    maxZ: s.get('maxZ'),
    recoveryEnabled: s.get('recoveryEnabled'),
    recoveryIntervalSeconds: s.get('recoveryIntervalSeconds'),
    tempPollingIntervalMs: s.get('tempPollingIntervalMs'),
  }
}

export function setSetting(key: keyof AppSettings, value: unknown): void {
  getStore().set(key, value as never)
}

export function getAllSettings(): AppSettings {
  return getStore().store
}
