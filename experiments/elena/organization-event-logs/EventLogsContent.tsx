'use client'

import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CalendarDateTime } from '@internationalized/date'
import { DateRangePickerStateContext as AriaDateRangePickerStateContext } from 'react-aria-components'
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  DataList,
  DateTimeRangePicker,
  Drawer,
  Filter,
  Icon,
  InputBase,
  Link,
  MultiSelect,
  PageHeader,
  Typography,
} from '@aivenio/aquarium'
import filterIcon from '@aivenio/aquarium/icons/filter'
import exportIcon from '@aivenio/aquarium/icons/export'
import searchIcon from '@aivenio/aquarium/icons/search'
import automaticUpdatesIcon from '@aivenio/aquarium/icons/automaticUpdates'
import consoleIcon from '@aivenio/aquarium/icons/console'
import personIcon from '@aivenio/aquarium/icons/person'
import {
  ACTOR_OPTIONS,
  DATE_RANGE_PRESETS,
  EVENT_TYPE_OPTIONS,
  PROJECT_OPTIONS,
  RESOURCE_OPTIONS,
  DEFAULT_PRESET_RANGE,
  MOCK_EVENT_LOGS,
  calendarDateTimeToUtcMs,
  downloadEventLogsJson,
  type EventDateRange,
  type EventLog,
} from './eventLogsData'

type QueryStatus = 'loading' | 'ready' | 'error'
type FilterOption = { value: string; label: string }

const COLUMN_WIDTHS = {
  dateTime: 260,
  actor: 180,
  resource: 240,
} as const

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

// ─── Reusable multi-select checkbox filter ────────────────────────────────────

function CheckboxFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const active = selected.length > 0
  const valueText = active
    ? selected.length === 1
      ? selected[0]
      : `${selected.length} selected`
    : undefined

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Filter.Trigger
        labelText={label}
        icon={filterIcon}
        value={valueText}
        onClear={active ? () => onChange([]) : undefined}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
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
            minWidth: 260,
            maxHeight: 320,
            overflow: 'auto',
          }}
        >
          <CheckboxGroup
            labelText={label}
            value={selected}
            onChange={(val) => onChange(val ?? [])}
          >
            {options.map((opt) => (
              <Checkbox key={opt.value} value={opt.value}>
                {opt.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Box>
      )}
    </div>
  )
}

// ─── "All filters" combined popover ────────────────────────────────────────────

type FilterState = {
  actors: string[]
  eventTypes: string[]
  resources: string[]
  projects: string[]
}

function AllFiltersButton({
  filters,
  setFilters,
}: {
  filters: FilterState
  setFilters: (next: FilterState) => void
}) {
  const [open, setOpen] = useState(false)

  const activeCount =
    filters.actors.length +
    filters.eventTypes.length +
    filters.resources.length +
    filters.projects.length

  const clearAll = () =>
    setFilters({ actors: [], eventTypes: [], resources: [], projects: [] })

  return (
    <>
      <Filter.Trigger
        labelText="All filters"
        icon={filterIcon}
        badge={activeCount > 0 ? activeCount : undefined}
        onClear={activeCount > 0 ? clearAll : undefined}
        onClick={() => setOpen(true)}
      />
      {/* Prototype-only: the playground's fixed top bars (lab chrome 48px + console
          header 66px = 114px) should stay visible, so open the drawer beneath them
          instead of over the whole viewport. Offsetting the top also requires capping
          the panel height so its footer buttons stay on-screen. Empty MultiSelect
          helper-text slots are collapsed so the filter gap reads as the intended 16px.
          The real Console has no lab chrome. */}
      {open && (
        <style>{`
          .z-modal { top: 114px !important; }
          .z-modal .react-aria-Modal > div {
            height: calc(100vh - 114px) !important;
            max-height: calc(100vh - 114px) !important;
          }
          .event-logs-filter-grid p.typography-small { display: none !important; }
        `}</style>
      )}
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
          <MultiSelect
            labelText="Actor"
            placeholder="All actors"
            options={ACTOR_OPTIONS.map((o) => o.value)}
            value={filters.actors}
            onChange={(items) => setFilters({ ...filters, actors: items ?? [] })}
          />
          <MultiSelect
            labelText="Event type"
            placeholder="All event types"
            options={EVENT_TYPE_OPTIONS.map((o) => o.value as string)}
            value={filters.eventTypes}
            onChange={(items) => setFilters({ ...filters, eventTypes: items ?? [] })}
          />
          <MultiSelect
            labelText="Resource"
            placeholder="All resources"
            options={RESOURCE_OPTIONS.map((o) => o.value)}
            value={filters.resources}
            onChange={(items) => setFilters({ ...filters, resources: items ?? [] })}
          />
          <MultiSelect
            labelText="Project"
            placeholder="All projects"
            options={PROJECT_OPTIONS.map((o) => o.value)}
            value={filters.projects}
            onChange={(items) => setFilters({ ...filters, projects: items ?? [] })}
          />
        </Box>
      </Drawer>
    </>
  )
}

