'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Card,
  DataList,
  EmptyState,
  Grid,
  InlineIcon,
  Link,
  Section,
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
  fmtTb,
  fmtUsd,
  latestActivityForFull,
} from './deriveFull'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import type { OnlineStoreProdFixture } from './fixtures/onlineStoreProd'

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
    <Section title="Recent activity" subtitle="Changes in this project">
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
      <MetricsRow fixture={fixture} />
      <NeedsAttentionModule fixture={fixture} />
      <CapacityHotspotsModule fixture={fixture} />
      <AggregatedActivityModule fixture={fixture} />
    </Box.Flex>
  )
}

FullDesignBody.displayName = 'FullDesignBody'
MetricsRow.displayName = 'MetricsRow'
MetricCard.displayName = 'MetricCard'
NeedsAttentionModule.displayName = 'NeedsAttentionModule'
CapacityHotspotsModule.displayName = 'CapacityHotspotsModule'
AggregatedActivityModule.displayName = 'AggregatedActivityModule'
