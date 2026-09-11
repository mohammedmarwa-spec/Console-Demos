'use client'

import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Card,
  DataList,
  DataTable,
  EmptyState,
  Grid,
  InlineIcon,
  Link,
  Section,
  SegmentedControl,
  SegmentedControlGroup,
  Typography,
} from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/types'
import currencyDollar from '@aivenio/aquarium/icons/currencyDollar'
import database from '@aivenio/aquarium/icons/database'
import outdated from '@aivenio/aquarium/icons/outdated'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import {
  deriveCapacityHotspots,
  deriveFullMetrics,
  deriveSystemRows,
  deriveTypeRollup,
  fmtTb,
  fmtUsd,
  latestActivityForFull,
  type SystemHealth,
} from './deriveFull'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import { useScope, type GroupBy } from './ScopeContext'
import type { OnlineStoreProdFixture } from './fixtures/onlineStoreProd'

const SYSTEM_DOT: Record<SystemHealth, 'danger-default' | 'warning-default' | 'muted' | 'success-default'> = {
  danger: 'danger-default',
  warning: 'warning-default',
  info: 'muted',
  success: 'success-default',
  muted: 'muted',
}

function GroupByControl() {
  const { groupBy, setGroupBy } = useScope()
  return (
    <Box.Flex justifyContent="flex-end" alignItems="center" gap="3">
      <Typography.Small color="muted">Group by</Typography.Small>
      <SegmentedControlGroup
        value={groupBy}
        onChange={(value) => setGroupBy(value as GroupBy)}
        ariaLabel="Group by"
      >
        <SegmentedControl value="system">System</SegmentedControl>
        <SegmentedControl value="service-type">Service type</SegmentedControl>
        <SegmentedControl value="none">None</SegmentedControl>
      </SegmentedControlGroup>
    </Box.Flex>
  )
}

function MetricCard({
  title,
  value,
  sublabel,
  icon,
  accent = 'none',
  sublabelTone = 'muted',
}: {
  title: string
  value: string | number
  sublabel: string
  icon: IconifyIcon
  accent?: 'danger' | 'none'
  sublabelTone?: 'muted' | 'warning-default'
}) {
  const iconColor = accent === 'danger' ? 'danger-default' : 'muted'
  return (
    <Box height="full">
      <Card
        fullWidth
        title={
          <Card.Title>
            <Box.Flex alignItems="center" gap="2">
              <InlineIcon icon={icon} color={iconColor} />
              {title}
            </Box.Flex>
          </Card.Title>
        }
      >
        <Typography.Heading color={accent === 'danger' ? 'danger-default' : undefined}>{value}</Typography.Heading>
        <Box marginTop="2">
          <Typography.Small color={sublabelTone}>{sublabel}</Typography.Small>
        </Box>
      </Card>
    </Box>
  )
}

function MetricsRow({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const metrics = useMemo(() => deriveFullMetrics(fixture), [fixture])
  const over85Label =
    metrics.storageOver85 === 1
      ? '1 service over 85%'
      : `${metrics.storageOver85} services over 85%`

  return (
    <Grid gap="4" alignItems="stretch">
      <Grid.Item xs={12} sm={6} md={3}>
        <MetricCard
          title="Needs attention"
          value={metrics.needsAttention}
          sublabel={`of ${fixture.services.length} services`}
          icon={warningSign}
          accent={metrics.needsAttention > 0 ? 'danger' : 'none'}
        />
      </Grid.Item>
      <Grid.Item xs={12} sm={6} md={3}>
        <MetricCard
          title="Month-to-date spend"
          value={fmtUsd(metrics.spendMtdUsd)}
          sublabel={
            metrics.overBudget
              ? `forecast ${fmtUsd(metrics.spendForecastUsd)} · over ${fmtUsd(metrics.budgetUsd)} budget`
              : `forecast ${fmtUsd(metrics.spendForecastUsd)}`
          }
          icon={currencyDollar}
          sublabelTone={metrics.overBudget ? 'warning-default' : 'muted'}
        />
      </Grid.Item>
      <Grid.Item xs={12} sm={6} md={3}>
        <MetricCard
          title="Storage used"
          value={`${fmtTb(metrics.storageUsedTb)} / ${fmtTb(metrics.storageTotalTb)} TB`}
          sublabel={over85Label}
          icon={database}
        />
      </Grid.Item>
      <Grid.Item xs={12} sm={6} md={3}>
        <MetricCard
          title="Off latest version"
          value={metrics.offLatest}
          sublabel={`${metrics.eolSoon} reach EOL < 30 days`}
          icon={outdated}
        />
      </Grid.Item>
    </Grid>
  )
}

function NeedsAttentionModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return <NeedsAttentionSection fixture={fixture} showSystem filterName="full-attention-severity" />
}

function SystemsModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const rows = useMemo(() => deriveSystemRows(fixture), [fixture])

  return (
    <Section
      title="Systems"
      subtitle={`${fixture.services.length} services in ${rows.length} systems`}
      badge={rows.length}
      actions={[{ text: 'Explore', onClick: () => undefined }]}
    >
      <DataList
        aria-label="Systems"
        hideHeader
        sticky={false}
        rows={rows}
        columns={[
          {
            type: 'custom',
            headerName: 'System',
            UNSAFE_render: (row) => (
              <Box.Flex alignItems="center" justifyContent="space-between" gap="4">
                <Box.Flex alignItems="center" gap="3">
                  <Typography color={SYSTEM_DOT[row.health]} htmlTag="span">
                    <Badge.Dot />
                  </Typography>
                  <Typography.DefaultStrong>{row.name}</Typography.DefaultStrong>
                </Box.Flex>
                <Typography.Small color="muted">
                  {row.serviceCount === 1 ? '1 service' : `${row.serviceCount} services`}
                </Typography.Small>
              </Box.Flex>
            ),
          },
        ]}
      />
    </Section>
  )
}

function ServiceTypeModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const rows = useMemo(() => deriveTypeRollup(fixture), [fixture])

  return (
    <Section title="By service type" subtitle="Composition across the project">
      <DataTable
        ariaLabel="By service type"
        sticky={false}
        rows={rows}
        columns={[
          { type: 'text', field: 'label', headerName: 'Type' },
          { type: 'number', field: 'count', headerName: 'Services' },
          { type: 'text', field: 'issuesLabel', headerName: 'Issues' },
        ]}
      />
    </Section>
  )
}

function ClusterRow({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const { groupBy } = useScope()
  const typeFirst = groupBy === 'service-type'
  const first = typeFirst ? (
    <ServiceTypeModule fixture={fixture} />
  ) : (
    <SystemsModule fixture={fixture} />
  )
  const second = typeFirst ? (
    <SystemsModule fixture={fixture} />
  ) : (
    <ServiceTypeModule fixture={fixture} />
  )

  return (
    <Box
      display="grid"
      gap="4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
    >
      {first}
      {second}
    </Box>
  )
}

function CapacityHotspotsModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const hotspots = useMemo(() => deriveCapacityHotspots(fixture), [fixture])
  const cells = [
    {
      id: 'storage',
      value: hotspots.storageNearLimit,
      label: 'Near storage limit',
      hint: '>85%',
      tone: 'warning-default' as const,
    },
    {
      id: 'cpu',
      value: hotspots.cpuSaturated,
      label: 'CPU saturated',
      hint: '>90%',
      tone: 'danger-default' as const,
    },
    {
      id: 'idle',
      value: hotspots.overProvisioned,
      label: 'Over-provisioned',
      hint: '<15%',
      tone: 'success-default' as const,
    },
  ]

  return (
    <Section title="Capacity hotspots" subtitle="Storage, CPU, and idle headroom">
      <Grid gap="4">
        {cells.map((cell) => (
          <Grid.Item key={cell.id} xs={12} sm={4}>
            <Typography.Heading color={cell.value > 0 ? cell.tone : 'muted'}>{cell.value}</Typography.Heading>
            <Box marginTop="2">
              <Typography.Small>{cell.label}</Typography.Small>
              <Typography.Small color="muted">{cell.hint}</Typography.Small>
            </Box>
          </Grid.Item>
        ))}
      </Grid>
      {hotspots.overProvisioned > 0 ? (
        <Box marginTop="4">
          <Typography.Small color="muted">
            Est. {fmtUsd(hotspots.savingsUsd)} / mo if the over-provisioned services are rightsized
          </Typography.Small>
        </Box>
      ) : null}
    </Section>
  )
}

function AggregatedActivityModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const events = useMemo(() => latestActivityForFull(fixture), [fixture])
  const groupIds = useMemo(() => [...new Set(events.map((event) => event.resource))], [events])
  const [expandedGroupIds, setExpandedGroupIds] = useState(groupIds)

  return (
    <Section title="Recent activity" subtitle="Changes across services, applications and agents">
      {events.length === 0 ? (
        <EmptyState
          title="No recent activity"
          primaryAction={{ text: 'View event log', onClick: () => undefined }}
          borderStyle="solid"
          fullHeight={false}
        >
          Changes across services, applications and agents will appear here
        </EmptyState>
      ) : (
        <Box.Flex flexDirection="column" gap="4">
          <DataList
            aria-label="Recent project activity grouped by service"
            sticky={false}
            rows={events}
            group="resource"
            expandedGroupIds={expandedGroupIds}
            onGroupToggled={(id, open) => {
              setExpandedGroupIds((current) =>
                open ? (current.includes(id) ? current : [...current, id]) : current.filter((key) => key !== id),
              )
            }}
            renderGroupName={(key, rows) => {
              const count = Array.isArray(rows) ? rows.length : 0
              return count > 1 ? `${key} · ${count} changes` : key
            }}
            columns={[
              { type: 'text', field: 'change', headerName: 'Change' },
              { type: 'text', field: 'actor', headerName: 'Actor' },
              { type: 'text', field: 'when', headerName: 'When' },
            ]}
          />
          <Typography.Small>
            <Link href="#" onClick={(event) => event.preventDefault()}>
              +41 more changes today
            </Link>
            {' · grouped by service'}
          </Typography.Small>
        </Box.Flex>
      )}
    </Section>
  )
}

export function FullDesignBody({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return (
    <Box.Flex flexDirection="column" gap="6">
      <GroupByControl />
      <MetricsRow fixture={fixture} />
      <NeedsAttentionModule fixture={fixture} />
      <ClusterRow fixture={fixture} />
      <CapacityHotspotsModule fixture={fixture} />
      <AggregatedActivityModule fixture={fixture} />
    </Box.Flex>
  )
}

FullDesignBody.displayName = 'FullDesignBody'
GroupByControl.displayName = 'GroupByControl'
MetricsRow.displayName = 'MetricsRow'
MetricCard.displayName = 'MetricCard'
NeedsAttentionModule.displayName = 'NeedsAttentionModule'
SystemsModule.displayName = 'SystemsModule'
ServiceTypeModule.displayName = 'ServiceTypeModule'
ClusterRow.displayName = 'ClusterRow'
CapacityHotspotsModule.displayName = 'CapacityHotspotsModule'
AggregatedActivityModule.displayName = 'AggregatedActivityModule'
