import { ipcMain, dialog } from 'electron'
import { GCodeAnalyzer } from '../print/GCodeAnalyzer'

export function registerFilesIPC(): void {
  const analyzer = new GCodeAnalyzer()

  ipcMain.handle('files:open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'G-Code Files', extensions: ['gcode', 'gco', 'g'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('files:analyze-gcode', async (_event, filePath: string) => {
    return analyzer.analyze(filePath)
  })
}
