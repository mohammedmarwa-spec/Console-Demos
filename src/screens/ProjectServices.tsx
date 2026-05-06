import { useState, useMemo, useEffect, useRef, useCallback, Fragment, useContext } from 'react'
import { CalendarDateTime } from '@internationalized/date'
import { DateRangePickerStateContext as AriaDateRangePickerStateContext } from 'react-aria-components'
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  DataTable,
  DateTimeRangePicker,
  Divider,
  DropdownMenu,
  Filter,
  InlineIcon,
  InputBase,
  Link,
  PageHeader,
  Pagination,
  StatusChip,
  Switch,
  Table,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import filterIcon from '@aivenio/aquarium/icons/filter'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import containerIcon from '@aivenio/aquarium/icons/container'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import exportIcon from '@aivenio/aquarium/icons/export'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { getServiceIconUrl } from '../components/ServiceIcon'
import type { ServiceTypeId } from './ServiceTypeSelectModal'

const PROJECT_NAME = 'ux-tests'

export type ServiceRow = {
  id: string
  serviceName: string
  serviceType: string
  status: string
  nodes: string
  planName: string
  planDetails: string
  cloudRegion: string
  location: string
  created: string
  /** 2–3 letters in the Created-column avatar; omit to show an icon avatar instead. */
  createdByInitials?: string
  /** Full name for avatar tooltip when using initials. */
  createdByFullName?: string
  /** Icon avatar when `createdByInitials` is unset (`user`, automation, or MCP “spark”). */
  createdByAvatarVariant?: 'user' | 'automation' | 'mcp-ai'
  /** Optional: for table icon (e.g. 'M', 'P') */
  iconLetter?: string
  /** Optional: for opening overview (mysql, postgresql, etc.) */
  serviceTypeId?: ServiceTypeId
  /** Optional: pricing type label shown as a chip (e.g. 'ACU') */
  pricingType?: string
  /** Replication role — undefined means standalone (no replication). */
  replicationRole?: 'primary' | 'read_replica' | 'fork'
  /** For read_replica / fork services: the id of the source service. */
  sourceServiceId?: string
  /** Total number of nodes. Drives the Nodes badge in ServiceOverview. */
  nodeCount?: number
  /** CPUs per VM. */
  cpuCount?: number
  /** Total RAM capacity, e.g. "4 GB". Drives plan usage bars in ServiceOverview. */
  ramCapacity?: string
  /** Total storage capacity, e.g. "80 GB". Drives plan usage bars in ServiceOverview. */
  storageCapacity?: string
  /** ACU service tier label, e.g. "Professional", "Business". */
  serviceTier?: string
  /** ACU compute type label, e.g. "Standard", "Memory-optimized". */
  computeType?: string
  /** Estimated monthly price string, e.g. "~$75", "$5", "Free". */
  monthlyPrice?: string
}

export const INITIAL_SERVICES: ServiceRow[] = [
  {
    id: 'mysql-204e49c9',
    serviceName: 'mysql-204e49c9',
    serviceType: 'MySQL',
    status: 'Running',
    nodes: 'Nodes 1',
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',
    cloudRegion: 'Google Cloud: asia-east1',
    location: 'Asia, Taiwan',
    created: '16 minutes ago',
    createdByInitials: 'RS',
    createdByFullName: 'Rick Salevsky',
    iconLetter: 'M',
    serviceTypeId: 'mysql',
    pricingType: 'ACU',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '8 GB',
    storageCapacity: '8 GB',
    serviceTier: 'Professional',
    computeType: 'Standard',
  },
]

// ─── Filter options ────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Apache Kafka', label: 'Apache Kafka' },
  { value: 'OpenSearch', label: 'OpenSearch' },
  { value: 'ClickHouse', label: 'ClickHouse' },
  { value: 'Valkey', label: 'Valkey' },
  { value: 'Dragonfly', label: 'Dragonfly' },
  { value: 'Thanos Metrics', label: 'Thanos Metrics' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'Grafana', label: 'Grafana' },
  { value: 'Apache Flink', label: 'Apache Flink' },
  { value: 'Apache Kafka Connect', label: 'Apache Kafka Connect' },
  { value: 'Apache Kafka MirrorMaker', label: 'Apache Kafka MirrorMaker' },
]

const STATUS_OPTIONS = [
  { value: 'Running', label: 'Running' },
  { value: 'Powered off', label: 'Powered off' },
  { value: 'Rebuilding', label: 'Rebuilding' },
  { value: 'Rebalancing', label: 'Rebalancing' },
]

