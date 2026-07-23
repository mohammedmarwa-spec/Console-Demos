'use client'

import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CalendarDate } from '@internationalized/date'
import { DateRangePickerStateContext as AriaDateRangePickerStateContext } from 'react-aria-components'
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  DataList,
  DateRangePicker,
  Divider,
  Drawer,
  Filter,
  Icon,
  Input,
  InputBase,
  Link,
  PageHeader,
  Popover,
  Typography,
} from '@aivenio/aquarium'
import filterIcon from '@aivenio/aquarium/icons/filter'
import exportIcon from '@aivenio/aquarium/icons/export'
import searchIcon from '@aivenio/aquarium/icons/search'
import automaticUpdatesIcon from '@aivenio/aquarium/icons/automaticUpdates'
import consoleIcon from '@aivenio/aquarium/icons/console'
import personIcon from '@aivenio/aquarium/icons/person'
import {
  DATE_RANGE_PRESETS,
  EVENT_LOG_MAX_DATE,
  EVENT_LOG_MIN_DATE,
  DEFAULT_PRESET_RANGE,
  MOCK_EVENT_LOGS,
  calendarDateToUtcEndMs,
  calendarDateToUtcStartMs,
  downloadEventLogsJson,
  eventLogSearchBlob,
  eventLogToJson,
  type EventDateRange,
  type EventLog,
} from './eventLogsData'

type QueryStatus = 'loading' | 'ready' | 'error'

type ColumnId = 'dateTime' | 'user' | 'action' | 'project' | 'service'

const COLUMN_OPTIONS: { id: ColumnId; label: string }[] = [
  { id: 'dateTime', label: 'Date and time' },
  { id: 'user', label: 'User' },
  { id: 'action', label: 'Action' },
  { id: 'project', label: 'Project' },
  { id: 'service', label: 'Service' },
]

const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = COLUMN_OPTIONS.map((c) => c.id)

const COLUMN_WIDTHS = {
  dateTime: 260,
  user: 180,
  project: 160,
  service: 200,
} as const

/** Max rows shown for a single query (retention / export cap). */
const MAX_EVENT_LOGS = 100
/** Infinite-scroll batch size. */
const EVENT_LOGS_BATCH = 25
const LOAD_MORE_DELAY_MS = 280

// ─── Date range filter (Filter.Trigger + DS calendar popover) ─────────────────

function DateRangeFilterTrigger({ onClear }: { onClear?: () => void }) {
  const dateRangeState = useContext(AriaDateRangePickerStateContext) as
    | { setOpen?: (open: boolean) => void }
    | null

  return (
    <Filter.Trigger
      labelText="Date range"
      icon={filterIcon}
      onClear={onClear}
      onClick={() => dateRangeState?.setOpen?.(true)}
    />
  )
}

// ─── Free-text ID filter (Filter.Trigger + local panel) ───────────────────────

/**
 * ID filters use typed strings (not selects) so users can filter by deleted
 * resources whose names/IDs are no longer in a live options catalog.
 * Uses a local absolute panel (not Aquarium Popover) so Filter.Trigger clear/toggle
 * does not fight Popover outside-click / Pressable wrapping.
 */
