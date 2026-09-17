'use client'

import { useMemo, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Banner,
  Box,
  Button,
  Card,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  EmptyState,
  Grid,
  InlineIcon,
  Link,
  PageHeader,
  ProgressBar,
  Section,
  Skeleton,
  StatusChip,
  Tabs,
  Timeline,
  Typography,
} from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/types'
import arrowLeft from '@aivenio/aquarium/icons/arrowLeft'
import chat from '@aivenio/aquarium/icons/chat'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import consoleIcon from '@aivenio/aquarium/icons/console'
import cpuChip from '@aivenio/aquarium/icons/cpuChip'
import currencyDollar from '@aivenio/aquarium/icons/currencyDollar'
import database from '@aivenio/aquarium/icons/database'
import dataflow01 from '@aivenio/aquarium/icons/dataflow01'
import dataLineage from '@aivenio/aquarium/icons/dataLineage'
import integrations from '@aivenio/aquarium/icons/integrations'
import outdated from '@aivenio/aquarium/icons/outdated'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@/components/ServiceIcon'
import { CreateServiceTopologyModal } from './CreateServiceTopologyModal'
import { ExploreSolutions, type OutcomeId } from './ExploreSolutions'
import { BlueprintDeploymentView, type DeploymentState } from './BlueprintDeployment'
import { SolutionBlueprint } from './SolutionBlueprint'
import { BLUEPRINTS, type ProjectContext } from './solutionBlueprints'
import {
  bySeverity,
  criticalActivity,
  deriveCapacityHotspots,
  type AttentionCategory,
  fmtUsd,
  groupServices,
  pageScale,
  summarize,
  type AsyncStatus,
  type OverviewActivity,
  type OverviewDataset,
  type OverviewSeverity,
  type OverviewService,
  type OverviewSummary,
} from './overviewV2Data'

const CREATE_SERVICE = { text: 'Create service', onClick: () => undefined }

// ─── Tone tokens ─────────────────────────────────────────────────────────────────

const ACCENT_COLOR: Record<'danger' | 'warning' | 'none', string> = {
  danger: 'var(--aquarium-background-color-danger-graphic)',
  warning: 'var(--aquarium-background-color-warning-graphic)',
  none: 'var(--aquarium-border-color-muted)',
}

/** InlineIcon color union (e.g. 'danger-default' | 'warning-default' | 'muted'). */
type IconColor = NonNullable<ComponentProps<typeof InlineIcon>['color']>

const TEXT_TONE = {
  danger: 'var(--aquarium-text-color-error-intense, var(--aquarium-background-color-danger-graphic))',
  warning: 'var(--aquarium-text-color-warning-intense)',
  muted: 'var(--aquarium-text-color-muted)',
} as const

type SubTone = keyof typeof TEXT_TONE | 'default'

const MODULE_FRAME: CSSProperties = {
  border: '1px solid var(--aquarium-border-color-muted)',
  borderRadius: 'var(--aquarium-border-radius-default, 8px)',
  padding: 20,
  backgroundColor: 'var(--aquarium-background-color-layer)',
}

// ─── Module async (Skeleton / inline Retry — never a spinner or exception string) ─

function ModuleStatus({
  module,
  status,
  onRetry,
  loading,
  children,
}: {
  module: string
  status: AsyncStatus
  onRetry?: () => void
  loading: ReactNode
  children: ReactNode
}) {
  if (status === 'loading') return <>{loading}</>
  if (status === 'error') {
    return (
      <Alert type="error" title={`Couldn't load ${module}`} action={{ text: 'Retry', onClick: () => onRetry?.() }} />
    )
  }
  return <>{children}</>
}

function MetricsSkeleton() {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} style={{ ...MODULE_FRAME, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton height={16} width={120} />
          <Skeleton height={32} width={80} />
          <Skeleton height={14} width={160} />
        </Box>
      ))}
    </Box>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={40} width={640} />
      ))}
    </Box>
  )
}

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
        ...MODULE_FRAME,
        borderLeft: `3px solid ${ACCENT_COLOR[accent]}`,
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

function MetricsRow({
  summary,
  status,
  onRetry,
  isPageEmpty,
}: {
  summary: OverviewSummary
  status: AsyncStatus
  onRetry?: () => void
  isPageEmpty: boolean
}) {
  return (
    <ModuleStatus module="metrics" status={status} onRetry={onRetry} loading={<MetricsSkeleton />}>
      {isPageEmpty ? (
        <EmptyState title="No usage yet" primaryAction={CREATE_SERVICE} borderStyle="solid" fullHeight={false}>
          Spend and storage will appear after you create a service
        </EmptyState>
      ) : (
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
      )}
    </ModuleStatus>
  )
}

