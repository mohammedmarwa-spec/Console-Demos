import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CalendarDateTime } from '@internationalized/date'
import { DateRangePickerStateContext as AriaDateRangePickerStateContext } from 'react-aria-components'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  DataList,
  DateTimeRangePicker,
  Drawer,
  DropdownMenu,
  Filter,
  Icon,
  InputBase,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Tabs,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import filterIcon from '@aivenio/aquarium/icons/filter'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import sendIcon from '@aivenio/aquarium/icons/send'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import { AuditLogsHistogram } from '../components/AuditLogsHistogram'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { ServiceSidebar } from '../components/ServiceSidebar'
import { getServiceIconUrl } from '../components/ServiceIcon'
import type { HistogramRange } from '../utils/auditHistogram'
import {
  buildLogHistogramBuckets,
  createMockPostgresDegradationLogs,
  type PostgresServiceEventLog,
} from '../utils/mockPostgresDegradationLogs'
import type { ServiceRow } from './ProjectServices'
import { ComparePricingModal } from './ComparePricingModal'
import type { ServiceTypeId } from './ServiceTypeSelectModal'

const PROJECT_NAME = 'UI-TESTS'
const MYSQL_SERVICE_NAME = 'mysql-204e49c9'
const PG_SERVICE_NAME = 'pg-2536119c'

type LogSeverity = 'info' | 'warning' | 'error'

type LogRow = {
  id: string
  timestampMs: number
  time: string
  displayTime: string
  searchableText: string
  source: string
  message: string
  severity: LogSeverity
  eventType: string
  component: PostgresServiceEventLog['component']
  service: string
  project: string
  region: string
  metadata: { label: string; value: string }[]
  keyValues: Record<string, string>
}

type AiRole = 'assistant' | 'user'

type AiMessage = {
  id: string
  role: AiRole
  text: string
  loading?: boolean
}

/** Legacy fixture retired in favor of incident-focused mock generator. */

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function pad3(value: number): string {
  return String(value).padStart(3, '0')
}

