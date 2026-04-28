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

type BucketPlan = {
  total: number
  info: number
  warning: number
  error: number
}

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * ONE_HOUR_MS
const DEFAULT_BUCKET_COUNT = 12

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
function getHourlyPlan(hourIndex: number): BucketPlan {
  if (hourIndex < 6) return { total: 3, info: 3, warning: 0, error: 0 }
  if (hourIndex < 10) return { total: 5, info: 3, warning: 2, error: 0 }
  if (hourIndex < 13) return { total: 8, info: 2, warning: 4, error: 2 }
  if (hourIndex < 15) return { total: 10, info: 1, warning: 4, error: 5 }
  if (hourIndex < 18) return { total: 7, info: 3, warning: 3, error: 1 }
  if (hourIndex < 22) return { total: 4, info: 3, warning: 1, error: 0 }
  return { total: 3, info: 3, warning: 0, error: 0 }
}

function alignToMinute(ms: number): number {
  return Math.floor(ms / 60_000) * 60_000
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

  for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
    const bucketStart = startMs + hourIndex * ONE_HOUR_MS
    const plan = getHourlyPlan(hourIndex)

    const severities: PostgresLogSeverity[] = [
      ...Array.from({ length: plan.info }, () => 'info' as const),
      ...Array.from({ length: plan.warning }, () => 'warning' as const),
      ...Array.from({ length: plan.error }, () => 'error' as const),
    ]

    severities.forEach((severity, entryIndex) => {
      const position = (entryIndex + 1) / (plan.total + 1)
      const timestampMs = bucketStart + Math.floor(position * ONE_HOUR_MS)
      const template = pickTemplate(severity, hourIndex, entryIndex)
      const globalIndex = logs.length + 1
      logs.push({
        id: `checkout-pg-prod-log-${String(globalIndex).padStart(3, '0')}`,
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
          ...template.metadata,
        },
      })
    })
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
