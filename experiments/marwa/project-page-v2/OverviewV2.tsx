'use client'

import { useMemo, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Banner,
  Box,
  Button,
  Card,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  EmptyState,
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
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import currencyDollar from '@aivenio/aquarium/icons/currencyDollar'
import database from '@aivenio/aquarium/icons/database'
import outdated from '@aivenio/aquarium/icons/outdated'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@/components/ServiceIcon'
import { CreateServiceTypeModal } from './CreateServiceTypeModal'
import {
  bySeverity,
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
const CREATE_FIRST_SERVICE = { text: 'Create your first service', onClick: () => undefined }

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
  onCreateService,
}: {
  summary: OverviewSummary
  status: AsyncStatus
  onRetry?: () => void
  isPageEmpty: boolean
  onCreateService: () => void
}) {
  return (
    <ModuleStatus module="metrics" status={status} onRetry={onRetry} loading={<MetricsSkeleton />}>
      {isPageEmpty ? (
        <EmptyState
          title="No usage yet"
          primaryAction={{ text: 'Create service', onClick: onCreateService }}
          borderStyle="solid"
          fullHeight={false}
        >
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

type AttentionFilter = 'all' | 'high' | 'other'

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
    return attention
  }, [attention, filter])

  const highCount = attention.filter((s) => s.severity === 'critical').length
  const otherCount = attention.length - highCount

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
          <ChoiceChip value="all">All {attention.length}</ChoiceChip>
          <ChoiceChip value="high">High {highCount}</ChoiceChip>
          <ChoiceChip value="other">Other {otherCount}</ChoiceChip>
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

// ─── Explore the platform (empty Overview) ─────────────────────────────────────

type PlatformTone = 'primary' | 'warning'
type PlatformBadge = 'NEW' | 'COMING'

type PlatformProduct = {
  id: string
  mark: string
  title: string
  description: string
  tone: PlatformTone
  badge?: PlatformBadge
}

const PLATFORM_PRODUCTS: PlatformProduct[] = [
  {
    id: 'runtime',
    mark: '{ }',
    title: 'Runtime',
    description: 'Run apps and agents next to your data.',
    tone: 'primary',
  },
  {
    id: 'ai-gateway',
    mark: 'AI',
    title: 'AI gateway',
    description: 'One endpoint for all your AI traffic.',
    tone: 'primary',
  },
  {
    id: 'agents',
    mark: 'AG',
    title: 'Agents',
    description: 'Deploy managed agents over your services.',
    tone: 'primary',
    badge: 'NEW',
  },
  {
    id: 'datahub',
    mark: 'DH',
    title: 'DataHub',
    description: 'Context, catalog, lineage and governance.',
    tone: 'primary',
  },
  {
    id: 'integration-endpoints',
    mark: '</>',
    title: 'Integration endpoints',
    description: 'Connect Aiven to external systems over MCP.',
    tone: 'primary',
  },
  {
    id: 'inference',
    mark: 'ML',
    title: 'Inference',
    description: 'Run models directly on the platform.',
    tone: 'warning',
    badge: 'COMING',
  },
]

const MARK_TONE: Record<PlatformTone, { bg: string; fg: string }> = {
  primary: {
    bg: 'var(--aquarium-background-color-primary-muted)',
    fg: 'var(--aquarium-text-color-primary-graphic)',
  },
  warning: {
    bg: 'var(--aquarium-background-color-warning-muted)',
    fg: 'var(--aquarium-text-color-warning-intense)',
  },
}

function ProductMark({ label, tone }: { label: string; tone: PlatformTone }) {
  const colors = MARK_TONE[tone]
  return (
    <Box
      aria-hidden
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: colors.bg,
        color: colors.fg,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {label}
    </Box>
  )
}

function ExplorePlatform() {
  return (
    <Section title="Explore the platform">
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {PLATFORM_PRODUCTS.map((product) => {
          const coming = product.badge === 'COMING'
          return (
              <Card
                key={product.id}
                fullWidth
                disabled={coming || undefined}
                onClick={() => undefined}
                title={
                  <Card.Title>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <ProductMark label={product.mark} tone={product.tone} />
                        <span>{product.title}</span>
                      </Box>
                      {product.badge ? (
                        <Chip.Inverse
                          dense
                          text={product.badge}
                          status={product.badge === 'NEW' ? 'primary' : 'warning'}
                        />
                      ) : null}
                    </Box>
                  </Card.Title>
                }
              >
                {product.description}
              </Card>
          )
        })}
      </Box>
    </Section>
  )
}

ExplorePlatform.displayName = 'ExplorePlatform'

// ─── Recent activity (Timeline at the top of Overview) ──────────────────────────

function RecentActivity({
  items,
  status,
  onRetry,
}: {
  items: OverviewActivity[]
  status: AsyncStatus
  onRetry?: () => void
}) {
  return (
    <Section
      title="Recent project activity"
      subtitle="Changes across services, applications and agents"
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

// ─── Overview V2 ─────────────────────────────────────────────────────────────────

export function OverviewV2({
  dataset,
  status = 'loaded',
  onRetry,
}: {
  dataset: OverviewDataset
  status?: AsyncStatus
  onRetry?: () => void
}) {
  const [openService, setOpenService] = useState<OverviewService | null>(null)
  const [createServiceOpen, setCreateServiceOpen] = useState(false)
  const summary = useMemo(() => summarize(dataset), [dataset])
  const scale = pageScale(summary.total)
  const isPageEmpty = scale === 'empty'
  const attentionCount = dataset.services.filter((s) => s.needsAttention).length
  const openCreateService = () => setCreateServiceOpen(true)

  if (openService) {
    return <ServicePreview svc={openService} onBack={() => setOpenService(null)} />
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {status === 'loaded' && isPageEmpty ? (
        <>
          <Banner
            layout="horizontal"
            title="Build more with Aiven Platform"
            action={{ text: 'Explore solutions', href: '#' }}
          >
            Connect your data, apps and agents to unlock powerful workflows
          </Banner>
          <EmptyState
            title="No services yet"
            primaryAction={CREATE_FIRST_SERVICE}
            secondaryAction={{ text: 'Explore solutions', href: '#' }}
            borderStyle="solid"
            fullHeight={false}
          >
            Create a service to start seeing spend, storage and issues on this project
          </EmptyState>
          <ExplorePlatform />
        </>
      ) : null}

      {!isPageEmpty ? <RecentActivity items={dataset.activity} status={status} onRetry={onRetry} /> : null}

      <MetricsRow
        summary={summary}
        status={status}
        onRetry={onRetry}
        isPageEmpty={isPageEmpty}
        onCreateService={openCreateService}
      />

      {!isPageEmpty ? (
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
      ) : null}
      <CreateServiceTypeModal
        open={createServiceOpen}
        onClose={() => setCreateServiceOpen(false)}
        projectName={dataset.projectName}
        orgName="Aiven"
      />
    </Box>
  )
}

OverviewV2.displayName = 'OverviewV2'
