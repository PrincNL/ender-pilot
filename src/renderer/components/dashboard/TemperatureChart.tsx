import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../shared/Card'
import { usePrinter } from '../../context/PrinterContext'

export function TemperatureChart() {
  const { tempHistory } = usePrinter()

  const data = tempHistory.map((t, i) => ({
    time: i * 2, // seconds
    hotend: Math.round(t.hotend),
    hotendTarget: Math.round(t.hotendTarget),
    bed: Math.round(t.bed),
    bedTarget: Math.round(t.bedTarget),
  }))

  return (
    <Card title="Temperature History" icon="📈" style={{ minHeight: 280 }}>
      {data.length < 2 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-disabled)',
            fontSize: '0.85rem',
          }}
        >
          Connect printer to see temperature graph
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-disabled)', fontSize: 11 }}
              tickFormatter={(v) => `${Math.floor(v / 60)}m`}
              stroke="var(--border)"
            />
            <YAxis
              tick={{ fill: 'var(--text-disabled)', fontSize: 11 }}
              stroke="var(--border)"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
              }}
              labelFormatter={(v) => `${Math.floor(Number(v) / 60)}m ${Number(v) % 60}s`}
            />
            <Line
              type="monotone"
              dataKey="hotend"
              stroke="var(--chart-hotend)"
              strokeWidth={2}
              dot={false}
              name="Hotend"
            />
            <Line
              type="monotone"
              dataKey="hotendTarget"
              stroke="var(--chart-hotend-target)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              name="Hotend Target"
            />
            <Line
              type="monotone"
              dataKey="bed"
              stroke="var(--chart-bed)"
              strokeWidth={2}
              dot={false}
              name="Bed"
            />
            <Line
              type="monotone"
              dataKey="bedTarget"
              stroke="var(--chart-bed-target)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              name="Bed Target"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