function formatLogTimestamp(isoUtc: string): string {
  const d = new Date(isoUtc)
  return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(-2)} ${pad2(
    d.getUTCHours(),
  )}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}:${pad3(d.getUTCMilliseconds())}`
}

function mapServiceEventToLogRow(log: PostgresServiceEventLog): LogRow {
  const source = [log.component, log.host].filter(Boolean).join(' | ')
  const metadata = [
    { label: 'Severity', value: log.severity.toUpperCase() },
    { label: 'Event type', value: log.eventType },
    { label: 'Component', value: log.component },
    ...(log.host ? [{ label: 'Host', value: log.host }] : []),
  ]
  const keyValues: Record<string, string> = {
    service: log.service,
    project: log.project,
    region: log.region,
    log_id: log.id,
  }
  for (const [key, value] of Object.entries(log.metadata ?? {})) {
    keyValues[key] = String(value)
  }
  const displayTime = formatLogTimestamp(log.timestamp)
  const searchableText = [
    displayTime,
    source,
    log.message,
    log.eventType,
    log.severity,
    log.component,
    log.service,
    log.project,
    log.region,
    ...metadata.map((item) => `${item.label} ${item.value}`),
    ...Object.entries(keyValues).map(([key, value]) => `${key} ${value}`),
  ]
    .join(' ')
    .toLowerCase()
  return {
    id: log.id,
    timestampMs: Date.parse(log.timestamp),
    time: log.timestamp,
    displayTime,
    searchableText,
    source,
    message: log.message,
    severity: log.severity,
    eventType: log.eventType,
    component: log.component,
    service: log.service,
    project: log.project,
    region: log.region,
    metadata,
    keyValues,
  }
}

/** Canonical mocked incident dataset for the log table and histogram. */
const MOCK_LOG_ROWS: LogRow[] = createMockPostgresDegradationLogs().map(mapServiceEventToLogRow)

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
const ONE_HOUR_MS = 60 * 60 * 1000
const DEFAULT_HISTOGRAM_HOURS = 24
const MAX_HISTOGRAM_BARS = 72
const LOGS_PAGE_SIZE = 30
/** Matches main content horizontal padding; top padding collapses while logs header is stuck. */
const MAIN_CONTENT_SCROLL_PAD = 24
/** Slack before restoring top padding when scrolling back (avoids padding ↔ measure oscillation). */
const LOGS_STICKY_PAD_HYSTERESIS_PX = 40
type LogDateRange = { start: CalendarDateTime; end: CalendarDateTime }
const LOG_EVENT_TYPE_OPTIONS = [
  'service.health_check_passed',
  'connection.accepted',
  'connection.count_high',
  'connection.pool_saturation',
  'connection.timeout',
  'connection.rejected',
  'postgres.too_many_connections',
  'query.slow',
  'pgbouncer.client_login_failed',
  'pgbouncer.pool_wait_timeout',
  'service.degraded',
  'service.recovery_started',
  'service.health_check_restored',
] as const
const LOG_SEVERITY_OPTIONS: readonly LogSeverity[] = ['info', 'warning', 'error']

function formatSeverityOption(severity: LogSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

function logMessageHighlightStyle(severity: LogSeverity): React.CSSProperties {
  if (severity === 'warning') {
    return {
      color: '#9a3412',
      backgroundColor: '#fff7ed',
      borderRadius: 6,
      padding: '2px 6px',
      fontWeight: 500,
    }
  }
  if (severity === 'error') {
    return {
      color: '#991b1b',
      backgroundColor: '#fef2f2',
      borderRadius: 6,
      padding: '2px 6px',
      fontWeight: 500,
    }
  }
  return { color: '#242429' }
}

function utcDateToCalendarDateTime(date: Date): CalendarDateTime {
  return new CalendarDateTime(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
}

function calendarDateTimeToUtcMs(cdt: CalendarDateTime): number {
  return Date.UTC(cdt.year, cdt.month - 1, cdt.day, cdt.hour, cdt.minute, cdt.second)
}

function createRelativeLogRange(anchor: Date, minutes: number): LogDateRange {
  const end = new Date(anchor)
  const start = new Date(anchor.getTime() - minutes * 60 * 1000)
  return {
    start: utcDateToCalendarDateTime(start),
    end: utcDateToCalendarDateTime(end),
  }
}

function createCenteredLogRange(centerMs: number, durationMs: number): LogDateRange {
  const half = Math.floor(durationMs / 2)
  const start = new Date(centerMs - half)
  const end = new Date(centerMs + half)
  return {
    start: utcDateToCalendarDateTime(start),
    end: utcDateToCalendarDateTime(end),
  }
}

function getHourlyBucketCount(range: HistogramRange): number {
  const spanMs = Math.max(ONE_HOUR_MS, range.endMs - range.startMs)
  return Math.min(MAX_HISTOGRAM_BARS, Math.max(1, Math.round(spanMs / ONE_HOUR_MS)))
}

function toHistogramRange(range: LogDateRange): HistogramRange {
  return {
    startMs: calendarDateTimeToUtcMs(range.start),
    endMs: calendarDateTimeToUtcMs(range.end),
  }
}

function classifyLogEventType(row: LogRow): (typeof LOG_EVENT_TYPE_OPTIONS)[number] {
  if ((LOG_EVENT_TYPE_OPTIONS as readonly string[]).includes(row.eventType)) {
    return row.eventType as (typeof LOG_EVENT_TYPE_OPTIONS)[number]
  }
  return 'service.health_check_passed'
}

function matchesLogSearch(row: LogRow, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return row.searchableText.includes(normalized)
}

function DateRangeFilterTrigger() {
  const dateRangeState = useContext(AriaDateRangePickerStateContext) as
    | { setOpen?: (open: boolean) => void }
    | null

  return (
    <Filter.Trigger
      labelText="Time range"
      icon={filterIcon}
      onClick={() => dateRangeState?.setOpen?.(true)}
    />
  )
}

type CompactServiceHeaderProps = {
  serviceName: string
  iconUrl: string
  version: string
  statusText: string
  nodeCount: number
}

function CompactServiceHeader({
  serviceName,
  iconUrl,
  version,
  statusText,
  nodeCount,
}: CompactServiceHeaderProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 12,
        marginBottom: 12,
        borderBottom: '1px solid #e7e8ed',
      }}
    >
      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <img
          src={iconUrl}
          alt={serviceName}
          width={32}
          height={32}
          style={{ borderRadius: 999, display: 'block' }}
        />
        <Box style={{ fontWeight: 600 }}>
          <Typography.Default>{serviceName}</Typography.Default>
        </Box>
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusChip text={version} status="neutral" icon={cpuChipIcon} dense />
          <StatusChip text={statusText} status="success" icon={tickCircleIcon} dense />
          <StatusChip text="Nodes" status="success" icon={nodesIcon} badge={nodeCount} dense />
        </Box>
      </Box>
    </Box>
  )
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
  const latestLogMs = Date.parse(MOCK_LOG_ROWS[MOCK_LOG_ROWS.length - 1]?.time ?? new Date().toISOString())
  const defaultLogRange = createRelativeLogRange(new Date(latestLogMs), DEFAULT_HISTOGRAM_HOURS * 60)
  const [dateRange, setDateRange] = useState<LogDateRange | null>(null)
  const [histogramWindowRange, setHistogramWindowRange] = useState<HistogramRange>(toHistogramRange(defaultLogRange))
  const [selectedHistogramRange, setSelectedHistogramRange] = useState<HistogramRange | null>(null)
  const [isHistogramRefreshing, setIsHistogramRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilterOpen, setEventFilterOpen] = useState(false)
  const [severityFilterOpen, setSeverityFilterOpen] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<LogSeverity[]>([])
  const [visibleLogsCount, setVisibleLogsCount] = useState(LOGS_PAGE_SIZE)
  const [logsTopPadCollapsed, setLogsTopPadCollapsed] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiDraft, setAiDraft] = useState('')
  const [aiMessages, setAiMessages] = useState<AiMessage[]>(INITIAL_AI_MESSAGES)
  const aiResponseTimerRef = useRef<number | null>(null)
  const histogramRefreshTimerRef = useRef<number | null>(null)
  const hasMountedRef = useRef(false)
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)
  const eventFilterRef = useRef<HTMLDivElement>(null)
  const severityFilterRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  /** Sits flush above the logs DataList; when it leaves the top of the scrollport, the table header is stuck. */
  const logsStickySentinelRef = useRef<HTMLDivElement>(null)
  const filteredLogRows = useMemo(() => {
    const activeRange = dateRange ?? defaultLogRange
    const startMs = calendarDateTimeToUtcMs(activeRange.start)
    const endMs = calendarDateTimeToUtcMs(activeRange.end)
    return MOCK_LOG_ROWS.filter((row) => {
      const ts = row.timestampMs
      if (ts < startMs || ts > endMs) return false
      if (!matchesLogSearch(row, searchQuery)) return false
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(row.severity)) return false
      if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(classifyLogEventType(row))) {
        return false
      }
      return true
    })
  }, [dateRange, defaultLogRange, searchQuery, selectedEventTypes, selectedSeverities])
  const clampedHistogramRange = useMemo<HistogramRange>(() => {
    const alignedStartMs = Math.floor(histogramWindowRange.startMs / ONE_HOUR_MS) * ONE_HOUR_MS
    const alignedEndMs = Math.max(
      alignedStartMs + ONE_HOUR_MS,
      Math.ceil(histogramWindowRange.endMs / ONE_HOUR_MS) * ONE_HOUR_MS,
    )
    const alignedRange = {
      startMs: alignedStartMs,
      endMs: alignedEndMs,
    }
    const spanMs = alignedRange.endMs - alignedRange.startMs
    const maxSpanMs = MAX_HISTOGRAM_BARS * ONE_HOUR_MS
    if (spanMs <= maxSpanMs) return alignedRange
    return {
      startMs: alignedRange.endMs - maxSpanMs,
      endMs: alignedRange.endMs,
    }
  }, [histogramWindowRange])
  const histogramLogRows = useMemo(() => {
    return MOCK_LOG_ROWS.filter((row) => {
      const ts = row.timestampMs
      return ts >= clampedHistogramRange.startMs && ts <= clampedHistogramRange.endMs
    })
  }, [clampedHistogramRange])
  const histogramFilteredByEventTypeRows = useMemo(() => {
    return histogramLogRows.filter((row) => {
      if (!matchesLogSearch(row, searchQuery)) return false
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(row.severity)) return false
      if (selectedEventTypes.length === 0) return true
      return selectedEventTypes.includes(classifyLogEventType(row))
    })
  }, [histogramLogRows, searchQuery, selectedEventTypes, selectedSeverities])
  const histogramBucketsData = useMemo(() => {
    return buildLogHistogramBuckets(
      histogramFilteredByEventTypeRows.map((row) => ({
        id: row.id,
        timestamp: row.time,
        service: 'checkout-pg-prod',
        serviceType: 'postgresql',
        severity: row.severity,
        eventType: row.eventType,
        message: row.message,
        component: row.component,
        project: 'payments-prod',
        region: 'aws-eu-west-1',
      })),
      clampedHistogramRange,
      getHourlyBucketCount(clampedHistogramRange),
    )
  }, [histogramFilteredByEventTypeRows, clampedHistogramRange])
  const severityCountsByBucket = useMemo<Record<number, { info: number; warning: number; error: number }>>(() => {
    const out: Record<number, { info: number; warning: number; error: number }> = {}
    for (const bucket of histogramBucketsData.buckets) {
      out[bucket.index] = { info: 0, warning: 0, error: 0 }
    }
    for (const bucket of histogramBucketsData.buckets) {
      out[bucket.index] = {
        info: bucket.info,
        warning: bucket.warning,
        error: bucket.error,
      }
    }
    return out
  }, [histogramBucketsData.buckets])
  const sortedLogRows = useMemo(() => {
    return [...filteredLogRows].sort((a, b) => b.timestampMs - a.timestampMs)
  }, [filteredLogRows])
  const visibleLogRows = useMemo(() => {
    return sortedLogRows.slice(0, visibleLogsCount)
  }, [sortedLogRows, visibleLogsCount])
  const hasMoreLogRows = visibleLogRows.length < sortedLogRows.length

  useEffect(() => {
    setSidebarItem(initialSidebarItem ?? 'overview')
    const resetRange = createRelativeLogRange(new Date(latestLogMs), DEFAULT_HISTOGRAM_HOURS * 60)
    setDateRange(null)
    setHistogramWindowRange(toHistogramRange(resetRange))
    setSelectedHistogramRange(null)
    setSearchQuery('')
    setSelectedEventTypes([])
    setSelectedSeverities([])
    setVisibleLogsCount(LOGS_PAGE_SIZE)
    setEventFilterOpen(false)
    setSeverityFilterOpen(false)
    setAiAssistantOpen(false)
    setAiDraft('')
    setAiMessages(INITIAL_AI_MESSAGES)
    if (aiResponseTimerRef.current) {
      window.clearTimeout(aiResponseTimerRef.current)
      aiResponseTimerRef.current = null
    }
  }, [serviceIdProp, initialSidebarItem, latestLogMs])

  useEffect(() => {
    return () => {
      if (aiResponseTimerRef.current) {
        window.clearTimeout(aiResponseTimerRef.current)
        aiResponseTimerRef.current = null
      }
      if (histogramRefreshTimerRef.current) {
        window.clearTimeout(histogramRefreshTimerRef.current)
        histogramRefreshTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    setIsHistogramRefreshing(true)
    if (histogramRefreshTimerRef.current) {
      window.clearTimeout(histogramRefreshTimerRef.current)
    }
    histogramRefreshTimerRef.current = window.setTimeout(() => {
      setIsHistogramRefreshing(false)
      histogramRefreshTimerRef.current = null
    }, 180)
  }, [searchQuery])

  useEffect(() => {
    if (!eventFilterOpen && !severityFilterOpen) return
    function handleMouseDown(event: MouseEvent) {
      if (eventFilterRef.current && !eventFilterRef.current.contains(event.target as Node)) {
        setEventFilterOpen(false)
      }
      if (severityFilterRef.current && !severityFilterRef.current.contains(event.target as Node)) {
        setSeverityFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [eventFilterOpen, severityFilterOpen])

  useEffect(() => {
    setVisibleLogsCount(LOGS_PAGE_SIZE)
  }, [dateRange, searchQuery, selectedEventTypes, selectedSeverities])

  useEffect(() => {
    if (!hasMoreLogRows || !loadMoreSentinelRef.current || !contentRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        setVisibleLogsCount((count) => Math.min(count + LOGS_PAGE_SIZE, sortedLogRows.length))
      },
      { root: contentRef.current, rootMargin: '120px 0px', threshold: 0.01 },
    )
    observer.observe(loadMoreSentinelRef.current)
    return () => observer.disconnect()
  }, [hasMoreLogRows, sortedLogRows.length])

  // Scroll the content area to the top on mount and section switch.
  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
    // Reset window scroll as well in case the outer layout overflows the viewport.
    try { window.scrollTo(0, 0) } catch { /* jsdom no-op */ }
  }, [serviceIdProp, sidebarItem])

  useEffect(() => {
    if (sidebarItem !== 'logs') {
      setLogsTopPadCollapsed(false)
      return
    }
    const root = contentRef.current
    const sentinel = logsStickySentinelRef.current
    if (!root || !sentinel) {
      setLogsTopPadCollapsed(false)
      return
    }
    const update = () => {
      const rootRect = root.getBoundingClientRect()
      const sentRect = sentinel.getBoundingClientRect()
      setLogsTopPadCollapsed((prev) => {
        const padTop = prev ? 0 : MAIN_CONTENT_SCROLL_PAD
        const contentTopY = rootRect.top + padTop
        const slackPx = sentRect.bottom - contentTopY
        if (!prev && slackPx < 0) return true
        if (prev && slackPx > LOGS_STICKY_PAD_HYSTERESIS_PX) return false
        return prev
      })
    }
    root.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(root)
    update()
    return () => {
      root.removeEventListener('scroll', update)
      ro.disconnect()
      setLogsTopPadCollapsed(false)
    }
  }, [sidebarItem, visibleLogRows.length])

  const prevLogsTopPadCollapsedRef = useRef<boolean | null>(null)
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el || sidebarItem !== 'logs') {
      prevLogsTopPadCollapsedRef.current = null
      return
    }
    const prev = prevLogsTopPadCollapsedRef.current
    if (prev === null) {
      prevLogsTopPadCollapsedRef.current = logsTopPadCollapsed
      return
    }
    if (prev === logsTopPadCollapsed) return
    const pad = MAIN_CONTENT_SCROLL_PAD
    if (!prev && logsTopPadCollapsed) {
      el.scrollTop = Math.min(Math.max(0, el.scrollHeight - el.clientHeight), el.scrollTop + pad)
    } else if (prev && !logsTopPadCollapsed) {
      el.scrollTop = Math.max(0, el.scrollTop - pad)
    }
    prevLogsTopPadCollapsedRef.current = logsTopPadCollapsed
  }, [logsTopPadCollapsed, sidebarItem])

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

  const handleExploreLogWithAi = (row: LogRow) => {
    const loadingId = `a-loading-${Date.now()}-${row.id}`
    const metadataPreview = row.metadata.map((item) => `- **${item.label}**: ${item.value}`).join('\n')
    const analysisMarkdown = [
      `### Log analysis`,
      ``,
      `#### Summary`,
      `- **Time**: ${row.displayTime}`,
      `- **Severity**: ${row.severity.toUpperCase()}`,
      `- **Event type**: ${row.eventType}`,
      `- **Source**: ${row.source}`,
      ``,
      `#### Message`,
      `> ${row.message}`,
      ``,
      `#### Context`,
      metadataPreview || '- No additional metadata available',
      ``,
      `#### Suggested next checks`,
      `1. Review previous and next entries from the same source for repeat failures.`,
      `2. Validate connection pool saturation and timeout trend around this timestamp.`,
      `3. Compare this event with deployment or traffic spikes in the same period.`,
    ].join('\n')

    setAiMessages((prev) => [
      ...prev,
      {
        id: `u-log-${Date.now()}-${row.id}`,
        role: 'user',
        text: `Explore this log entry with AI: ${row.displayTime} · ${row.eventType}`,
      },
      {
        id: loadingId,
        role: 'assistant',
        text: 'Analyzing selected log entry...',
        loading: true,
      },
    ])
    setAiAssistantOpen(true)
    if (aiResponseTimerRef.current) {
      window.clearTimeout(aiResponseTimerRef.current)
    }
    aiResponseTimerRef.current = window.setTimeout(() => {
      setAiMessages((prev) =>
        prev.map((message) =>
          message.id === loadingId
            ? {
                id: `a-log-${Date.now()}-${row.id}`,
                role: 'assistant',
                text: analysisMarkdown,
              }
            : message,
        ),
      )
      aiResponseTimerRef.current = null
    }, 900)
  }

  const handleExploreLogWindow = (row: LogRow) => {
    const centeredRange = createCenteredLogRange(row.timestampMs, 2 * 60 * 1000)
    setDateRange(centeredRange)
    setHistogramWindowRange(toHistogramRange(centeredRange))
    setSelectedHistogramRange(null)
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
        <div
          ref={contentRef}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            padding:
              sidebarItem === 'logs' && logsTopPadCollapsed
                ? `0 ${MAIN_CONTENT_SCROLL_PAD}px ${MAIN_CONTENT_SCROLL_PAD}px ${MAIN_CONTENT_SCROLL_PAD}px`
                : MAIN_CONTENT_SCROLL_PAD,
            overflow: 'auto',
            overflowAnchor: 'none',
            backgroundColor: '#fff',
          }}
        >
          {sidebarItem === 'logs' ? (
            <>
              <Box style={{ marginBottom: 16 }}>
                <CompactServiceHeader
                  serviceName={serviceName}
                  iconUrl={getServiceIconUrl(serviceTypeId ?? null)}
                  version={serviceVersion}
                  statusText="Running"
                  nodeCount={nodeCount}
                />
                <PageHeader
                  title=""
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
                    <Breadcrumbs.Crumb key="logs">Service logs</Breadcrumbs.Crumb>,
                  ]}
                  secondaryActions={{ text: 'AI assistant', onClick: () => setAiAssistantOpen(true) }}
                  menu={
                    <DropdownMenu.Items>
                      <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                    </DropdownMenu.Items>
                  }
                  onAction={(key) => { if (key === 'delete') onDeleteService?.() }}
                />
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Typography.Heading>Service logs</Typography.Heading>
                </Box>
              </Box>

              <Box style={{ marginTop: 0 }} role="region" aria-label="Service logs">
                <Box style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, flex: '1 1 auto', minWidth: 0 }}>
                    <Box style={{ flex: '1 1 340px', minWidth: 240, maxWidth: 480 }}>
                      <InputBase
                        placeholder="Search logs by message, event type, source, or metadata..."
                        aria-label="Search service logs"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery((event.target as HTMLInputElement).value)}
                      />
                    </Box>
                    <DateTimeRangePicker
                      aria-label="Date and time range"
                      granularity="minute"
                      value={dateRange ?? undefined}
                      reserveSpaceForError={false}
                      onChange={(value) => {
                        if (value?.start && value?.end) {
                          const nextRange = { start: value.start as CalendarDateTime, end: value.end as CalendarDateTime }
                          setDateRange(nextRange)
                          setHistogramWindowRange(toHistogramRange(nextRange))
                          setSelectedHistogramRange(null)
                        } else {
                          setDateRange(null)
                          setHistogramWindowRange(toHistogramRange(defaultLogRange))
                          setSelectedHistogramRange(null)
                        }
                      }}
                      shouldCloseOnSelect={false}
                    >
                      <DateRangeFilterTrigger />
                      <DateTimeRangePicker.Calendar />
                    </DateTimeRangePicker>

                    <div ref={eventFilterRef} style={{ position: 'relative' }}>
                      <Filter.Trigger
                        labelText="Event type"
                        icon={filterIcon}
                        value={selectedEventTypes.length > 0 ? selectedEventTypes.join(', ') : undefined}
                        onClear={selectedEventTypes.length > 0 ? () => setSelectedEventTypes([]) : undefined}
                        onClick={() => setEventFilterOpen((open) => !open)}
                      />
                      {eventFilterOpen && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            zIndex: 200,
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e8',
                            borderRadius: 8,
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                            padding: 16,
                            minWidth: 260,
                          }}
                        >
                          <CheckboxGroup
                            labelText="Event type"
                            value={selectedEventTypes}
                            onChange={(value) => setSelectedEventTypes(value ?? [])}
                          >
                            {LOG_EVENT_TYPE_OPTIONS.map((option) => (
                              <Checkbox key={option} value={option}>
                                {option}
                              </Checkbox>
                            ))}
                          </CheckboxGroup>
                        </Box>
                      )}
                    </div>
                    <div ref={severityFilterRef} style={{ position: 'relative' }}>
                      <Filter.Trigger
                        labelText="Severity"
                        icon={filterIcon}
                        value={
                          selectedSeverities.length > 0
                            ? selectedSeverities.map((severity) => formatSeverityOption(severity)).join(', ')
                            : undefined
                        }
                        onClear={selectedSeverities.length > 0 ? () => setSelectedSeverities([]) : undefined}
                        onClick={() => setSeverityFilterOpen((open) => !open)}
                      />
                      {severityFilterOpen && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            zIndex: 200,
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e8',
                            borderRadius: 8,
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                            padding: 16,
                            minWidth: 220,
                          }}
                        >
                          <CheckboxGroup
                            labelText="Severity"
                            value={selectedSeverities}
                            onChange={(value) => setSelectedSeverities((value as LogSeverity[] | undefined) ?? [])}
                          >
                            {LOG_SEVERITY_OPTIONS.map((option) => (
                              <Checkbox key={option} value={option}>
                                {formatSeverityOption(option)}
                              </Checkbox>
                            ))}
                          </CheckboxGroup>
                        </Box>
                      )}
                    </div>
                  </Box>
                </Box>

                <Box style={{ marginBottom: 12 }}>
                  <AuditLogsHistogram
                    status="ready"
                    buckets={histogramBucketsData.buckets.map((bucket) => ({
                      index: bucket.index,
                      startMs: bucket.startMs,
                      endMs: bucket.endMs,
                      count: bucket.total,
                    }))}
                    severityCountsByBucket={severityCountsByBucket}
                    range={histogramBucketsData.range}
                    selectedRange={selectedHistogramRange}
                    isRefreshing={isHistogramRefreshing}
                    onRangeSelected={(range) => {
                      setSelectedHistogramRange(range)
                      setDateRange({
                        start: utcDateToCalendarDateTime(new Date(range.startMs)),
                        end: utcDateToCalendarDateTime(new Date(range.endMs)),
                      })
                    }}
                  />
                </Box>

                {visibleLogRows.length === 0 ? (
                  <Typography.Default>No log entries for this filter.</Typography.Default>
                ) : (
                  <>
                    <div
                      ref={logsStickySentinelRef}
                      aria-hidden
                      style={{ height: 1, overflow: 'hidden', pointerEvents: 'none' }}
                    />
                    <LogsDataList
                      rows={visibleLogRows}
                      onExploreWithAi={handleExploreLogWithAi}
                      onExploreWindow={handleExploreLogWindow}
                    />
                    {hasMoreLogRows && <div ref={loadMoreSentinelRef} style={{ height: 1 }} aria-hidden="true" />}
                  </>
                )}
              </Box>
            </>
          ) : (
            <>
            {/* Page header */}
          <Box style={{ marginBottom: 32 }}>
            <CompactServiceHeader
              serviceName={serviceName}
              iconUrl={getServiceIconUrl(serviceTypeId ?? null)}
              version={serviceVersion}
              statusText="Running"
              nodeCount={nodeCount}
            />
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
      size="md"
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 420, height: '100%' }}>
        <Box
          style={{
            border: '1px solid #ededf0',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: 1,
            minHeight: 220,
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
              {message.loading && (
                <Box style={{ marginBottom: 4 }}>
                  <StatusChip text="Loading" status="neutral" dense badge />
                </Box>
              )}
              <Box style={{ whiteSpace: 'pre-wrap' }}>
                <Typography.Small>{message.text}</Typography.Small>
              </Box>
            </Box>
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

        <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AI_SUGGESTIONS.map((suggestion) => (
            <Button.Ghost key={suggestion} type="button" dense onClick={() => setAiDraft(suggestion)}>
              {suggestion}
            </Button.Ghost>
          ))}
        </Box>
      </Box>
    </Drawer>
    </>
  )
}

