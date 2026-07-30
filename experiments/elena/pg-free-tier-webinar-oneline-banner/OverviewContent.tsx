'use client'

import { useState, type ReactNode } from 'react'
import {
  Banner,
  Box,
  Breadcrumbs,
  Button,
  DropdownMenu,
  Icon,
  Link,
  OneLineBanner,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import { Axis, LineChart } from '@aivenio/aquarium/charts'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import downloadIcon from '@aivenio/aquarium/icons/download'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import eyeOpenIcon from '@aivenio/aquarium/icons/eyeOpen'
import refreshIcon from '@aivenio/aquarium/icons/refresh'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import warningSignIcon from '@aivenio/aquarium/icons/warningSign'
import { NodesCountChip } from '@/components/NodesCountChip'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { getServiceIconUrl } from '@/components/ServiceIcon'
import { CloudProviderIcon } from '@/screens/CloudProviderIcon'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import { imageSrc } from '@/lib/image'
import pgUpgradeBannerUrl from './assets/pg-upgrade-banner.png'
import {
  CONNECTION_ROWS,
  FREE_TIER_GATES,
  ORG_NAME,
  PROJECT_NAME,
  SERVICE,
  UPGRADE_BANNER,
  WEBINAR_ANNOUNCEMENT,
  type ConnectionRow,
} from './overviewData'

/** Match Console service overview content padding (equal L/R). */
const MAIN_PAD = 36

function ConnectionRowView({ row, isLast }: { row: ConnectionRow; isLast: boolean }) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBlock: 10,
        borderBottom: isLast ? undefined : '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Box style={{ display: 'flex', gap: 16, minWidth: 0, flex: 1, alignItems: 'baseline' }}>
        <Box style={{ color: 'var(--aquarium-text-color-muted)', minWidth: 140, flexShrink: 0 }}>
          <Typography.Small>{row.label}</Typography.Small>
        </Box>
        <Box style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.valueIsLink ? (
            <Link href="#">{row.value}</Link>
          ) : (
            <Typography.Default>{row.value}</Typography.Default>
          )}
        </Box>
      </Box>
      <Box style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
        {row.actions.map((action) => {
          const icon =
            action === 'copy'
              ? duplicateIcon
              : action === 'download'
                ? downloadIcon
                : action === 'reveal'
                  ? eyeOpenIcon
                  : refreshIcon
          const label =
            action === 'copy'
              ? `Copy ${row.label}`
              : action === 'download'
                ? `Download ${row.label}`
                : action === 'reveal'
                  ? `Reveal ${row.label}`
                  : `Refresh ${row.label}`
          return (
            <Button.Ghost key={action} type="button" aria-label={label} dense>
              <Icon icon={icon} />
            </Button.Ghost>
          )
        })}
      </Box>
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
      />
      <LineChart.Line dataKey="cpu" isAnimationActive={false} />
    </LineChart>
  )
}

function StatCell({
  label,
  value,
  icon,
  valueNode,
}: {
  label: string
  value?: string
  icon?: ReactNode
  valueNode?: ReactNode
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <Typography.Small color="muted">{label}</Typography.Small>
      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {icon}
        {valueNode ?? <Typography.Default>{value}</Typography.Default>}
      </Box>
    </Box>
  )
}

