import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  Drawer,
  DropdownMenu,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Tabs,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import pulseIcon from '@aivenio/aquarium/icons/pulse'
import sendIcon from '@aivenio/aquarium/icons/send'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { ServiceSidebar } from '../components/ServiceSidebar'
import { getServiceIconUrl } from '../components/ServiceIcon'
import type { ServiceRow } from './ProjectServices'
import { ComparePricingModal } from './ComparePricingModal'
import type { ServiceTypeId } from './ServiceTypeSelectModal'

const PROJECT_NAME = 'UI-TESTS'
const MYSQL_SERVICE_NAME = 'mysql-204e49c9'
const PG_SERVICE_NAME = 'pg-2536119c'

type LogSeverity = 'info' | 'warning' | 'important'

type LogRow = {
  id: string
  time: string
  source: string
  message: string
  severity: LogSeverity
}

type LogSegment =
  | { type: 'rows'; rows: LogRow[] }
  | { type: 'divider'; id: string; label: string }

type AiRole = 'assistant' | 'user'

type AiMessage = {
  id: string
  role: AiRole
  text: string
}

/** Chronological mock log lines (~48h of history + live tail; oldest first). */
const MOCK_LOG_ROWS: LogRow[] = [
  { id: 'l1', time: '2026-04-13T18:02:04Z', source: 'pid=12001', message: '[postgresql-17] checkpoint starting: time', severity: 'info' },
  { id: 'l2', time: '2026-04-13T18:02:41Z', source: 'pid=12001', message: '[postgresql-17] checkpoint complete: wrote 182 buffers (1.1%); 0 WAL file(s) added, 0 removed, 0 recycled', severity: 'info' },
  { id: 'l3', time: '2026-04-13T21:15:09Z', source: 'pid=12044', message: '[postgresql-17] automatic vacuum of table "public.events": index scans not needed', severity: 'info' },
  { id: 'l4', time: '2026-04-13T23:47:22Z', source: 'pid=12088', message: '[postgresql-17] connection received: host=10.0.4.12 port=44102', severity: 'info' },
  { id: 'l5', time: '2026-04-13T23:47:23Z', source: 'pid=12088', message: '[postgresql-17] connection authenticated: user="batch" method=scram-sha-256', severity: 'info' },
  { id: 'l6', time: '2026-04-14T02:30:00Z', source: 'pid=12120', message: '[postgresql-17] archived WAL file 0000000100000123000000A1', severity: 'info' },
  { id: 'l7', time: '2026-04-14T08:11:33Z', source: 'pid=12155', message: '[postgresql-17] connection authorized: user=app_rw db=defaultdb application_name=orders-api', severity: 'info' },
  { id: 'l8', time: '2026-04-14T10:44:18Z', source: 'pid=12190', message: '[postgresql-17] WARNING: long-running query (>120s) on public.order_items (pid=12190)', severity: 'warning' },
  { id: 'l9', time: '2026-04-14T12:05:00Z', source: 'pid=12201', message: '[postgresql-17] base backup completed successfully (label=nightly_20260414)', severity: 'info' },
  { id: 'l10', time: '2026-04-14T14:22:51Z', source: 'pid=12240', message: '[postgresql-17] disconnection: session=0:12:04.200 user=app_rw db=defaultdb host=10.0.4.18', severity: 'info' },
  { id: 'l11', time: '2026-04-14T17:33:06Z', source: 'pid=12266', message: '[postgresql-17] connection authorized: user=analytics db=defaultdb application_name=metabase', severity: 'info' },
  { id: 'l12', time: '2026-04-14T20:01:17Z', source: 'pid=12290', message: '[postgresql-17] checkpoint starting: time', severity: 'info' },
  { id: 'l13', time: '2026-04-14T20:01:55Z', source: 'pid=12290', message: '[postgresql-17] checkpoint complete: wrote 640 buffers (3.9%); 1 WAL file(s) added', severity: 'info' },
  { id: 'l14', time: '2026-04-14T22:18:40Z', source: 'pid=12310', message: '[postgresql-17] connection received: host=[local]', severity: 'info' },
  { id: 'l15', time: '2026-04-15T06:40:12Z', source: 'pid=28001', message: '[postgresql-17] connection authorized: user=postgres db=_aiven app=management-agent', severity: 'info' },
  { id: 'l16', time: '2026-04-15T07:55:03Z', source: 'pid=28102', message: '[postgresql-17] connection authenticated: user="app_rw" method=scram-sha-256', severity: 'info' },
  { id: 'l17', time: '2026-04-15T09:24:11Z', source: 'pid=28380', message: '[postgresql-17] connection received: host=[local]', severity: 'info' },
  { id: 'l18', time: '2026-04-15T09:24:11Z', source: 'pid=28380', message: '[postgresql-17] connection authenticated: user="postgres" method=trust (pg_hba.conf:2)', severity: 'info' },
  { id: 'l19', time: '2026-04-15T09:24:11Z', source: 'pid=28380', message: '[postgresql-17] connection authorized: user=postgres db=_aiven app=management-agent', severity: 'info' },
  { id: 'l20', time: '2026-04-15T09:24:11Z', source: 'pid=28380', message: '[postgresql-17] disconnection: session=0:00:00.010 user=postgres db=_aiven host=[local]', severity: 'info' },
  { id: 'l21', time: '2026-04-15T09:24:13Z', source: 'pid=28387', message: '[postgresql-17] connection authenticated: user="avnadmin" method=trust (pg_hba.conf:3)', severity: 'info' },
  { id: 'l22', time: '2026-04-15T09:24:13Z', source: 'pid=28387', message: '[postgresql-17] connection authorized: user=avnadmin db=defaultdb app=management-agent', severity: 'info' },
  { id: 'l23', time: '2026-04-15T09:24:20Z', source: 'pid=28431', message: '[postgresql-17] connection authorized: user=postgres db=defaultdb app=management-agent', severity: 'info' },
  { id: 'l24', time: '2026-04-15T09:24:21Z', source: 'pid=28437', message: '[postgresql-17] disconnection: session=0:00:00.015 user=postgres db=_aiven host=[local]', severity: 'info' },
  { id: 'l25', time: '2026-04-15T09:24:22Z', source: 'pid=28444', message: '[postgresql-17] connection authorized: user=_avnadmin_monitor db=_aiven app=system-stats', severity: 'info' },
  { id: 'l26', time: '2026-04-15T09:24:22Z', source: 'pid=28445', message: '[postgresql-17] connection authorized: user=_avnadmin_monitor db=defaultdb app=system-stats', severity: 'info' },
  { id: 'l27', time: '2026-04-15T09:24:23Z', source: 'pid=28451', message: '[postgresql-17] disconnection: session=0:00:00.011 user=postgres db=_aiven host=[local]', severity: 'info' },
  { id: 'l28', time: '2026-04-15T09:24:26Z', source: 'pid=28469', message: '[postgresql-17] connection authorized: user=postgres db=_aiven app=management-agent', severity: 'info' },
  { id: 'l29', time: '2026-04-15T09:24:29Z', source: 'pid=28487', message: '[postgresql-17] disconnection: session=0:00:00.010 user=postgres db=_aiven host=[local]', severity: 'info' },
  { id: 'l30', time: '2026-04-15T09:24:31Z', source: 'pid=28500', message: '[postgresql-17] connection authorized: user=postgres db=_aiven app=management-agent', severity: 'info' },
  { id: 'l31', time: '2026-04-15T09:24:32Z', source: 'pid=28503', message: '[postgresql-17] WARNING: autovacuum worker took unusually long on public.sessions (45s)', severity: 'warning' },
  { id: 'l32', time: '2026-04-15T09:24:33Z', source: 'pid=28506', message: '[postgresql-17] WARNING: max_connections nearing limit (91% used), consider connection pools', severity: 'warning' },
  { id: 'l33', time: '2026-04-15T09:24:34Z', source: 'pid=28508', message: '[postgresql-17] ERROR: could not serialize access due to concurrent update', severity: 'important' },
  { id: 'l34', time: '2026-04-15T09:24:35Z', source: 'pid=28510', message: '[postgresql-17] WARNING: statement timeout after 5000 ms (app=query-runner)', severity: 'warning' },
  { id: 'l35', time: '2026-04-15T09:24:35Z', source: 'pid=28511', message: '[postgresql-17] connection authorized: user=app_rw db=defaultdb application_name=retry-worker', severity: 'info' },
  { id: 'l36', time: '2026-04-15T09:24:36Z', source: 'pid=28512', message: '[postgresql-17] FATAL: remaining connection slots are reserved for non-replication superuser connections', severity: 'important' },
]

