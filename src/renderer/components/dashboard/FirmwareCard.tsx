import React from 'react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { Badge } from '../shared/Badge'
import { usePrinter } from '../../context/PrinterContext'

export function FirmwareCard() {
  const {
    connectionStatus, firmwareInfo, stepsPerMm, acceleration, maxFeedrate,
    pidHotend, pidBed, endstopStatus, refreshPrinterInfo, pidAutotuneHotend,
    pidAutotuneBed, queryEndstops,
  } = usePrinter()
  const isConnected = connectionStatus === 'connected'

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
        {value ?? '--'}
      </span>
    </div>
  )

  return (
    <Card title="Firmware & Settings" icon="⚙">
      {/* Firmware info */}
      {firmwareInfo && (
        <div style={{ padding: 'var(--space-sm)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{firmwareInfo.name || 'Unknown Firmware'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            v{firmwareInfo.version} | {firmwareInfo.machineType} | {firmwareInfo.extruderCount} extruder(s)
          </div>
        </div>
      )}

      {/* Endstop status */}
      {endstopStatus && (
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 4 }}>Endstops</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {Object.entries(endstopStatus).map(([name, triggered]) => (
              <Badge key={name} variant={triggered ? 'error' : 'success'} dot>
                {name}: {triggered ? 'TRIGGERED' : 'open'}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Steps per mm */}
      {stepsPerMm && (
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 4 }}>Steps/mm (M92)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-xs)' }}>
            <InfoRow label="X" value={stepsPerMm.x} />
            <InfoRow label="Y" value={stepsPerMm.y} />
            <InfoRow label="Z" value={stepsPerMm.z} />
            <InfoRow label="E" value={stepsPerMm.e} />
          </div>
        </div>
      )}

      {/* Acceleration */}
      {acceleration && (
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 4 }}>Acceleration (M204)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-xs)' }}>
            <InfoRow label="Print" value={`${acceleration.print}`} />
            <InfoRow label="Retract" value={`${acceleration.retract}`} />
            <InfoRow label="Travel" value={`${acceleration.travel}`} />
          </div>
        </div>
      )}

      {/* Max Feedrate */}
      {maxFeedrate && (
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 4 }}>Max Feedrate (M203)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-xs)' }}>
            <InfoRow label="X" value={maxFeedrate.x} />
            <InfoRow label="Y" value={maxFeedrate.y} />
            <InfoRow label="Z" value={maxFeedrate.z} />
            <InfoRow label="E" value={maxFeedrate.e} />
          </div>
        </div>
      )}

      {/* PID values */}
      {(pidHotend || pidBed) && (
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginBottom: 4 }}>PID Values</div>
          {pidHotend && (
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--chart-hotend)' }}>Hotend:</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                P:{pidHotend.p.toFixed(2)} I:{pidHotend.i.toFixed(2)} D:{pidHotend.d.toFixed(2)}
              </span>
            </div>
          )}
          {pidBed && (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--chart-bed)' }}>Bed:</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                P:{pidBed.p.toFixed(2)} I:{pidBed.i.toFixed(2)} D:{pidBed.d.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <Button variant="ghost" small onClick={refreshPrinterInfo} disabled={!isConnected}>Refresh Info</Button>
        <Button variant="ghost" small onClick={queryEndstops} disabled={!isConnected}>Check Endstops</Button>
        <Button variant="ghost" small onClick={() => pidAutotuneHotend(200)} disabled={!isConnected}>PID Tune Hotend</Button>
        <Button variant="ghost" small onClick={() => pidAutotuneBed(60)} disabled={!isConnected}>PID Tune Bed</Button>
      </div>
    </Card>
  )
}
