/**
 * Anonymized templates derived from 10 real BigQuery Console event-log samples.
 * No real customer identifiers — ID shapes and nullability patterns preserved.
 */

import type { ActorKind, EventLog, EventType, ResourceKind } from './eventLogsData'

/** Structural template matching real BQ row shapes (after anonymization). */
export type RealEventTemplate = {
  eventType: EventType
  actorKind: ActorKind
  /** When false, account/org/project/billing/service IDs are null together (real pattern). */
  scoped: boolean
  /** When scoped, whether service_id is present on the row. */
  hasServiceId: boolean
  /** Summary builder — receives deterministic mock context for this row index. */
  buildSummary: (ctx: AnonContext) => string
}

export type AnonContext = {
  index: number
  actor: string
  actorEmail: string
  projectId: string
  serviceName: string
  serviceId: string
  planFrom: string
  planTo: string
  cloud: string
  serviceType: string
  integrationId: string
  endpointName: string
  ipFrom: string
  ipTo: string
}

const HUMAN_ACTORS = [
  { name: 'Elena Ivanova', email: 'elena.ivanova@bigco.example', userId: 'usr_elena_ivanova' },
  { name: 'Marcus Chen', email: 'marcus.chen@bigco.example', userId: 'usr_marcus_chen' },
  { name: 'Priya Nair', email: 'priya.nair@bigco.example', userId: 'usr_priya_nair' },
  { name: 'Sofia Rossi', email: 'sofia.rossi@bigco.example', userId: 'usr_sofia_rossi' },
] as const

const APP_USER_ACTORS = [
  'u0001@application-user.avns.net',
  'u0002@application-user.avns.net',
  'u0003@application-user.avns.net',
  'u0004@application-user.avns.net',
] as const

const ORG_UNITS = ['ou-platform', 'ou-data', 'ou-security', 'ou-finance', 'ou-europe'] as const

const SERVICE_NAMES = [
  'pg-production',
  'pg-staging',
  'valkey-cache',
  'kafka-events',
  'mysql-orders',
  'redis-sessions',
  'clickhouse-analytics',
  'grafana-metrics',
] as const

const SERVICE_TYPES = ['pg', 'valkey', 'kafka', 'mysql', 'redis', 'clickhouse'] as const

const PLANS = [
  'startup-4',
  'business-16',
  'do-os-s-1-2-40-1',
  'do-1vm-xh-4gib-2cpu-70gib-intel-1',
  'do-premium-xh-4gib-2cpu-60gib-amd-1',
] as const

const CLOUDS = [
  'google-europe-west1',
  'aws-eu-north-1',
  'custom-digitalocean-do-syd1',
  'azure-westus2',
] as const

/** Short synthetic CIDR lists — keep allowlist diff pattern without giant payloads. */
const IP_SETS = [
  ['10.108.128.0/19', '10.116.0.2/32', '10.116.0.3/32', '10.116.0.4/32'],
  ['10.116.0.2/32', '10.116.0.11/32', '10.116.0.15/32', '10.116.0.18/32'],
  ['192.168.10.0/24', '192.168.20.5/32', '192.168.20.6/32'],
  ['10.0.0.0/8', '172.16.0.1/32', '172.16.0.2/32', '172.16.0.3/32'],
] as const

function padHex(n: number, width: number): string {
  return n.toString(16).padStart(width, '0')
}

function uuidFromIndex(index: number, salt: number): string {
  const h = (n: number, width: number) =>
    (n >>> 0).toString(16).padStart(width, '0').slice(-width)
  const p1 = h(index * 7919 + salt * 13, 8)
  const p2 = h(index * 104729 + salt * 17, 4)
  const p3 = h(0x4000 | (index * 224737 + salt), 4)
  const p4 = h(0x8000 | (index * 350377 + salt * 3), 4)
  const p5 = h(index * 433494437 + salt * 19, 4)
  const p6 = h(index * 2971215073 + salt * 23, 8)
  return `${p1}-${p2}-${p3}-${p4}-${p5}${p6}`
}

function ipList(parts: readonly string[], extraCount: number): string {
  const shown = parts.join(', ')
  return extraCount > 0 ? `${shown}, … (+${extraCount} more)` : shown
}