export function OverviewContent() {
  const theme = useResolvedTheme()
  const [showWebinarBanner, setShowWebinarBanner] = useState(true)
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
              <StatusChip text={SERVICE.version} status="neutral" icon={cpuChipIcon} dense />
              <StatusChip text={SERVICE.eolLabel} status="success" icon={tickCircleIcon} dense />
              <ServiceStatusChip status={SERVICE.status} />
              <NodesCountChip count={SERVICE.nodeCount} serviceStatus={SERVICE.status} />
            </Box>
          }
          secondaryActions={{ text: 'Open support ticket', onClick: noop }}
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={noop}
        />
      </Box>

      {showWebinarBanner ? (
        <Box style={{ marginBottom: 16 }}>
          <OneLineBanner
            title={WEBINAR_ANNOUNCEMENT.title}
            action={{
              text: WEBINAR_ANNOUNCEMENT.registerCta,
              href: WEBINAR_ANNOUNCEMENT.href,
            }}
            onDismiss={() => setShowWebinarBanner(false)}
          >
            {WEBINAR_ANNOUNCEMENT.description}{' '}
            <Typography.Strong>{WEBINAR_ANNOUNCEMENT.schedule}</Typography.Strong>
          </OneLineBanner>
        </Box>
      ) : null}

      <Box style={{ marginBottom: 16 }}>
        <Banner
          title={UPGRADE_BANNER.title}
          layout="vertical"
          variant="default"
          image={imageSrc(pgUpgradeBannerUrl)}
          imageAlt="PostgreSQL"
          imageWidth={308}
          imageHeight={196}
          action={{ text: UPGRADE_BANNER.cta, onClick: noop }}
        >
          {UPGRADE_BANNER.description}
        </Banner>
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Section
          title="Connection information"
          collapsible
          defaultCollapsed={false}
          actions={{ text: 'Quick connect', onClick: noop }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            {CONNECTION_ROWS.map((row, index) => (
              <ConnectionRowView
                key={row.label}
                row={row}
                isLast={index === CONNECTION_ROWS.length - 1}
              />
            ))}
          </Box>
        </Section>

        <Section
          title="Service plan usage"
          subtitle={SERVICE.planDetails}
          collapsible
          defaultCollapsed={false}
          actions={{ text: 'Change plan', onClick: noop }}
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
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="download">Download backup</DropdownMenu.Item>
              <DropdownMenu.Item id="restore">Restore from backup</DropdownMenu.Item>
              <DropdownMenu.Item id="fork">Create fork</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={noop}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 24,
              paddingTop: 8,
            }}
          >
            <StatCell label="Backup location" value={SERVICE.backupLocation} />
            <StatCell label="Latest backup" value={SERVICE.latestBackup} />
            <StatCell label="Oldest backup" value={SERVICE.oldestBackup} />
            <StatCell label="Total backups stored" value={SERVICE.totalBackupsStored} />
          </Box>
        </Section>

        <Section
          title="Maintenance"
          collapsible
          defaultCollapsed={false}
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="maintenance-docs">View documentation</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={noop}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 24,
              paddingTop: 8,
            }}
          >
            <StatCell
              label="Version"
              icon={<Icon icon={cpuChipIcon} style={{ width: 16, height: 16 }} />}
              value={SERVICE.version}
            />
            <StatCell
              label="End of life"
              valueNode={
                <StatusChip text={SERVICE.eolLabel} status="success" icon={tickCircleIcon} dense />
              }
            />
            <StatCell label="Maintenance window" value={SERVICE.maintenanceWindow} />
          </Box>
        </Section>

        <Section
          title="Cloud and network"
          collapsible
          defaultCollapsed={false}
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="cloud-docs">View documentation</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={noop}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 24,
              paddingTop: 8,
            }}
          >
            <StatCell
              label="Cloud provider"
              icon={<CloudProviderIcon id={SERVICE.cloudProviderId} size={16} />}
              value={SERVICE.cloudProvider}
            />
            <StatCell
              label="Cloud region"
              icon={
                <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
                  {SERVICE.cloudRegionFlag}
                </span>
              }
              value={SERVICE.cloudRegion}
            />
            <StatCell label="Deployment model" value={SERVICE.deploymentModel} />
            <StatCell
              label="IP address allowlist"
              icon={
                <Icon
                  icon={warningSignIcon}
                  style={{
                    width: 16,
                    height: 16,
                    color: 'var(--aquarium-text-color-warning-default)',
                  }}
                />
              }
              value={SERVICE.ipAllowlist}
            />
          </Box>
        </Section>

        <Section title="Read replica" collapsible defaultCollapsed={false}>
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <Typography.Default>
              {FREE_TIER_GATES.readReplica} <Link href="#">Learn more</Link>
            </Typography.Default>
            <Button.Secondary type="button" onClick={noop}>
              Upgrade plan
            </Button.Secondary>
          </Box>
        </Section>

        <Section
          title="Integrations"
          collapsible
          defaultCollapsed={false}
          actions={[
            { text: 'Go to integrations', onClick: noop },
            { text: 'Set-up endpoint', onClick: noop },
          ]}
        >
          <Typography.Default>
            {FREE_TIER_GATES.integrations} <Link href="#">Learn more</Link>
          </Typography.Default>
        </Section>
      </Box>
    </div>
  )
}

OverviewContent.displayName = 'OverviewContent'
