import { CalendarDateTime } from '@internationalized/date'

// ─── Types ──────────────────────────────────────────────────────────────────

export type EventDateRange = { start: CalendarDateTime; end: CalendarDateTime }

export type ActorKind = 'user' | 'automation' | 'system'

export type ResourceKind = 'Service' | 'Project' | 'Organization' | 'Network' | 'Billing'

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

/** A single organization event-log entry. Mirrors the schema shown in the design. */
export type EventLog = {
  id: string
  occurredAt: Date
  /** Pre-formatted ISO 8601 UTC label for the table, e.g. "2024-08-23T14:22:08.000Z". */
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
  organizationUnitId: string | null
  billingGroupId: string | null
  projectId: string | null
  serviceId: string | null
  actorUserId: string
  metadata: Record<string, string | number | boolean | null>
}

// ─── Date helpers (shared pattern with src/screens/ProjectServices.tsx) ───────

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
  return d.toISOString()
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type Seed = Omit<EventLog, 'dateTimeLabel'>

/** Deterministic, mock-only dataset scoped to Aug 2024 (within the 30-day retention window). */
function createMockEventLogs(): EventLog[] {
  const seeds: Seed[] = [
    {
      id: 'evt-1',
      occurredAt: new Date(Date.UTC(2024, 7, 23, 14, 22, 8)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Associated static IP 185.24.68.12 with pg-production',
      eventType: 'static_ip_address_associate',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_2f9c41ab7e',
      organizationUnitId: 'ou-platform',
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
      action: 'Deleted private link endpoint vpce-0a1b2c3d4e from kafka-analytics',
      eventType: 'privatelink_delete',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_88b0aa1240',
      organizationUnitId: 'ou-data',
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
      action: 'Private link connection pending user approval for kafka-analytics',
      eventType: 'privatelink_connection_pending_user_approval',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_5c1d77e9a3',
      organizationUnitId: 'ou-data',
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
      action: 'Added user devops@bigco.example to organization',
      eventType: 'project_member_add',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_a71e0b93cc',
      organizationUnitId: null,
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
      action: 'Read service user credentials for prj-data',
      eventType: 'service_user_secrets_read',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_33aa90fd12',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { service_user: 'default', method: 'console' },
    },
    {
      id: 'evt-6',
      occurredAt: new Date(Date.UTC(2024, 7, 21, 8, 2, 19)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Updated IP filter configuration on os-search-eu',
      eventType: 'service_update',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_120fe4bb87',
      organizationUnitId: 'ou-data',
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
      eventType: 'service_update',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_9de1a2f450',
      organizationUnitId: 'ou-platform',
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
      action: 'Performed scheduled maintenance on kafka-analytics',
      eventType: 'service_maintenance_perform',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_6640cd2f19',
      organizationUnitId: 'ou-platform',
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
      action: 'Assigned billing group bg-004 to prj-platform',
      eventType: 'project_billing_group_set',
      resourceKind: 'Billing',
      resourceName: 'Default billing group',
      logEntryId: 'log_af0912ee6b',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_priya_nair',
      metadata: { billing_group_id: 'bg-004', project_id: 'prj-platform' },
    },
    {
      id: 'evt-10',
      occurredAt: new Date(Date.UTC(2024, 7, 19, 10, 47, 12)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created VPC peering connection vpc-eu-north to aws-eu-north-1',
      eventType: 'project_vpc_peering_connection_create',
      resourceKind: 'Network',
      resourceName: 'vpc-eu-north',
      logEntryId: 'log_7b0c5519d0',
      organizationUnitId: 'ou-platform',
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
      action: 'Updated member contractor@bigco.example in prj-data',
      eventType: 'project_member_update',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_dd41aa7c02',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { member_email: 'contractor@bigco.example', change: 'removed' },
    },
    {
      id: 'evt-12',
      occurredAt: new Date(Date.UTC(2024, 7, 18, 6, 35, 26)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Updated user permissions for marcus@bigco.example',
      eventType: 'user_permissions_set',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_11c9be3a77',
      organizationUnitId: 'ou-data',
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
      eventType: 'service_create',
      resourceKind: 'Service',
      resourceName: 'ch-events',
      logEntryId: 'log_4a7712fe58',
      organizationUnitId: 'ou-data',
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
      action: 'Modified additional backup regions for pg-production',
      eventType: 'service_additional_backup_regions_modified',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_9021ccaa31',
      organizationUnitId: 'ou-data',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'svc_automation',
      metadata: { added_region: 'eu-west-1', removed_region: null },
    },
    {
      id: 'evt-15',
      occurredAt: new Date(Date.UTC(2024, 7, 16, 4, 2, 51)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created static IP address 203.0.113.44 in prj-platform',
      eventType: 'static_ip_address_create',
      resourceKind: 'Network',
      resourceName: 'static-ip-203-0-113-44',
      logEntryId: 'log_5f8830be7a',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { ip_address: '203.0.113.44', cloud: 'aws-eu-north-1' },
    },
    {
      id: 'evt-16',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 19, 27, 16)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Set permissions for group platform-operators',
      eventType: 'group_permissions_set',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_7cc0aa1e94',
      organizationUnitId: null,
      billingGroupId: null,
      projectId: null,
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { group: 'platform-operators', scope: 'project_admin' },
    },
    {
      id: 'evt-17',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 8, 55, 33)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Changed organization role for marcus@bigco.example to Admin',
      eventType: 'user_permissions_set',
      resourceKind: 'Organization',
      resourceName: 'Big Co Ltd.',
      logEntryId: 'log_2ab7f00c65',
      organizationUnitId: null,
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
      action: 'Powered off os-search-eu',
      eventType: 'service_poweroff',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_66aa02cd18',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-os-search-eu',
      actorUserId: 'system',
      metadata: { reason: 'maintenance_window' },
    },
    {
      id: 'evt-19',
      occurredAt: new Date(Date.UTC(2024, 7, 14, 11, 3, 29)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Revived service valkey-cache in prj-platform',
      eventType: 'service_revive',
      resourceKind: 'Service',
      resourceName: 'valkey-cache',
      logEntryId: 'log_98cd11a7ef',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-valkey-cache',
      actorUserId: 'usr_marcus_chen',
      metadata: { previous_state: 'powered_off' },
    },
    {
      id: 'evt-20',
      occurredAt: new Date(Date.UTC(2024, 7, 13, 16, 12, 48)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Deleted project prj-archive',
      eventType: 'project_delete',
      resourceKind: 'Project',
      resourceName: 'prj-archive',
      logEntryId: 'log_0af7cc9b23',
      organizationUnitId: 'ou-archive',
      billingGroupId: null,
      projectId: 'prj-archive',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { services_deleted: 3 },
    },
    {
      id: 'evt-21',
      occurredAt: new Date(Date.UTC(2024, 7, 13, 6, 40, 2)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Dissociated static IP 185.24.68.12 from pg-production',
      eventType: 'static_ip_address_dissociate',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_71bc0a2d84',
      organizationUnitId: 'ou-archive',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'svc_automation',
      metadata: { ip_address: '185.24.68.12' },
    },
    {
      id: 'evt-22',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 15, 33, 55)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Forked service pg-production to pg-production-staging',
      eventType: 'service_forked',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_3390cae0f1',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'usr_priya_nair',
      metadata: { forked_service: 'pg-production-staging', project_id: 'prj-staging' },
    },
    {
      id: 'evt-23',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 9, 8, 14)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Updated project prj-data default cloud region',
      eventType: 'project_update',
      resourceKind: 'Project',
      resourceName: 'prj-data',
      logEntryId: 'log_c0a1129fbe',
      organizationUnitId: 'ou-data',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: null,
      actorUserId: 'usr_marcus_chen',
      metadata: { default_cloud: 'aws-eu-north-1' },
    },
    {
      id: 'evt-24',
      occurredAt: new Date(Date.UTC(2024, 7, 12, 5, 21, 39)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Detected deleted VPC peering connection for vpc-eu-north',
      eventType: 'project_vpc_peering_connection_delete_detected',
      resourceKind: 'Network',
      resourceName: 'vpc-eu-north',
      logEntryId: 'log_ee02a7cc90',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'system',
      metadata: { peering_id: 'pcx-0a1b2c3d', cloud: 'aws' },
    },
    {
      id: 'evt-25',
      occurredAt: new Date(Date.UTC(2024, 7, 22, 13, 47, 5)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Created upgrade pipeline step for pg-production',
      eventType: 'upgrade_pipeline_step_create',
      resourceKind: 'Service',
      resourceName: 'pg-production',
      logEntryId: 'log_a17c0f92de',
      organizationUnitId: 'ou-platform',
      billingGroupId: null,
      projectId: 'prj-platform',
      serviceId: 'svc-pg-production',
      actorUserId: 'usr_marcus_chen',
      metadata: { step_id: 'ups-4412', target_version: '16.4' },
    },
    {
      id: 'evt-26',
      occurredAt: new Date(Date.UTC(2024, 7, 21, 9, 14, 33)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Approved private link connection for kafka-analytics',
      eventType: 'privatelink_connection_user_approved',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_b2380ac71f',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'usr_elena_ivanova',
      metadata: { connection_id: 'plc-9931', approved_by: 'usr_elena_ivanova' },
    },
    {
      id: 'evt-27',
      occurredAt: new Date(Date.UTC(2024, 7, 20, 3, 30, 0)),
      actor: 'Aiven Automation',
      actorKind: 'automation',
      action: 'Created Datadog metrics integration on kafka-analytics',
      eventType: 'service_integration_create',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_c9911fe044',
      organizationUnitId: 'ou-data',
      billingGroupId: 'bg-004',
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'svc_automation',
      metadata: { integration: 'datadog', endpoint: 'metrics' },
    },
    {
      id: 'evt-28',
      occurredAt: new Date(Date.UTC(2024, 7, 19, 14, 2, 41)),
      actor: 'Priya Nair',
      actorKind: 'user',
      actorHref: '#',
      action: 'Updated Datadog integration settings on kafka-analytics',
      eventType: 'service_integration_update',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_d40a1c8b72',
      organizationUnitId: 'ou-data',
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
      action: 'Performed maintenance window update on os-search-eu',
      eventType: 'service_maintenance_perform',
      resourceKind: 'Service',
      resourceName: 'os-search-eu',
      logEntryId: 'log_e5520bd913',
      organizationUnitId: 'ou-data',
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
      action: 'Created private link for kafka-analytics',
      eventType: 'privatelink_create',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_f6631ce0a4',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'usr_priya_nair',
      metadata: { privatelink_id: 'pl-8821', cloud: 'aws' },
    },
    {
      id: 'evt-31',
      occurredAt: new Date(Date.UTC(2024, 7, 16, 15, 48, 52)),
      actor: 'Elena Ivanova',
      actorKind: 'user',
      actorHref: '#',
      action: 'Activated VPC peering connection vpc-eu-north',
      eventType: 'project_vpc_peering_connection_active',
      resourceKind: 'Network',
      resourceName: 'vpc-eu-north',
      logEntryId: 'log_071742db35',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'usr_elena_ivanova',
      metadata: { peering_id: 'pcx-0a1b2c3d', status: 'active' },
    },
    {
      id: 'evt-32',
      occurredAt: new Date(Date.UTC(2024, 7, 15, 11, 9, 7)),
      actor: 'system@aiven.io',
      actorKind: 'system',
      action: 'Suspended project prj-platform',
      eventType: 'project_suspend',
      resourceKind: 'Project',
      resourceName: 'prj-platform',
      logEntryId: 'log_18835ef1c6',
      organizationUnitId: 'ou-platform',
      billingGroupId: 'bg-004',
      projectId: 'prj-platform',
      serviceId: null,
      actorUserId: 'system',
      metadata: { reason: 'billing_overdue' },
    },
    {
      id: 'evt-33',
      occurredAt: new Date(Date.UTC(2024, 7, 14, 8, 33, 24)),
      actor: 'Marcus Chen',
      actorKind: 'user',
      actorHref: '#',
      action: 'Validated upgrade pipeline step for kafka-analytics',
      eventType: 'upgrade_pipeline_step_validate',
      resourceKind: 'Service',
      resourceName: 'kafka-analytics',
      logEntryId: 'log_299460af27',
      organizationUnitId: 'ou-data',
      billingGroupId: null,
      projectId: 'prj-data',
      serviceId: 'svc-kafka-analytics',
      actorUserId: 'usr_marcus_chen',
      metadata: { step_id: 'ups-8820', result: 'passed' },
    },
  ]

  const TARGET_COUNT = 100
  const actors = [
    {
      actor: 'Elena Ivanova',
      actorKind: 'user' as const,
      actorUserId: 'usr_elena_ivanova',
      actorHref: '#',
    },
    {
      actor: 'Marcus Chen',
      actorKind: 'user' as const,
      actorUserId: 'usr_marcus_chen',
      actorHref: '#',
    },
    {
      actor: 'Priya Nair',
      actorKind: 'user' as const,
      actorUserId: 'usr_priya_nair',
      actorHref: '#',
    },
    {
      actor: 'Aiven Automation',
      actorKind: 'automation' as const,
      actorUserId: 'svc_automation',
    },
    {
      actor: 'system@aiven.io',
      actorKind: 'system' as const,
      actorUserId: 'system',
    },
  ]
  const resources = [
    {
      resourceKind: 'Service' as const,
      resourceName: 'pg-production',
      projectId: 'prj-platform',
      organizationUnitId: 'ou-platform',
      serviceId: 'svc-pg-production',
      billingGroupId: 'bg-004' as string | null,
    },
    {
      resourceKind: 'Service' as const,
      resourceName: 'kafka-analytics',
      projectId: 'prj-data',
      organizationUnitId: 'ou-data',
      serviceId: 'svc-kafka-analytics',
      billingGroupId: 'bg-004' as string | null,
    },
    {
      resourceKind: 'Service' as const,
      resourceName: 'os-search-eu',
      projectId: 'prj-platform',
      organizationUnitId: 'ou-platform',
      serviceId: 'svc-os-search-eu',
      billingGroupId: 'bg-004' as string | null,
    },
    {
      resourceKind: 'Service' as const,
      resourceName: 'valkey-cache',
      projectId: 'prj-platform',
      organizationUnitId: 'ou-platform',
      serviceId: 'svc-valkey-cache',
      billingGroupId: null as string | null,
    },
    {
      resourceKind: 'Project' as const,
      resourceName: 'prj-data',
      projectId: 'prj-data',
      organizationUnitId: 'ou-data',
      serviceId: null as string | null,
      billingGroupId: 'bg-004' as string | null,
    },
  ]
  const generatedActions: { eventType: EventType; action: (name: string) => string }[] = [
    { eventType: 'service_update', action: (name) => `Updated configuration on ${name}` },
    { eventType: 'service_poweron', action: (name) => `Powered on ${name}` },
    { eventType: 'service_poweroff', action: (name) => `Powered off ${name}` },
    { eventType: 'service_maintenance_perform', action: (name) => `Performed maintenance on ${name}` },
    { eventType: 'service_integration_update', action: (name) => `Updated integration on ${name}` },
    { eventType: 'project_update', action: (name) => `Updated project settings for ${name}` },
    { eventType: 'static_ip_address_patch', action: (name) => `Patched static IP binding on ${name}` },
    { eventType: 'privatelink_connection_updated', action: (name) => `Updated private link connection on ${name}` },
  ]

  const generated: Seed[] = []
  for (let i = seeds.length; i < TARGET_COUNT; i++) {
    const n = i - seeds.length
    const actor = actors[n % actors.length]
    const resource = resources[n % resources.length]
    const actionSpec = generatedActions[n % generatedActions.length]
    // Spread across ~28 days before latest handcrafted event (2024-08-23), staying in retention.
    const dayOffset = 1 + (n % 28)
    const hour = 6 + (n % 12)
    const minute = (n * 7) % 60
    generated.push({
      id: `evt-${i + 1}`,
      occurredAt: new Date(Date.UTC(2024, 7, 23 - dayOffset, hour, minute, (n * 3) % 60)),
      actor: actor.actor,
      actorKind: actor.actorKind,
      actorHref: actor.actorHref,
      action: actionSpec.action(resource.resourceName),
      eventType: actionSpec.eventType,
      resourceKind: resource.resourceKind,
      resourceName: resource.resourceName,
      logEntryId: `log_gen${(i + 1).toString(16).padStart(8, '0')}`,
      organizationUnitId: resource.organizationUnitId,
      billingGroupId: resource.billingGroupId,
      projectId: resource.projectId,
      serviceId: resource.serviceId,
      actorUserId: actor.actorUserId,
      metadata: { generated: true, sequence: n + 1 },
    })
  }

  return [...seeds, ...generated].map((seed) => ({
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

/** Human users that don't exist in MOCK_EVENT_LOGS but round out the filter dropdown. */
const EXTRA_USER_OPTIONS = [
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
]

/** Automation identities that don't exist in MOCK_EVENT_LOGS but round out the dropdown. */
const EXTRA_AUTOMATION_OPTIONS = ['terraform@aiven.io', 'ci-bot@bigco.example']

export type UserOptionGroup = {
  title: string
  options: { value: string; label: string }[]
}

function toOptions(values: string[]): { value: string; label: string }[] {
  return unique(values)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }))
}

/** Grouped User filter options: people vs Aiven automation / system actors. */
export const USER_OPTION_GROUPS: UserOptionGroup[] = [
  {
    title: 'Users',
    options: toOptions([
      ...MOCK_EVENT_LOGS.filter((e) => e.actorKind === 'user').map((e) => e.actor),
      ...EXTRA_USER_OPTIONS,
    ]),
  },
  {
    title: 'Aiven automation',
    options: toOptions([
      ...MOCK_EVENT_LOGS.filter((e) => e.actorKind !== 'user').map((e) => e.actor),
      ...EXTRA_AUTOMATION_OPTIONS,
    ]),
  },
]

/** Flat list for drawer MultiSelect and value→label lookups. */
export const USER_OPTIONS: { value: string; label: string }[] = USER_OPTION_GROUPS.flatMap(
  (group) => group.options,
)

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] =
  EVENT_TYPE_VALUES.map((value) => ({ value, label: value }))

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
    row.organizationUnitId,
    row.billingGroupId,
    row.projectId,
    row.serviceId,
    row.actorUserId,
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
  value: { start: CalendarDateTime; end: CalendarDateTime }
}

const startOfDay = (cdt: CalendarDateTime) =>
  new CalendarDateTime(cdt.year, cdt.month, cdt.day, 0, 0, 0)

const endOfDay = (cdt: CalendarDateTime) =>
  new CalendarDateTime(cdt.year, cdt.month, cdt.day, 23, 59, 59)

/** Latest mock event — used as "now" for presets and retention bounds. */
const EVENT_LOG_ANCHOR = utcDateToCalendarDateTime(
  new Date(Math.max(...MOCK_EVENT_LOGS.map((e) => e.occurredAt.getTime()))),
)

/** Earliest selectable instant (start of day, retention days before the anchor). */
export const EVENT_LOG_MIN_DATE: CalendarDateTime = startOfDay(
  EVENT_LOG_ANCHOR.subtract({ days: EVENT_LOG_RETENTION_DAYS }),
)

/** Latest selectable instant (end of the anchor day). */
export const EVENT_LOG_MAX_DATE: CalendarDateTime = endOfDay(EVENT_LOG_ANCHOR)

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Last 3 days',
    value: {
      start: startOfDay(EVENT_LOG_ANCHOR.subtract({ days: 3 })),
      end: EVENT_LOG_MAX_DATE,
    },
  },
  {
    label: 'Last week',
    value: {
      start: startOfDay(EVENT_LOG_ANCHOR.subtract({ days: 7 })),
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
    organization_unit_id: row.organizationUnitId,
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