function buildIpAllowlistSummary(index: number): { from: string; to: string } {
  const fromSet = IP_SETS[index % IP_SETS.length]
  const toSet = IP_SETS[(index + 1) % IP_SETS.length]
  const fromExtra = 20 + (index % 40)
  const toExtra = fromExtra + ((index % 5) - 2)
  return {
    from: ipList(fromSet, fromExtra),
    to: ipList(toSet, Math.max(0, toExtra)),
  }
}

/**
 * 10 templates mirroring the BigQuery sample event types and nullability.
 * Summaries use mock names/IDs only.
 */
export const REAL_EVENT_TEMPLATES: RealEventTemplate[] = [
  {
    // Sample 0: unscoped IP allowlist update via application-user
    eventType: 'service_update',
    actorKind: 'system',
    scoped: false,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `Changed allowed IP addresses from '${ctx.ipFrom}' to '${ctx.ipTo}'`,
  },
  {
    // Sample 1: secrets read by human (scoped, no service_id)
    eventType: 'service_user_secrets_read',
    actorKind: 'user',
    scoped: true,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `User ${ctx.actorEmail} read secrets of all service users of service ${ctx.serviceName}(project: ${ctx.projectId}) in plaintext.`,
  },
  {
    // Sample 2: service create via application-user
    eventType: 'service_create',
    actorKind: 'system',
    scoped: true,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `Created '${ctx.serviceType}' service '${ctx.serviceName}' with plan '${ctx.planTo}' in cloud '${ctx.cloud}'`,
  },
  {
    // Sample 3: unscoped large IP allowlist update
    eventType: 'service_update',
    actorKind: 'system',
    scoped: false,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `Changed allowed IP addresses from '${ctx.ipFrom}' to '${ctx.ipTo}'`,
  },
  {
    // Sample 4: plan change (scoped + service_id)
    eventType: 'service_update',
    actorKind: 'system',
    scoped: true,
    hasServiceId: true,
    buildSummary: (ctx) =>
      `Changed service plan from '${ctx.planFrom}' to '${ctx.planTo}'`,
  },
  {
    // Sample 5: integration create
    eventType: 'service_integration_create',
    actorKind: 'system',
    scoped: true,
    hasServiceId: true,
    buildSummary: (ctx) =>
      `Created integration prometheus (${ctx.integrationId}) from project ${ctx.projectId} service ${ctx.serviceName} to project ${ctx.projectId} service endpoint ${ctx.endpointName}`,
  },
  {
    // Sample 6: unscoped IP allowlist
    eventType: 'service_update',
    actorKind: 'system',
    scoped: false,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `Changed allowed IP addresses from '${ctx.ipFrom}' to '${ctx.ipTo}'`,
  },
  {
    // Sample 7: automation poweroff
    eventType: 'service_poweroff',
    actorKind: 'automation',
    scoped: true,
    hasServiceId: true,
    buildSummary: () => 'Powered down the free service due to inactivity',
  },
  {
    // Sample 8: unscoped IP allowlist
    eventType: 'service_update',
    actorKind: 'system',
    scoped: false,
    hasServiceId: false,
    buildSummary: (ctx) =>
      `Changed allowed IP addresses from '${ctx.ipFrom}' to '${ctx.ipTo}'`,
  },
  {
    // Sample 9: maintenance by human (scoped, no service_id)
    eventType: 'service_maintenance_perform',
    actorKind: 'user',
    scoped: true,
    hasServiceId: false,
    buildSummary: () =>
      'Applied maintenance updates: Security patch with fixes for potential vulnerabilities; TimescaleDB version 2.27.0 is available.; TimescaleDB version 2.27.1 is available.; TimescaleDB version 2.27.2 is available.; Fixes to anon, postgis_topology, address_standardize extensions',
  },
]

function pickActor(template: RealEventTemplate, index: number): {
  actor: string
  actorKind: ActorKind
  actorUserId: string | null
  actorHref?: string
  internalActor: string | null
} {
  if (template.actorKind === 'automation') {
    return {
      actor: 'Aiven Automation',
      actorKind: 'automation',
      actorUserId: null,
      internalActor: 'aiven-automation',
    }
  }
  if (template.actorKind === 'system') {
    // application-user pattern from samples
    const email = APP_USER_ACTORS[index % APP_USER_ACTORS.length]
    return {
      actor: email,
      actorKind: 'system',
      actorUserId: null,
      internalActor: email,
    }
  }
  const human = HUMAN_ACTORS[index % HUMAN_ACTORS.length]
  return {
    actor: human.name,
    actorKind: 'user',
    actorUserId: human.userId,
    actorHref: '#',
    internalActor: null,
  }
}