function logDayKey(isoUtc: string): string {
  return isoUtc.slice(0, 10)
}

function logDayDividerLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Day groups + dividers. Only the first row block shows a table header (see `LogsDataTable`). */
function buildLogSegmentsFromRows(rows: LogRow[]): LogSegment[] {
  const out: LogSegment[] = []
  let chunk: LogRow[] = []
  let previousDay: string | null = null
  for (const row of rows) {
    const day = logDayKey(row.time)
    if (previousDay !== null && day !== previousDay) {
      if (chunk.length > 0) out.push({ type: 'rows', rows: chunk })
      chunk = []
      out.push({ type: 'divider', id: `log-day-${day}`, label: logDayDividerLabel(day) })
    }
    previousDay = day
    chunk.push(row)
  }
  if (chunk.length > 0) out.push({ type: 'rows', rows: chunk })
  return out
}

const LOG_SEGMENTS_ALL: LogSegment[] = buildLogSegmentsFromRows(MOCK_LOG_ROWS)
const WARNING_LOG_COUNT = MOCK_LOG_ROWS.filter((row) => row.severity === 'warning').length
const IMPORTANT_LOG_COUNT = MOCK_LOG_ROWS.filter((row) => row.severity === 'important').length
const AI_SUGGESTIONS = [
  'Summarize unusual log entries',
  'Show potential causes for warnings',
  'List immediate mitigation steps',
]
const INITIAL_AI_MESSAGES: AiMessage[] = [
  {
    id: 'a1',
    role: 'assistant',
    text: 'I am watching live PostgreSQL logs. Ask me to summarize warnings/errors, detect patterns, or suggest next steps.',
  },
]
const LOG_MONO_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace'

