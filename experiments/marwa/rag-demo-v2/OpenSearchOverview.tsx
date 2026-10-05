'use client'

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  DropdownMenu,
  Icon,
  Link,
  Section,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import resetIcon from '@aivenio/aquarium/icons/reset'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import type { ServiceRow } from '@/screens/ProjectServices'

const SERVICE_VERSION = 'OpenSearch 3.3.2'

// ─── Small building blocks ───────────────────────────────────────────────────────

/** A label/value row with a copy affordance (Connection information). */
function ConnRow({
  label,
  value,
  masked,
  actions,
}: {
  label: string
  value: string
  masked?: boolean
  actions?: React.ReactNode
}) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBlock: 10,
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Box style={{ minWidth: 160, flexShrink: 0 }}>
        <Typography.Small color="muted">{label}</Typography.Small>
      </Box>
      <Box style={{ flex: 1, minWidth: 0, textAlign: 'right', overflow: 'hidden' }}>
        <Typography.Small>
          <Box component="span" style={{ fontFamily: masked ? 'var(--aquarium-font-family-code, monospace)' : undefined }}>
            {value}
          </Box>
        </Typography.Small>
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {actions}
        <Button.Icon type="button" dense aria-label={`Copy ${label}`} tooltip="Copy" icon={duplicateIcon} />
      </Box>
    </Box>
  )
}

/** Vertical label/value used in the stat grids (Backups, Cloud, Maintenance). */
function InfoStat({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Typography.Caption color="muted">{label}</Typography.Caption>
        {tooltip ? <Icon icon={infoSignIcon} style={{ width: 14, height: 14, color: 'var(--aquarium-text-color-muted)' }} /> : null}
      </Box>
      <Typography.Small color="intense">{value}</Typography.Small>
    </Box>
  )
}

function PlanUsageBar({ label, valueLabel, percent }: { label: string; valueLabel: string; percent: number }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <Typography.Small color="muted">{label}</Typography.Small>
        <Typography.SmallStrong>{valueLabel}</Typography.SmallStrong>
      </Box>
      <Box
        style={{
          height: 8,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: 'var(--aquarium-background-color-muted)',
        }}
      >
        <Box
          style={{
            width: `${Math.max(1, Math.min(100, percent))}%`,
            height: '100%',
            backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
          }}
        />
      </Box>
    </Box>
  )
}

