import React from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { JogControls } from '../components/dashboard/JogControls'
import { SpeedFanControls } from '../components/dashboard/SpeedFanControls'
import { FilamentControls } from '../components/dashboard/FilamentControls'
import { EmergencyCard } from '../components/dashboard/EmergencyCard'

export function ControlsPage() {
  return (
    <PageLayout title="Controls" subtitle="Move, extrude, and control your printer">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        <JogControls />
        <SpeedFanControls />
        <FilamentControls />
        <EmergencyCard />
      </div>
    </PageLayout>
  )
}