ServiceOverview.displayName = 'ServiceOverview'

export default ServiceOverview

function LogsDataList({
  rows,
  onExploreWithAi,
  onExploreWindow,
}: {
  rows: LogRow[]
  onExploreWithAi: (row: LogRow) => void
  onExploreWindow: (row: LogRow) => void
}) {
  if (rows.length === 0) return null
  const columns = [
    {
      type: 'custom' as const,
      headerName: 'Time',
      width: 220,
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ color: '#242429' }}>
          <Box component="span" style={{ fontFamily: LOG_MONO_FONT, fontSize: 12, lineHeight: '16px' }}>
            {row.displayTime}
          </Box>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Severity',
      width: 110,
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ color: '#242429' }}>
          <Box
            component="span"
            style={{
              ...logMessageHighlightStyle(row.severity),
              fontFamily: LOG_MONO_FONT,
              fontSize: 12,
              lineHeight: '16px',
            }}
          >
            {formatSeverityOption(row.severity)}
          </Box>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Source',
      width: 160,
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ color: '#242429' }}>
          <Box component="span" style={{ fontFamily: LOG_MONO_FONT, fontSize: 12, lineHeight: '16px' }}>
            {row.source}
          </Box>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Event type',
      width: 230,
      UNSAFE_render: (row: LogRow) => (
        <Box component="span" style={{ color: '#242429' }}>
          <Box component="span" style={{ fontFamily: LOG_MONO_FONT, fontSize: 12, lineHeight: '16px' }}>
            {row.eventType}
          </Box>
        </Box>
      ),
    },
    {
      type: 'custom' as const,
      headerName: 'Message',
      UNSAFE_render: (row: LogRow) => (
        <Box component="span">
          <Box
            component="span"
            style={{
              ...logMessageHighlightStyle(row.severity),
              fontFamily: LOG_MONO_FONT,
              fontSize: 12,
              lineHeight: '16px',
            }}
          >
            {row.message}
          </Box>
        </Box>
      ),
    },
  ]
  return (
    <div className="service-logs-data-list">
      <DataList
        sticky
        rows={rows}
        columns={columns}
        rowDetails={(row) => (
          <LogsRowDetails row={row} onExploreWithAi={onExploreWithAi} onExploreWindow={onExploreWindow} />
        )}
      />
    </div>
  )
}