function IdStringFilter({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const active = value.trim().length > 0

  useEffect(() => {
    if (!open) return

    const closeOnOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [open])

  return (
    <div ref={rootRef} style={{ display: 'inline-flex', position: 'relative' }}>
      <Filter.Trigger
        labelText={label}
        icon={filterIcon}
        value={active ? value.trim() : undefined}
        onClear={
          active
            ? () => {
                onChange('')
                setOpen(false)
              }
            : undefined
        }
        onClick={() => setOpen((prev) => !prev)}
      />
      {open ? (
        <Box
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 200,
            minWidth: 280,
            padding: 12,
            backgroundColor: 'var(--aquarium-background-color-layer)',
            border: '1px solid var(--aquarium-border-color-muted)',
            borderRadius: 8,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Input
            labelText={label}
            placeholder={placeholder}
            value={value}
            reserveSpaceForError={false}
            autoFocus
            onChange={(event) => onChange(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false)
              if (event.key === 'Enter') setOpen(false)
            }}
          />
        </Box>
      ) : null}
    </div>
  )
}

/** True when filter is empty, or row value matches (comma-separated IDs allowed). */
function matchesIdFilter(filterValue: string, rowValue: string | null | undefined): boolean {
  const tokens = filterValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (tokens.length === 0) return true
  if (!rowValue) return false
  return tokens.includes(rowValue)
}

// ─── "All filters" combined drawer ─────────────────────────────────────────────

type FilterState = {
  /** Free-text schema ID fields — supports deleted resources not in any options list. */
  actorUserId: string
  /** Kept for a possible return of the Event type chip; UI currently hidden. */
  eventTypes: string[]
  accountId: string
  organizationUnitId: string
  projectId: string
  billingGroupId: string
  serviceId: string
}

const EMPTY_FILTERS: FilterState = {
  actorUserId: '',
  eventTypes: [],
  accountId: '',
  organizationUnitId: '',
  projectId: '',
  billingGroupId: '',
  serviceId: '',
}

function countActiveIdFilters(filters: FilterState): number {
  return (
    Number(Boolean(filters.actorUserId.trim())) +
    filters.eventTypes.length +
    Number(Boolean(filters.accountId.trim())) +
    Number(Boolean(filters.organizationUnitId.trim())) +
    Number(Boolean(filters.projectId.trim())) +
    Number(Boolean(filters.billingGroupId.trim())) +
    Number(Boolean(filters.serviceId.trim()))
  )
}

function AllFiltersButton({
  filters,
  setFilters,
}: {
  filters: FilterState
  setFilters: (next: FilterState) => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  const activeCount = countActiveIdFilters(filters)
  const clearAll = () => setFilters({ ...EMPTY_FILTERS })

  useEffect(() => {
    if (!open) return

    const filterGrid = document.querySelector('.event-logs-filter-grid')
    const dialog = filterGrid?.closest<HTMLElement>('.react-aria-Modal')
    if (!dialog) return

    const closeOnEmptyOutsideClick = (event: MouseEvent) => {
      if (activeCount > 0) return
      if (!(event.target instanceof Node)) return
      if (dialog.contains(event.target) || triggerRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', closeOnEmptyOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnEmptyOutsideClick)
  }, [activeCount, open])

  return (
    <>
      <div ref={triggerRef} style={{ display: 'inline-flex' }}>
        <Filter.Trigger
          labelText="All filters"
          icon={filterIcon}
          badge={activeCount > 0 ? activeCount : undefined}
          onClear={activeCount > 0 ? clearAll : undefined}
          onClick={() => setOpen((prev) => !prev)}
        />
      </div>
      {/* Prototype-only: the playground's fixed top bars (lab chrome 48px + console
          header 66px = 114px) should stay visible, so open the drawer beneath them
          instead of over the whole viewport. Offsetting the top also requires capping
          the panel height so its footer buttons stay on-screen. The overlay is made
          non-blocking (no backdrop, pointer-events pass through) so the log table and
          filter chips stay interactive while the drawer is open. Empty helper-text
          slots are collapsed so the filter gap reads as the intended 16px.
          The real Console has no lab chrome. */}
      <style>{`
        .Aquarium-Drawer:has(.event-logs-filter-grid) {
          top: 114px !important;
          pointer-events: none !important;
        }
        .Aquarium-Drawer:has(.event-logs-filter-grid) .bg-backdrop {
          display: none !important;
        }
        .Aquarium-Drawer:has(.event-logs-filter-grid) .react-aria-Modal {
          pointer-events: auto !important;
        }
        .Aquarium-Drawer:has(.event-logs-filter-grid) .react-aria-Modal > div {
          height: calc(100vh - 114px) !important;
          max-height: calc(100vh - 114px) !important;
          border-left: 1px solid var(--aquarium-border-color-muted) !important;
        }
        .event-logs-filter-grid p.typography-small { display: none !important; }
      `}</style>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter by"
        size="sm"
        closeOnEsc
        primaryAction={{ text: 'Done', onClick: () => setOpen(false) }}
        secondaryActions={{ text: 'Clear filters', onClick: clearAll }}
      >
        <Box className="event-logs-filter-grid" style={{ display: 'grid', rowGap: 16 }}>
          {/* Order follows Aiven entity hierarchy, then actor. */}
          <Input
            labelText="account_id [string]"
            placeholder="Enter account_id"
            value={filters.accountId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, accountId: event.currentTarget.value })
            }
          />
          <Input
            labelText="organization_unit_id [string]"
            placeholder="Enter organization_unit_id"
            value={filters.organizationUnitId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, organizationUnitId: event.currentTarget.value })
            }
          />
          <Input
            labelText="billing_group_id [string]"
            placeholder="Enter billing_group_id"
            value={filters.billingGroupId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, billingGroupId: event.currentTarget.value })
            }
          />
          <Input
            labelText="project_id [string]"
            placeholder="Enter project_id"
            value={filters.projectId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, projectId: event.currentTarget.value })
            }
          />
          <Input
            labelText="service_id [string]"
            placeholder="Enter service_id"
            value={filters.serviceId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, serviceId: event.currentTarget.value })
            }
          />
          <Input
            labelText="actor_user_id [string]"
            placeholder="Enter actor_user_id"
            value={filters.actorUserId}
            reserveSpaceForError={false}
            onChange={(event) =>
              setFilters({ ...filters, actorUserId: event.currentTarget.value })
            }
          />
          {/* Event type filter hidden for now — keep filters.eventTypes to restore. */}
        </Box>
      </Drawer>
    </>
  )
}