// ─── Actor avatar (reflects actor kind) ────────────────────────────────────────

function ActorAvatar({ kind }: { kind: EventLog['actorKind'] }) {
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

function nullable(value: string | null): ReactNode {
  if (value === null) {
    return <span style={{ color: 'var(--aquarium-text-color-muted)', fontStyle: 'italic' }}>null</span>
  }
  return value
}

// ─── DataList cell renderers ───────────────────────────────────────────────────

function ActorCell({ row }: { row: EventLog }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ActorAvatar kind={row.actorKind} />
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

function ResourceCell({ row }: { row: EventLog }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography.Caption color="muted">{row.resourceKind}</Typography.Caption>
      <Typography.Default>{row.resourceName}</Typography.Default>
    </Box>
  )
}

type DetailRow = { id: string; label: string; value: ReactNode }

function EventDetails({ row }: { row: EventLog }) {
  const detailRows: DetailRow[] = [
    { id: 'log_entry_id', label: 'log_entry_id', value: row.logEntryId },
    { id: 'event_type', label: 'event_type', value: row.eventType },
    { id: 'summary', label: 'summary', value: row.action },
    { id: 'create_time', label: 'create_time', value: row.occurredAt.toISOString() },
    { id: 'organization_id', label: 'organization_id', value: row.organizationId },
    { id: 'account_id', label: 'account_id', value: nullable(row.accountId) },
    { id: 'billing_group_id', label: 'billing_group_id', value: nullable(row.billingGroupId) },
    { id: 'project_id', label: 'project_id', value: nullable(row.projectId) },
    { id: 'service_id', label: 'service_id', value: nullable(row.serviceId) },
    { id: 'actor_user_id', label: 'actor_user_id', value: row.actorUserId },
    { id: 'actor', label: 'actor', value: row.actor },
    {
      id: 'metadata',
      label: 'metadata',
      value: <Typography.CodeSmall>{JSON.stringify(row.metadata)}</Typography.CodeSmall>,
    },
  ]

  return (
    <Box style={{ padding: '16px 8px 12px' }}>
      {/* paddingLeft matches the detail DataList cell's 12px left padding so the
          heading aligns with the key column text below it. */}
      <Box style={{ marginBottom: 12, paddingLeft: 12 }}>
        <Typography.SmallStrong>Event details</Typography.SmallStrong>
      </Box>
      <Box style={{ maxWidth: 720 }}>
        <DataList
          hideHeader
          sticky={false}
          rows={detailRows}
          columns={[
            {
              type: 'custom',
              headerName: 'Field',
              width: 220,
              UNSAFE_render: (r) => (
                <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                  <Typography.Small>{r.label}</Typography.Small>
                </Box>
              ),
            },
            {
              type: 'custom',
              headerName: 'Value',
              UNSAFE_render: (r) => (
                <Box style={{ wordBreak: 'break-word' }}>
                  {typeof r.value === 'string' ? (
                    <Typography.Small>{r.value}</Typography.Small>
                  ) : (
                    r.value
                  )}
                </Box>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  )
}

/** Direction-aware comparators for sortable DataList headers. */
const dir = (n: number, descending: boolean) => (descending ? -n : n)

// ─── Main content ──────────────────────────────────────────────────────────────

export function EventLogsContent() {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<EventDateRange | null>(DEFAULT_PRESET_RANGE)
  const [filters, setFilters] = useState<FilterState>({
    actors: [],
    eventTypes: [],
    resources: [],
    projects: [],
  })
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('loading')
  const [queryError, setQueryError] = useState<string>()
  const [queryRows, setQueryRows] = useState<EventLog[]>([])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let startMs = -8.64e15
    let endMs = 8.64e15
    if (dateRange?.start && dateRange?.end) {
      startMs = calendarDateTimeToUtcMs(dateRange.start)
      endMs = calendarDateTimeToUtcMs(dateRange.end)
    }
    return MOCK_EVENT_LOGS.filter((row) => {
      const t = row.occurredAt.getTime()
      if (t < startMs || t > endMs) return false
      if (filters.actors.length > 0 && !filters.actors.includes(row.actor)) return false
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(row.eventType)) return false
      if (filters.resources.length > 0 && !filters.resources.includes(row.resourceName)) return false
      if (filters.projects.length > 0 && !(row.projectId && filters.projects.includes(row.projectId)))
        return false
      if (!q) return true
      const blob = [
        row.actor,
        row.action,
        row.eventType,
        row.resourceKind,
        row.resourceName,
        row.dateTimeLabel,
        row.logEntryId,
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [search, dateRange, filters])

  // Simulate an async query so DS loading / error / empty states are exercised.
  useEffect(() => {
    setQueryError(undefined)
    if (
      dateRange?.start &&
      dateRange?.end &&
      calendarDateTimeToUtcMs(dateRange.start) > calendarDateTimeToUtcMs(dateRange.end)
    ) {
      setQueryRows([])
      setQueryStatus('error')
      setQueryError('Invalid time range. The start must be before the end.')
      return
    }
    setQueryStatus('loading')
    const timerId = window.setTimeout(() => {
      setQueryRows(filteredRows)
      setQueryStatus('ready')
    }, 220)
    return () => window.clearTimeout(timerId)
  }, [filteredRows, dateRange])

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
            subtitle="View the history of user activity in your organization."
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

        {/* Search */}
        <Box style={{ maxWidth: 500, marginBottom: 16 }}>
          <InputBase
            placeholder="Search by actor, action or resource"
            aria-label="Search event logs"
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
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
            <DateTimeRangePicker
              aria-label="Date and time range"
              granularity="minute"
              value={dateRange ?? undefined}
              reserveSpaceForError={false}
              shouldCloseOnSelect={false}
              onChange={(val) => {
                if (val?.start && val?.end) {
                  setDateRange({
                    start: val.start as CalendarDateTime,
                    end: val.end as CalendarDateTime,
                  })
                } else {
                  setDateRange(null)
                }
              }}
            >
              <DateRangeFilterTrigger
                onClear={dateRange ? () => setDateRange(null) : undefined}
              />
              <DateTimeRangePicker.Calendar presets={DATE_RANGE_PRESETS} />
            </DateTimeRangePicker>

            <CheckboxFilter
              label="Actor"
              options={ACTOR_OPTIONS}
              selected={filters.actors}
              onChange={(actors) => setFilters((f) => ({ ...f, actors }))}
            />
            <CheckboxFilter
              label="Event type"
              options={EVENT_TYPE_OPTIONS}
              selected={filters.eventTypes}
              onChange={(eventTypes) => setFilters((f) => ({ ...f, eventTypes }))}
            />
            <CheckboxFilter
              label="Resource"
              options={RESOURCE_OPTIONS}
              selected={filters.resources}
              onChange={(resources) => setFilters((f) => ({ ...f, resources }))}
            />
            <CheckboxFilter
              label="Project"
              options={PROJECT_OPTIONS}
              selected={filters.projects}
              onChange={(projects) => setFilters((f) => ({ ...f, projects }))}
            />
            <AllFiltersButton filters={filters} setFilters={setFilters} />
          </Box>

          <Box style={{ marginLeft: 'auto', flexShrink: 0 }}>
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

        {/* Collapsible data list */}
        {queryStatus === 'loading' ? (
          <DataList.Skeleton columns={4} rows={6} />
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
            rows={queryRows}
            sticky={false}
            defaultSort={{ headerName: 'Date and time', direction: 'descending' }}
            pagination={{ initialPageSize: 10, pageSizes: [5, 10, 20, 50] }}
            rowDetails={(row) => <EventDetails row={row} />}
            columns={[
              {
                type: 'text',
                headerName: 'Date and time',
                field: 'dateTimeLabel',
                width: COLUMN_WIDTHS.dateTime,
                sort: (a, b, direction) =>
                  dir(a.occurredAt.getTime() - b.occurredAt.getTime(), direction === 'descending'),
              },
              {
                type: 'custom',
                headerName: 'Actor',
                width: COLUMN_WIDTHS.actor,
                sort: (a, b, direction) => dir(a.actor.localeCompare(b.actor), direction === 'descending'),
                UNSAFE_render: (row) => <ActorCell row={row} />,
              },
              {
                type: 'text',
                headerName: 'Action',
                field: 'action',
                sort: (a, b, direction) => dir(a.action.localeCompare(b.action), direction === 'descending'),
              },
              {
                type: 'custom',
                headerName: 'Resource',
                width: COLUMN_WIDTHS.resource,
                sort: (a, b, direction) =>
                  dir(a.resourceName.localeCompare(b.resourceName), direction === 'descending'),
                UNSAFE_render: (row) => <ResourceCell row={row} />,
              },
            ]}
          />
        )}
      </Box>
    </Box>
  )
}

EventLogsContent.displayName = 'EventLogsContent'