function logMessageColor(severity: LogSeverity): string {
  if (severity === 'warning') return '#9a3412'
  if (severity === 'important') return '#991b1b'
  return '#242429'
}

function logRowCellClass(severity: LogSeverity): string | undefined {
  if (severity === 'warning') return 'logs-row-warning'
  if (severity === 'important') return 'logs-row-error'
  return undefined
}

function logSegmentsForFilter(filter: 'all' | 'warning' | 'important'): LogSegment[] {
  if (filter === 'all') return LOG_SEGMENTS_ALL
  const severity = filter === 'warning' ? 'warning' : 'important'
  const rows = MOCK_LOG_ROWS.filter((row) => row.severity === severity)
  return rows.length > 0 ? buildLogSegmentsFromRows(rows) : []
}

export type ServiceOverviewProps = {
  /** Current service id (e.g. from created service); used for display name when set. */
  serviceId?: string | null
  /** Service type for this overview (MySQL shows "New pricing" banner; PG does not). */
  serviceTypeId?: ServiceTypeId | null
  /** Called when user clicks "Back to project" */
  onBackToProject?: () => void
  /** Called when user chooses "Delete service" from the ⋯ menu */
  onDeleteService?: () => void
  /** Full service list used to resolve read replicas linked to this service. */
  services?: ServiceRow[]
  /** Called when user clicks "Create replica" in the Read replica section. */
  onCreateReplica?: () => void
  /** Called when user clicks a replica row to navigate to its overview. */
  onReplicaClick?: (replicaServiceId: string) => void
  /** Called when user clicks "Create fork" in the Backups overview section. */
  onCreateFork?: () => void
  /** Called when user clicks "Change" in the Service plan usage section. */
  onChangePlan?: () => void
  /** Called when the user navigates to Billing via header. */
  onBillingClick?: () => void
  /** Called when the user navigates to the org home page. */
  onOrgHomeClick?: () => void
  /** Optional scenario hook to open a specific sidebar item by default. */
  initialSidebarItem?: string
}

