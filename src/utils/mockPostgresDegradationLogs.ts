import type { HistogramRange } from './auditHistogram'
import { buildHistogramBuckets } from './auditHistogram'

export type PostgresLogSeverity = 'info' | 'warning' | 'error'

export type PostgresServiceEventLog = {
  id: string
  timestamp: string
  service: 'checkout-pg-prod'
  serviceType: 'postgresql'
  severity: PostgresLogSeverity
  eventType: string
  message: string
  component:
    | 'postgres'
    | 'pgbouncer'
    | 'connection_pool'
    | 'autovacuum'
    | 'replication'
    | 'monitoring'
    | 'service_health'
    | 'audit'
  project: 'payments-prod'
  region: 'aws-eu-west-1'
  host?: string
  metadata?: Record<string, unknown>
}

type EventTemplate = {
  eventType: string
  message: string
  component: PostgresServiceEventLog['component']
  host?: string
  metadata?: Record<string, unknown>
}

type HourlySeverityWeights = {
  info: number
  warning: number
  error: number
}

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * ONE_HOUR_MS
const DEFAULT_BUCKET_COUNT = 12
const BASE_INTERVAL_OPTIONS_MS = [20_000, 30_000, 40_000] as const

const INFO_TEMPLATES: EventTemplate[] = [
  {
    eventType: 'service.health_check_passed',
    message: 'Service health check passed',
    component: 'service_health',
    metadata: { healthState: 'healthy' },
  },
  {
    eventType: 'connection.accepted',
    message: 'Accepted client connection through PgBouncer',
    component: 'pgbouncer',
    host: 'checkout-api-1',
  },
  {
    eventType: 'connection.accepted',
    message: 'Connection established to primary instance',
    component: 'postgres',
    host: 'checkout-worker-2',
  },
  {
    eventType: 'service.health_check_restored',
    message: 'Service health checks restored to nominal latency',
    component: 'monitoring',
    metadata: { latencyP95Ms: 52 },
  },
  {
    eventType: 'service.recovery_started',
    message: 'Connection pool utilization returned below warning threshold',
    component: 'service_health',
    metadata: { utilizationPercent: 74 },
  },
]

const WARNING_TEMPLATES: EventTemplate[] = [
  {
    eventType: 'connection.count_high',
    message: 'Connection count reached 82% of configured limit',
    component: 'connection_pool',
    metadata: { connectionCount: 246, maxConnections: 300 },
  },
  {
    eventType: 'query.slow',
    message: 'Observed sustained slow queries above 1.2s p95',
    component: 'monitoring',
    metadata: { p95Ms: 1240 },
  },
  {
    eventType: 'connection.timeout',
    message: 'Client connection timed out while waiting for available pool slot',
    component: 'pgbouncer',
    host: 'checkout-api-3',
  },
  {
    eventType: 'pgbouncer.pool_wait_timeout',
    message: 'PgBouncer pool wait timeout exceeded',
    component: 'pgbouncer',
    metadata: { waitTimeoutMs: 5000 },
  },
  {
    eventType: 'service.degraded',
    message: 'Service health state changed from healthy to degraded',
    component: 'service_health',
    metadata: { healthState: 'degraded' },
  },
  {
    eventType: 'connection.pool_saturation',
    message: 'Connection pool utilization exceeded warning threshold',
    component: 'connection_pool',
    metadata: { utilizationPercent: 91 },
  },
]

const ERROR_TEMPLATES: EventTemplate[] = [
  {
    eventType: 'connection.rejected',
    message: 'Client connection rejected: no pool slots available',
    component: 'connection_pool',
    host: 'checkout-api-2',
  },
  {
    eventType: 'postgres.too_many_connections',
    message: 'FATAL: sorry, too many clients already',
    component: 'postgres',
    metadata: { sqlState: '53300' },
  },
  {
    eventType: 'pgbouncer.client_login_failed',
    message: 'PgBouncer client login failed due to backend exhaustion',
    component: 'pgbouncer',
  },
  {
    eventType: 'connection.timeout',
    message: 'Connection attempt timed out after retry budget exhausted',
    component: 'monitoring',
    metadata: { retryAttempts: 3 },
  },
]

/**
 * Incident narrative shape over the last 24h (oldest -> newest):
 * - Hours 0-5: healthy baseline
 * - Hours 6-9: warning signals build up
 * - Hours 10-14: service degradation and peak failures
 * - Hours 15-17: mitigation in progress
 * - Hours 18-21: mostly recovered with residual warnings
 * - Hours 22-23: healthy closeout
 */
function getHourlySeverityWeights(hourIndex: number): HourlySeverityWeights {
  if (hourIndex < 6) return { info: 95, warning: 5, error: 0 }
  if (hourIndex < 10) return { info: 72, warning: 24, error: 4 }
  if (hourIndex < 13) return { info: 40, warning: 38, error: 22 }
  if (hourIndex < 15) return { info: 22, warning: 33, error: 45 }
  if (hourIndex < 18) return { info: 56, warning: 32, error: 12 }
  if (hourIndex < 22) return { info: 80, warning: 17, error: 3 }
  return { info: 94, warning: 6, error: 0 }
}