LogsDataList.displayName = 'LogsDataList'

function LogsRowDetails({
  row,
  onExploreWithAi,
  onExploreWindow,
}: {
  row: LogRow
  onExploreWithAi: (row: LogRow) => void
  onExploreWindow: (row: LogRow) => void
}) {
  const [copied, setCopied] = useState(false)
  const copyToClipboard = (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return
    void navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }
  const logDetailRows = [
    ...row.metadata,
    ...Object.entries(row.keyValues).map(([label, value]) => ({ label, value })),
  ]
  const allLogDetails = logDetailRows.map((item) => `${item.label}: ${item.value}`).join('\n')

  return (
    <Box style={{ padding: 24 }}>
      <Box style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Typography.SmallStrong>Log details</Typography.SmallStrong>
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Button.Secondary type="button" dense icon={proPlansIcon} onClick={() => onExploreWithAi(row)}>
            Explain the log
          </Button.Secondary>
          <Button.Secondary type="button" dense onClick={() => onExploreWindow(row)}>
            Show ±1 min context
          </Button.Secondary>
          <Tooltip content={copied ? 'Copied' : 'Copy all log details'}>
            <Button.Icon
              type="button"
              dense
              icon={duplicateIcon}
              aria-label="Copy all log details"
              onClick={() => copyToClipboard(allLogDetails)}
            />
          </Tooltip>
        </Box>
      </Box>
      <Box style={{ display: 'grid', rowGap: 6 }}>
        {logDetailRows.map((item, index) => (
          <Box key={`${item.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 120, color: '#787885' }}>
              <Typography.Small>{item.label}</Typography.Small>
            </Box>
            <Box style={{ color: '#1a1b24', flex: 1, minWidth: 0 }}>
              <Typography.Small>{item.value}</Typography.Small>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

LogsRowDetails.displayName = 'LogsRowDetails'

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