function ServiceOverview({
  serviceId: serviceIdProp,
  serviceTypeId = 'mysql',
  onBackToProject,
  onDeleteService,
  services = [],
  onCreateReplica,
  onReplicaClick,
  onCreateFork,
  onChangePlan,
  onBillingClick,
  onOrgHomeClick,
  initialSidebarItem,
}: ServiceOverviewProps) {
  const isMySQL = serviceTypeId === 'mysql'
  const isPostgres = serviceTypeId === 'postgresql'
  /** True for service types that support the ACU / legacy pricing toggle. */
  const hasAcuCapability = isMySQL || isPostgres
  const replicas = services.filter((s) => s.sourceServiceId === (serviceIdProp ?? undefined) && s.replicationRole === 'read_replica')
  const serviceName = serviceIdProp ?? (isMySQL ? MYSQL_SERVICE_NAME : PG_SERVICE_NAME)
  const serviceVersion = isMySQL ? 'MySQL 8.0.45' : 'PostgreSQL 17'

  // Relationship metadata
  const currentService = services.find((s) => s.id === serviceIdProp)
  const isAcuPricing = currentService?.pricingType === 'ACU'
  const isReplica = currentService?.replicationRole === 'read_replica'
  const isFork = currentService?.replicationRole === 'fork'
  const primaryService = (isReplica || isFork)
    ? services.find((s) => s.id === currentService?.sourceServiceId)
    : undefined

  // Derive plan capacity from the matching ServiceRow (populated during creation).
  // Fall back to representative defaults so pre-seeded services without resource fields still render.
  const ramCapacity = currentService?.ramCapacity ?? '8 GB'
  const storageCapacity = currentService?.storageCapacity ?? '80 GB'
  const nodeCount = currentService?.nodeCount ?? 1
  // Compute plausible usage values (37% RAM, 13% storage) from the actual capacity.
  const ramUsedGB = (parseFloat(ramCapacity) * 0.37).toFixed(1)
  const storageUsedGB = (parseFloat(storageCapacity) * 0.13).toFixed(1)

  // Free / Developer tiers show "Upgrade" instead of "Change" in the plan section.
  const isSimpleTier = ['free', 'developer'].includes((currentService?.planName ?? '').toLowerCase())

  // Caption shown beneath the "Service plan usage" section title.
  // For ACU services: prefer serviceTier as the plan label and include computeType.
  const planLabel = isAcuPricing && currentService?.serviceTier
    ? currentService.serviceTier
    : currentService?.planName
  const planUsageSubtitle = planLabel
    ? [
        planLabel,
        `${nodeCount} ${nodeCount === 1 ? 'node' : 'nodes'}`,
        ...(isAcuPricing && currentService?.computeType ? [currentService.computeType] : []),
        currentService?.planDetails ?? `${ramCapacity} RAM · ${storageCapacity} storage`,
      ].join(' · ')
    : undefined

  const [comparePricingOpen, setComparePricingOpen] = useState(false)
  const [sidebarItem, setSidebarItem] = useState(initialSidebarItem ?? 'overview')
  const [logFilter, setLogFilter] = useState<'all' | 'warning' | 'important'>('all')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiDraft, setAiDraft] = useState('')
  const [aiMessages, setAiMessages] = useState<AiMessage[]>(INITIAL_AI_MESSAGES)
  const logSegments = useMemo(() => logSegmentsForFilter(logFilter), [logFilter])

  useEffect(() => {
    setSidebarItem(initialSidebarItem ?? 'overview')
    setLogFilter('all')
    setAiAssistantOpen(false)
    setAiDraft('')
    setAiMessages(INITIAL_AI_MESSAGES)
  }, [serviceIdProp, initialSidebarItem])

  // Scroll the content area to the top on mount and section switch.
  const contentRef = useRef<HTMLDivElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
    // Reset window scroll as well in case the outer layout overflows the viewport.
    try { window.scrollTo(0, 0) } catch { /* jsdom no-op */ }
  }, [serviceIdProp, sidebarItem])

  function scrollToLatestLog() {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const sendAiMessage = () => {
    const prompt = aiDraft.trim()
    if (!prompt) return
    const userMessage: AiMessage = { id: `u-${Date.now()}`, role: 'user', text: prompt }
    const assistantMessage: AiMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: `Captured "${prompt}". Based on current logs, prioritize checking warning/error rows and active PID sequences for repeat failures.`,
    }
    setAiMessages((prev) => [...prev, userMessage, assistantMessage])
    setAiDraft('')
  }

  return (
    <>
    <Box style={{ height: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader activeNav="projects" onHomeClick={onOrgHomeClick} onBillingClick={onBillingClick} onProjectsClick={onOrgHomeClick} />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ServiceSidebar
          projectName={PROJECT_NAME}
          serviceName={serviceName}
          activeItem={sidebarItem}
          onBackToProject={onBackToProject}
          onNavigate={setSidebarItem}
        />

        {/* Main content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 24, overflow: 'auto', overflowAnchor: 'none', backgroundColor: '#fff' }}>
          {sidebarItem === 'logs' ? (
            <>
              <Box style={{ marginBottom: 32 }}>
                <PageHeader
                  title="Logs"
                  image={getServiceIconUrl(serviceTypeId ?? null)}
                  imageAlt={serviceTypeId ?? 'service'}
                  breadcrumbs={[
                    <Breadcrumbs.Crumb key="org">
                      <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                        My Organization
                      </Link>
                    </Breadcrumbs.Crumb>,
                    <Breadcrumbs.Crumb key="projects">
                      <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                        Projects
                      </Link>
                    </Breadcrumbs.Crumb>,
                    <Breadcrumbs.Crumb key="project">
                      <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                        {PROJECT_NAME}
                      </Link>
                    </Breadcrumbs.Crumb>,
                    <Breadcrumbs.Crumb key="service">{serviceName}</Breadcrumbs.Crumb>,
                    <Breadcrumbs.Crumb key="logs">Logs</Breadcrumbs.Crumb>,
                  ]}
                  subtitle={
                    <Box component="span" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusChip text="Running" status="success" dense />
                      <StatusChip text="Nodes" status="neutral" dense badge={nodeCount} />
                      <StatusChip text="Live" status="success" dense badge />
                    </Box>
                  }
                  secondaryActions={{ text: 'AI assistant', onClick: () => setAiAssistantOpen(true) }}
                  menu={
                    <DropdownMenu.Items>
                      <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                    </DropdownMenu.Items>
                  }
                  onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
                />
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                <Box style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <ChoiceChipGroup
                    name="logFilter"
                    selectionMode="radio"
                    value={logFilter}
                    onChange={(value) => setLogFilter(value as 'all' | 'warning' | 'important')}
                  >
                    <ChoiceChip value="all" dense>All logs</ChoiceChip>
                    <ChoiceChip value="warning" dense>
                      <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        Warning
                        <Box component="span" style={{ color: '#b45309' }}>
                          <Badge value={WARNING_LOG_COUNT} dense />
                        </Box>
                      </Box>
                    </ChoiceChip>
                    <ChoiceChip value="important" dense>
                      <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        Important
                        <Box component="span" style={{ color: '#b91c1c' }}>
                          <Badge value={IMPORTANT_LOG_COUNT} dense />
                        </Box>
                      </Box>
                    </ChoiceChip>
                  </ChoiceChipGroup>
                </Box>
                <Box style={{ flexShrink: 0, marginLeft: 'auto' }}>
                  <Button.Ghost type="button" dense onClick={scrollToLatestLog}>
                    Go to most recent message
                  </Button.Ghost>
                </Box>
              </Box>

              <Box style={{ marginTop: 0 }} role="region" aria-label="Service logs">
                {logSegments.length === 0 ? (
                  <Typography.Default>No log entries for this filter.</Typography.Default>
                ) : (
                  (() => {
                    let pastFirstRowBlock = false
                    return logSegments.map((segment) => {
                      if (segment.type === 'divider') {
                        return <LogsTimeDivider key={segment.id} label={segment.label} />
                      }
                      const showColumnHeader = !pastFirstRowBlock
                      pastFirstRowBlock = true
                      return (
                        <Box key={segment.rows.map((row) => row.id).join('-')} style={{ marginBottom: 8 }}>
                          <LogsDataTable rows={segment.rows} showColumnHeader={showColumnHeader} />
                        </Box>
                      )
                    })
                  })()
                )}
                <div ref={logsEndRef} style={{ height: 1, overflow: 'hidden' }} aria-hidden />
              </Box>
            </>
          ) : (
            <>
            {/* Page header */}
          <Box style={{ marginBottom: 32 }}>
            <PageHeader
              title={serviceName}
              image={getServiceIconUrl(serviceTypeId ?? null)}
              imageAlt={serviceTypeId ?? 'service'}
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="projects">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                    Projects
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="project">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBackToProject?.() }}>
                    {PROJECT_NAME}
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="service">{serviceName}</Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="overview">Overview</Breadcrumbs.Crumb>,
              ]}
              subtitle={
                <Box component="span" style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
                  <Box component="span" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusChip text={serviceVersion} status="neutral" dense />
                    <StatusChip text="Running" status="success" dense />
                    {isReplica && <StatusChip text="Read Replica" status="neutral" dense />}
                    {isFork && <StatusChip text="Fork" status="neutral" dense />}
                    <StatusChip text="Nodes" status="success" badge={nodeCount} dense />
                    {currentService?.pricingType && (
                      <StatusChip
                        text={currentService.pricingType}
                        status="neutral"
                        dense
                      />
                    )}
                  </Box>
                  {isReplica && primaryService && (
                    <Box component="span" style={{ color: '#787885' }}>
                      <Typography.Caption>
                        Replica of{' '}
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(primaryService.id)
                          }}
                        >
                          {primaryService.serviceName}
                        </Link>
                      </Typography.Caption>
                    </Box>
                  )}
                  {isFork && primaryService && (
                    <Box component="span" style={{ color: '#787885' }}>
                      <Typography.Caption>
                        Forked from{' '}
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(primaryService.id)
                          }}
                        >
                          {primaryService.serviceName}
                        </Link>
                      </Typography.Caption>
                    </Box>
                  )}
                </Box>
              }
              primaryAction={{ text: 'Quick connect', onClick: () => {} }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
            />
          </Box>

          {/* Sections */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Service plan usage + Connection information — side by side */}
            <Box style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
              <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="service-plan-fill">
                <Section
                  title="Service plan usage"
                  subtitle={planUsageSubtitle}
                  actions={{ text: isSimpleTier ? 'Upgrade' : 'Change', onClick: () => onChangePlan?.() }}
                  menu={
                    <DropdownMenu.Items>
                      <DropdownMenu.Item id="change-plan">Change plan</DropdownMenu.Item>
                    </DropdownMenu.Items>
                  }
                  onAction={() => {}}
                >
                  {isAcuPricing && (
                    <Box style={{ marginBottom: 16 }}>
                      <StatusChip text="ACU" status="neutral" />
                    </Box>
                  )}
                  {hasAcuCapability && !isAcuPricing && (
                    <Box style={{ marginBottom: 16 }}>
                      <Alert type="success">
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Typography.Small>
                            We introduce new flexible pricing, allowing to fine-tune amount of CPU/RAM and storage.{' '}
                            <Link href="#">Learn more</Link>
                          </Typography.Small>
                          <Box>
                            <Button.Ghost type="button" dense onClick={() => setComparePricingOpen(true)}>Switch to new pricing</Button.Ghost>
                          </Box>
                        </Box>
                      </Alert>
                    </Box>
                  )}
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <PlanUsageBar label="Memory use" value={`${ramUsedGB} of ${ramCapacity} (37%)`} percent={37} />
                    <PlanUsageBar label="Storage used" value={`${storageUsedGB} of ${storageCapacity} (13%)`} percent={13} />
                    <Box>
                      <Box style={{ marginBottom: 8 }}>
                        <Typography.Caption>CPU across all nodes</Typography.Caption>
                      </Box>
                      <CpuLineChart />
                    </Box>
                  </Box>
                </Section>
                </div>
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Section title="Connection information">
                  {isMySQL ? (
                    <Tabs value="mysql" onChange={() => {}}>
                      <Tabs.Tab title="MySQL" value="mysql" />
                      <Tabs.Tab title="MySQLx" value="mysqlx" />
                    </Tabs>
                  ) : (
                    <Tabs value="psql" onChange={() => {}}>
                      <Tabs.Tab title="psql" value="psql" />
                      <Tabs.Tab title="Connection string" value="uri" />
                    </Tabs>
                  )}
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(isMySQL
                      ? [
                          { label: 'Service URI', value: 'mysql://***@mysql-204e49c9-ux-tests.jaivencloud.com:12691/defaultdb?ssl-mode=REQUIRED' },
                          { label: 'Database name', value: 'defaultdb' },
                          { label: 'Host', value: 'mysql-204e49c9-ux-tests.jaivencloud.com' },
                          { label: 'Port', value: '12691' },
                          { label: 'User', value: 'avnadmin' },
                          { label: 'Password', value: '**********' },
                          { label: 'SSL mode', value: 'REQUIRED' },
                          { label: 'CA certificate', value: 'Show' },
                        ]
                      : [
                          { label: 'Service URI', value: 'postgres://***@pg-2536119c-ux-tests.jaivencloud.com:12692/defaultdb?sslmode=require' },
                          { label: 'Database name', value: 'defaultdb' },
                          { label: 'Host', value: 'pg-2536119c-ux-tests.jaivencloud.com' },
                          { label: 'Port', value: '12692' },
                          { label: 'User', value: 'avnadmin' },
                          { label: 'Password', value: '**********' },
                          { label: 'SSL mode', value: 'require' },
                          { label: 'CA certificate', value: 'Show' },
                        ]
                    ).map((row) => (
                      <Box key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <Box>
                          <Box style={{ color: '#787885' }}><Typography.Caption>{row.label}</Typography.Caption></Box>
                          <Typography.Small>{row.value}</Typography.Small>
                        </Box>
                        <Button.Ghost type="button" aria-label={`Copy ${row.label}`} dense>
                          <Icon icon={duplicateIcon} />
                        </Button.Ghost>
                      </Box>
                    ))}
                  </Box>
                </Section>
              </Box>
            </Box>

            <Section
              title="Backups"
              collapsible
              defaultCollapsed={false}
              actions={{ text: 'Create fork', onClick: () => onCreateFork?.() }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="download">Download backup</DropdownMenu.Item>
                  <DropdownMenu.Item id="restore">Restore from backup</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={() => {}}
            >
              <Box style={{ display: 'flex', gap: 24, paddingTop: 8 }}>
                <BackupStat label="Backup location" value="google-asia-east1" />
                <BackupStat label="Backup interval" value="24 hour" />
                <BackupStat label="Backup retention" value="1 day" />
                <BackupStat label="Latest backup" value="< 1 minute ago" />
                <BackupStat label="Oldest backup" value="< 1 minute ago" />
                <BackupStat label="Total backups stored" value="866 MB" showInfo tooltip="Total size of all stored backup files" />
              </Box>
            </Section>

            <Section
              title="Read replica"
              collapsible
              defaultCollapsed={false}
              actions={{ text: 'Create replica', onClick: () => onCreateReplica?.() }}
              menu={
                <DropdownMenu.Items>
                  <DropdownMenu.Item id="replica-docs">View documentation</DropdownMenu.Item>
                </DropdownMenu.Items>
              }
              onAction={() => {}}
            >
              {replicas.length === 0 ? (
                <Typography.Default>
                  Create a read-only replica for better performance and additional disaster recovery
                </Typography.Default>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {replicas.map((replica) => (
                    <Box
                      key={replica.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        paddingBlock: 8,
                      }}
                    >
                      {/* Service type icon */}
                      <img
                        aria-hidden
                        src={getServiceIconUrl(replica.serviceTypeId ?? null)}
                        width={24}
                        height={24}
                        alt=""
                        style={{ borderRadius: '50%', flexShrink: 0 }}
                      />
                      {/* Replica name as a navigable link */}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onReplicaClick?.(replica.id)
                          }}
                        >
                          {replica.serviceName}
                        </Link>
                      </Box>
                      <StatusChip text="Active" status="success" dense />
                    </Box>
                  ))}
                </Box>
              )}
            </Section>

            <Section title="Maintenance" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="Version" value={serviceVersion} />
                <Row label="Maintenance window" value="Saturdays after 19:36:13 UTC" />
              </Box>
            </Section>

            <Section title="Cloud and network" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="Cloud provider" value="Google Cloud" />
                <Row label="Cloud region" value="asia-east1" />
                <Row label="Deployment model" value="Public internet" />
                <Row label="IP address allowlist" value="Open to all" />
              </Box>
            </Section>

            <Section title="Integrations" collapsible defaultCollapsed={false}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <Typography.Small>
                  Service integrations are only available on startup plans and higher. <Link href="#">Learn more</Link>
                </Typography.Small>
                <Button.Primary type="button">Upgrade plan</Button.Primary>
              </Box>
            </Section>
          </Box>
          </>
          )}
        </div>
      </Box>
    </Box>

    <ComparePricingModal
      open={comparePricingOpen}
      onClose={() => setComparePricingOpen(false)}
      onConfirm={() => { setComparePricingOpen(false); onChangePlan?.() }}
      service={currentService}
    />
    <Drawer
      open={aiAssistantOpen}
      onClose={() => setAiAssistantOpen(false)}
      title="AI assistant"
      size="sm"
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 420 }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon icon={pulseIcon} style={{ color: '#006260' }} />
            <Typography.SmallStrong>Service investigator</Typography.SmallStrong>
            <StatusChip text="Live" status="success" dense badge />
          </Box>
          <Button.Icon
            type="button"
            dense
            aria-label="Collapse AI assistant"
            icon={chevronRight}
            onClick={() => setAiAssistantOpen(false)}
          />
        </Box>

        <Box style={{ color: '#787885' }}>
          <Typography.Caption>Aiven / dev-sandbox / {serviceName} / Logs</Typography.Caption>
        </Box>

        <Box
          style={{
            border: '1px solid #ededf0',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: 320,
            overflow: 'auto',
            backgroundColor: '#fff',
          }}
        >
          {aiMessages.map((message) => (
            <Box
              key={message.id}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                backgroundColor: message.role === 'user' ? '#e9f7f7' : '#f5f5f7',
                borderRadius: 8,
                padding: '8px 10px',
              }}
            >
              <Typography.Small>{message.text}</Typography.Small>
            </Box>
          ))}
        </Box>

        <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AI_SUGGESTIONS.map((suggestion) => (
            <Button.Ghost key={suggestion} type="button" dense onClick={() => setAiDraft(suggestion)}>
              {suggestion}
            </Button.Ghost>
          ))}
        </Box>

        <Box style={{ position: 'relative' }}>
          <textarea
            value={aiDraft}
            onChange={(event) => setAiDraft(event.target.value)}
            rows={4}
            placeholder="Ask about this service log stream..."
            style={{
              width: '100%',
              resize: 'vertical',
              border: '1px solid #d6d6d6',
              borderRadius: 8,
              padding: '10px 48px 10px 10px',
              fontFamily: 'inherit',
              fontSize: 14,
              lineHeight: 1.4,
              boxSizing: 'border-box',
            }}
          />
          <Button.Icon
            type="button"
            dense
            aria-label="Send message"
            icon={sendIcon}
            onClick={sendAiMessage}
            style={{ position: 'absolute', right: 8, bottom: 8 }}
          />
        </Box>
      </Box>
    </Drawer>
    </>
  )
}