function pickSeverity(stepIndex: number, hourIndex: number): PostgresLogSeverity {
  const weights = getHourlySeverityWeights(hourIndex)
  const warningThreshold = weights.info + weights.warning
  const score = (stepIndex * 17 + hourIndex * 29) % 100
  if (score < weights.info) return 'info'
  if (score < warningThreshold) return 'warning'
  return 'error'
}

function hashToInt(seedA: number, seedB: number, seedC = 0): number {
  const value = (seedA * 73_856_093) ^ (seedB * 19_349_663) ^ (seedC * 83_492_791)
  return Math.abs(value)
}

function getRandomizedIntervalMs(hourIndex: number, sequenceInHour: number): number {
  const baseIndex = hashToInt(hourIndex, sequenceInHour) % BASE_INTERVAL_OPTIONS_MS.length
  const base = BASE_INTERVAL_OPTIONS_MS[baseIndex]
  const jitterSeconds = (hashToInt(hourIndex, sequenceInHour, 11) % 7) - 3 // -3..+3s
  return Math.max(15_000, base + jitterSeconds * 1_000)
}

/** Aligns to UTC minute boundary; matches log generator `endMs` so scenarios line up with the 24h window. */
export function alignToMinute(ms: number): number {
  return Math.floor(ms / 60_000) * 60_000
}

/** Maintenance audit + post-maintenance surge start this many minutes before the aligned window end. */
export const MAINTENANCE_SCENARIO_MINUTES_BEFORE_END = 3

export function getMaintenanceScenarioAppliedMs(anchor: Date): number {
  const endMs = alignToMinute(anchor.getTime())
  return endMs - MAINTENANCE_SCENARIO_MINUTES_BEFORE_END * 60 * 1000
}

type PostMaintTemplate = {
  eventType: string
  message: string
  component: PostgresServiceEventLog['component']
  host?: string
  severity: PostgresLogSeverity
  metadata?: Record<string, unknown>
}

const POST_MAINTENANCE_TEMPLATES: PostMaintTemplate[] = [
  {
    severity: 'warning',
    eventType: 'service.post_maintenance_slow_start',
    message: 'Primary node slow to accept connections after maintenance restart',
    component: 'postgres',
    metadata: { phase: 'post_maintenance', warmUpSeconds: 42 },
  },
  {
    severity: 'error',
    eventType: 'connection.rejected',
    message: 'Client connection rejected: no pool slots available (post-maintenance surge)',
    component: 'connection_pool',
    host: 'checkout-api-1',
    metadata: { phase: 'post_maintenance' },
  },
  {
    severity: 'warning',
    eventType: 'replication.lag_high',
    message: 'Standby replication lag exceeded warning threshold while catching up after maintenance',
    component: 'replication',
    metadata: { lagMb: 512, phase: 'post_maintenance' },
  },
  {
    severity: 'error',
    eventType: 'postgres.too_many_connections',
    message: 'FATAL: sorry, too many clients already (observed after maintenance recycle)',
    component: 'postgres',
    metadata: { sqlState: '53300', phase: 'post_maintenance' },
  },
  {
    severity: 'warning',
    eventType: 'pgbouncer.pool_wait_timeout',
    message: 'PgBouncer pool wait timeout exceeded following maintenance traffic spike',
    component: 'pgbouncer',
    metadata: { waitTimeoutMs: 5000, phase: 'post_maintenance' },
  },
  {
    severity: 'warning',
    eventType: 'connection.pool_saturation',
    message: 'Connection pool utilization sustained above 95% after maintenance window',
    component: 'connection_pool',
    metadata: { utilizationPercent: 97, phase: 'post_maintenance' },
  },
  {
    severity: 'error',
    eventType: 'pgbouncer.client_login_failed',
    message: 'PgBouncer client login failed due to backend exhaustion after node restart',
    component: 'pgbouncer',
    metadata: { phase: 'post_maintenance' },
  },
  {
    severity: 'warning',
    eventType: 'query.slow',
    message: 'Observed sustained slow queries above 1.8s p95 after maintenance',
    component: 'monitoring',
    metadata: { p95Ms: 2100, phase: 'post_maintenance' },
  },
  {
    severity: 'error',
    eventType: 'connection.timeout',
    message: 'Connection attempt timed out after retry budget exhausted (post-maintenance)',
    component: 'monitoring',
    metadata: { retryAttempts: 3, phase: 'post_maintenance' },
  },
  {
    severity: 'warning',
    eventType: 'service.degraded',
    message: 'Service health state changed from healthy to degraded after maintenance completed',
    component: 'service_health',
    metadata: { healthState: 'degraded', phase: 'post_maintenance' },
  },
  {
    severity: 'info',
    eventType: 'service.health_check_passed',
    message: 'Intermittent health check passed (recovery in progress)',
    component: 'service_health',
    metadata: { phase: 'post_maintenance' },
  },
]