const PROVIDER_OPTIONS = [
  { value: 'Amazon Web Services', label: 'Amazon Web Services' },
  { value: 'Google Cloud', label: 'Google Cloud' },
  { value: 'Microsoft Azure', label: 'Microsoft Azure' },
  { value: 'DigitalOcean', label: 'DigitalOcean' },
  { value: 'UpCloud', label: 'UpCloud' },
]

const PRICING_OPTIONS = [
  { value: 'ACU', label: 'ACU' },
  { value: 'Fixed plan', label: 'Fixed plan' },
]

type AuditDateRange = { start: CalendarDateTime; end: CalendarDateTime }
type QuickRangePreset = 'last-15m' | 'last-1h' | 'last-24h' | null
type QueryStatus = 'loading' | 'ready' | 'error'

const QUICK_RANGE_LABELS: Record<Exclude<QuickRangePreset, null>, string> = {
  'last-15m': '15 minutes',
  'last-1h': '1 hour',
  'last-24h': '24 hours',
}

type AuditLogEntry = {
  id: string
  occurredAt: Date
  dateTimeLabel: string
  user: string
  userHref?: string
  eventType: string
  event: string
  /** Short metadata lines (e.g. request id, route). */
  metadata: { label: string; value: string }[]
  /** Additional key/value pairs for the expanded section. */
  details: Record<string, string>
}

