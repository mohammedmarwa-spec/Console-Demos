/**
 * Org-level mock: 52 services across 3 projects (Production / Staging / Development).
 * The pitch page is scoped to one project at a time — Console never mixes environments on one dashboard.
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

export type EnvironmentId = 'production' | 'staging' | 'development'

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
  environment: EnvironmentId
  ageDays: number
  offLatestVersion: boolean
}

export type System = {
  id: SystemId
  name: string
  serviceCount: number
}

export type Environment = {
  id: EnvironmentId
  name: string
  serviceCount: number
}

export type PlantedIssue = {
  id: string
  kind: PlantedIssueKind
  serviceName: string
  system: SystemId
  environment: EnvironmentId
  summary: string
  started: string
}

export type ActivityEvent = {
  id: string
  change: string
  resource: string
  environment: EnvironmentId
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
    /** Named per environment — `scopeToEnvironment` swaps in the sibling project's name. */
    name: string
    description: string
    orgName: string
    appsCount: 8
    agentsCount: 4
  }
  systems: System[]
  environments: Environment[]
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

export const ENVIRONMENT_QUOTAS: Environment[] = [
  { id: 'production', name: 'Production', serviceCount: 32 },
  { id: 'staging', name: 'Staging', serviceCount: 12 },
  { id: 'development', name: 'Development', serviceCount: 8 },
]

export const ENVIRONMENT_LABEL: Record<EnvironmentId, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
}

export const ENVIRONMENT_ORDER: EnvironmentId[] = ['production', 'staging', 'development']

export function environmentProjectLabel(id: EnvironmentId): string {
  return `Project: ${ENVIRONMENT_LABEL[id]}`
}