MetricsRow.displayName = 'MetricsRow'

function CapacityHotspotsSkeleton() {
  return (
    <Grid gap="4">
      {[0, 1, 2].map((i) => (
        <Grid.Item key={i} xs={12} sm={4}>
          <Skeleton height={32} width={48} />
          <Box marginTop="2">
            <Skeleton height={14} width={140} />
            <Skeleton height={14} width={64} />
          </Box>
        </Grid.Item>
      ))}
    </Grid>
  )
}

function CapacityHotspots({
  services,
  status,
  onRetry,
  isPageEmpty,
}: {
  services: OverviewService[]
  status: AsyncStatus
  onRetry?: () => void
  isPageEmpty: boolean
}) {
  const hotspots = useMemo(() => deriveCapacityHotspots(services), [services])
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
      <ModuleStatus module="capacity hotspots" status={status} onRetry={onRetry} loading={<CapacityHotspotsSkeleton />}>
        {isPageEmpty ? (
          <EmptyState title="No capacity data yet" primaryAction={CREATE_SERVICE} borderStyle="solid" fullHeight={false}>
            Storage, CPU and idle headroom will appear after you create a service
          </EmptyState>
        ) : (
          <>
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
          </>
        )}
      </ModuleStatus>
    </Section>
  )
}

CapacityHotspots.displayName = 'CapacityHotspots'

// ─── Small building blocks ───────────────────────────────────────────────────────

const ISSUE_DOT: Record<Exclude<OverviewSeverity, 'none'>, string> = {
  critical: 'var(--aquarium-background-color-danger-graphic)',
  warning: 'var(--aquarium-background-color-warning-graphic)',
}

type AttentionIssueRow = {
  id: string
  issue: string
  affectedResources: string
  impact: string
  started: string
  severity: Exclude<OverviewSeverity, 'none'>
  service: OverviewService
}

function toIssueRow(svc: OverviewService): AttentionIssueRow {
  return {
    id: svc.id,
    issue: svc.attentionReason ?? 'Needs attention',
    affectedResources: svc.name,
    impact: svc.impact ?? 'Service health',
    started: svc.started ?? '—',
    severity: svc.severity === 'critical' ? 'critical' : 'warning',
    service: svc,
  }
}

// ─── Grouped rollup (Systems / Service types) — large volume only ───────────────

function GroupRollup({
  services,
  status,
  onRetry,
}: {
  services: OverviewService[]
  status: AsyncStatus
  onRetry?: () => void
}) {
  const groups = useMemo(() => groupServices(services, 'type'), [services])

  return (
    <ModuleStatus module="service types" status={status} onRetry={onRetry} loading={<ListSkeleton rows={5} />}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.4fr)',
            gap: 12,
            paddingBottom: 8,
            color: 'var(--aquarium-text-color-muted)',
          }}
        >
          <Typography.Small color="muted">Service type</Typography.Small>
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
    </ModuleStatus>
  )
}

GroupRollup.displayName = 'GroupRollup'

// ─── Needs attention ─────────────────────────────────────────────────────────────

type AttentionFilter = 'all' | 'high' | 'other' | AttentionCategory

/** Severity filters first, then the alert kinds from the Console alerts table. */
const ATTENTION_CATEGORY_FILTERS: { id: AttentionCategory; label: string }[] = [
  { id: 'eol', label: 'Close EOL' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'degraded', label: 'Degraded service' },
]

