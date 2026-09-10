'use client'

import { useMemo, useState, type ComponentProps } from 'react'
import {
  Accordion,
  Badge,
  Box,
  Card,
  EmptyState,
  EmptyStateLayout,
  InlineIcon,
  ProgressBar,
  SegmentedControl,
  SegmentedControlGroup,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/types'
import currencyDollar from '@aivenio/aquarium/icons/currencyDollar'
import database from '@aivenio/aquarium/icons/database'
import errorSign from '@aivenio/aquarium/icons/error'
import outdated from '@aivenio/aquarium/icons/outdated'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@/components/ServiceIcon'
import {
  bySeverity,
  fmtUsd,
  groupServices,
  summarize,
  type GroupDim,
  type OverviewActivity,
  type OverviewDataset,
  type OverviewSeverity,
  type OverviewService,
} from './overviewV2Data'

// ─── Tone tokens ─────────────────────────────────────────────────────────────────

const ACCENT_COLOR: Record<'danger' | 'warning' | 'none', string> = {
  danger: 'var(--aquarium-background-color-danger-graphic)',
  warning: 'var(--aquarium-background-color-warning-graphic)',
  none: 'var(--aquarium-border-color-muted)',
}

/** InlineIcon color union (e.g. 'danger-default' | 'warning-default' | 'muted'). */
type IconColor = NonNullable<ComponentProps<typeof InlineIcon>['color']>

/** InlineIcon color tokens, mirroring aiven-core (danger-default / warning-default). */
const SEVERITY_ICON: Record<Exclude<OverviewSeverity, 'none'>, { icon: IconifyIcon; color: IconColor }> = {
  critical: { icon: errorSign, color: 'danger-default' },
  warning: { icon: warningSign, color: 'warning-default' },
}

const TEXT_TONE = {
  danger: 'var(--aquarium-text-color-error-intense, var(--aquarium-background-color-danger-graphic))',
  warning: 'var(--aquarium-text-color-warning-intense)',
  muted: 'var(--aquarium-text-color-muted)',
} as const

type SubTone = keyof typeof TEXT_TONE | 'default'

// ─── Metric card ─────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sublabel,
  icon,
  iconColor = 'muted',
  accent = 'none',
  valueTone = 'default',
  sublabelTone = 'muted',
}: {
  label: string
  value: string | number
  sublabel: string
  icon: IconifyIcon
  iconColor?: IconColor
  accent?: 'danger' | 'warning' | 'none'
  valueTone?: 'danger' | 'default'
  sublabelTone?: SubTone
}) {
  return (
    <Box
      style={{
        minWidth: 0,
        border: '1px solid var(--aquarium-border-color-muted)',
        borderLeft: `3px solid ${ACCENT_COLOR[accent]}`,
        borderRadius: 'var(--aquarium-border-radius-default, 8px)',
        padding: 20,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--aquarium-text-color-muted)' }}>
        <InlineIcon icon={icon} color={iconColor} width="16px" height="16px" />
        <Typography.Small>{label}</Typography.Small>
      </Box>
      <Box style={{ color: valueTone === 'danger' ? TEXT_TONE.danger : undefined }}>
        <Typography.LargeHeading>{value}</Typography.LargeHeading>
      </Box>
      <Box style={{ color: sublabelTone === 'default' ? undefined : TEXT_TONE[sublabelTone] }}>
        <Typography.Small>{sublabel}</Typography.Small>
      </Box>
    </Box>
  )
}

MetricCard.displayName = 'MetricCard'

// ─── Small building blocks ───────────────────────────────────────────────────────

// Status chips carry icons, mirroring aiven-core's ServiceStatusChip (tickCircle /
// warningSign) and Action-required / EOL chips.
function severityChip(severity: OverviewSeverity) {
  if (severity === 'critical') return <StatusChip dense status="danger" icon={warningSign} text="Critical" />
  if (severity === 'warning') return <StatusChip dense status="warning" icon={warningSign} text="Warning" />
  return <StatusChip dense status="success" icon={tickCircle} text="Healthy" />
}

function AttentionRow({ svc }: { svc: OverviewService }) {
  const sev = svc.severity !== 'none' ? SEVERITY_ICON[svc.severity] : null
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1.6fr) minmax(0,0.9fr)',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderTop: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      {/* Name cell — service-type logo + name, as in aiven-core's ServiceNameCell */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <ServiceIcon serviceTypeId={svc.typeId} size={28} alt="" />
        <Box style={{ minWidth: 0 }}>
          <Typography.DefaultStrong>{svc.name}</Typography.DefaultStrong>
          <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
            <Typography.Small>{svc.type}</Typography.Small>
          </Box>
        </Box>
      </Box>
      {/* Reason cell — severity InlineIcon + text, as in aiven-core's ServiceAlertsCell */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {sev ? <InlineIcon icon={sev.icon} color={sev.color} width="16px" height="16px" /> : null}
        <Typography.Small>{svc.attentionReason}</Typography.Small>
      </Box>
      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>{severityChip(svc.severity)}</Box>
    </Box>
  )
}

