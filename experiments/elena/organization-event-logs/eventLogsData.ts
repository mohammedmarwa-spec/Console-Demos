import { CalendarDateTime } from '@internationalized/date'

// ─── Types ──────────────────────────────────────────────────────────────────

export type EventDateRange = { start: CalendarDateTime; end: CalendarDateTime }

export type ActorKind = 'user' | 'automation' | 'system'

export type ResourceKind = 'Service' | 'Project' | 'Organization' | 'Network' | 'Billing'

export type EventType =
  | 'Access'
  | 'API token'
  | 'Authentication'
  | 'Backup'
  | 'Billing'
  | 'Integration'
  | 'Maintenance'
  | 'Network'
  | 'Organization'
  | 'Project management'
  | 'Quota'
  | 'Security'
  | 'Service management'
  | 'Support'
  | 'User management'

/** A single organization event-log entry. Mirrors the schema shown in the design. */
export type EventLog = {
  id: string
  occurredAt: Date
  /** Pre-formatted "13 Aug 2024 14:22:08 UTC" label for the table. */
  dateTimeLabel: string
  actor: string
  actorKind: ActorKind
  /** Present for real users — renders the actor as a DS Link. */
  actorHref?: string
  /** Human summary rendered in the Action column. */
  action: string
  eventType: EventType
  resourceKind: ResourceKind
  resourceName: string
  // ── Detail fields (mirror the API schema in the Figma expanded row) ──────────
  logEntryId: string
  organizationId: string
  accountId: string | null
  billingGroupId: string | null
  projectId: string | null
  serviceId: string | null
  actorUserId: string
  metadata: Record<string, string | number | boolean | null>
}

// ─── Date helpers (shared pattern with src/screens/ProjectServices.tsx) ───────

const UTC_TIME_ZONE = 'UTC'

export function utcDateToCalendarDateTime(date: Date): CalendarDateTime {
  return new CalendarDateTime(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
}

export function calendarDateTimeToUtcMs(cdt: CalendarDateTime): number {
  return Date.UTC(cdt.year, cdt.month - 1, cdt.day, cdt.hour, cdt.minute, cdt.second)
}

/** Formats a CalendarDateTime as dd/mm/yyyy for the Date range filter chip. */
export function formatDayMonthYear(cdt: CalendarDateTime): string {
  const dd = String(cdt.day).padStart(2, '0')
  const mm = String(cdt.month).padStart(2, '0')
  return `${dd}/${mm}/${cdt.year}`
}

function formatEventTimestamp(d: Date): string {
  const s = d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: UTC_TIME_ZONE,
  })
  return `${s} UTC`
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type Seed = Omit<EventLog, 'dateTimeLabel'>