function NeedsAttention({
  services,
  status,
  onRetry,
  isPageEmpty,
  onOpenService,
}: {
  services: OverviewService[]
  status: AsyncStatus
  onRetry?: () => void
  isPageEmpty: boolean
  onOpenService: (svc: OverviewService) => void
}) {
  const [filter, setFilter] = useState<AttentionFilter>('all')
  const attention = useMemo(() => services.filter((s) => s.needsAttention).sort(bySeverity), [services])
  const visible = useMemo(() => {
    if (filter === 'high') return attention.filter((s) => s.severity === 'critical')
    if (filter === 'other') return attention.filter((s) => s.severity !== 'critical')
    if (filter !== 'all') return attention.filter((s) => s.attentionCategory === filter)
    return attention
  }, [attention, filter])

  const highCount = attention.filter((s) => s.severity === 'critical').length
  const otherCount = attention.length - highCount
  const categoryCounts = useMemo(
    () =>
      ATTENTION_CATEGORY_FILTERS.map((category) => ({
        ...category,
        count: attention.filter((s) => s.attentionCategory === category.id).length,
      })),
    [attention],
  )

  const rows = useMemo(() => visible.map(toIssueRow), [visible])

  const body = () => {
    if (isPageEmpty) {
      return (
        <EmptyState title="Nothing needs attention" primaryAction={CREATE_SERVICE} borderStyle="solid" fullHeight={false}>
          Issues will appear after you create a service
        </EmptyState>
      )
    }

    if (attention.length === 0) {
      return (
        <EmptyState title="Nothing needs attention" borderStyle="solid" fullHeight={false}>
          All services are healthy right now
        </EmptyState>
      )
    }

    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography.Small color="muted">Project-level issues, ordered by their impact.</Typography.Small>
        <ChoiceChipGroup
          name="needs-attention-severity"
          selectionMode="radio"
          dense
          value={filter}
          onChange={(value) => setFilter(value as AttentionFilter)}
        >
          {[
            <ChoiceChip key="all" value="all">
              All {attention.length}
            </ChoiceChip>,
            <ChoiceChip key="high" value="high">
              High {highCount}
            </ChoiceChip>,
            <ChoiceChip key="other" value="other">
              Other {otherCount}
            </ChoiceChip>,
            ...categoryCounts.map((category) => (
              <ChoiceChip key={category.id} value={category.id} disabled={category.count === 0}>
                {category.label} {category.count}
              </ChoiceChip>
            )),
          ]}
        </ChoiceChipGroup>
        {visible.length === 0 ? (
          <EmptyState title="No issues in this filter" borderStyle="solid" fullHeight={false}>
            Switch to All to see every service that needs attention
          </EmptyState>
        ) : (
          <DataTable
            ariaLabel="Needs attention"
            rows={rows}
            columns={[
              {
                type: 'custom',
                headerName: 'Issue',
                UNSAFE_render: (row) => (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Box
                      aria-label={row.severity}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundColor: ISSUE_DOT[row.severity],
                      }}
                    />
                    <Link
                      href={`#/services/${row.service.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        onOpenService(row.service)
                      }}
                    >
                      {row.issue}
                    </Link>
                  </Box>
                ),
              },
              {
                type: 'text',
                field: 'affectedResources',
                headerName: 'Affected resources',
              },
              {
                type: 'text',
                field: 'impact',
                headerName: 'Impact',
              },
              {
                type: 'custom',
                headerName: 'Started',
                UNSAFE_render: (row) => (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      color: 'var(--aquarium-text-color-muted)',
                    }}
                  >
                    <Typography.Small>{row.started}</Typography.Small>
                    <InlineIcon icon={chevronRight} width="16px" height="16px" color="muted" />
                  </Box>
                ),
              },
            ]}
          />
        )}
      </Box>
    )
  }

  return (
    <ModuleStatus
      module="needs attention"
      status={status}
      onRetry={onRetry}
      loading={<DataTable.Skeleton columns={['2', '2', '1', '1']} rows={4} />}
    >
      {body()}
    </ModuleStatus>
  )
}

NeedsAttention.displayName = 'NeedsAttention'

function ServicePreview({ svc, onBack }: { svc: OverviewService; onBack: () => void }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button.Ghost type="button" dense icon={arrowLeft} onClick={onBack}>
        Back to overview
      </Button.Ghost>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ServiceIcon serviceTypeId={svc.typeId} size={40} alt="" />
        <PageHeader
          title={svc.name}
          subtitle={<Typography.Default color="muted">{svc.type}</Typography.Default>}
        />
      </Box>
      {svc.attentionReason ? (
        <StatusChip
          status={svc.severity === 'critical' ? 'danger' : 'warning'}
          icon={warningSign}
          text={svc.attentionReason}
        />
      ) : null}
      <EmptyState title="Service overview" borderStyle="solid" fullHeight={false}>
        Opened from Needs attention. Full service pages are not part of this experiment
      </EmptyState>
    </Box>
  )
}

ServicePreview.displayName = 'ServicePreview'

// ─── Recent activity (Timeline at the top of Overview) ──────────────────────────

/** Large projects show only the worst few changes; everything else is in the event log. */
const ACTIVITY_LIMIT_LARGE = 3

function RecentActivity({
  items,
  status,
  onRetry,
  subtitle = 'Changes across services, applications and agents',
}: {
  items: OverviewActivity[]
  status: AsyncStatus
  onRetry?: () => void
  subtitle?: string
}) {
  return (
    <Section
      title="Recent project activity"
      subtitle={subtitle}
      actions={{ text: 'View event log', onClick: () => undefined }}
    >
      <ModuleStatus
        module="recent activity"
        status={status}
        onRetry={onRetry}
        loading={<Timeline.Skeleton items={4} />}
      >
        {items.length === 0 ? (
          <EmptyState title="No recent activity" borderStyle="solid" fullHeight={false}>
            Changes across services, applications and agents will appear here
          </EmptyState>
        ) : (
          <Timeline aria-label="Recent project activity">
            {items.map((item) => (
              <Timeline.Item key={item.id} title={item.change} variant={item.variant}>
                <Typography.Small color="muted">
                  {item.resource} · {item.actor} · {item.when}
                </Typography.Small>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </ModuleStatus>
    </Section>
  )
}

RecentActivity.displayName = 'RecentActivity'

// ─── Empty Overview — explore the platform ───────────────────────────────────────

type PlatformTile = {
  id: string
  icon: IconifyIcon
  title: string
  description: string
  /** Card `chips` entries — status objects render as status chips. */
  chips: ComponentProps<typeof Card>['chips']
}

/** Every tile carries a chip so the chip row, title and body line up across the grid. */
const AVAILABLE_CHIP: ComponentProps<typeof Card>['chips'] = [{ text: 'Available', status: 'neutral' }]

const PLATFORM_TILES: PlatformTile[] = [
  {
    id: 'runtime',
    icon: consoleIcon,
    title: 'Runtime',
    description: 'Run apps and agents next to your data.',
    chips: AVAILABLE_CHIP,
  },
  {
    id: 'ai-gateway',
    icon: dataflow01,
    title: 'AI gateway',
    description: 'One endpoint for all your AI traffic.',
    chips: AVAILABLE_CHIP,
  },
  {
    id: 'agents',
    icon: chat,
    title: 'Agents',
    description: 'Deploy managed agents over your services.',
    chips: [{ text: 'New', status: 'info' }],
  },
  {
    id: 'datahub',
    icon: dataLineage,
    title: 'DataHub',
    description: 'Context, catalog, lineage and governance.',
    chips: AVAILABLE_CHIP,
  },
  {
    id: 'integration-endpoints',
    icon: integrations,
    title: 'Integration endpoints',
    description: 'Connect Aiven to external systems over MCP.',
    chips: AVAILABLE_CHIP,
  },
  {
    id: 'inference',
    icon: cpuChip,
    title: 'Inference',
    description: 'Run models directly on the platform.',
    chips: [{ text: 'Coming soon', status: 'warning' }],
  },
]

function ExplorePlatform() {
  return (
    <Section title="Explore the platform">
      <Grid gap="4" alignItems="stretch">
        {PLATFORM_TILES.map((tile) => (
          <Grid.Item key={tile.id} xs={12} sm={6} md={4}>
            {/* Flex wrapper so every card fills its grid row and the rows line up. */}
            <Box height="full" style={{ display: 'flex' }}>
              <Card
                fullWidth
                onClick={() => undefined}
                chips={tile.chips}
                title={
                  <Card.Title>
                    <InlineIcon icon={tile.icon} width="20px" height="20px" color="primary-graphic" />
                    <span>{tile.title}</span>
                  </Card.Title>
                }
              >
                <Typography.Small color="muted">{tile.description}</Typography.Small>
              </Card>
            </Box>
          </Grid.Item>
        ))}
      </Grid>
    </Section>
  )
}

ExplorePlatform.displayName = 'ExplorePlatform'

// ─── Overview V2 ─────────────────────────────────────────────────────────────────

export function OverviewV2({
  dataset,
  status = 'loaded',
  onRetry,
  project,
  projects,
  onProjectChange,
  onCreateDevelopmentProject,
}: {
  dataset: OverviewDataset
  status?: AsyncStatus
  onRetry?: () => void
  project: ProjectContext
  projects: ProjectContext[]
  onProjectChange: (projectId: string) => void
  onCreateDevelopmentProject: () => void
}) {
  const [openService, setOpenService] = useState<OverviewService | null>(null)
  const [topologyOpen, setTopologyOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [outcome, setOutcome] = useState<OutcomeId | null>(null)
  const [deployment, setDeployment] = useState<DeploymentState | null>(null)
  const summary = useMemo(() => summarize(dataset), [dataset])
  const scale = pageScale(summary.total)
  const isPageEmpty = scale === 'empty'
  const attentionCount = dataset.services.filter((s) => s.needsAttention).length
  // At 50+ services the full change feed stops being readable — lead with the worst.
  const activityItems =
    scale === 'large' ? criticalActivity(dataset.activity, ACTIVITY_LIMIT_LARGE) : dataset.activity
  const showEmptyActivation = status === 'loaded' && isPageEmpty
  const openTopology = () => setTopologyOpen(true)

  if (openService) {
    return <ServicePreview svc={openService} onBack={() => setOpenService(null)} />
  }

  // Once anything is confirmed the project is no longer empty, blueprint or not.
  if (status === 'loaded' && isPageEmpty && deployment) {
    return (
      <BlueprintDeploymentView
        state={deployment}
        project={project}
        onAdd={(nodeId) =>
          setDeployment((prev) =>
            prev ? { ...prev, createdNodeIds: [...prev.createdNodeIds, nodeId] } : prev,
          )
        }
        onDismissResume={() =>
          setDeployment((prev) => (prev ? { ...prev, resumeDismissed: true } : prev))
        }
      />
    )
  }

  if (showEmptyActivation && exploreOpen && outcome) {
    return (
      <SolutionBlueprint
        outcomeId={outcome}
        project={project}
        projects={projects}
        onProjectChange={onProjectChange}
        onCreateDevelopmentProject={onCreateDevelopmentProject}
        onChangeOutcome={() => setOutcome(null)}
        onCreate={({ plannedNodeIds, confirmedNodeIds, region }) =>
          setDeployment({
            blueprint: BLUEPRINTS[outcome],
            plannedNodeIds,
            createdNodeIds: confirmedNodeIds,
            region,
            resumeDismissed: false,
          })
        }
      />
    )
  }

  if (showEmptyActivation && exploreOpen) {
    return <ExploreSolutions onBack={() => setExploreOpen(false)} onSelect={setOutcome} />
  }

  if (showEmptyActivation) {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Banner
          layout="horizontal"
          title="Build more with Aiven Platform"
          action={{ text: 'Explore solutions', onClick: () => setExploreOpen(true) }}
        >
          Connect your data, apps and agents to unlock powerful workflows
        </Banner>
        <EmptyState
          title="No services yet"
          primaryAction={{ text: 'Create your first service', onClick: openTopology }}
          secondaryAction={{ text: 'Explore solutions', onClick: () => setExploreOpen(true) }}
          borderStyle="solid"
          fullHeight={false}
        >
          Create a service to start seeing spend, storage and issues on this project
        </EmptyState>
        <ExplorePlatform />
        <EmptyState
          title="No usage yet"
          primaryAction={{ text: 'Create service', onClick: openTopology }}
          borderStyle="solid"
          fullHeight={false}
        >
          Spend and storage will appear after you create a service
        </EmptyState>
        <CreateServiceTopologyModal
          open={topologyOpen}
          onClose={() => setTopologyOpen(false)}
          projectName={project.name}
        />
      </Box>
    )
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <RecentActivity
        items={activityItems}
        status={status}
        onRetry={onRetry}
        subtitle={
          scale === 'large'
            ? `Top ${ACTIVITY_LIMIT_LARGE} by severity — the event log has everything else`
            : undefined
        }
      />

      <MetricsRow summary={summary} status={status} onRetry={onRetry} isPageEmpty={isPageEmpty} />

      <Tabs defaultValue="service-type" aria-label="Overview sections">
        <Tabs.Tab title="Service type" value="service-type">
          <GroupRollup services={dataset.services} status={status} onRetry={onRetry} />
        </Tabs.Tab>
        <Tabs.Tab
          title="Needs attention"
          value="needs-attention"
          badge={attentionCount > 0 ? attentionCount : undefined}
        >
          <NeedsAttention
            services={dataset.services}
            status={status}
            onRetry={onRetry}
            isPageEmpty={isPageEmpty}
            onOpenService={setOpenService}
          />
        </Tabs.Tab>
      </Tabs>

      <CapacityHotspots
        services={dataset.services}
        status={status}
        onRetry={onRetry}
        isPageEmpty={isPageEmpty}
      />
    </Box>
  )
}

OverviewV2.displayName = 'OverviewV2'
