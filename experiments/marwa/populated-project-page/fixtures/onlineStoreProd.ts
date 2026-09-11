/**
 * Sole data source for the populated project-page pitch.
 * 52 services, 5 systems, planted issues — no API calls.
 */

export type ServiceTypeId =
  | 'postgresql'
  | 'kafka'
  | 'opensearch'
  | 'valkey'
  | 'clickhouse'
  | 'mysql'
  | 'grafana'

export type ServiceStatus = 'running' | 'rebuilding' | 'poweroff'

export type SystemId = 'checkout' | 'ingestion' | 'search' | 'analytics' | 'unassigned'

export type PlantedIssueKind =
  | 'critical'
  | 'eol'
  | 'maintenance'
  | 'failed-backup'
  | 'scheduled-deletion'

export type Service = {
  name: string
  type: ServiceTypeId
  typeLabel: string
  plan: string
  status: ServiceStatus
  storagePct: number
  cpuPct: number
  system: SystemId
  ageDays: number
  offLatestVersion: boolean
}

export type System = {
  id: SystemId
  name: string
  serviceCount: number
}

export type PlantedIssue = {
  id: string
  kind: PlantedIssueKind
  serviceName: string
  system: SystemId
  summary: string
  started: string
}

export type ActivityEvent = {
  id: string
  change: string
  resource: string
  actor: string
  when: string
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export type Solution = {
  id: string
  name: string
  description: string
}

export type ArchitectureSnapshot = {
  connectedSystems: number
  connections: number
}

export type OnlineStoreProdFixture = {
  project: {
    name: 'online-store-prod'
    description: string
    orgName: string
    appsCount: 8
    agentsCount: 4
  }
  systems: System[]
  services: Service[]
  issues: PlantedIssue[]
  activity: ActivityEvent[]
  /** Empty → LHF hides the Solutions module. */
  solutions: Solution[]
  /** Null → LHF hides the Architecture module. */
  architecture: ArchitectureSnapshot | null
  spend: {
    monthToDateUsd: number
    forecastUsd: number
    /** Mocked monthly budget. Full design warns when forecast exceeds this. */
    budgetUsd: number
  }
  storage: {
    usedTb: number
    totalTb: number
  }
  offLatestVersionCount: number
}

const TYPE_QUOTAS: { type: ServiceTypeId; label: string; short: string; count: number }[] = [
  { type: 'postgresql', label: 'PostgreSQL', short: 'pg', count: 18 },
  { type: 'kafka', label: 'Apache Kafka', short: 'kafka', count: 12 },
  { type: 'opensearch', label: 'OpenSearch', short: 'os', count: 9 },
  { type: 'valkey', label: 'Valkey', short: 'valkey', count: 7 },
  { type: 'clickhouse', label: 'ClickHouse', short: 'ch', count: 4 },
  { type: 'mysql', label: 'MySQL', short: 'mysql', count: 1 },
  { type: 'grafana', label: 'Grafana', short: 'grafana', count: 1 },
]

const SYSTEM_QUOTAS: System[] = [
  { id: 'checkout', name: 'Checkout', serviceCount: 9 },
  { id: 'ingestion', name: 'Ingestion', serviceCount: 12 },
  { id: 'search', name: 'Search', serviceCount: 7 },
  { id: 'analytics', name: 'Analytics', serviceCount: 14 },
  { id: 'unassigned', name: 'Unassigned', serviceCount: 10 },
]

const PLANS = ['Hobbyist', 'Startup-4', 'Business-4', 'Business-16', 'Premium-32'] as const

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function buildServices(): Service[] {
  const systemSlots: SystemId[] = SYSTEM_QUOTAS.flatMap((system) =>
    Array.from({ length: system.serviceCount }, () => system.id),
  )
  let slot = 0
  const services: Service[] = []

  for (const quota of TYPE_QUOTAS) {
    for (let i = 1; i <= quota.count; i += 1) {
      const n = services.length
      services.push({
        name: `${quota.short}-${pad(i)}`,
        type: quota.type,
        typeLabel: quota.label,
        plan: PLANS[n % PLANS.length],
        status: n % 17 === 0 ? 'rebuilding' : n % 23 === 0 ? 'poweroff' : 'running',
        storagePct: 28 + ((n * 7) % 62),
        cpuPct: 12 + ((n * 11) % 68),
        system: systemSlots[slot] ?? 'unassigned',
        ageDays: 14 + ((n * 13) % 420),
        offLatestVersion: false,
      })
      slot += 1
    }
  }

  return services
}

const ISSUE_STARTED = [
  '8 mins ago',
  '12 mins ago',
  '18 mins ago',
  '42 mins ago',
  '1 hour ago',
  '2 hours ago',
  '3 hours ago',
  '5 hours ago',
  'Yesterday',
  'Yesterday',
  '2 days ago',
  '2 days ago',
  '3 days ago',
  '4 days ago',
  '5 days ago',
  '1 week ago',
]

/** Formula cpuPct maxes at 79 — plant a few saturated and idle services for Capacity hotspots. */
function plantCapacity(services: Service[]): void {
  const saturated = [4, 12, 19, 41] as const
  const idle = [7, 22, 38, 48] as const
  saturated.forEach((index, n) => {
    services[index].cpuPct = 91 + n * 2
  })
  idle.forEach((index, n) => {
    services[index].cpuPct = 6 + n
  })
}

function plantIssues(services: Service[]): PlantedIssue[] {
  const issues: PlantedIssue[] = []
  const take = (start: number, count: number) => services.slice(start, start + count)
  const nextStarted = () => ISSUE_STARTED[issues.length] ?? '1 week ago'

  take(0, 2).forEach((service, i) => {
    issues.push({
      id: `critical-${i + 1}`,
      kind: 'critical',
      serviceName: service.name,
      system: service.system,
      summary: 'Service unavailable — replica lag exceeded threshold',
      started: nextStarted(),
    })
  })

  take(2, 6).forEach((service, i) => {
    service.offLatestVersion = true
    issues.push({
      id: `eol-${i + 1}`,
      kind: 'eol',
      serviceName: service.name,
      system: service.system,
      summary: 'Version reaches end of life in under 30 days',
      started: nextStarted(),
    })
  })

  take(8, 3).forEach((service, i) => {
    issues.push({
      id: `maint-${i + 1}`,
      kind: 'maintenance',
      serviceName: service.name,
      system: service.system,
      summary: 'Maintenance window scheduled this week',
      started: nextStarted(),
    })
  })

  take(11, 3).forEach((service, i) => {
    issues.push({
      id: `backup-${i + 1}`,
      kind: 'failed-backup',
      serviceName: service.name,
      system: service.system,
      summary: 'Latest backup failed',
      started: nextStarted(),
    })
  })

  take(14, 2).forEach((service, i) => {
    issues.push({
      id: `delete-${i + 1}`,
      kind: 'scheduled-deletion',
      serviceName: service.name,
      system: service.system,
      summary: 'Scheduled for deletion',
      started: nextStarted(),
    })
  })

  take(20, 5).forEach((service) => {
    service.offLatestVersion = true
  })

  return issues
}

function buildActivity(services: Service[]): ActivityEvent[] {
  const pg = services.find((s) => s.type === 'postgresql')?.name ?? 'pg-01'
  const kafka = services.find((s) => s.type === 'kafka')?.name ?? 'kafka-01'
  const os = services.find((s) => s.type === 'opensearch')?.name ?? 'os-01'
  const ch = services.find((s) => s.type === 'clickhouse')?.name ?? 'ch-01'

  return [
    { id: 'a1', change: 'Deployment completed', resource: 'Storefront API', actor: 'CI deployment', when: '8 mins ago', variant: 'success' },
    { id: 'a2', change: 'High query latency detected', resource: pg, actor: 'Monitoring', when: '12 mins ago', variant: 'error' },
    { id: 'a3', change: 'Schema migrated', resource: pg, actor: 'Elena Ivanova', when: '42 mins ago', variant: 'default' },
    { id: 'a4', change: 'Topic partition reassigned', resource: kafka, actor: 'Jake Sullivan', when: '1 hour ago', variant: 'info' },
    { id: 'a5', change: 'Index rebuilt', resource: os, actor: 'CI deployment', when: '2 hours ago', variant: 'success' },
    { id: 'a6', change: 'Disk usage above 85%', resource: os, actor: 'Monitoring', when: '3 hours ago', variant: 'warning' },
    { id: 'a7', change: 'Integration connected', resource: `${kafka} → ${ch}`, actor: 'Maria Pereira', when: 'Yesterday', variant: 'default' },
    { id: 'a8', change: 'Agent updated', resource: 'Support triage agent', actor: 'Jake Sullivan', when: 'Yesterday', variant: 'info' },
  ]
}

function buildFixture(): OnlineStoreProdFixture {
  const typeTotal = TYPE_QUOTAS.reduce((sum, row) => sum + row.count, 0)
  const systemTotal = SYSTEM_QUOTAS.reduce((sum, row) => sum + row.serviceCount, 0)
  if (typeTotal !== 52 || systemTotal !== 52) {
    throw new Error(`Fixture quotas must sum to 52 (types=${typeTotal}, systems=${systemTotal})`)
  }

  const services = buildServices()
  plantCapacity(services)
  const issues = plantIssues(services)
  const activity = buildActivity(services)

  const kindCount = (kind: PlantedIssueKind) => issues.filter((issue) => issue.kind === kind).length
  if (
    kindCount('critical') !== 2 ||
    kindCount('eol') !== 6 ||
    kindCount('maintenance') !== 3 ||
    kindCount('failed-backup') !== 3 ||
    kindCount('scheduled-deletion') !== 2
  ) {
    throw new Error('Planted issue counts do not match the brief')
  }

  return {
    project: {
      name: 'online-store-prod',
      description: 'Build and operate your application, data and agents in one project.',
      orgName: 'Aiven',
      appsCount: 8,
      agentsCount: 4,
    },
    systems: SYSTEM_QUOTAS,
    services,
    issues,
    activity,
    solutions: [],
    architecture: null,
    spend: {
      monthToDateUsd: 12840,
      forecastUsd: 15420,
      budgetUsd: 14000,
    },
    storage: {
      usedTb: 18.4,
      totalTb: 42,
    },
    offLatestVersionCount: services.filter((service) => service.offLatestVersion).length,
  }
}

export const onlineStoreProd: OnlineStoreProdFixture = buildFixture()
