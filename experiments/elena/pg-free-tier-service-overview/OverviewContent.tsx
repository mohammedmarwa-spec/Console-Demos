'use client'

import { useState } from 'react'
import {
  Banner,
  Box,
  Breadcrumbs,
  Button,
  DropdownMenu,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Tabs,
  Typography,
} from '@aivenio/aquarium'
import { Axis, LineChart } from '@aivenio/aquarium/charts'
import { NodesCountChip } from '@/components/NodesCountChip'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { getServiceIconUrl } from '@/components/ServiceIcon'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import hobbyistBannerUrl from '@/assets/upgrade-plan-illus/hobbyist-banner.svg'
import {
  CONNECTION_ROWS,
  FREE_TIER_GATES,
  ORG_NAME,
  PROJECT_NAME,
  SERVICE,
  UPGRADE_BANNER,
} from './overviewData'

const MAIN_PAD = 24

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', gap: 16 }}>
      <Box style={{ color: 'var(--aquarium-text-color-muted)', minWidth: 140 }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.Default>{value}</Typography.Default>
    </Box>
  )
}

function PlanUsageBar({
  label,
  value,
  percent,
}: {
  label: string
  value: string
  percent: number
}) {
  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Typography.Small>{label}</Typography.Small>
        <Typography.Small>{value}</Typography.Small>
      </Box>
      <Box
        style={{
          height: 4,
          backgroundColor: 'var(--aquarium-background-color-default)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            height: '100%',
            backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
            borderRadius: 12,
          }}
        />
      </Box>
    </Box>
  )
}

const CPU_SERIES = [
  { time: '13:00', cpu: 42 },
  { time: '13:15', cpu: 50 },
  { time: '13:30', cpu: 68 },
  { time: '13:45', cpu: 55 },
  { time: '14:00', cpu: 72 },
  { time: '14:15', cpu: 58 },
  { time: '14:30', cpu: 48 },
  { time: '14:45', cpu: 64 },
  { time: '15:00', cpu: 52 },
  { time: '15:15', cpu: 44 },
]

/** Aquarium LineChart — axis ticks pick up DS small typography via .recharts-cartesian-axis-tick-value */
function CpuLineChart() {
  return (
    <LineChart data={CPU_SERIES} height={140} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <Axis.XAxis dataKey="time" tickLine={false} axisLine={false} interval="preserveStartEnd" />
      <Axis.YAxis
        domain={[0, 100]}
        ticks={[0, 25, 50, 75, 100]}
        width={40}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v) => (v === 0 ? 'Average' : String(v))}
      />
      <LineChart.Line dataKey="cpu" isAnimationActive={false} />
    </LineChart>
  )
}

function BackupStat({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
      <Typography.Caption color="muted">{label}</Typography.Caption>
      <Typography.Default>{value}</Typography.Default>
    </Box>
  )
}

function FreeTierGate({
  message,
  onUpgrade,
}: {
  message: string
  onUpgrade: () => void
}) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <Typography.Small>
        {message} <Link href="#">Learn more</Link>
      </Typography.Small>
      <Button.Primary type="button" onClick={onUpgrade}>
        Upgrade plan
      </Button.Primary>
    </Box>
  )
}

