import { CalendarDate } from '@internationalized/date'
import { createRealEventLogs } from './realEventLogTemplates'

// ─── Types ──────────────────────────────────────────────────────────────────

export type EventDateRange = { start: CalendarDate; end: CalendarDate }

export type ActorKind = 'user' | 'automation' | 'system'

export type ResourceKind =
  | 'Service'
  | 'Project'
  | 'Organization unit'
  | 'Network'
  | 'Billing group'

/** API event_type values shown in log details and filter dropdowns. */
export const EVENT_TYPE_VALUES = [
  'group_permissions_set',
  'privatelink_connection_active',
  'privatelink_connection_connected',
  'privatelink_connection_pending_user_approval',
  'privatelink_connection_updated',
  'privatelink_connection_user_approved',
  'privatelink_create',
  'privatelink_delete',
  'project_billing_group_set',
  'project_delete',
  'project_member_add',
  'project_member_update',
  'project_suspend',
  'project_update',
  'project_vpc_delete',
  'project_vpc_peering_connection_active',
  'project_vpc_peering_connection_create',
  'project_vpc_peering_connection_delete_detected',
  'project_vpc_route_create',
  'service_additional_backup_regions_modified',
  'service_create',
  'service_disaster_recovery_transition',
  'service_forked',
  'service_integration_create',
  'service_integration_delete',
  'service_integration_update',
  'service_maintenance_perform',
  'service_poweroff',
  'service_poweron',
  'service_revive',
  'service_update',
  'service_user_secrets_read',
  'static_ip_address_associate',
  'static_ip_address_create',
  'static_ip_address_dissociate',
  'static_ip_address_patch',
  'upgrade_pipeline_step_create',
  'upgrade_pipeline_step_delete',
  'upgrade_pipeline_step_update',
  'upgrade_pipeline_step_validate',
  'user_permissions_set',
] as const

export type EventType = (typeof EVENT_TYPE_VALUES)[number]

/** A single organization event-log entry. Mirrors the API schema. */
export type EventLog = {
  id: string
  occurredAt: Date
  /** Pre-formatted ISO 8601 UTC label for the table, e.g. "2024-08-23T14:22:08.000Z". */
  dateTimeLabel: string
  actor: string
  actorKind: ActorKind
  /** Present for real users — renders the actor as a DS Link. */
  actorHref?: string
  /** Human summary rendered in the Action column (`summary` in the API). */
  action: string
  eventType: EventType
  /** Generation helper — not shown in details UI (use assetType / assetId). */
  resourceKind: ResourceKind
  /** Generation helper — not shown in details UI (use assetType / assetId). */
  resourceName: string
  // ── API detail fields ──────────────────────────────────────────────────────
  logEntryId: string
  /** Prototype filter only — not part of the public event-log schema. */
  organizationUnitId: string | null
  /** Often null together with org/project/billing/service on unscoped rows. */
  accountId: string | null
  organizationId: string | null
  billingGroupId: string | null
  projectId: string | null
  serviceId: string | null
  assetType: string
  assetId: string | null
  /** Usually null in real logs; User column shows `actor` instead. */
  actorUserId: string | null
  /** Present for automation/system actors; null for human users. */
  internalActor: string | null
  metadata: Record<string, string | number | boolean | null>
  /** Opaque string blob (JSON) per schema. */
  additionalProperties: string
}

/** Example IDs for docs / leftover imports — not the sole account/org in the dataset. */
const MOCK_ACCOUNT_ID = 'a00b10000'
const MOCK_ORGANIZATION_ID = 'org00c20000'

export { MOCK_ACCOUNT_ID, MOCK_ORGANIZATION_ID }

// ─── Date helpers (shared pattern with src/screens/ProjectServices.tsx) ───────

export function utcDateToCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/** Start of calendar day in UTC (inclusive filter bound). */
export function calendarDateToUtcStartMs(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day, 0, 0, 0, 0)
}

/** End of calendar day in UTC (inclusive filter bound). */
export function calendarDateToUtcEndMs(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day, 23, 59, 59, 999)
}

/** Formats a CalendarDate as dd/mm/yyyy for the Date range filter chip. */
export function formatDayMonthYear(date: CalendarDate): string {
  const dd = String(date.day).padStart(2, '0')
  const mm = String(date.month).padStart(2, '0')
  return `${dd}/${mm}/${date.year}`
}

// ─── Mock data ────────────────────────────────────────────────────────────────

/** 100 rows derived from 10 anonymized real BigQuery event-log templates. */
export const MOCK_EVENT_LOGS: EventLog[] = createRealEventLogs(100)