const PLANS = ['Hobbyist', 'Startup-4', 'Business-4', 'Business-16', 'Premium-32'] as const

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function buildServices(): Service[] {
  const systemSlots: SystemId[] = SYSTEM_QUOTAS.flatMap((system) =>
    Array.from({ length: system.serviceCount }, () => system.id),
  )
  const environmentSlots: EnvironmentId[] = ENVIRONMENT_QUOTAS.flatMap((environment) =>
    Array.from({ length: environment.serviceCount }, () => environment.id),
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
        environment: environmentSlots[slot] ?? 'production',
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
  const byEnv = (id: EnvironmentId) => services.filter((service) => service.environment === id)
  const production = byEnv('production')
  const staging = byEnv('staging')
  const development = byEnv('development')
  const nextStarted = () => ISSUE_STARTED[issues.length] ?? '1 week ago'

  const push = (kind: PlantedIssueKind, service: Service, summary: string, id: string) => {
    issues.push({
      id,
      kind,
      serviceName: service.name,
      system: service.system,
      environment: service.environment,
      summary,
      started: nextStarted(),
    })
  }

  production.slice(0, 2).forEach((service, i) => {
    push('critical', service, 'Service unavailable — replica lag exceeded threshold', `critical-${i + 1}`)
  })

  production.slice(2, 3).forEach((service, i) => {
    service.offLatestVersion = true
    push('eol', service, 'Version reaches end of life in under 30 days', `eol-${i + 1}`)
  })

  production.slice(8, 9).forEach((service, i) => {
    push('maintenance', service, 'Maintenance window scheduled this week', `maint-prod-${i + 1}`)
  })
  staging.slice(0, 2).forEach((service, i) => {
    push('maintenance', service, 'Maintenance window scheduled this week', `maint-stg-${i + 1}`)
  })

  staging.slice(2, 5).forEach((service, i) => {
    push('failed-backup', service, 'Latest backup failed', `backup-${i + 1}`)
  })

  development.slice(0, 2).forEach((service, i) => {
    push('scheduled-deletion', service, 'Scheduled for deletion', `delete-${i + 1}`)
  })

  staging.slice(5, 6).forEach((service) => {
    service.offLatestVersion = true
  })

  return issues
}

function buildActivity(services: Service[]): ActivityEvent[] {
  const pg = services.find((s) => s.environment === 'production' && s.type === 'postgresql')?.name ?? 'pg-01'
  const kafka = services.find((s) => s.environment === 'production' && s.type === 'kafka')?.name ?? 'kafka-01'
  const os = services.find((s) => s.environment === 'production' && s.type === 'opensearch')?.name ?? 'os-01'
  const stagingOs = services.find((s) => s.environment === 'staging' && s.type === 'opensearch')?.name ?? 'os-03'
  const stagingValkey = services.find((s) => s.environment === 'staging' && s.type === 'valkey')?.name ?? 'valkey-01'
  const devCh = services.find((s) => s.environment === 'development' && s.type === 'clickhouse')?.name ?? 'ch-01'
  const storefront = 'Storefront API'

  return [
    { id: 'a1', change: 'High query latency detected', resource: pg, environment: 'production', actor: 'Monitoring', when: '8 mins ago', variant: 'error' },
    { id: 'a2', change: 'Disk usage above 85%', resource: os, environment: 'production', actor: 'Monitoring', when: '12 mins ago', variant: 'warning' },
    { id: 'a3', change: 'Deployment completed', resource: storefront, environment: 'production', actor: 'CI deployment', when: '42 mins ago', variant: 'success' },
    { id: 'a4', change: 'Topic partition reassigned', resource: kafka, environment: 'production', actor: 'Jake Sullivan', when: '1 hour ago', variant: 'info' },
    { id: 'a5', change: 'Agent updated', resource: 'Support triage agent', environment: 'production', actor: 'Jake Sullivan', when: '2 hours ago', variant: 'info' },
    { id: 'a6', change: 'Latest backup failed', resource: stagingOs, environment: 'staging', actor: 'Monitoring', when: '3 hours ago', variant: 'warning' },
    { id: 'a7', change: 'Index rebuilt', resource: stagingOs, environment: 'staging', actor: 'Elena Ivanova', when: 'Yesterday', variant: 'default' },
    { id: 'a8', change: 'Plan changed', resource: devCh, environment: 'development', actor: 'CI deployment', when: 'Yesterday', variant: 'success' },
    { id: 'a9', change: 'Integration connected', resource: `${stagingOs} → ${stagingValkey}`, environment: 'staging', actor: 'Maria Pereira', when: '2 days ago', variant: 'default' },
  ]
}

const PROJECT_BY_ENV: Record<EnvironmentId, Pick<OnlineStoreProdFixture['project'], 'name'>> = {
  production: { name: 'online-store-prod' },
  staging: { name: 'online-store-staging' },
  development: { name: 'online-store-dev' },
}

/** One Console project = one environment. The project page never mixes sibling env projects. */
export function scopeToEnvironment(
  fixture: OnlineStoreProdFixture,
  env: EnvironmentId,
): OnlineStoreProdFixture {
  const services = fixture.services.filter((service) => service.environment === env)
  const issues = fixture.issues.filter((issue) => issue.environment === env)
  const activity = fixture.activity.filter((event) => event.environment === env)
  const systems = fixture.systems
    .map((system) => ({
      ...system,
      serviceCount: services.filter((service) => service.system === system.id).length,
    }))
    .filter((system) => system.serviceCount > 0)

  return {
    ...fixture,
    project: {
      ...fixture.project,
      name: PROJECT_BY_ENV[env].name,
    },
    services,
    issues,
    activity,
    systems,
    environments: fixture.environments.filter((environment) => environment.id === env),
    offLatestVersionCount: services.filter((service) => service.offLatestVersion).length,
  }
}

function buildFixture(): OnlineStoreProdFixture {
  const typeTotal = TYPE_QUOTAS.reduce((sum, row) => sum + row.count, 0)
  const systemTotal = SYSTEM_QUOTAS.reduce((sum, row) => sum + row.serviceCount, 0)
  const envTotal = ENVIRONMENT_QUOTAS.reduce((sum, row) => sum + row.serviceCount, 0)
  if (typeTotal !== 52 || systemTotal !== 52 || envTotal !== 52) {
    throw new Error(`Fixture quotas must sum to 52 (types=${typeTotal}, systems=${systemTotal}, envs=${envTotal})`)
  }

  const services = buildServices()
  plantCapacity(services)
  const issues = plantIssues(services)
  const activity = buildActivity(services)

  const kindCount = (kind: PlantedIssueKind) => issues.filter((issue) => issue.kind === kind).length
  if (
    kindCount('critical') !== 2 ||
    kindCount('eol') !== 1 ||
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
    environments: ENVIRONMENT_QUOTAS,
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

const onlineStoreOrg: OnlineStoreProdFixture = buildFixture()

/** Pitch dashboard: Production project only. Staging / Development are separate projects. */
export const onlineStoreProd: OnlineStoreProdFixture = scopeToEnvironment(onlineStoreOrg, 'production')
