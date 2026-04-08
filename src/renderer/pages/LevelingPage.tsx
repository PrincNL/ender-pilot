import React from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { BedLevelingCard } from '../components/dashboard/BedLevelingCard'
import { FirmwareCard } from '../components/dashboard/FirmwareCard'

export function LevelingPage() {
  return (
    <PageLayout title="Leveling & Firmware" subtitle="Bed leveling, Z-offset, and firmware settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <BedLevelingCard />
        <FirmwareCard />
      </div>
    </PageLayout>
  )
}