// ─── Grouped rollup (Systems / Service types) ───────────────────────────────────

function GroupRollup({ dim, services }: { dim: Exclude<GroupDim, 'none'>; services: OverviewService[] }) {
  const groups = useMemo(() => groupServices(services, dim), [services, dim])
  const title = dim === 'system' ? 'Systems' : 'Service types'

  return (
    <Section title={title}>
      {/* Column headers */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.4fr)',
          gap: 12,
          paddingBottom: 8,
          color: 'var(--aquarium-text-color-muted)',
        }}
      >
        <Typography.Small color="muted">{dim === 'system' ? 'System' : 'Service type'}</Typography.Small>
        <Typography.Small color="muted">Health</Typography.Small>
        <Typography.Small color="muted">Spend (MTD)</Typography.Small>
        <Typography.Small color="muted">Storage</Typography.Small>
      </Box>
      {groups.map((g) => {
        const storagePct = g.storageTotalGb > 0 ? (g.storageUsedGb / g.storageTotalGb) * 100 : 0
        return (
          <Box
            key={g.key}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.4fr)',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderTop: '1px solid var(--aquarium-border-color-muted)',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Typography.DefaultStrong>{g.label}</Typography.DefaultStrong>
              <Badge value={g.services.length} kind="outlined" dense />
            </Box>
            <Box>
              {g.attentionCount > 0 ? (
                <StatusChip dense status="warning" icon={warningSign} text={`${g.attentionCount} need attention`} />
              ) : (
                <StatusChip dense status="success" icon={tickCircle} text="Healthy" />
              )}
            </Box>
            <Typography.Small>{fmtUsd(g.spendMtd)}</Typography.Small>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <ProgressBar
                dense
                value={Math.round(storagePct)}
                progresStatus={storagePct > 85 ? 'warning' : 'info'}
                completedStatus="error"
                aria-label={`${g.label} storage`}
              />
              <Typography.Small color="muted">
                {(g.storageUsedGb / 1024).toFixed(1)} / {(g.storageTotalGb / 1024).toFixed(1)} TB
              </Typography.Small>
            </Box>
          </Box>
        )
      })}
    </Section>
  )
}

GroupRollup.displayName = 'GroupRollup'

// ─── Needs attention (exception-first, grouped by the group-by dimension) ───────

function NeedsAttention({ dim, services }: { dim: GroupDim; services: OverviewService[] }) {
  const attention = useMemo(() => services.filter((s) => s.needsAttention).sort(bySeverity), [services])

  const body = () => {
    if (attention.length === 0) {
      return (
        <EmptyState title="Nothing needs attention" borderStyle="solid" fullHeight={false}>
          All services are healthy right now.
        </EmptyState>
      )
    }

    if (dim === 'none') {
      return <Box>{attention.map((svc) => <AttentionRow key={svc.id} svc={svc} />)}</Box>
    }

    const groups = groupServices(attention, dim).filter((g) => g.services.length > 0)

    if (groups.length === 1) {
      return (
        <Box>
          {[...groups[0].services].sort(bySeverity).map((svc) => (
            <AttentionRow key={svc.id} svc={svc} />
          ))}
        </Box>
      )
    }

    return (
      <Box.Flex flexDirection="column">
        {groups.map((g) => {
          const worst: OverviewSeverity = g.services.some((s) => s.severity === 'critical')
            ? 'critical'
            : 'warning'
          return (
            <Accordion key={g.key}>
              <Accordion.Container panelId={g.key}>
                <Accordion.Summary
                  title={g.label}
                  description={
                    <Box.Flex alignItems="center" gap="2">
                      <Typography.Small color="muted">
                        {g.services.length} {g.services.length === 1 ? 'service' : 'services'}
                      </Typography.Small>
                      {severityChip(worst)}
                    </Box.Flex>
                  }
                  toggle={<Accordion.Toggle />}
                />
                <Accordion.Panel>
                  <Box style={{ paddingBottom: 8 }}>
                    {[...g.services].sort(bySeverity).map((svc) => (
                      <AttentionRow key={svc.id} svc={svc} />
                    ))}
                  </Box>
                </Accordion.Panel>
              </Accordion.Container>
            </Accordion>
          )
        })}
      </Box.Flex>
    )
  }

  return (
    <Section
      title="Needs attention"
      subtitle="Project-level issues, grouped and ordered by impact."
      actions={attention.length > 0 ? { text: 'View all issues', onClick: () => undefined } : undefined}
    >
      {body()}
    </Section>
  )
}

NeedsAttention.displayName = 'NeedsAttention'

// ─── Recent activity (horizontal strip, pinned to the top of Overview) ──────────