const EVENT_TYPE_FILTER_OPTIONS = [
  { value: 'Application', label: 'Application' },
  { value: 'User management', label: 'User management' },
  { value: 'Access', label: 'Access' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Security', label: 'Security' },
  { value: 'Network', label: 'Network' },
]

const AUDIT_TABLE_COLUMN_WIDTHS = {
  dateTime: 320,
  user: 170,
  eventType: 170,
} as const

// Keep header text aligned with the date value text (not the chevron icon).
const AUDIT_DATE_TEXT_OFFSET = 26
const HELSINKI_TIME_ZONE = 'Europe/Helsinki'

function DateRangeFilterTrigger() {
  const dateRangeState = useContext(AriaDateRangePickerStateContext) as
    | { setOpen?: (open: boolean) => void }
    | null

  return (
    <Filter.Trigger
      labelText="Date range"
      icon={filterIcon}
      onClick={() => dateRangeState?.setOpen?.(true)}
    />
  )
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

function createRelativeAuditRange(anchor: Date, minutes: number): AuditDateRange {
  const end = new Date(anchor)
  const start = new Date(anchor.getTime() - minutes * 60 * 1000)
  return {
    start: utcDateToCalendarDateTime(start),
    end: utcDateToCalendarDateTime(end),
  }
}

function calendarDateTimeToUtcMs(cdt: CalendarDateTime): number {
  return Date.UTC(cdt.year, cdt.month - 1, cdt.day, cdt.hour, cdt.minute, cdt.second)
}

function getHelsinkiGmtOffset(d: Date): string {
  return (
    new Intl.DateTimeFormat('en-GB', {
      timeZone: HELSINKI_TIME_ZONE,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(d)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0'
  )
}

function formatOccurredAt(d: Date): string {
  const s = d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: HELSINKI_TIME_ZONE,
  })
  return `${s} ${getHelsinkiGmtOffset(d)}`
}

function createMockAuditLogs(): AuditLogEntry[] {
  const types = ['Application', 'User management', 'Access', 'Billing', 'Security', 'Network'] as const
  const userPool: { user: string; userHref?: string }[] = [
    { user: 'Rick Salevsky', userHref: '#' },
    { user: 'Aiven Automation' },
    { user: 'Jane Cooper', userHref: '#' },
    { user: 'system@aiven.io' },
  ]
  const eventByType: Record<string, string[]> = {
    Application: ['Created a service', 'Deleted service', 'Changed service plan', 'Restarted service', 'Updated integration'],
    'User management': ['Added users to project', 'Removed user from project', 'Changed project role', 'Invited user'],
    Access: ['Updated project permissions', 'Rotated API token', 'Created personal token'],
    Billing: ['Updated billing contact', 'Changed payment method', 'Downloaded usage report'],
    Security: ['Enabled IP filter', 'Disabled IP filter', 'Reset user MFA'],
    Network: ['Created VPC peering', 'Updated VPC route', 'Deleted VPC'],
  }
  const start = Date.UTC(2024, 9, 4, 10, 59, 0)
  const end = Date.UTC(2024, 9, 18, 17, 0, 0)
  const n = 46
  const out: AuditLogEntry[] = []
  for (let i = 0; i < n; i++) {
    const t = new Date(start + ((end - start) * (i + 0.5)) / n)
    const eventType = types[i % types.length]
    const eventList = eventByType[eventType] ?? ['Event']
    const event = eventList[i % eventList.length]
    const { user, userHref } = userPool[i % userPool.length]
    out.push({
      id: `audit-mock-${i + 1}`,
      occurredAt: t,
      dateTimeLabel: formatOccurredAt(t),
      user,
      userHref,
      eventType,
      event,
      metadata: [
        { label: 'Request ID', value: `req_${(100_000 + i * 911).toString(36)}` },
        { label: 'Client IP', value: `203.0.113.${(i % 200) + 1}` },
        { label: 'User agent', value: 'Aiven-Console/1.0' },
      ],
      details: {
        'Resource id': `prj-ux/${(i % 5) + 1}/svc-${(i % 3) + 1}`,
        'Project': 'ux-tests',
        'Organization id': 'org-7a2c',
        'API version': 'v1',
        'Status code': i % 7 === 0 ? '403' : '200',
        'Trace id': `tr_${i.toString(16).padStart(8, '0')}`,
      },
    })
  }
  return out
}

const MOCK_AUDIT_LOGS = createMockAuditLogs()
const DEFAULT_AUDIT_DATE_RANGE = createRelativeAuditRange(
  MOCK_AUDIT_LOGS[MOCK_AUDIT_LOGS.length - 1]?.occurredAt ?? new Date(),
  24 * 60,
)

function auditLogEntryToJson(row: AuditLogEntry) {
  return {
    id: row.id,
    occurredAt: row.occurredAt.toISOString(),
    dateTimeLabel: row.dateTimeLabel,
    user: row.user,
    userHref: row.userHref,
    eventType: row.eventType,
    event: row.event,
    metadata: row.metadata,
    details: row.details,
  }
}

function downloadAuditLogsJson(rows: AuditLogEntry[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    count: rows.length,
    logs: rows.map(auditLogEntryToJson),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'audit-logs.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

function AuditLogsSection() {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<AuditDateRange | null>(DEFAULT_AUDIT_DATE_RANGE)
  const [quickRangePreset, setQuickRangePreset] = useState<QuickRangePreset>('last-24h')
  const [eventFilterOpen, setEventFilterOpen] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('loading')
  const [queryError, setQueryError] = useState<string>()
  const [queryRows, setQueryRows] = useState<AuditLogEntry[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const eventFilterRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    if (!eventFilterOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (eventFilterRef.current && !eventFilterRef.current.contains(e.target as Node)) {
        setEventFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [eventFilterOpen])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let startMs = 0
    let endMs = 8.64e15
    if (dateRange?.start && dateRange?.end) {
      startMs = calendarDateTimeToUtcMs(dateRange.start)
      endMs = calendarDateTimeToUtcMs(dateRange.end)
    }
    return MOCK_AUDIT_LOGS.filter((row) => {
      const t = row.occurredAt.getTime()
      if (t < startMs || t > endMs) return false
      if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(row.eventType)) return false
      if (!q) return true
      const blob = [row.user, row.event, row.eventType, row.dateTimeLabel, ...row.metadata.flatMap((m) => [m.label, m.value]), ...Object.entries(row.details).flat()].join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [search, dateRange, selectedEventTypes])

  useEffect(() => {
    setQueryError(undefined)
    if (
      dateRange?.start &&
      dateRange?.end &&
      calendarDateTimeToUtcMs(dateRange.start) > calendarDateTimeToUtcMs(dateRange.end)
    ) {
      setQueryRows([])
      setQueryStatus('error')
      setQueryError('Invalid time range. Start must be before end.')
      return
    }
    setQueryStatus('loading')
    const timerId = window.setTimeout(() => {
      setQueryRows(filteredRows)
      setQueryStatus('ready')
    }, 180)
    return () => window.clearTimeout(timerId)
  }, [filteredRows, dateRange])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dateRange, selectedEventTypes, pageSize])

  const totalPages = Math.max(1, Math.ceil(queryRows.length / pageSize) || 1)
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const safePage = Math.min(currentPage, totalPages)
  const pageItems = useMemo(() => {
    const page = Math.min(currentPage, totalPages)
    const start = (page - 1) * pageSize
    return queryRows.slice(start, start + pageSize)
  }, [queryRows, currentPage, pageSize, totalPages])

  const hasPreviousPage = safePage > 1
  const hasNextPage = safePage < totalPages

  const eventFilterValueText =
    selectedEventTypes.length > 0 ? selectedEventTypes.join(', ') : undefined
  const eventFilterActive = selectedEventTypes.length > 0
  const quickRangeValueText = quickRangePreset ? QUICK_RANGE_LABELS[quickRangePreset] : undefined
  const latestAuditTimestamp = MOCK_AUDIT_LOGS[MOCK_AUDIT_LOGS.length - 1]?.occurredAt ?? new Date()

  const hasValidAuditTimeRange =
    dateRange != null &&
    calendarDateTimeToUtcMs(dateRange.start) <= calendarDateTimeToUtcMs(dateRange.end)

  function applyQuickRange(preset: Exclude<QuickRangePreset, null>) {
    const minutes = preset === 'last-15m' ? 15 : preset === 'last-1h' ? 60 : 24 * 60
    setDateRange(createRelativeAuditRange(latestAuditTimestamp, minutes))
    setQuickRangePreset(preset)
  }

  return (
    <>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <Box style={{ flex: '1 1 360px', maxWidth: 466 }}>
          <InputBase
            placeholder="Search by date, time, user, or action"
            aria-label="Search audit logs"
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
        </Box>
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 }}>
          <DropdownMenu
            minWidth={220}
            placement="bottom-left"
            onAction={(action) => {
              if (action === 'last-15m' || action === 'last-1h' || action === 'last-24h') {
                applyQuickRange(action)
              }
            }}
          >
            <DropdownMenu.Trigger>
              <Filter.Trigger
                labelText="Last"
                icon={filterIcon}
                value={quickRangeValueText}
                onClear={
                  quickRangePreset
                    ? () => {
                        setQuickRangePreset(null)
                        setDateRange(null)
                      }
                    : undefined
                }
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              <DropdownMenu.Item id="last-15m">{QUICK_RANGE_LABELS['last-15m']}</DropdownMenu.Item>
              <DropdownMenu.Item id="last-1h">{QUICK_RANGE_LABELS['last-1h']}</DropdownMenu.Item>
              <DropdownMenu.Item id="last-24h">{QUICK_RANGE_LABELS['last-24h']}</DropdownMenu.Item>
            </DropdownMenu.Items>
          </DropdownMenu>

          <DateTimeRangePicker
            aria-label="Date and time range"
            granularity="minute"
            value={dateRange ?? undefined}
            reserveSpaceForError={false}
            onChange={(val) => {
              if (val?.start && val?.end) {
                setDateRange({ start: val.start as CalendarDateTime, end: val.end as CalendarDateTime })
                setQuickRangePreset(null)
              } else {
                setDateRange(null)
                setQuickRangePreset(null)
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
              value={eventFilterValueText}
              onClear={eventFilterActive ? () => setSelectedEventTypes([]) : undefined}
              onClick={() => {
                setEventFilterOpen((o) => !o)
              }}
            />
            {eventFilterOpen && (
              <Box
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 200,
                  backgroundColor: 'var(--aquarium-background-color-layer)',
                  border: '1px solid var(--aquarium-border-color-muted)',
                  borderRadius: 8,
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                  padding: 16,
                  minWidth: 280,
                  maxHeight: 320,
                  overflow: 'auto',
                }}
              >
                <CheckboxGroup
                  labelText="Event types"
                  value={selectedEventTypes}
                  onChange={(val) => setSelectedEventTypes(val ?? [])}
                >
                  {EVENT_TYPE_FILTER_OPTIONS.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      {opt.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Box>
            )}
          </div>
        </Box>

        {hasValidAuditTimeRange && queryStatus === 'ready' ? (
          <Box style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <Button.Secondary
              dense
              type="button"
              icon={exportIcon}
              onClick={() => downloadAuditLogsJson(queryRows)}
            >
              Export JSON
            </Button.Secondary>
          </Box>
        ) : null}
      </Box>

      <Table ariaLabel="Audit logs" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Table.Head sticky>
          <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.dateTime }}>
            <Box style={{ paddingLeft: AUDIT_DATE_TEXT_OFFSET }}>
              <Typography.SmallStrong>Time (Helsinki, GMT+2/GMT+3)</Typography.SmallStrong>
            </Box>
          </Table.Cell>
          <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.user }}>
            <Typography.SmallStrong>Initiated by</Typography.SmallStrong>
          </Table.Cell>
          <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.eventType }}>
            <Typography.SmallStrong>Event type</Typography.SmallStrong>
          </Table.Cell>
          <Table.Cell>
            <Typography.SmallStrong>Event</Typography.SmallStrong>
          </Table.Cell>
        </Table.Head>
        <Table.Body>
          {queryStatus === 'loading' ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <Typography.Default>Loading logs...</Typography.Default>
              </Table.Cell>
            </Table.Row>
          ) : queryStatus === 'error' ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <Typography.Default>{queryError ?? 'Failed to run logs query.'}</Typography.Default>
              </Table.Cell>
            </Table.Row>
          ) : pageItems.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <Typography.Default>No log entries for this query.</Typography.Default>
              </Table.Cell>
            </Table.Row>
          ) : (
            pageItems.map((row) => {
            const expanded = expandedIds.has(row.id)
            return (
              <Fragment key={row.id}>
                <Table.Row
                  onClick={() => toggleExpanded(row.id)}
                  role="button"
                  aria-expanded={expanded}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpanded(row.id)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.dateTime, verticalAlign: 'middle' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4a4b57' }}>
                      <InlineIcon icon={expanded ? chevronDownIcon : chevronRightIcon} />
                      <span>{row.dateTimeLabel}</span>
                    </Box>
                  </Table.Cell>
                  <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.user, verticalAlign: 'middle' }}>
                    {row.userHref ? (
                      <Link
                        href={row.userHref}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                      >
                        {row.user}
                      </Link>
                    ) : (
                      row.user
                    )}
                  </Table.Cell>
                  <Table.Cell style={{ width: AUDIT_TABLE_COLUMN_WIDTHS.eventType, verticalAlign: 'middle' }}>{row.eventType}</Table.Cell>
                  <Table.Cell style={{ verticalAlign: 'middle' }}>{row.event}</Table.Cell>
                </Table.Row>
                {expanded && (
                  <Table.Row>
                    <Table.Cell colSpan={4} style={{ backgroundColor: 'var(--aquarium-background-color-muted)', borderBottom: '1px solid var(--aquarium-border-color-muted)' }}>
                      <Box style={{ padding: '8px 8px 16px' }}>
                        <Box style={{ marginBottom: 12 }}>
                          <Typography.SmallStrong>Metadata</Typography.SmallStrong>
                        </Box>
                        <Box style={{ display: 'grid', rowGap: 6, marginBottom: 16 }}>
                          {row.metadata.map((m) => (
                            <Box key={m.label} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <Box style={{ minWidth: 100, color: '#787885' }}>
                                <Typography.Small>{m.label}</Typography.Small>
                              </Box>
                              <Box style={{ color: '#1a1b24' }}>
                                <Typography.Small>{m.value}</Typography.Small>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                        <Box style={{ marginBottom: 8 }}>
                          <Typography.SmallStrong>Details</Typography.SmallStrong>
                        </Box>
                        <Box
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(120px, 200px) 1fr',
                            gap: '8px 24px',
                          }}
                        >
                          {Object.entries(row.details).map(([k, v]) => (
                            <Fragment key={k}>
                              <Box style={{ color: '#787885' }}>
                                <Typography.Small>{k}</Typography.Small>
                              </Box>
                              <Box style={{ color: '#1a1b24', wordBreak: 'break-all' }}>
                                <Typography.Small>{v}</Typography.Small>
                              </Box>
                            </Fragment>
                          ))}
                        </Box>
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Fragment>
            )
          }))}
        </Table.Body>
      </Table>

      <Box style={{ marginTop: 16 }}>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageChange={setCurrentPage}
          pageSizes={[5, 10, 20, 50]}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      </Box>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Running':     '#16a34a',
  'Powered off': '#787885',
  'Rebuilding':  '#2E90FA',
  'Rebalancing': '#2E90FA',
}

function ServiceStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#787885'
  return (
    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Box
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span style={{ color, fontSize: 12, lineHeight: '16px' }}>{status}</span>
    </Box>
  )
}

function extractProvider(cloudRegion: string): string {
  return cloudRegion.split(':')[0].trim()
}

function getPlanCaption(row: ServiceRow): string {
  if (row.pricingType === 'ACU' && row.computeType) {
    const nodes = row.nodeCount ?? 1
    const nodeText = `${nodes} ${nodes === 1 ? 'node' : 'nodes'}`
    const parts: string[] = [`${row.computeType} compute: ${nodeText}`]
    if (row.cpuCount) parts.push(`${row.cpuCount} CPU`)
    if (row.ramCapacity) parts.push(`${row.ramCapacity} RAM`)
    return parts.join(' · ')
  }
  return row.planDetails
}

const CREATED_WITH_MCP_TOOLTIP = 'Aiven MCP'

/** 24px circular avatar (Ant Design Avatar–style): initials or Aquarium icon fallback. */
function UserAvatar24({
  initials,
  variant = 'user',
  tooltip,
}: {
  initials?: string
  variant?: 'user' | 'automation' | 'mcp-ai'
  tooltip?: string
}) {
  const isMcp = variant === 'mcp-ai'
  const raw = isMcp ? '' : (initials?.trim() ?? '')
  const letters = raw.slice(0, 3).toUpperCase()
  const showLetters = letters.length > 0
  const icon = isMcp ? proPlansIcon : variant === 'automation' ? containerIcon : appUsersIcon
  const mcpBg = 'linear-gradient(135deg, rgba(53, 69, 190, 0.14) 0%, rgba(139, 92, 246, 0.12) 100%)'

  const avatar = (
    <Box
      style={{
        width: 24,
        height: 24,
        minWidth: 24,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isMcp ? mcpBg : 'var(--aquarium-background-color-inactive, #f5f5f7)',
        color: isMcp
          ? 'var(--aquarium-background-color-primary-default, #3545be)'
          : 'var(--aquarium-colors-grey-70, #5c5c6f)',
        fontSize: letters.length >= 3 ? 9 : letters.length === 2 ? 10 : 11,
        fontWeight: 400,
        letterSpacing: letters.length >= 3 ? '-0.02em' : undefined,
        lineHeight: 1,
        cursor: tooltip ? 'default' : undefined,
      }}
    >
      {showLetters ? (
        <span>{letters}</span>
      ) : (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
          <InlineIcon icon={icon} />
        </Box>
      )}
    </Box>
  )

  if (tooltip) {
    return (
      <Tooltip placement="top" content={tooltip}>
        {avatar}
      </Tooltip>
    )
  }
  return avatar
}