// ─── Filter option catalogs ───────────────────────────────────────────────────

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

// The option catalogs below intentionally include more values than appear in the
// mock rows. Real Console filter dropdowns list IDs seen in logs (and related
// historical IDs), not live resource display names — deleted resources may have
// no resolvable name, but their IDs remain on the event.

/** Actor user IDs that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_ACTOR_USER_ID_OPTIONS = [
  'usr_sofia_rossi',
  'usr_liam_oconnor',
  'usr_yuki_tanaka',
  'usr_noah_schmidt',
  'usr_amara_okafor',
  'usr_diego_fernandez',
  'usr_mei_lin',
  'usr_oliver_brown',
  'usr_fatima_alsayed',
  'usr_lucas_silva',
]

/** Automation / system actor_user_id values that don't exist in MOCK_EVENT_LOGS. */
const EXTRA_AUTOMATION_ACTOR_USER_ID_OPTIONS = ['svc_terraform', 'svc_ci_bot', 'system']

export type IdOptionGroup = {
  title: string
  options: { value: string; label: string }[]
}

function toOptions(values: string[]): { value: string; label: string }[] {
  return unique(values)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }))
}

/** Grouped actor_user_id filter options: people vs Aiven automation / system. */
export const ACTOR_USER_ID_OPTION_GROUPS: IdOptionGroup[] = [
  {
    title: 'Users',
    options: toOptions([
      ...MOCK_EVENT_LOGS.filter((e) => e.actorKind === 'user')
        .map((e) => e.actorUserId)
        .filter((id): id is string => Boolean(id)),
      ...EXTRA_ACTOR_USER_ID_OPTIONS,
    ]),
  },
  {
    title: 'Aiven automation',
    options: toOptions([
      ...MOCK_EVENT_LOGS.filter((e) => e.actorKind !== 'user')
        .map((e) => e.actorUserId)
        .filter((id): id is string => Boolean(id)),
      ...EXTRA_AUTOMATION_ACTOR_USER_ID_OPTIONS,
    ]),
  },
]

/** Flat list for drawer MultiSelect. */
export const ACTOR_USER_ID_OPTIONS: { value: string; label: string }[] =
  ACTOR_USER_ID_OPTION_GROUPS.flatMap((group) => group.options)

/** @deprecated Use ACTOR_USER_ID_OPTION_GROUPS — kept for any leftover imports. */
export type UserOptionGroup = IdOptionGroup
/** @deprecated Use ACTOR_USER_ID_OPTION_GROUPS */
export const USER_OPTION_GROUPS = ACTOR_USER_ID_OPTION_GROUPS
/** @deprecated Use ACTOR_USER_ID_OPTIONS */
export const USER_OPTIONS = ACTOR_USER_ID_OPTIONS

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] =
  EVENT_TYPE_VALUES.map((value) => ({ value, label: value }))

const EXTRA_ACCOUNT_ID_OPTIONS = ['acc-partner-002', 'acc-trial-003', 'acc-legacy-004', 'acc-sandbox-005']

export const ACCOUNT_ID_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.accountId).filter((id): id is string => Boolean(id)),
  ...EXTRA_ACCOUNT_ID_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

const EXTRA_ORGANIZATION_ID_OPTIONS = [
  'org-partner-eu',
  'org-acme-holdings',
  'org-legacy-archive',
  'org-sandbox',
]

export const ORGANIZATION_ID_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.organizationId).filter((id): id is string => Boolean(id)),
  ...EXTRA_ORGANIZATION_ID_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