const ACTIVITY_STATUS: Record<OverviewActivity['variant'], 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  default: 'neutral',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
}

function RecentActivity({ dataset }: { dataset: OverviewDataset }) {
  return (
    <Section
      title="Recent project activity"
      subtitle="Changes across services, applications and agents."
      actions={{ text: 'View event log', onClick: () => undefined }}
    >
      {dataset.activity.length === 0 ? (
        <EmptyState title="No recent activity" layout={EmptyStateLayout.Horizontal} borderStyle="solid">
          Changes across services, applications and agents will appear here.
        </EmptyState>
      ) : (
        <Box
          role="list"
          aria-label="Recent project activity"
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {dataset.activity.map((item) => (
            <Box
              key={item.id}
              role="listitem"
              style={{ flex: '1 0 200px', minWidth: 200, maxWidth: 280 }}
            >
              <Card.Compact fullWidth title={item.change}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <StatusChip dense status={ACTIVITY_STATUS[item.variant]} text={item.when} />
                  <Typography.Small color="muted">
                    {item.resource} · {item.actor}
                  </Typography.Small>
                </Box>
              </Card.Compact>
            </Box>
          ))}
        </Box>
      )}
    </Section>
  )
}

RecentActivity.displayName = 'RecentActivity'

// ─── Overview V2 ─────────────────────────────────────────────────────────────────

export function OverviewV2({ dataset }: { dataset: OverviewDataset }) {
  const [dim, setDim] = useState<GroupDim>('system')
  const summary = useMemo(() => summarize(dataset), [dataset])

  // Zero-state: a single, friendly hero instead of a wall of 0s + header-only tables.
  if (summary.total === 0) {
    return (
      <EmptyState
        title="No services yet"
        primaryAction={{ text: 'Create your first service', onClick: () => undefined }}
        secondaryAction={{ text: 'Explore solutions', href: '#' }}
        footer="Services, apps and agents you create will be summarised here."
      >
        This project has no services, apps or agents yet. Create one to start building your
        aggregation-first Overview.
      </EmptyState>
    )
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Recent activity — horizontal strip at the top, not buried below the rollup */}
      <RecentActivity dataset={dataset} />

      {/* Group-by control — right-aligned under the activity strip */}
      <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <Typography.Small color="muted">Group by</Typography.Small>
        <SegmentedControlGroup
          value={dim}
          onChange={(value) => setDim(value as GroupDim)}
          ariaLabel="Group services by"
        >
          <SegmentedControl value="system">System</SegmentedControl>
          <SegmentedControl value="type">Service type</SegmentedControl>
          <SegmentedControl value="none">None</SegmentedControl>
        </SegmentedControlGroup>
      </Box>

      {/* Summary metric row */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
        }}
      >
        <MetricCard
          label="Needs attention"
          value={summary.needsAttention}
          sublabel={`of ${summary.total} services`}
          icon={warningSign}
          iconColor={summary.needsAttention > 0 ? 'danger-default' : 'muted'}
          accent={summary.needsAttention > 0 ? 'danger' : 'none'}
          valueTone={summary.needsAttention > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          label="Month-to-date spend"
          value={fmtUsd(summary.spendMtd)}
          sublabel={
            summary.overBudget
              ? `forecast ${fmtUsd(summary.spendForecast)} · over ${fmtUsd(summary.budgetUsd)} budget`
              : `forecast ${fmtUsd(summary.spendForecast)}`
          }
          icon={currencyDollar}
          iconColor={summary.overBudget ? 'warning-default' : 'muted'}
          sublabelTone={summary.overBudget ? 'warning' : 'muted'}
        />
        <MetricCard
          label="Storage used"
          value={`${summary.storageUsedTb.toFixed(1)} / ${summary.storageTotalTb.toFixed(1)} TB`}
          sublabel={`${summary.storageOver85} ${summary.storageOver85 === 1 ? 'service' : 'services'} over 85%`}
          icon={database}
          iconColor={summary.storageOver85 > 0 ? 'warning-default' : 'muted'}
          sublabelTone={summary.storageOver85 > 0 ? 'warning' : 'muted'}
        />
        <MetricCard
          label="Off latest version"
          value={summary.offLatest}
          sublabel={`${summary.eolSoon} reach EOL < 30 days`}
          icon={outdated}
          iconColor={summary.eolSoon > 0 ? 'danger-default' : 'muted'}
          sublabelTone={summary.eolSoon > 0 ? 'danger' : 'muted'}
        />
      </Box>

      {/* Grouped rollup — Systems / Service types (hidden when Group by = None) */}
      {dim !== 'none' ? <GroupRollup dim={dim} services={dataset.services} /> : null}

      {/* Needs attention — grouped, exception-first */}
      <NeedsAttention dim={dim} services={dataset.services} />
    </Box>
  )
}

OverviewV2.displayName = 'OverviewV2'