/**
 * Dense warning/error service events from shortly after maintenance through "now",
 * for the "maintenance applied → degradation" demo when merged into the log table.
 */
export function createPostMaintenanceDegradationSurge(anchor: Date): PostgresServiceEventLog[] {
  const maintenanceAppliedMs = getMaintenanceScenarioAppliedMs(anchor)
  const surgeStartMs = maintenanceAppliedMs + 2 * 60 * 1000
  const surgeEndMs = anchor.getTime() - 8_000
  if (surgeEndMs <= surgeStartMs) return []

  const logs: PostgresServiceEventLog[] = []
  let t = surgeStartMs
  let i = 0
  while (t < surgeEndMs && i < 90) {
    const tmpl = POST_MAINTENANCE_TEMPLATES[i % POST_MAINTENANCE_TEMPLATES.length]
    const jitter = ((i * 37) % 11) * 3_000
    logs.push({
      id: `checkout-pg-prod-post-maint-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(t + jitter).toISOString(),
      service: 'checkout-pg-prod',
      serviceType: 'postgresql',
      severity: tmpl.severity,
      eventType: tmpl.eventType,
      message: tmpl.message,
      component: tmpl.component,
      project: 'payments-prod',
      region: 'aws-eu-west-1',
      host: tmpl.host,
      metadata: {
        postMaintenanceSurge: true,
        ...tmpl.metadata,
      },
    })
    const step = 42_000 + (i % 8) * 9_000
    t += step
    i += 1
  }
  return logs
}

function pickTemplate(
  severity: PostgresLogSeverity,
  bucketIndex: number,
  entryIndex: number,
): EventTemplate {
  const templates =
    severity === 'error'
      ? ERROR_TEMPLATES
      : severity === 'warning'
      ? WARNING_TEMPLATES
      : INFO_TEMPLATES
  return templates[(bucketIndex + entryIndex) % templates.length]
}

export function createMockPostgresDegradationLogs(now = new Date()): PostgresServiceEventLog[] {
  const endMs = alignToMinute(now.getTime())
  const startMs = endMs - ONE_DAY_MS
  const logs: PostgresServiceEventLog[] = []

  let stepIndex = 0
  for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
    const hourStartMs = startMs + hourIndex * ONE_HOUR_MS
    const hourEndMs = Math.min(hourStartMs + ONE_HOUR_MS, endMs)
    let timestampMs = hourStartMs
    let sequenceInHour = 0
    while (timestampMs <= hourEndMs) {
      const severity = pickSeverity(stepIndex, hourIndex)
      const template = pickTemplate(severity, hourIndex, stepIndex)
      const globalIndex = logs.length + 1
      logs.push({
        id: `checkout-pg-prod-log-${String(globalIndex).padStart(5, '0')}`,
        timestamp: new Date(timestampMs).toISOString(),
        service: 'checkout-pg-prod',
        serviceType: 'postgresql',
        severity,
        eventType: template.eventType,
        message: template.message,
        component: template.component,
        project: 'payments-prod',
        region: 'aws-eu-west-1',
        host: template.host,
        metadata: {
          hourIndex,
          sequenceInHour,
          ...template.metadata,
        },
      })
      sequenceInHour += 1
      stepIndex += 1
      timestampMs += getRandomizedIntervalMs(hourIndex, sequenceInHour)
    }
  }

  return logs
}

export type SeverityBucket = {
  index: number
  startMs: number
  endMs: number
  total: number
  info: number
  warning: number
  error: number
}

export function buildLogHistogramBuckets(
  logs: PostgresServiceEventLog[],
  range: HistogramRange,
  bucketCount = DEFAULT_BUCKET_COUNT,
): { range: HistogramRange; buckets: SeverityBucket[] } {
  const { buckets, range: normalizedRange } = buildHistogramBuckets(
    logs.map((log) => ({ occurredAt: new Date(log.timestamp) })),
    bucketCount,
    range,
  )

  const severityByIndex: Record<number, { info: number; warning: number; error: number }> = {}
  for (const bucket of buckets) severityByIndex[bucket.index] = { info: 0, warning: 0, error: 0 }

  for (const log of logs) {
    const ts = Date.parse(log.timestamp)
    const bucket = buckets.find((b) => ts >= b.startMs && ts < b.endMs)
    if (!bucket) continue
    if (log.severity === 'error') severityByIndex[bucket.index].error += 1
    else if (log.severity === 'warning') severityByIndex[bucket.index].warning += 1
    else severityByIndex[bucket.index].info += 1
  }

  return {
    range: normalizedRange,
    buckets: buckets.map((bucket) => ({
      index: bucket.index,
      startMs: bucket.startMs,
      endMs: bucket.endMs,
      total: bucket.count,
      info: severityByIndex[bucket.index].info,
      warning: severityByIndex[bucket.index].warning,
      error: severityByIndex[bucket.index].error,
    })),
  }
}
