import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { PrintHistoryEntry } from '../types'

const HISTORY_FILE = 'print-history.json'

function getHistoryPath(): string {
  return path.join(app.getPath('userData'), HISTORY_FILE)
}

export function getHistory(): PrintHistoryEntry[] {
  try {
    const filePath = getHistoryPath()
    if (!fs.existsSync(filePath)) return []
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function addHistoryEntry(entry: PrintHistoryEntry): void {
  const history = getHistory()
  history.unshift(entry) // Newest first
  // Keep max 500 entries
  if (history.length > 500) history.length = 500
  try {
    fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save print history:', err)
  }
}