// ─── User avatar (reflects actor kind) ─────────────────────────────────────────

function UserAvatar({ kind }: { kind: EventLog['actorKind'] }) {
  const icon = kind === 'automation' ? automaticUpdatesIcon : kind === 'system' ? consoleIcon : personIcon
  return (
    <Box
      aria-hidden
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      <Icon icon={icon} color="muted" style={{ width: 14, height: 14 }} />
    </Box>
  )
}

// ─── Expanded detail rows ──────────────────────────────────────────────────────

/**
 * Identifiers in Action column copy (DataList only): emails, IPs, prefixed IDs
 * (prj-/bg-/vpc-/…), cloud regions, hyphenated resource names, plan codes, roles.
 */
const ACTION_IDENTIFIER_PATTERN =
  /(\b[\w.+-]+@[\w.-]+\.\w+\b|\b\d{1,3}(?:\.\d{1,3}){3}\b|\b(?:org|ou|acc|bg|prj|svc|vpce|vpc|plc|pcx|ups|pl)-[\w.-]+\b|\b(?:aws|gcp|azure)-[a-z0-9-]+\b|\b[A-Z][a-zA-Z]*-\d+\b|\b(?:Admin|Developer|Operator|Owner|Member|Viewer)\b|\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b)/g

function isActionIdentifier(part: string): boolean {
  return (
    /^[\w.+-]+@[\w.-]+\.\w+$/.test(part) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(part) ||
    /^(?:org|ou|acc|bg|prj|svc|vpce|vpc|plc|pcx|ups|pl)-[\w.-]+$/.test(part) ||
    /^(?:aws|gcp|azure)-[a-z0-9-]+$/.test(part) ||
    /^[A-Z][a-zA-Z]*-\d+$/.test(part) ||
    /^(?:Admin|Developer|Operator|Owner|Member|Viewer)$/.test(part) ||
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(part)
  )
}