/** Projects that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_PROJECT_OPTIONS = [
  'prj-staging',
  'prj-sandbox',
  'prj-analytics',
  'prj-ml',
  'prj-marketing',
  'prj-infra',
  'prj-security',
  'prj-billing',
  'prj-support',
  'prj-experiments',
  'prj-archive',
  'prj-shared',
]

export const PROJECT_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.projectId).filter((id): id is string => Boolean(id)),
  ...EXTRA_PROJECT_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

/** Org units that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_ORGANIZATION_UNIT_OPTIONS = [
  'ou-security',
  'ou-finance',
  'ou-marketing',
  'ou-ml',
  'ou-shared-services',
  'ou-europe',
  'ou-americas',
]

export const ORGANIZATION_UNIT_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.organizationUnitId).filter((id): id is string => Boolean(id)),
  ...EXTRA_ORGANIZATION_UNIT_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

/** Billing groups that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_BILLING_GROUP_OPTIONS = [
  'bg-001',
  'bg-002',
  'bg-003',
  'bg-005',
  'bg-enterprise',
  'bg-trial',
  'bg-partner',
]

export const BILLING_GROUP_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.billingGroupId).filter((id): id is string => Boolean(id)),
  ...EXTRA_BILLING_GROUP_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

/** Service IDs that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_SERVICE_OPTIONS = [
  'svc-pg-staging',
  'svc-mysql-orders',
  'svc-redis-sessions',
  'svc-flink-jobs',
  'svc-grafana-dashboards',
  'svc-cassandra-metrics',
  'svc-clickhouse-analytics',
]

export const SERVICE_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.serviceId).filter((id): id is string => Boolean(id)),
  ...EXTRA_SERVICE_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

/** Lowercased blob of all row + detail fields for free-text search. */
export function eventLogSearchBlob(row: EventLog): string {
  const metadataBlob = Object.entries(row.metadata)
    .flatMap(([key, value]) => [key, value == null ? '' : String(value)])
    .join(' ')
  return [
    row.actor,
    row.action,
    row.eventType,
    row.resourceKind,
    row.resourceName,
    row.dateTimeLabel,
    row.logEntryId,
    row.accountId,
    row.organizationId,
    row.organizationUnitId,
    row.billingGroupId,
    row.projectId,
    row.serviceId,
    row.assetType,
    row.assetId,
    row.actorUserId,
    row.internalActor,
    row.additionalProperties,
    metadataBlob,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Event log retention window — calendar selection cannot start earlier than this. */
export const EVENT_LOG_RETENTION_DAYS = 30

/**
 * Quick-range presets rendered in the calendar popover's left column.
 * Anchored to the latest event so selecting a preset actually filters the
 * mock data (rather than a real "now" that has no rows). Only ranges within
 * the retention window are offered.
 */
export type DateRangePreset = {
  label: string
  value: { start: CalendarDate; end: CalendarDate }
}

/** Latest mock event day — used as "now" for presets and retention bounds. */
const EVENT_LOG_ANCHOR = utcDateToCalendarDate(
  new Date(Math.max(...MOCK_EVENT_LOGS.map((e) => e.occurredAt.getTime()))),
)

/** Earliest selectable day (retention days before the anchor). */
export const EVENT_LOG_MIN_DATE: CalendarDate = EVENT_LOG_ANCHOR.subtract({
  days: EVENT_LOG_RETENTION_DAYS,
})

/** Latest selectable day (the anchor day). */
export const EVENT_LOG_MAX_DATE: CalendarDate = EVENT_LOG_ANCHOR

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Last 3 days',
    value: {
      start: EVENT_LOG_ANCHOR.subtract({ days: 3 }),
      end: EVENT_LOG_MAX_DATE,
    },
  },
  {
    label: 'Last week',
    value: {
      start: EVENT_LOG_ANCHOR.subtract({ days: 7 }),
      end: EVENT_LOG_MAX_DATE,
    },
  },
  {
    label: 'Last month',
    value: { start: EVENT_LOG_MIN_DATE, end: EVENT_LOG_MAX_DATE },
  },
]

/** Range applied on load — "Last month" (30-day retention window). */
export const DEFAULT_PRESET_RANGE: EventDateRange =
  DATE_RANGE_PRESETS.find((preset) => preset.label === 'Last month')?.value ??
  DATE_RANGE_PRESETS[DATE_RANGE_PRESETS.length - 1].value

/** @deprecated Prefer DEFAULT_PRESET_RANGE — kept for any leftover imports. */
export const DEFAULT_DATE_RANGE: EventDateRange = DEFAULT_PRESET_RANGE

// ─── Export helper ──────────────────────────────────────────────────────────

export function eventLogToJson(row: EventLog) {
  return {
    log_entry_id: row.logEntryId,
    event_type: row.eventType,
    summary: row.action,
    create_time: row.occurredAt.toISOString(),
    actor: row.actor,
    actor_user_id: row.actorUserId,
    internal_actor: row.internalActor,
    account_id: row.accountId,
    organization_id: row.organizationId,
    billing_group_id: row.billingGroupId,
    project_id: row.projectId,
    service_id: row.serviceId,
    asset_type: row.assetType,
    asset_id: row.assetId,
    metadata: row.metadata,
    additional_properties: row.additionalProperties,
  }
}

export function downloadEventLogsJson(rows: EventLog[]): void {
  const payload = {
    exported_at: new Date().toISOString(),
    count: rows.length,
    logs: rows.map(eventLogToJson),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'organization-event-logs.json'
  a.click()
  URL.revokeObjectURL(a.href)
}