export function OverviewContent() {
  const theme = useResolvedTheme()
  const [connectionTab, setConnectionTab] = useState('psql')

  const noop = () => {}

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        padding: MAIN_PAD,
        overflow: 'auto',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box style={{ maxWidth: 1120, marginInline: 'auto' }}>
        <Box style={{ marginBottom: 24 }}>
          <PageHeader
            title={SERVICE.name}
            image={getServiceIconUrl(SERVICE.serviceTypeId, theme)}
            imageAlt={SERVICE.serviceType}
            breadcrumbs={[
              <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                {ORG_NAME}
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="project" href="#" onClick={(e) => e.preventDefault()}>
                {PROJECT_NAME}
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="service">{SERVICE.name}</Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="overview">Overview</Breadcrumbs.Crumb>,
            ]}
            subtitle={
              <Box
                component="span"
                style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <StatusChip text={SERVICE.version} status="neutral" dense />
                <StatusChip text={SERVICE.eolLabel} status="success" dense />
                <ServiceStatusChip status={SERVICE.status} />
                <NodesCountChip count={SERVICE.nodeCount} serviceStatus={SERVICE.status} />
              </Box>
            }
            primaryAction={{ text: 'Open support ticket', onClick: noop }}
            menu={
              <DropdownMenu.Items>
                <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
              </DropdownMenu.Items>
            }
            onAction={noop}
          />
        </Box>

        {/* Aquarium Banner — vertical layout (default)
            @see https://aquarium-library.aiven.io/?path=/docs/data-display-banner--docs#vertical-layout-default */}
        <Box style={{ marginBottom: 16 }}>
          <Banner
            title={UPGRADE_BANNER.title}
            layout="vertical"
            variant="default"
            image={hobbyistBannerUrl}
            imageAlt=""
            action={{ text: UPGRADE_BANNER.cta, onClick: noop }}
          >
            {UPGRADE_BANNER.description}
          </Banner>
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section
            title="Connection information"
            collapsible
            defaultCollapsed={false}
            actions={{ text: 'Quick connect', onClick: noop }}
          >
            <Tabs
              value={connectionTab}
              onChange={(key) => setConnectionTab(String(key))}
            >
              <Tabs.Tab title="psql" value="psql" />
              <Tabs.Tab title="Connection string" value="uri" />
            </Tabs>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              {CONNECTION_ROWS.map((row) => (
                <Row key={row.label} label={row.label} value={row.value} />
              ))}
            </Box>
          </Section>

          <Section
            title="Service plan usage"
            subtitle={SERVICE.planDetails}
            collapsible
            defaultCollapsed={false}
            actions={{ text: 'Upgrade plan', onClick: noop }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <PlanUsageBar
                label="Memory used (60min)"
                value={`${SERVICE.memoryPercent}%`}
                percent={SERVICE.memoryPercent}
              />
              <PlanUsageBar
                label="Storage used"
                value={`${SERVICE.storagePercent}% (out of ${SERVICE.storageCapacity})`}
                percent={SERVICE.storagePercent}
              />
              <Box>
                <Box style={{ marginBottom: 8 }}>
                  <Typography.Small color="muted">CPU across all nodes (60min)</Typography.Small>
                </Box>
                <CpuLineChart />
              </Box>
            </Box>
          </Section>

          <Section
            title="Backups and forking"
            subtitle="Backups for disaster recovery"
            collapsible
            defaultCollapsed={false}
          >
            <Box style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 8 }}>
              <BackupStat label="Backup location" value={SERVICE.backupLocation} />
              <BackupStat label="Latest backup" value={SERVICE.latestBackup} />
              <BackupStat label="Oldest backup" value={SERVICE.oldestBackup} />
              <BackupStat label="Total backups stored" value={SERVICE.totalBackupsStored} />
            </Box>
          </Section>

          <Section title="Maintenance" collapsible defaultCollapsed={false}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Version" value={SERVICE.version} />
              <Row label="End of life" value={SERVICE.eolLabel} />
              <Row label="Maintenance window" value={SERVICE.maintenanceWindow} />
            </Box>
          </Section>

          <Section title="Cloud and network" collapsible defaultCollapsed={false}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Cloud provider" value={SERVICE.cloudProvider} />
              <Row label="Cloud region" value={SERVICE.cloudRegion} />
              <Row label="Deployment model" value={SERVICE.deploymentModel} />
              <Row label="IP address allowlist" value={SERVICE.ipAllowlist} />
            </Box>
          </Section>

          <Section title="Read replica" collapsible defaultCollapsed={false}>
            <FreeTierGate message={FREE_TIER_GATES.readReplica} onUpgrade={noop} />
          </Section>

          <Section title="Integrations" collapsible defaultCollapsed={false}>
            <FreeTierGate message={FREE_TIER_GATES.integrations} onUpgrade={noop} />
          </Section>
        </Box>
      </Box>
    </div>
  )
}

OverviewContent.displayName = 'OverviewContent'
