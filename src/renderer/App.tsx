import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { PrinterProvider } from './context/PrinterContext'
import { Sidebar } from './components/layout/Sidebar'
import { ResumeDialog } from './components/print/ResumeDialog'
import { DashboardPage } from './pages/DashboardPage'
import { ControlsPage } from './pages/ControlsPage'
import { FileBrowserPage } from './pages/FileBrowserPage'
import { LevelingPage } from './pages/LevelingPage'
import { TerminalPage } from './pages/TerminalPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  return (
    <HashRouter>
      <PrinterProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/controls" element={<ControlsPage />} />
            <Route path="/files" element={<FileBrowserPage />} />
            <Route path="/leveling" element={<LevelingPage />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
        <ResumeDialog />
      </PrinterProvider>
    </HashRouter>
  )
}