UserAvatar24.displayName = 'UserAvatar24'

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ onCreateServiceClick }: { onCreateServiceClick: () => void }) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <Box
        aria-hidden="true"
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--aquarium-background-color-primary-muted) 0%, var(--aquarium-background-color-muted) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Box component="span" style={{ fontSize: 36 }}>☁</Box>
      </Box>
      <Typography.LargeHeading>No services yet</Typography.LargeHeading>
      <Box style={{ maxWidth: 360 }}>
        <Box style={{ color: '#4a4b57' }}>
          <Typography.Default>
            Create your first service to get started. Choose from databases, streaming platforms, and more.
          </Typography.Default>
        </Box>
      </Box>
      <Box style={{ marginTop: 8 }}>
        <Button.Primary type="button" onClick={onCreateServiceClick}>
          Create service
        </Button.Primary>
      </Box>
    </Box>
  )
}

EmptyState.displayName = 'EmptyState'

// ─── Main component ───────────────────────────────────────────────────────────

type ProjectServicesProps = {
  services: ServiceRow[]
  onCreateServiceClick: () => void
  onServiceClick?: (serviceId: string) => void
  /** Called when the user chooses "Delete service" from a row's context menu. */
  onDeleteService?: (serviceId: string) => void
  /** Called when the user navigates to Billing (sidebar or header). */
  onBillingClick?: () => void
  /** Called when the user clicks the org root breadcrumb or Home nav. */
  onOrgHomeClick?: () => void
}