/** Deterministic, mock-only dataset scoped to Aug 2024 to match the default range. */
function createMockEventLogs(): EventLog[] {
  const seeds: Seed[] = [
    {
      id: 'evt-1',
      occurredAt: new Date(Date.UTC(2024, 7, 23, 14, 22, 8)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Associated static IP 185.24.68.12 with pg-production',
      eventType: 'Network',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_2f9c41ab7e',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'usr_elena_ivanova',
      metadata: { ip_address: '185.24.68.12', region: 'aws-eu-north-1', reused: false },
    },
    {
      id: 'evt-2',
      occurredAt: new Date(Date.UTC(2024, 7, 23, 11, 5, 17)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Deleted private link endpoint vpce-0a1b2c3d4e',
      eventType: 'Network',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_88b0aa1240',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'usr_marcus_chen',
      metadata: { endpoint_id: 'vpce-0a1b2c3d4e', cloud: 'aws', status: 'deleted' },
    },
    {
      id: 'evt-3',
      occurredAt: new Date(Date.UTC(2024, 7, 22, 18, 43, 2)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Private link connection awaiting approval for kafka-analytics',
      eventType: 'Network',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_5c1d77e9a3',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'svc_automation',
      metadata: { connection_id: 'plc-9931', requires_approval: true },
    },
    {
      id: 'evt-4',
      occurredAt: new Date(Date.UTC(2024, 7, 22, 9, 12, 55)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Invited user devops@bigco.example to organization',
      eventType: 'User management',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_a71e0b93cc',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { invited_email: 'devops@bigco.example', role: 'operator' },
    },
    {
      id: 'evt-5',
      occurredAt: new Date(Date.UTC(2024, 7, 21, 16, 30, 41)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Rotated project API token for prj-data',
      eventType: 'Access',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_33aa90fd12',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { token_prefix: 'tok_9f…', method: 'manual' },
    },
    {
      id: 'evt-6',
      occurredAt: new Date(Date.UTC(2024, 7, 21, 8, 2, 19)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Enabled IP filter on os-search-eu',
      eventType: 'Security',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_120fe4bb87',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-os-search-eu',
      actorUserId: 'system',
      metadata: { allowed_cidrs: '10.0.0.0/8', enforced: true },
    },
    {
      id: 'evt-7',
      occurredAt: new Date(Date.UTC(2024, 7, 20, 13, 58, 44)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Changed service plan of pg-production to Business-8',
      eventType: 'Service management',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_9de1a2f450',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'usr_elena_ivanova',
      metadata: { from_plan: 'Business-4', to_plan: 'Business-8' },
    },
    {
      id: 'evt-8',
      occurredAt: new Date(Date.UTC(2024, 7, 20, 7, 11, 3)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Applied scheduled maintenance update to kafka-analytics',
      eventType: 'Service management',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_6640cd2f19',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'svc_automation',
      metadata: { window: '2024-08-20T06:00Z', version: '3.7.1' },
    },
    {
      id: 'evt-9',
      occurredAt: new Date(Date.UTC(2024, 7, 19, 20, 24, 37)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Updated billing contact for Big Co Ltd.',
      eventType: 'Billing',
      resourceKind: 'Billing',
      resourceName: 'Default billing group',
      logEntryId: 'log_af0912ee6b',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { contact_email: 'finance@bigco.example' },
    },
    {
      id: 'evt-10',
      occurredAt: new Date(Date.UTC(2024, 7, 19, 10, 47, 12)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created VPC peering to aws-eu-north-1',
      eventType: 'Network',
      resourceKind: 'Network',
      resourceName: 'vpc-eu-north',
      logEntryId: 'log_7b0c5519d0',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { peer_account: '9012…', cidr: '172.16.0.0/16' },
    },
    {
      id: 'evt-11',
      occurredAt: new Date(Date.UTC(2024, 7, 18, 15, 9, 58)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Removed user contractor@bigco.example from prj-data',
      eventType: 'User management',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_dd41aa7c02',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { removed_email: 'contractor@bigco.example' },
    },
    {
      id: 'evt-12',
      occurredAt: new Date(Date.UTC(2024, 7, 18, 6, 35, 26)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Reset MFA for user marcus@bigco.example',
      eventType: 'Security',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_11c9be3a77',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'system',
      metadata: { target_user: 'usr_marcus_chen', reason: 'support_request' },
    },
    {
      id: 'evt-13',
      occurredAt: new Date(Date.UTC(2024, 7, 17, 17, 51, 9)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created service ch-events in prj-data',
      eventType: 'Service management',
      resourceKind: 'Service',
      resourceName: 'ch-events',
      logEntryId: 'log_4a7712fe58',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: 'svc-ch-events',
      actorUserId: 'usr_priya_nair',
      metadata: { service_type: 'clickhouse', plan: 'startup-16' },
    },
    {
      id: 'evt-14',
      occurredAt: new Date(Date.UTC(2024, 7, 16, 12, 18, 44)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Auto-scaled storage for pg-production to 320 GB',
      eventType: 'Service management',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_9021ccaa31',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'svc_automation',
      metadata: { from_gb: 240, to_gb: 320, trigger: 'disk_usage_90pct' },
    },
    {
      id: 'evt-15',
      occurredAt: new Date(Date.UTC(2024, 7, 16, 4, 2, 51)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Downloaded usage report for July 2024',
      eventType: 'Billing',
      resourceKind: 'Billing',
      resourceName: 'Default billing group',
      logEntryId: 'log_5f8830be7a',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { period: '2024-07', format: 'csv' },
    },
    {
      id: 'evt-16',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 19, 27, 16)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created personal access token console-cli',
      eventType: 'Access',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_7cc0aa1e94',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { token_name: 'console-cli', scope: 'read_write' },
    },
    {
      id: 'evt-17',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 8, 55, 33)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Changed organization role for marcus@bigco.example to Admin',
      eventType: 'User management',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_2ab7f00c65',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { target_user: 'usr_marcus_chen', new_role: 'admin' },
    },
    {
      id: 'evt-18',
      occurredAt: new Date(Date.UTC(2024, 7, 14, 22, 41, 7)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Disabled IP filter on os-search-eu',
      eventType: 'Security',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_66aa02cd18',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-os-search-eu',
      actorUserId: 'system',
      metadata: { previous_cidrs: '10.0.0.0/8' },
    },
    {
      id: 'evt-19',
      occurredAt: new Date(Date.UTC(2024, 7, 14, 11, 3, 29)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Deleted service valkey-cache in prj-platform',
      eventType: 'Service management',
      resourceKind: 'Service',
      resourceName: 'valkey-cache',
      logEntryId: 'log_98cd11a7ef',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-valkey-cache',
      actorUserId: 'usr_marcus_chen',
      metadata: { service_type: 'valkey', backups_retained: false },
    },
    {
      id: 'evt-20',
      occurredAt: new Date(Date.UTC(2024, 7, 13, 16, 12, 48)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Updated project permissions for prj-platform',
      eventType: 'Access',
      resourceKind: 'Project',
      resourceName: 'prj-platform',
      logEntryId: 'log_0af7cc9b23',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { added_role: 'read_only', principals: 2 },
    },
    {
      id: 'evt-21',
      occurredAt: new Date(Date.UTC(2024, 7, 13, 6, 40, 2)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Renewed TLS certificate for pg-production',
      eventType: 'Security',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_71bc0a2d84',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'svc_automation',
      metadata: { expires_at: '2025-08-13', issuer: 'aiven-ca' },
    },
    {
      id: 'evt-22',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 15, 33, 55)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created project prj-data',
      eventType: 'Service management',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_3390cae0f1',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { default_cloud: 'aws-eu-north-1' },
    },
    {
      id: 'evt-23',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 9, 8, 14)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Added user devops@bigco.example to prj-platform',
      eventType: 'User management',
      resourceKind: 'Project',
      resourceName: 'prj-platform',
      logEntryId: 'log_c0a1129fbe',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { added_email: 'devops@bigco.example', role: 'developer' },
    },
    {
      id: 'evt-24',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 5, 21, 39)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Detected new sign-in from unrecognized device',
      eventType: 'Security',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_ee02a7cc90',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'system',
      metadata: { target_user: 'usr_elena_ivanova', location: 'Helsinki, FI' },
    },
    // ── Rows exercising the newer event types so those filter options match data ──
    {
      id: 'evt-25',
      occurredAt: new Date(Date.UTC(2024, 7, 22, 13, 47, 5)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created project API token console-cli for prj-data',
      eventType: 'API token',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_a17c0f92de',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { token_name: 'console-cli', scope: 'read_write' },
    },
    {
      id: 'evt-26',
      occurredAt: new Date(Date.UTC(2024, 7, 21, 9, 14, 33)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Signed in via SSO (Okta)',
      eventType: 'Authentication',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_b2380ac71f',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { method: 'sso', provider: 'okta', mfa: true },
    },
    {
      id: 'evt-27',
      occurredAt: new Date(Date.UTC(2024, 7, 20, 3, 30, 0)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Created scheduled backup of pg-production',
      eventType: 'Backup',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_c9911fe044',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'svc_automation',
      metadata: { backup_id: 'bkp_20240820', size_gb: 118, type: 'full' },
    },
    {
      id: 'evt-28',
      occurredAt: new Date(Date.UTC(2024, 7, 19, 14, 2, 41)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Configured Datadog metrics integration for kafka-analytics',
      eventType: 'Integration',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_d40a1c8b72',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'usr_priya_nair',
      metadata: { integration: 'datadog', endpoint: 'metrics', enabled: true },
    },
    {
      id: 'evt-29',
      occurredAt: new Date(Date.UTC(2024, 7, 18, 6, 0, 0)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Scheduled maintenance window for os-search-eu',
      eventType: 'Maintenance',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_e5520bd913',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-os-search-eu',
      actorUserId: 'svc_automation',
      metadata: { window: '2024-08-25T06:00Z', version: '2.13.0' },
    },
    {
      id: 'evt-30',
      occurredAt: new Date(Date.UTC(2024, 7, 17, 10, 26, 18)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Updated organization display name to Big Co Ltd.',
      eventType: 'Organization',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_f6631ce0a4',
      organizationId: 'org-7a2c91',
      accountId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { previous_name: 'Big Company', new_name: 'Big Co Ltd.' },
    },
    {
      id: 'evt-31',
      occurredAt: new Date(Date.UTC(2024, 7, 16, 15, 48, 52)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Renamed project prj-data to prj-data-eu',
      eventType: 'Project management',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_071742db35',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { from: 'prj-data', to: 'prj-data-eu' },
    },
    {
      id: 'evt-32',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 11, 9, 7)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Increased service quota for prj-platform',
      eventType: 'Quota',
      resourceKind: 'Project',
      resourceName: 'prj-platform',
      logEntryId: 'log_18835ef1c6',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'system',
      metadata: { resource: 'services', from: 20, to: 30 },
    },
    {
      id: 'evt-33',
      occurredAt: new Date(Date.UTC(2024, 7, 14, 8, 33, 24)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Opened support ticket #4821 (elevated storage latency)',
      eventType: 'Support',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_299460af27',
      organizationId: 'org-7a2c91',
      accountId: 'acc-31f8',
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { ticket_id: '4821', priority: 'high', category: 'performance' },
    },
  ]

  return seeds.map((seed) => ({
    ...seed,
    dateTimeLabel: formatEventTimestamp(seed.occurredAt),
  }))
}

export const MOCK_EVENT_LOGS: EventLog[] = createMockEventLogs()

// ─── Filter option catalogs ───────────────────────────────────────────────────

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

// The option catalogs below intentionally include more values than appear in the
// mock rows. Real Console filter dropdowns list every possible value in the org
// (most of which aren't on the current page), so padding these lets us exercise
// the searchable dropdown's in-menu search and >10-item scroll behaviour.

/** Actors that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_ACTOR_OPTIONS = [
  'Sofia Rossi',
  'Liam O’Connor',
  'Yuki Tanaka',
  'Noah Schmidt',
  'Amara Okafor',
  'Diego Fernández',
  'Mei Lin',
  'Oliver Brown',
  'Fatima Al-Sayed',
  'Lucas Silva',
  'terraform@aiven.io',
  'ci-bot@bigco.example',
]

export const ACTOR_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.actor),
  ...EXTRA_ACTOR_OPTIONS,
])
  .sort()
  .map((value) => ({ value, label: value }))

// Typed against the EventType union so any option that isn't a real event type
// (and therefore could never match a log row) fails to compile.
const EVENT_TYPE_VALUES: EventType[] = [
  'Access',
  'API token',
  'Authentication',
  'Backup',
  'Billing',
  'Integration',
  'Maintenance',
  'Network',
  'Organization',
  'Project management',
  'Quota',
  'Security',
  'Service management',
  'Support',
  'User management',
]

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] =
  EVENT_TYPE_VALUES.map((value) => ({ value, label: value }))

/** Resources that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_RESOURCE_OPTIONS = [
  'redis-sessions',
  'mysql-orders',
  'opensearch-logs',
  'kafka-connect',
  'flink-jobs',
  'grafana-dashboards',
  'cassandra-metrics',
  'clickhouse-analytics',
  'valkey-ratelimit',
  'pg-staging',
]

export const RESOURCE_OPTIONS: { value: string; label: string }[] = unique([
  ...MOCK_EVENT_LOGS.map((e) => e.resourceName),
  ...EXTRA_RESOURCE_OPTIONS,
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

/** Default date range shown on load — matches the 12/08/2024 – 24/08/2024 design. */
export const DEFAULT_DATE_RANGE: EventDateRange = {
  start: new CalendarDateTime(2024, 8, 12, 0, 0, 0),
  end: new CalendarDateTime(2024, 8, 24, 23, 59, 59),
}

/**
 * Quick-range presets rendered in the calendar popover's left column.
 * Anchored to the latest event so selecting a preset actually filters the
 * mock data (rather than a real "now" that has no rows).
 */
export type DateRangePreset = {
  label: string
  value: { start: CalendarDateTime; end: CalendarDateTime }
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = (() => {
  const latestMs = Math.max(...MOCK_EVENT_LOGS.map((e) => e.occurredAt.getTime()))
  const anchor = utcDateToCalendarDateTime(new Date(latestMs))
  const end = new CalendarDateTime(anchor.year, anchor.month, anchor.day, 23, 59, 59)
  const startOfDay = (cdt: CalendarDateTime) =>
    new CalendarDateTime(cdt.year, cdt.month, cdt.day, 0, 0, 0)

  return [
    { label: 'Last month', value: { start: startOfDay(anchor.subtract({ months: 1 })), end } },
    { label: 'Last 3 months', value: { start: startOfDay(anchor.subtract({ months: 3 })), end } },
    { label: 'Last 6 months', value: { start: startOfDay(anchor.subtract({ months: 6 })), end } },
  ]
})()

/**
 * Range applied on load. Uses the "Last 3 months" preset so that preset shows
 * as preselected/highlighted in the calendar popover.
 */
export const DEFAULT_PRESET_RANGE: EventDateRange =
  DATE_RANGE_PRESETS.find((preset) => preset.label === 'Last 3 months')?.value ??
  DEFAULT_DATE_RANGE

// ─── Export helper ──────────────────────────────────────────────────────────

function eventLogToJson(row: EventLog) {
  return {
    log_entry_id: row.logEntryId,
    event_type: row.eventType,
    summary: row.action,
    create_time: row.occurredAt.toISOString(),
    organization_id: row.organizationId,
    account_id: row.accountId,
    billing_group_id: row.billingGroupId,
    project_id: row.projectId,
    service_id: row.serviceId,
    actor: row.actor,
    actor_user_id: row.actorUserId,
    resource: `${row.resourceKind}: ${row.resourceName}`,
    metadata: row.metadata,
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
