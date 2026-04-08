import React from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { ConnectionCard } from '../components/dashboard/ConnectionCard'
import { TemperatureCard } from '../components/dashboard/TemperatureCard'
import { PrintProgressCard } from '../components/dashboard/PrintProgressCard'
import { TemperatureChart } from '../components/dashboard/TemperatureChart'

export function DashboardPage() {
  return (
    <PageLayout title="Dashboard" subtitle="Monitor your Ender 3 V3 SE">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        <ConnectionCard />
        <TemperatureCard />

        <div style={{ gridColumn: '1 / -1' }}>
          <PrintProgressCard />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <TemperatureChart />
        </div>
      </div>
    </PageLayout>
  )
}