/** Bold identifiers in Action column text. Not used in expanded details. */
function emphasizeActionIdentifiers(text: string): ReactNode {
  return text.split(ACTION_IDENTIFIER_PATTERN).map((part, index) => {
    if (!part) return null
    if (isActionIdentifier(part)) {
      return (
        <span key={`${part}-${index}`} style={{ fontWeight: 600 }}>
          {part}
        </span>
      )
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>
  })
}

function entityLink(value: string, alertMessage: string): ReactNode {
  return (
    <Link
      href="#"
      onClick={(e) => {
        e.preventDefault()
        window.alert(alertMessage)
      }}
    >
      {value}
    </Link>
  )
}

function nullableEntityLink(value: string | null, alertMessage: string): ReactNode {
  if (value === null) {
    return <span style={{ color: 'var(--aquarium-text-color-muted)', fontStyle: 'italic' }}>null</span>
  }
  return entityLink(value, alertMessage)
}

function nullable(value: string | null): ReactNode {
  if (value === null) {
    return <span style={{ color: 'var(--aquarium-text-color-muted)', fontStyle: 'italic' }}>null</span>
  }
  return value
}

// ─── DataList cell renderers ───────────────────────────────────────────────────

function UserCell({ row }: { row: EventLog }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <UserAvatar kind={row.actorKind} />
      {row.actorHref ? (
        <Link href={row.actorHref} onClick={(e) => e.preventDefault()}>
          {row.actor}
        </Link>
      ) : (
        <span>{row.actor}</span>
      )}
    </Box>
  )
}

function ProjectCell({ row }: { row: EventLog }) {
  return <Typography.Default>{row.projectId ?? '—'}</Typography.Default>
}

function ServiceCell({ row }: { row: EventLog }) {
  return <Typography.Default>{row.serviceId ?? '—'}</Typography.Default>
}

type DetailRow = { id: string; label: string; value: ReactNode }