type ProjectPageId = 'services' | 'observability' | 'audit-logs'

function ProjectServices({ services, onCreateServiceClick, onServiceClick, onDeleteService, onBillingClick, onOrgHomeClick }: ProjectServicesProps) {
  const [activeProjectPage, setActiveProjectPage] = useState<ProjectPageId>('services')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedPricingModes, setSelectedPricingModes] = useState<string[]>([])
  const filterWrapperRef = useRef<HTMLDivElement>(null)

  // Close filter panel when clicking outside the wrapper
  useEffect(() => {
    if (!filterOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [filterOpen])

  const filteredServices = useMemo(() => {
    return services.filter((row) => {
      const matchesService = selectedServices.length === 0 || selectedServices.includes(row.serviceType)
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(row.status)
      const provider = extractProvider(row.cloudRegion)
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(provider)
      const matchesPricing =
        selectedPricingModes.length === 0 ||
        selectedPricingModes.some((mode) => {
          if (mode === 'ACU') return row.pricingType === 'ACU'
          if (mode === 'Fixed plan') return row.pricingType !== 'ACU'
          return false
        })
      return matchesService && matchesStatus && matchesProvider && matchesPricing
    })
  }, [services, selectedServices, selectedStatuses, selectedProviders, selectedPricingModes])

  const activeFilterCount =
    selectedServices.length + selectedStatuses.length + selectedProviders.length + selectedPricingModes.length

  const filterValueText = useMemo(() => {
    if (activeFilterCount === 0) return undefined
    const all = [...selectedServices, ...selectedStatuses, ...selectedProviders, ...selectedPricingModes]
    const MAX = 3
    const shown = all.slice(0, MAX)
    const overflow = all.length - shown.length
    return overflow > 0 ? `${shown.join(', ')} +${overflow} more` : shown.join(', ')
  }, [activeFilterCount, selectedServices, selectedStatuses, selectedProviders, selectedPricingModes])

  function handleClearFilters() {
    setSelectedServices([])
    setSelectedStatuses([])
    setSelectedProviders([])
    setSelectedPricingModes([])
  }

  const isEmpty = services.length === 0
  const isServicesPage = activeProjectPage === 'services'

  function handleProjectSidebarItemClick(itemId: string) {
    if (itemId === 'services' || itemId === 'observability' || itemId === 'audit-logs') {
      setActiveProjectPage(itemId)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--aquarium-background-color-body)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ConsoleHeader activeNav="projects" onHomeClick={onOrgHomeClick} onBillingClick={onBillingClick} onProjectsClick={onOrgHomeClick} />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ProjectSidebar
          projectName={PROJECT_NAME}
          activeItem={activeProjectPage}
          onBillingClick={onBillingClick}
          onItemClick={handleProjectSidebarItemClick}
        />

        {/* Main content */}
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            padding: 24,
            overflow: 'auto',
            backgroundColor: 'var(--aquarium-background-color-body)',
          }}
        >
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title={
                activeProjectPage === 'services'
                  ? 'Services'
                  : activeProjectPage === 'observability'
                  ? 'Observability'
                  : 'Audit logs'
              }
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="projects">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    Projects
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="project">{PROJECT_NAME}</Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="page">
                  {activeProjectPage === 'services'
                    ? 'Services'
                    : activeProjectPage === 'observability'
                    ? 'Observability'
                    : 'Audit logs'}
                </Breadcrumbs.Crumb>,
              ]}
              primaryAction={
                isServicesPage ? { text: 'Create service', onClick: onCreateServiceClick } : undefined
              }
            />
          </Box>

          {!isServicesPage ? (
            activeProjectPage === 'observability' ? (
              <Box
                style={{
                  border: '1px solid var(--aquarium-border-color-muted)',
                  borderRadius: 12,
                  padding: 24,
                  maxWidth: 760,
                  backgroundColor: 'var(--aquarium-background-color-layer)',
                }}
              >
                <Box style={{ marginBottom: 8 }}>
                  <Typography.LargeHeading>Observability</Typography.LargeHeading>
                </Box>
                <Typography.Default>
                  Monitor project-level health, alerts, and telemetry from one place.
                </Typography.Default>
              </Box>
            ) : (
              <AuditLogsSection />
            )
          ) : isEmpty ? (
            <EmptyState onCreateServiceClick={onCreateServiceClick} />
          ) : (
            <>
              {/* Toolbar */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Box style={{ flex: '1 1 auto', minWidth: 200, maxWidth: 400 }}>
                  <InputBase
                    placeholder="Search services by name, plan, cloud and tags..."
                    aria-label="Search services"
                  />
                </Box>

                {/* Filter trigger + dropdown panel */}
                <div ref={filterWrapperRef} style={{ position: 'relative' }}>
                  <Filter.Trigger
                    labelText="Filter"
                    icon={filterIcon}
                    value={filterValueText}
                    onClear={activeFilterCount > 0 ? handleClearFilters : undefined}
                    onClick={() => setFilterOpen((prev) => !prev)}
                  />

                  {filterOpen && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        zIndex: 200,
                        backgroundColor: 'var(--aquarium-background-color-layer)',
                        border: '1px solid var(--aquarium-border-color-muted)',
                        borderRadius: 8,
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                        padding: 24,
                        minWidth: 720,
                      }}
                    >
                      {/* Filter sections — horizontal layout matching the screenshot */}
                      <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 20 }}>
                        <CheckboxGroup
                          labelText="Services"
                          cols="2"
                          value={selectedServices}
                          onChange={(val) => setSelectedServices(val ?? [])}
                        >
                          {SERVICE_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Status"
                          value={selectedStatuses}
                          onChange={(val) => setSelectedStatuses(val ?? [])}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Providers"
                          value={selectedProviders}
                          onChange={(val) => setSelectedProviders(val ?? [])}
                        >
                          {PROVIDER_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Pricing mode"
                          value={selectedPricingModes}
                          onChange={(val) => setSelectedPricingModes(val ?? [])}
                        >
                          {PRICING_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                      </Box>

                      <Divider />

                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <InlineIcon icon={infoSignIcon} />
                        <Typography.SmallStrong>
                          Need more filter options?{' '}
                          <Link href="#">Learn more</Link>
                        </Typography.SmallStrong>
                      </Box>
                    </Box>
                  )}
                </div>

                <Switch checked={false} onChange={() => {}}>
                  Show only services with alerts
                </Switch>
              </Box>

              {/* Services table */}
              <DataTable
                ariaLabel="Services"
                rows={filteredServices}
                columns={[
                  {
                    type: 'custom',
                    headerName: 'Service',
                    UNSAFE_render: (row) => {
                      const isReplica = row.replicationRole === 'read_replica'
                      const isFork = row.replicationRole === 'fork'
                      const iconUrl = getServiceIconUrl(row.serviceTypeId ?? null)

                      return (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Dashed tree connector — replicas only */}
                          {isReplica && (
                            <Box
                              aria-hidden="true"
                              style={{ width: 28, alignSelf: 'stretch', flexShrink: 0, position: 'relative', marginRight: 16 }}
                            >
                              <Box style={{
                                position: 'absolute',
                                left: 11,
                                top: 0,
                                bottom: '50%',
                                borderLeft: '1.5px dashed #c0c0cc',
                              }} />
                              <Box style={{
                                position: 'absolute',
                                left: 11,
                                top: '50%',
                                width: 17,
                                borderTop: '1.5px dashed #c0c0cc',
                              }} />
                            </Box>
                          )}

                          {/* Service icon */}
                          <Box style={{ width: 40, height: 40, flexShrink: 0, marginRight: 12 }}>
                            {iconUrl ? (
                              <img src={iconUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                            ) : (
                              <Typography.SmallStrong>
                                {row.iconLetter ?? row.serviceType.charAt(0)}
                              </Typography.SmallStrong>
                            )}
                          </Box>

                          {/* Name + caption */}
                          <Box>
                            <Link
                              href="#"
                              onClick={(e) => { e.preventDefault(); onServiceClick?.(row.id) }}
                            >
                              {row.serviceName}
                            </Link>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <Box style={{ color: '#787885' }}>
                                <Typography.Caption>{row.serviceType}</Typography.Caption>
                              </Box>
                              <ServiceStatusBadge status={row.status ?? 'Running'} />
                              {(isReplica || isFork) && (
                                <Box style={{ color: '#787885' }}>
                                  <Typography.Caption>
                                    <strong>{isFork ? 'Fork' : 'Read replica'}</strong>
                                  </Typography.Caption>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      )
                    },
                  },
                  {
                    type: 'custom',
                    headerName: 'Nodes',
                    UNSAFE_render: (row) => {
                      const statusClass =
                        row.status === 'Running'
                          ? 'nodes-chip--running'
                          : row.status === 'Rebuilding' || row.status === 'Rebalancing'
                          ? 'nodes-chip--rebuilding'
                          : 'nodes-chip--muted'
                      return (
                        <span className={`nodes-chip ${statusClass}`}>
                          <StatusChip text="Nodes" status="neutral" dense badge={row.nodeCount ?? 1} />
                        </span>
                      )
                    },
                  },
                  {
                    type: 'custom',
                    headerName: 'Pricing',
                    headerInvisible: true,
                    width: 60,
                    UNSAFE_render: (row) =>
                      row.pricingType ? (
                        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <StatusChip
                            status="neutral"
                            text={row.pricingType}
                            dense
                          />
                        </Box>
                      ) : null,
                  },
                  {
                    type: 'item',
                    headerName: 'Plan',
                    item: (row) => ({
                      title: (
                        <Box component="span" style={{ fontSize: 14, fontWeight: 600 }}>
                          {row.pricingType === 'ACU' && row.serviceTier ? row.serviceTier : row.planName}
                        </Box>
                      ),
                      caption: getPlanCaption(row),
                    }),
                  },
                  {
                    type: 'item',
                    headerName: 'Cloud',
                    item: (row) => ({
                      title: row.cloudRegion,
                      caption: row.location,
                    }),
                  },
                  {
                    type: 'custom',
                    headerName: 'Created',
                    UNSAFE_render: (row) => (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserAvatar24
                          initials={row.createdByInitials}
                          variant={row.createdByAvatarVariant ?? 'user'}
                          tooltip={
                            row.createdByAvatarVariant === 'mcp-ai'
                              ? CREATED_WITH_MCP_TOOLTIP
                              : row.createdByFullName?.trim()
                              ? row.createdByFullName.trim()
                              : undefined
                          }
                        />
                        <Box component="span" style={{ fontSize: 14, lineHeight: '20px' }}>
                          {row.created}
                        </Box>
                      </Box>
                    ),
                  },
                ]}
                menu={() => (
                  <DropdownMenu.Items>
                    <DropdownMenu.Item id="open">Open service</DropdownMenu.Item>
                    <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                  </DropdownMenu.Items>
                )}
                menuHeaderName="Actions"
                onAction={(action, row) => {
                  if (action === 'open') onServiceClick?.(row.id)
                  if (action === 'delete') onDeleteService?.(row.id)
                }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

ProjectServices.displayName = 'ProjectServices'

export default ProjectServices