/** Lightweight CPU line chart (Max / Average / Min) — decorative, deterministic. */
function CpuMiniChart() {
  const series: { color: string; points: number[] }[] = [
    { color: 'var(--aquarium-background-color-danger-graphic)', points: [58, 72, 66, 90, 84, 70, 60, 40, 30, 26, 24, 24] },
    { color: 'var(--aquarium-background-color-primary-graphic)', points: [40, 48, 44, 52, 50, 42, 34, 26, 22, 20, 20, 20] },
    { color: 'var(--aquarium-background-color-info-graphic)', points: [64, 30, 22, 26, 24, 20, 18, 16, 15, 15, 16, 16] },
  ]
  const W = 520
  const H = 150
  const toPath = (pts: number[]) =>
    pts
      .map((p, i) => {
        const x = (i / (pts.length - 1)) * W
        const y = H - (p / 100) * H
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  return (
    <Box>
      <Box style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {[
          { label: 'Max', color: 'var(--aquarium-background-color-danger-graphic)' },
          { label: 'Average', color: 'var(--aquarium-background-color-primary-graphic)' },
          { label: 'Min', color: 'var(--aquarium-background-color-info-graphic)' },
        ].map((l) => (
          <Box key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Box component="span" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: l.color }} />
            <Typography.Caption color="muted">{l.label}</Typography.Caption>
          </Box>
        ))}
      </Box>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="CPU across all nodes">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={W}
            y1={H * f}
            y2={H * f}
            stroke="var(--aquarium-border-color-muted)"
            strokeWidth={1}
          />
        ))}
        {series.map((s, i) => (
          <path key={i} d={toPath(s.points)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
    </Box>
  )
}

// ─── Overview page ───────────────────────────────────────────────────────────────

export function OpenSearchOverview({
  service,
  onChangePlan,
  onQuickConnect,
}: {
  service: ServiceRow
  onChangePlan?: () => void
  onQuickConnect?: () => void
}) {
  const [tab, setTab] = useState('opensearch')
  const [showPassword, setShowPassword] = useState(false)

  const host = `${service.serviceName}-quick-upgrade-demo.g.aivencloud.com`
  const port = '12691'
  const password = showPassword ? 'a1v3n-dem0-p4ssw0rd' : '••••••••••'
  const serviceUri = showPassword
    ? `https://avnadmin:a1v3n-dem0-p4ssw0rd@${host}:${port}`
    : `https://CLICK_TO:REVEAL_PASSWORD@${host}:${port}`

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Connection information */}
      <Section
        title="Connection information"
        actions={{ text: 'Quick connect', onClick: () => onQuickConnect?.() }}
      >
        <Tabs value={tab} onChange={(value) => setTab(String(value))}>
          <Tabs.Tab title="OpenSearch" value="opensearch" />
          <Tabs.Tab title="OpenSearch Dashboards" value="dashboards" />
        </Tabs>
        <Box style={{ display: 'flex', flexDirection: 'column' }}>
          <ConnRow label="Service URI" value={serviceUri} masked />
          <ConnRow label="Host" value={host} />
          <ConnRow label="Port" value={port} />
          <ConnRow label="User" value="avnadmin" />
          <ConnRow
            label="Password"
            value={password}
            masked
            actions={
              <>
                <Button.Icon
                  type="button"
                  dense
                  aria-label="Reset password"
                  tooltip="Reset password"
                  icon={resetIcon}
                />
                <Button.Ghost type="button" dense onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? 'Hide' : 'Show'}
                </Button.Ghost>
              </>
            }
          />
        </Box>
      </Section>

      {/* Service plan usage */}
      <Section
        title="Service plan usage"
        subtitle={`${service.planDetails || '2 CPU / 8 GB RAM / 175 GB storage'} · 3-node high availability set`}
        actions={{ text: 'Change plan', onClick: () => onChangePlan?.() }}
        menu={
          <DropdownMenu.Items>
            <DropdownMenu.Item id="change-plan">Change plan</DropdownMenu.Item>
          </DropdownMenu.Items>
        }
        onAction={() => onChangePlan?.()}
      >
        <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 220, flex: '0 0 240px' }}>
            <PlanUsageBar label="Memory used (60min)" valueLabel="69%" percent={69} />
            <PlanUsageBar label="Storage used" valueLabel="0.0% (out of 175 GB)" percent={1} />
          </Box>
          <Box style={{ flex: 1, minWidth: 280 }}>
            <Box style={{ marginBottom: 6 }}>
              <Typography.Caption color="muted">CPU across all nodes (60min)</Typography.Caption>
            </Box>
            <CpuMiniChart />
          </Box>
        </Box>
      </Section>

      {/* Backups and forking */}
      <Section
        title="Backups and forking"
        subtitle="Hourly backup for 24 hours and daily backup for 14 days"
        collapsible
        defaultCollapsed={false}
        menu={
          <DropdownMenu.Items>
            <DropdownMenu.Item id="fork">Create fork</DropdownMenu.Item>
            <DropdownMenu.Item id="restore">Restore from backup</DropdownMenu.Item>
          </DropdownMenu.Items>
        }
        onAction={() => undefined}
      >
        <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 8 }}>
          <InfoStat label="Backup location" value="google-europe-west1" />
          <InfoStat label="Secondary backup location" value="Not set" />
          <InfoStat label="Latest backup" value="12 minutes ago" />
          <InfoStat label="Oldest backup" value="12 minutes ago" />
          <InfoStat label="Total backups stored" value="321 KB" tooltip="Total size of all stored backup files" />
        </Box>
      </Section>

      {/* Maintenance */}
      <Section title="Maintenance" collapsible defaultCollapsed={false}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert type="error" title="Mandatory updates">
            <Typography.Small>
              Scheduled for 25 September 2026 00:10 UTC. Scheduled maintenance for TLS certificate update.{' '}
              <Link href="#" onClick={(event) => event.preventDefault()}>
                More info
              </Link>
            </Typography.Small>
          </Alert>
          <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <InfoStat label="Version" value={SERVICE_VERSION} />
            <InfoStat label="Maintenance window" value="Fridays after 00:10:07 UTC" />
          </Box>
        </Box>
      </Section>

      {/* Cloud and network */}
      <Section title="Cloud and network" collapsible defaultCollapsed={false}>
        <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 8 }}>
          <InfoStat label="Cloud provider" value="Google Cloud" />
          <InfoStat label="Cloud region" value="europe-west1" />
          <InfoStat label="Deployment model" value="Public internet" />
          <InfoStat label="IP address allowlist" value="Open to all" />
        </Box>
      </Section>

      {/* Cross cluster replication */}
      <Section
        title="Cross cluster replication"
        collapsible
        defaultCollapsed={false}
        actions={{ text: 'Create follower', onClick: () => undefined }}
      >
        <Typography.Small color="muted">
          Replicate the cluster to ensure data recovery while maintaining high-availability.{' '}
          <Link href="#" onClick={(event) => event.preventDefault()}>
            Learn more
          </Link>
        </Typography.Small>
      </Section>

      {/* Integrations */}
      <Section
        title="Integrations"
        collapsible
        defaultCollapsed={false}
        actions={[
          { text: 'Set-up endpoint', onClick: () => undefined },
          { text: 'Go to integrations', onClick: () => undefined },
        ]}
      >
        <Typography.Small color="muted">
          Aiven integrations transform the Aiven platform into a true data cloud. Leverage the power of logs,
          metrics, dataflow/replication and authentication integrations among your Aiven services and with external
          applications.{' '}
          <Link href="#" onClick={(event) => event.preventDefault()}>
            Learn more
          </Link>
        </Typography.Small>
      </Section>
    </Box>
  )
}

OpenSearchOverview.displayName = 'OpenSearchOverview'
