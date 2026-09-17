import type {
  ActivityEvent,
  OnlineStoreProdFixture,
  PlantedIssueKind,
  Service,
} from './fixtures/onlineStoreProd'

export type AttentionSeverity = 'danger' | 'warning' | 'info'

export type AttentionRow = {
  id: string
  title: string
  serviceNames: string
  systemNames: string
  severity: AttentionSeverity
  severityLabel: string
  started: string
  kind: PlantedIssueKind
  /** Resolved for the issue detail drawer — undefined if the service is outside this scope. */
  service?: Service
  impact: string
  nextStep: string
}

export const KIND_SEVERITY: Record<PlantedIssueKind, AttentionSeverity> = {
  critical: 'danger',
  eol: 'warning',
  maintenance: 'warning',
  'failed-backup': 'warning',
  'scheduled-deletion': 'info',
}

const KIND_LABEL: Record<PlantedIssueKind, string> = {
  critical: 'critical',
  eol: 'warning',
  maintenance: 'warning',
  'failed-backup': 'warning',
  'scheduled-deletion': 'info',
}

const KIND_IMPACT: Record<PlantedIssueKind, string> = {
  critical: 'Reads and writes are failing for clients connected to this service.',
  eol: 'Security patches stop once the version reaches end of life.',
  maintenance: 'A short failover is expected during the maintenance window.',
  'failed-backup': 'The latest recovery point is older than your backup policy allows.',
  'scheduled-deletion': 'The service and its backups are removed on the deletion date.',
}

const KIND_NEXT_STEP: Record<PlantedIssueKind, string> = {
  critical: 'Check replica lag, then fail over to a healthy node.',
  eol: 'Schedule a version upgrade before the end-of-life date.',
  maintenance: 'Move the window to off-peak hours, or apply it now.',
  'failed-backup': 'Re-run the backup and check storage headroom.',
  'scheduled-deletion': 'Cancel the deletion if this service is still needed.',
}

const SEVERITY_RANK: Record<AttentionSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
}

export function needsAttentionCount(fixture: OnlineStoreProdFixture): number {
  return fixture.issues.length
}

export type AttentionSeverityCounts = Record<AttentionSeverity | 'all', number>

export function attentionSeverityCounts(fixture: OnlineStoreProdFixture): AttentionSeverityCounts {
  const counts: AttentionSeverityCounts = { all: fixture.issues.length, danger: 0, warning: 0, info: 0 }
  for (const issue of fixture.issues) {
    counts[KIND_SEVERITY[issue.kind]] += 1
  }
  return counts
}

/** One row per issue in this project, ordered by severity. */
export function topAttentionIssues(
  fixture: OnlineStoreProdFixture,
  severity: AttentionSeverity | 'all' = 'all',
): AttentionRow[] {
  return fixture.issues
    .filter((issue) => severity === 'all' || KIND_SEVERITY[issue.kind] === severity)
    .map((issue) => {
      const systemName = fixture.systems.find((system) => system.id === issue.system)?.name ?? issue.system
      return {
        id: issue.id,
        title: issue.summary,
        serviceNames: issue.serviceName,
        systemNames: systemName,
        severity: KIND_SEVERITY[issue.kind],
        severityLabel: KIND_LABEL[issue.kind],
        started: issue.started,
        kind: issue.kind,
        service: fixture.services.find((service) => service.name === issue.serviceName),
        impact: KIND_IMPACT[issue.kind],
        nextStep: KIND_NEXT_STEP[issue.kind],
      }
    })
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
}

const ACTIVITY_SEVERITY_RANK: Record<ActivityEvent['variant'], number> = {
  error: 0,
  warning: 1,
  default: 2,
  info: 3,
  success: 4,
}

export function latestActivity(fixture: OnlineStoreProdFixture, limit = 5): ActivityEvent[] {
  return fixture.activity.slice(0, limit)
}

/** LHF: exception-first — errors, then warnings. Success/info/default stay out. */
export function criticalActivity(fixture: OnlineStoreProdFixture, limit = 5): ActivityEvent[] {
  return fixture.activity
    .filter((event) => event.variant === 'error' || event.variant === 'warning')
    .sort((a, b) => ACTIVITY_SEVERITY_RANK[a.variant] - ACTIVITY_SEVERITY_RANK[b.variant])
    .slice(0, limit)
}