function buildContext(index: number, actorEmail: string): AnonContext {
  const ips = buildIpAllowlistSummary(index)
  return {
    index,
    actor: actorEmail,
    actorEmail,
    projectId: `do-user-${10000 + (index % 50)}-0`,
    serviceName: SERVICE_NAMES[index % SERVICE_NAMES.length],
    serviceId: `s${padHex(0xa00000 + index * 97, 8)}`,
    planFrom: PLANS[index % PLANS.length],
    planTo: PLANS[(index + 2) % PLANS.length],
    cloud: CLOUDS[index % CLOUDS.length],
    serviceType: SERVICE_TYPES[index % SERVICE_TYPES.length],
    integrationId: uuidFromIndex(index, 42),
    endpointName: index % 2 === 0 ? 'insights' : 'metrics',
    ipFrom: ips.from,
    ipTo: ips.to,
  }
}

function formatEventTimestamp(d: Date): string {
  return d.toISOString()
}

/**
 * Build 100 EventLog rows by cycling the 10 real templates.
 * Times span ~30 days ending 2026-06-16 (latest sample day).
 */
export function createRealEventLogs(count = 100): EventLog[] {
  const anchorMs = Date.UTC(2026, 5, 16, 15, 16, 45, 529) // 2026-06-16 ~ sample max
  const spanMs = 30 * 24 * 60 * 60 * 1000

  const rows: EventLog[] = []
  for (let i = 0; i < count; i++) {
    const template = REAL_EVENT_TEMPLATES[i % REAL_EVENT_TEMPLATES.length]
    const actorInfo = pickActor(template, i)
    const emailForSummary =
      actorInfo.actorKind === 'user'
        ? HUMAN_ACTORS[i % HUMAN_ACTORS.length].email
        : actorInfo.actor.includes('@')
          ? actorInfo.actor
          : HUMAN_ACTORS[0].email
    const ctx = buildContext(i, emailForSummary)

    // Spread evenly across retention window; later indices are more recent
    const offsetMs = Math.floor((i / Math.max(count - 1, 1)) * spanMs)
    const occurredAt = new Date(anchorMs - (spanMs - offsetMs))
    // Add a small per-row second offset so timestamps aren't identical within a day
    occurredAt.setUTCSeconds(occurredAt.getUTCSeconds() + (i % 60))
    occurredAt.setUTCMilliseconds((i * 37) % 1000)

    const scoped = template.scoped
    const accountId = scoped ? `a${padHex(0xb10000 + (i % 8) * 111, 8)}` : null
    const organizationId = scoped ? `org${padHex(0xc20000 + (i % 5) * 77, 8)}` : null
    const billingGroupId = scoped ? `bg-${String(1000 + (i % 12)).padStart(4, '0')}` : null
    const projectId = scoped ? ctx.projectId : null
    const serviceId = scoped && template.hasServiceId ? ctx.serviceId : null
    const organizationUnitId = ORG_UNITS[i % ORG_UNITS.length]

    // Numeric asset ids like real samples; always service asset_type
    const assetId = String(2_800_000_000 + i * 137 + (i % 17))
    const resourceName = ctx.serviceName
    const resourceKind: ResourceKind = 'Service'

    const action = template.buildSummary(ctx)

    rows.push({
      id: `evt-${i + 1}`,
      occurredAt,
      dateTimeLabel: formatEventTimestamp(occurredAt),
      actor: actorInfo.actor,
      actorKind: actorInfo.actorKind,
      actorHref: actorInfo.actorHref,
      action,
      eventType: template.eventType,
      resourceKind,
      resourceName,
      logEntryId: uuidFromIndex(i, 7),
      organizationUnitId,
      accountId,
      organizationId,
      billingGroupId,
      projectId,
      serviceId,
      assetType: 'service',
      assetId,
      actorUserId: actorInfo.actorUserId,
      internalActor: actorInfo.internalActor,
      metadata: {
        template_index: i % REAL_EVENT_TEMPLATES.length,
        sequence: i + 1,
        source: 'real-seed',
      },
      additionalProperties: JSON.stringify({
        source: 'real-bq-template',
        template: i % REAL_EVENT_TEMPLATES.length,
      }),
    })
  }

  // Newest first (table expectation)
  return rows.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
}