ServiceOverview.displayName = 'ServiceOverview'

export default ServiceOverview

function LogsTimeDivider({ label }: { label: string }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0', width: '100%' }}>
      <Box style={{ flex: 1, height: 1, backgroundColor: '#ededf0' }} />
      <Box
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          backgroundColor: '#ededf0',
          flexShrink: 0,
        }}
      >
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Box style={{ flex: 1, height: 1, backgroundColor: '#ededf0' }} />
    </Box>
  )
}

LogsTimeDivider.displayName = 'LogsTimeDivider'

function LogsDataTable({ rows, showColumnHeader = true }: { rows: LogRow[]; showColumnHeader?: boolean }) {
  if (rows.length === 0) return null
  const hideHeader = !showColumnHeader
  const columns = [
    {
      type: 'custom' as const,
      headerName: 'Time',
      width: 220,
      ...(hideHeader ? { headerInvisible: true as const } : {}),
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ fontFamily: LOG_MONO_FONT, color: logMessageColor(row.severity) }}>
          <Typography.Small>{row.time}</Typography.Small>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Source',
      width: 160,
      ...(hideHeader ? { headerInvisible: true as const } : {}),
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ fontFamily: LOG_MONO_FONT, color: logMessageColor(row.severity) }}>
          <Typography.Small>{row.source}</Typography.Small>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Message',
      ...(hideHeader ? { headerInvisible: true as const } : {}),
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ fontFamily: LOG_MONO_FONT, color: logMessageColor(row.severity) }}>
          <Typography.Small>{row.message}</Typography.Small>
        </Box>
      ),
    },
  ]
  return (
    <div
      className={
        showColumnHeader ? 'service-logs-data-table' : 'service-logs-data-table service-logs-data-table--continuation'
      }
    >
      <DataTable
        ariaLabel="Service logs"
        layout="fixed"
        sticky={showColumnHeader}
        rows={rows}
        rowClassName={(row) => logRowCellClass(row.severity)}
        columns={columns}
      />
    </div>
  )
}

