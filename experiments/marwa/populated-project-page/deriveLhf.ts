import type {
  ActivityEvent,
  OnlineStoreProdFixture,
  PlantedIssueKind,
  Service,
  ServiceStatus,
  ServiceTypeId,
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
}

export type ServiceTypeGroup = {
  type: ServiceTypeId
  label: string
  services: Service[]
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

/** Group same-kind issues, order by severity (deletion = info), take top 5. */
export function topAttentionIssues(
  fixture: OnlineStoreProdFixture,
  limit = 5,
  severity: AttentionSeverity | 'all' = 'all',
): AttentionRow[] {
  const groups = new Map<PlantedIssueKind, AttentionRow>()

  for (const issue of fixture.issues) {
    const systemName = fixture.systems.find((system) => system.id === issue.system)?.name ?? issue.system
    const existing = groups.get(issue.kind)
    if (existing) {
      existing.serviceNames = `${existing.serviceNames}, ${issue.serviceName}`
      if (!existing.systemNames.split(', ').includes(systemName)) {
        existing.systemNames = `${existing.systemNames}, ${systemName}`
      }
      continue
    }
    groups.set(issue.kind, {
      id: issue.id,
      title: issue.summary,
      serviceNames: issue.serviceName,
      systemNames: systemName,
      severity: KIND_SEVERITY[issue.kind],
      severityLabel: KIND_LABEL[issue.kind],
      started: issue.started,
    })
  }

  return [...groups.values()]
    .filter((row) => severity === 'all' || row.severity === severity)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, limit)
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

export function filterServices(
  services: Service[],
  query: string,
  type: ServiceTypeId | 'all',
): Service[] {
  const needle = query.trim().toLowerCase()
  return services.filter((service) => {
    if (type !== 'all' && service.type !== type) return false
    if (!needle) return true
    return (
      service.name.toLowerCase().includes(needle) ||
      service.typeLabel.toLowerCase().includes(needle) ||
      service.plan.toLowerCase().includes(needle)
    )
  })
}

export function groupServicesByType(services: Service[]): ServiceTypeGroup[] {
  const groups = new Map<ServiceTypeId, ServiceTypeGroup>()
  for (const service of services) {
    const existing = groups.get(service.type)
    if (existing) {
      existing.services.push(service)
    } else {
      groups.set(service.type, {
        type: service.type,
        label: service.typeLabel,
        services: [service],
      })
    }
  }
  return [...groups.values()]
}

export function statusChip(status: ServiceStatus): { text: string; status: 'success' | 'info' | 'neutral' } {
  if (status === 'running') return { text: 'running', status: 'success' }
  if (status === 'rebuilding') return { text: 'rebuilding', status: 'info' }
  return { text: 'powered off', status: 'neutral' }
}

export const SERVICE_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'kafka', label: 'Apache Kafka' },
  { value: 'opensearch', label: 'OpenSearch' },
  { value: 'valkey', label: 'Valkey' },
  { value: 'clickhouse', label: 'ClickHouse' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'grafana', label: 'Grafana' },
] as const