function EventDetails({ row }: { row: EventLog }) {
  const [copied, setCopied] = useState(false)

  const copyLogDetails = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return
    void navigator.clipboard.writeText(JSON.stringify(eventLogToJson(row), null, 2))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  const detailRows: DetailRow[] = [
    { id: 'log_entry_id', label: 'log_entry_id', value: row.logEntryId },
    { id: 'event_type', label: 'event_type', value: row.eventType },
    {
      id: 'actor',
      label: 'actor',
      value: entityLink(row.actor, 'Link to user'),
    },
    {
      id: 'actor_user_id',
      label: 'actor_user_id',
      value: nullableEntityLink(row.actorUserId, 'Link to user'),
    },
    ...(row.internalActor
      ? [{ id: 'internal_actor', label: 'internal_actor', value: row.internalActor } satisfies DetailRow]
      : []),
    { id: 'account_id', label: 'account_id', value: nullable(row.accountId) },
    { id: 'organization_id', label: 'organization_id', value: nullable(row.organizationId) },
    {
      id: 'billing_group_id',
      label: 'billing_group_id',
      value: nullableEntityLink(row.billingGroupId, 'Link to billing group'),
    },
    {
      id: 'project_id',
      label: 'project_id',
      value: nullableEntityLink(row.projectId, 'Link to project'),
    },
    {
      id: 'service_id',
      label: 'service_id',
      value: nullableEntityLink(row.serviceId, 'Link to service'),
    },
    { id: 'asset_type', label: 'asset_type', value: row.assetType },
    { id: 'asset_id', label: 'asset_id', value: nullable(row.assetId) },
    { id: 'metadata', label: 'metadata', value: JSON.stringify(row.metadata) },
    { id: 'additional_properties', label: 'additional_properties', value: row.additionalProperties },
  ]

  return (
    <Box className="event-log-details" style={{ padding: '16px 0 12px', fontSize: 14, lineHeight: '20px' }}>
      <Box
        style={{
          marginBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Typography.DefaultStrong>Event details</Typography.DefaultStrong>
        <Button.Secondary type="button" dense onClick={copyLogDetails}>
          {copied ? 'Copied' : 'Copy log details'}
        </Button.Secondary>
      </Box>
      {detailRows.map((r, index) => (
        <Box
          key={r.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '12px',
            borderBottom:
              index < detailRows.length - 1
                ? '1px solid var(--aquarium-border-color-muted)'
                : undefined,
          }}
        >
          <Box
            style={{
              width: 220,
              flexShrink: 0,
              color: 'var(--aquarium-text-color-muted)',
            }}
          >
            {r.label}
          </Box>
          <Box style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{r.value}</Box>
        </Box>
      ))}
    </Box>
  )
}

/** Direction-aware comparators for sortable DataList headers. */
const dir = (n: number, descending: boolean) => (descending ? -n : n)

function buildEventLogColumns(visibleIds: ColumnId[]) {
  const visible = new Set(visibleIds)
  const columns = []

  if (visible.has('dateTime')) {
    columns.push({
      type: 'text' as const,
      headerName: 'Date and time',
      field: 'dateTimeLabel' as const,
      width: COLUMN_WIDTHS.dateTime,
      sort: (a: EventLog, b: EventLog, direction: 'ascending' | 'descending' | 'none' | undefined) =>
        dir(a.occurredAt.getTime() - b.occurredAt.getTime(), direction === 'descending'),
    })
  }
  if (visible.has('user')) {
    columns.push({
      type: 'custom' as const,
      headerName: 'User',
      width: COLUMN_WIDTHS.user,
      sort: (a: EventLog, b: EventLog, direction: 'ascending' | 'descending' | 'none' | undefined) =>
        dir(a.actor.localeCompare(b.actor), direction === 'descending'),
      UNSAFE_render: (row: EventLog) => <UserCell row={row} />,
    })
  }
  if (visible.has('action')) {
    columns.push({
      type: 'custom' as const,
      headerName: 'Action',
      sort: (a: EventLog, b: EventLog, direction: 'ascending' | 'descending' | 'none' | undefined) =>
        dir(a.action.localeCompare(b.action), direction === 'descending'),
      UNSAFE_render: (row: EventLog) => (
        <Typography.Default>{emphasizeActionIdentifiers(row.action)}</Typography.Default>
      ),
    })
  }
  if (visible.has('project')) {
    columns.push({
      type: 'custom' as const,
      headerName: 'Project',
      width: COLUMN_WIDTHS.project,
      sort: (a: EventLog, b: EventLog, direction: 'ascending' | 'descending' | 'none' | undefined) =>
        dir((a.projectId ?? '').localeCompare(b.projectId ?? ''), direction === 'descending'),
      UNSAFE_render: (row: EventLog) => <ProjectCell row={row} />,
    })
  }
  if (visible.has('service')) {
    columns.push({
      type: 'custom' as const,
      headerName: 'Service',
      width: COLUMN_WIDTHS.service,
      sort: (a: EventLog, b: EventLog, direction: 'ascending' | 'descending' | 'none' | undefined) =>
        dir((a.serviceId ?? '').localeCompare(b.serviceId ?? ''), direction === 'descending'),
      UNSAFE_render: (row: EventLog) => <ServiceCell row={row} />,
    })
  }

  // Mixed column defs need an assertion; Aquarium's DataListColumn is a discriminative union.
  return columns as never
}

function ColumnConfigurer({
  visibleIds,
  onChange,
}: {
  visibleIds: ColumnId[]
  onChange: (next: ColumnId[]) => void
}) {
  const onlyOneVisible = visibleIds.length === 1

  return (
    <Popover placement="bottom-end">
      <Popover.Trigger>
        <Button.Dropdown kind="ghost" type="button">
          Configure columns
        </Button.Dropdown>
      </Popover.Trigger>
      <Popover.Panel>
        <Box style={{ padding: 12, width: 'max-content' }}>
          <CheckboxGroup
            labelText="Visible columns"
            reserveSpaceForError={false}
            value={visibleIds}
            onChange={(val) => {
              const selected = new Set(val ?? [])
              const next = COLUMN_OPTIONS.map((opt) => opt.id).filter((id) => selected.has(id))
              if (next.length === 0) return
              onChange(next)
            }}
          >
            {COLUMN_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                value={opt.id}
                disabled={onlyOneVisible && visibleIds.includes(opt.id)}
              >
                {opt.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Box>
      </Popover.Panel>
    </Popover>
  )
}

// ─── Main content ──────────────────────────────────────────────────────────────

export function EventLogsContent() {
  const [dateRange, setDateRange] = useState<EventDateRange | null>(DEFAULT_PRESET_RANGE)
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS })
  const [searchInput, setSearchInput] = useState('')
  const [visibleColumnIds, setVisibleColumnIds] = useState<ColumnId[]>(DEFAULT_VISIBLE_COLUMNS)
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('loading')
  const [queryError, setQueryError] = useState<string>()
  const [queryRows, setQueryRows] = useState<EventLog[]>([])
  const [visibleCount, setVisibleCount] = useState(EVENT_LOGS_BATCH)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreTimerRef = useRef<number | null>(null)

  const visibleColumns = useMemo(
    () => buildEventLogColumns(visibleColumnIds),
    [visibleColumnIds],
  )

  const filteredRows = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    let startMs = -8.64e15
    let endMs = 8.64e15
    if (dateRange?.start && dateRange?.end) {
      startMs = calendarDateToUtcStartMs(dateRange.start)
      endMs = calendarDateToUtcEndMs(dateRange.end)
    }
    return MOCK_EVENT_LOGS.filter((row) => {
      const t = row.occurredAt.getTime()
      if (t < startMs || t > endMs) return false
      if (!matchesIdFilter(filters.actorUserId, row.actorUserId)) return false
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(row.eventType)) return false
      if (!matchesIdFilter(filters.accountId, row.accountId)) return false
      if (!matchesIdFilter(filters.organizationUnitId, row.organizationUnitId)) return false
      if (!matchesIdFilter(filters.projectId, row.projectId)) return false
      if (!matchesIdFilter(filters.billingGroupId, row.billingGroupId)) return false
      if (!matchesIdFilter(filters.serviceId, row.serviceId)) return false
      if (!q) return true
      return eventLogSearchBlob(row).includes(q)
    })
  }, [searchInput, dateRange, filters])

  // Simulate an async query so DS loading / error / empty states are exercised.
  useEffect(() => {
    setQueryError(undefined)
    if (
      dateRange?.start &&
      dateRange?.end &&
      calendarDateToUtcStartMs(dateRange.start) > calendarDateToUtcEndMs(dateRange.end)
    ) {
      setQueryRows([])
      setQueryStatus('error')
      setQueryError('Invalid time range. The start must be before the end.')
      return
    }
    setQueryStatus('loading')
    setVisibleCount(EVENT_LOGS_BATCH)
    setIsLoadingMore(false)
    const timerId = window.setTimeout(() => {
      setQueryRows(filteredRows.slice(0, MAX_EVENT_LOGS))
      setQueryStatus('ready')
    }, 220)
    return () => window.clearTimeout(timerId)
  }, [filteredRows, dateRange])

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current != null) {
        window.clearTimeout(loadMoreTimerRef.current)
      }
    }
  }, [])

  const visibleRows = useMemo(
    () => queryRows.slice(0, visibleCount),
    [queryRows, visibleCount],
  )
  const hasMore = visibleCount < queryRows.length

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    if (loadMoreTimerRef.current != null) {
      window.clearTimeout(loadMoreTimerRef.current)
    }
    loadMoreTimerRef.current = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + EVENT_LOGS_BATCH, queryRows.length, MAX_EVENT_LOGS))
      setIsLoadingMore(false)
      loadMoreTimerRef.current = null
    }, LOAD_MORE_DELAY_MS)
  }

  const canExport = queryStatus === 'ready' && queryRows.length > 0

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        padding: '24px 32px 48px',
        overflowY: 'auto',
      }}
    >
      <Box style={{ width: '100%' }}>
        <Box style={{ marginBottom: 24 }}>
          <PageHeader
            title="Event logs"
            subtitle="View the history of actions across organization"
            breadcrumbs={[
              <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                Big Co Ltd.
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="admin" href="#" onClick={(e) => e.preventDefault()}>
                Admin
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="event-logs">Event logs</Breadcrumbs.Crumb>,
            ]}
          />
        </Box>

        {/* Free-text search across table + detail fields */}
        <Box style={{ maxWidth: 720, marginBottom: 16 }}>
          <InputBase
            placeholder="Search event logs"
            aria-label="Search event logs"
            value={searchInput}
            onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
            endAdornment={<Icon icon={searchIcon} color="muted" style={{ width: 16, height: 16 }} />}
          />
        </Box>

        {/* Filter row */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 }}>
            <DateRangePicker
              aria-label="Date range"
              value={dateRange ?? undefined}
              minValue={EVENT_LOG_MIN_DATE}
              maxValue={EVENT_LOG_MAX_DATE}
              reserveSpaceForError={false}
              shouldCloseOnSelect={false}
              onChange={(val) => {
                if (val?.start && val?.end) {
                  setDateRange({
                    start: val.start as CalendarDate,
                    end: val.end as CalendarDate,
                  })
                } else {
                  setDateRange(null)
                }
              }}
            >
              <DateRangeFilterTrigger
                onClear={dateRange ? () => setDateRange(null) : undefined}
              />
              <DateRangePicker.Calendar presets={DATE_RANGE_PRESETS} />
            </DateRangePicker>

            <IdStringFilter
              label="account_id"
              placeholder="Enter account_id"
              value={filters.accountId}
              onChange={(accountId) => setFilters((f) => ({ ...f, accountId }))}
            />
            <IdStringFilter
              label="organization_unit_id"
              placeholder="Enter organization_unit_id"
              value={filters.organizationUnitId}
              onChange={(organizationUnitId) => setFilters((f) => ({ ...f, organizationUnitId }))}
            />
            <IdStringFilter
              label="project_id"
              placeholder="Enter project_id"
              value={filters.projectId}
              onChange={(projectId) => setFilters((f) => ({ ...f, projectId }))}
            />
            <IdStringFilter
              label="actor_user_id"
              placeholder="Enter actor_user_id"
              value={filters.actorUserId}
              onChange={(actorUserId) => setFilters((f) => ({ ...f, actorUserId }))}
            />
            {/* Event type filter hidden for now — restore with filters.eventTypes. */}
            <AllFiltersButton filters={filters} setFilters={setFilters} />
          </Box>
        </Box>

        {/* Table control panel — result count + column/export actions */}
        {(queryStatus === 'loading' || (queryStatus === 'ready' && queryRows.length > 0)) && (
          <Box style={{ marginBottom: 12 }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Typography.Default color="muted">
                {queryStatus === 'loading' ? '…' : 'Showing last 100 entries'}
              </Typography.Default>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <ColumnConfigurer visibleIds={visibleColumnIds} onChange={setVisibleColumnIds} />
                <Button.Secondary
                  dense
                  icon={exportIcon}
                  disabled={!canExport}
                  onClick={() => downloadEventLogsJson(queryRows)}
                >
                  Export logs
                </Button.Secondary>
              </Box>
            </Box>
            <Divider />
          </Box>
        )}

        {/* Collapsible data list */}
        {queryStatus === 'loading' ? (
          <DataList.Skeleton columns={visibleColumnIds.length} rows={6} />
        ) : queryStatus === 'error' ? (
          <Box style={{ padding: '16px 4px', color: 'var(--aquarium-text-color-error, #b3261e)' }}>
            <Typography.Default>{queryError ?? 'Failed to run the logs query.'}</Typography.Default>
          </Box>
        ) : queryRows.length === 0 ? (
          <Box style={{ padding: '32px 4px', textAlign: 'center' }}>
            <Typography.DefaultStrong>No event logs match your filters</Typography.DefaultStrong>
            <Box style={{ marginTop: 4 }}>
              <Typography.Small>Try widening the date range or clearing filters.</Typography.Small>
            </Box>
          </Box>
        ) : (
          <DataList
            rows={visibleRows}
            sticky={false}
            defaultSort={
              visibleColumnIds.includes('dateTime')
                ? { headerName: 'Date and time', direction: 'descending' }
                : undefined
            }
            hasMore={hasMore}
            isLoading={isLoadingMore}
            next={loadMore}
            loadingIndicator={
              <Box style={{ padding: '12px 4px', textAlign: 'center' }}>
                <Typography.Small color="muted">Loading more event logs…</Typography.Small>
              </Box>
            }
            rowDetails={(row) => <EventDetails row={row} />}
            columns={visibleColumns}
          />
        )}
      </Box>
    </Box>
  )
}

EventLogsContent.displayName = 'EventLogsContent'