LogsDataTable.displayName = 'LogsDataTable'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', gap: 16 }}>
      <Box style={{ color: '#787885', minWidth: 140 }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.Default>{value}</Typography.Default>
    </Box>
  )
}

Row.displayName = 'Row'

function PlanUsageBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Typography.Caption>{label}</Typography.Caption>
        <Typography.Caption>{value}</Typography.Caption>
      </Box>
      <Box style={{ height: 4, backgroundColor: '#ededf0', borderRadius: 12, overflow: 'hidden' }}>
        <Box style={{ width: `${percent}%`, height: '100%', backgroundColor: '#3545be', borderRadius: 12 }} />
      </Box>
    </Box>
  )
}

PlanUsageBar.displayName = 'PlanUsageBar'

function CpuLineChart() {
  const labelW = 32
  const plotW = 420
  const plotH = 62
  const bottomPad = 18
  const totalH = plotH + bottomPad

  const rawPoints = [0.42, 0.50, 0.68, 0.55, 0.72, 0.58, 0.48, 0.64, 0.52, 0.44]
  const step = plotW / (rawPoints.length - 1)
  const polyline = rawPoints
    .map((v, i) => `${labelW + i * step},${plotH - v * plotH}`)
    .join(' ')

  const xLabels = ['12:00', '12:15', '12:30', '12:45', '13:00']
  const xStep = plotW / (xLabels.length - 1)

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${labelW + plotW} ${totalH}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="CPU usage chart"
    >
      {/* Y-axis labels */}
      <text x={labelW - 4} y={4}            style={{ fontSize: 10 }} fill="#787885" textAnchor="end" dominantBaseline="hanging">100%</text>
      <text x={labelW - 4} y={plotH / 2}    style={{ fontSize: 10 }} fill="#787885" textAnchor="end" dominantBaseline="middle">50%</text>
      <text x={labelW - 4} y={plotH}        style={{ fontSize: 10 }} fill="#787885" textAnchor="end" dominantBaseline="auto">0</text>

      {/* Grid lines */}
      <line x1={labelW} y1={1}           x2={labelW + plotW} y2={1}           stroke="#D2D2D6" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={labelW} y1={plotH / 2}   x2={labelW + plotW} y2={plotH / 2}   stroke="#D2D2D6" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={labelW} y1={plotH}       x2={labelW + plotW} y2={plotH}       stroke="#D2D2D6" strokeWidth="1" />

      {/* Data line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#4CC2F7"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X-axis labels */}
      {xLabels.map((label, i) => (
        <text
          key={label}
          x={labelW + i * xStep}
          y={plotH + bottomPad - 2}
          style={{ fontSize: 10 }}
          fill="#787885"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

CpuLineChart.displayName = 'CpuLineChart'

function BackupStat({ label, value, showInfo, tooltip }: { label: string; value: string; showInfo?: boolean; tooltip?: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box style={{ color: '#787885', whiteSpace: 'nowrap' }}><Typography.Caption>{label}</Typography.Caption></Box>
        {showInfo && tooltip && (
          <Tooltip placement="top" content={tooltip}>
            <Icon icon={infoSignIcon} style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }} />
          </Tooltip>
        )}
      </Box>
      <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
    </Box>
  )
}

BackupStat.displayName = 'BackupStat'
