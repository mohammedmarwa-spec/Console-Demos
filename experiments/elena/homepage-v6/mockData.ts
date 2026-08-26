import type { ServiceTypeId } from '@experiments/_shared/lib/serviceTypes'
import { projectPageData } from '@experiments/elena/project-page/mockData'

export type HomeProjectTag = 'prod' | 'staging' | 'dev'

export type HomeProject = {
  id: string
  name: string
  serviceCount: number
  tag: HomeProjectTag
}

export type HomeEnvironment = 'production' | 'development'

export type HomeNodeStatus = 'healthy' | 'degraded' | 'down'

export type HomeMaintenanceWindowState = 'configured' | 'needs_review'

export type HomeVersionEolState = 'supported' | 'approaching_eol' | 'eol'

export type HomeServiceRow = {
  id: string
  serviceName: string
  serviceTypeId: ServiceTypeId
  status: 'Running' | 'Rebuilding' | 'Rebalancing'
  nodeStatus: HomeNodeStatus
  environment: HomeEnvironment
  hasAutomaticFailover: boolean
  isPubliclyAccessible: boolean
  hasAlertDestination: boolean
  isBackedUp: boolean
  maintenanceWindowState: HomeMaintenanceWindowState
  versionEolState: HomeVersionEolState
  maintenance: string
  alerts: string[]
  severity: 'warning' | 'danger'
}

export type HomePostureSignalId = 'failover' | 'public-access' | 'alerts' | 'backups' | 'maintenance' | 'eol'

export type HomePostureSignalTone = 'success' | 'warning' | 'danger'

export type HomePostureSignal = {
  id: HomePostureSignalId
  title: string
  coverage: string
  summary: string
  tone: HomePostureSignalTone
  affectedServiceIds: string[]
  fixLabel: string
  whyMatters: string
}

export type HomeScope = 'production' | 'all'

export type ReleaseNote = {
  id: string
  date: string
  tag: string
  title: string
  description: string
  href: string
}

const STORE_PROD = projectPageData.projectName

export const ORG_NAME = projectPageData.orgName
export const USER_NAME = 'Elena'
export const USER_INITIALS = 'EI'
export const PROJECT_HOME_ID = STORE_PROD

const ALERT_DETAILS: Record<string, Pick<HomeServiceRow, 'maintenance' | 'alerts' | 'severity'>> = {
  'pg-prod-01': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['Connection pool saturated', 'Replication lag above threshold'],
    severity: 'warning',
  },
  'kafka-events': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['Disk usage above 80%', 'Under-replicated partitions'],
    severity: 'warning',
  },
  'mysql-app': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['MySQL version approaching end of life'],
    severity: 'warning',
  },
  'opensearch-logs': {
    maintenance: 'Monday 01:00–05:00 UTC',
    alerts: ['Node restart required', 'Certificate expires in 14 days'],
    severity: 'danger',
  },
  'clickhouse-analytics': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['Disk usage above 80%', 'Query memory usage high'],
    severity: 'warning',
  },
  'pg-prod-01-replica': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['No alert destination configured'],
    severity: 'warning',
  },
}

const DISMISS_REASONS = [
  'Not relevant for this project',
  'Already tracked elsewhere',
  'Temporary environment',
  'Will fix later this quarter',
] as const

export const POSTURE_DISMISS_REASONS = DISMISS_REASONS

const STORE_PROD_POSTURE: Record<
  string,
  Pick<
    HomeServiceRow,
    | 'nodeStatus'
    | 'environment'
    | 'hasAutomaticFailover'
    | 'isPubliclyAccessible'
    | 'hasAlertDestination'
    | 'isBackedUp'
    | 'maintenanceWindowState'
    | 'versionEolState'
  >
> = {
  'pg-prod-01': {
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'kafka-events': {
    nodeStatus: 'degraded',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: true,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'mysql-app': {
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'approaching_eol',
  },
  'valkey-cache': {
    nodeStatus: 'healthy',
    environment: 'development',
    hasAutomaticFailover: false,
    isPubliclyAccessible: false,
    hasAlertDestination: false,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'opensearch-logs': {
    nodeStatus: 'degraded',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'needs_review',
    versionEolState: 'supported',
  },
  'clickhouse-analytics': {
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'grafana-dash': {
    nodeStatus: 'healthy',
    environment: 'development',
    hasAutomaticFailover: false,
    isPubliclyAccessible: true,
    hasAlertDestination: false,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'pg-prod-01-replica': {
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: false,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
}

export const PROJECTS: HomeProject[] = [
  {
    id: STORE_PROD,
    name: STORE_PROD,
    serviceCount: projectPageData.services.length,
    tag: 'prod',
  },
  { id: 'online-store-staging', name: 'online-store-staging', serviceCount: 3, tag: 'staging' },
  { id: 'online-store-dev', name: 'online-store-dev', serviceCount: 2, tag: 'dev' },
  { id: 'kafka-prod', name: 'kafka-prod', serviceCount: 3, tag: 'prod' },
  { id: 'pg-analytics', name: 'pg-analytics', serviceCount: 4, tag: 'staging' },
]

function buildStoreProdRows(): HomeServiceRow[] {
  return projectPageData.services.map((service) => {
    const details = ALERT_DETAILS[service.id] ?? {
      maintenance: 'Sunday 02:00–06:00 UTC',
      alerts: [],
      severity: 'warning' as const,
    }
    const posture = STORE_PROD_POSTURE[service.id]
    if (!posture) {
      throw new Error(`Missing posture mock for service ${service.id}`)
    }
    return {
      id: service.id,
      serviceName: service.serviceName,
      serviceTypeId: service.serviceTypeId,
      status: service.status === 'Rebuilding' ? 'Rebuilding' : 'Running',
      ...details,
      ...posture,
    }
  })
}

export const SERVICES_BY_PROJECT: Record<string, HomeServiceRow[]> = {
  [STORE_PROD]: buildStoreProdRows(),
  'kafka-prod': [
    {
      id: 'kafka-cluster',
      serviceName: 'kafka-cluster',
      serviceTypeId: 'kafka',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'production',
      hasAutomaticFailover: true,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 04:00–08:00 UTC',
      alerts: ['Under-replicated partitions'],
      severity: 'warning',
    },
    {
      id: 'kafka-ui',
      serviceName: 'kafka-ui',
      serviceTypeId: 'kafka',
      status: 'Running',
      nodeStatus: 'degraded',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: true,
      hasAlertDestination: false,
      isBackedUp: true,
      maintenanceWindowState: 'needs_review',
      versionEolState: 'approaching_eol',
      maintenance: 'Review required',
      alerts: ['Connector lag above threshold'],
      severity: 'warning',
    },
    {
      id: 'kafka-bridge',
      serviceName: 'kafka-bridge',
      serviceTypeId: 'kafka',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'production',
      hasAutomaticFailover: true,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Saturday 03:00–04:00 UTC',
      alerts: [],
      severity: 'warning',
    },
  ],
  'pg-analytics': [
    {
      id: 'analytics-pg',
      serviceName: 'analytics-pg',
      serviceTypeId: 'postgresql',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'production',
      hasAutomaticFailover: true,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 02:00–03:00 UTC',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'analytics-clickhouse',
      serviceName: 'analytics-clickhouse',
      serviceTypeId: 'clickhouse',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'production',
      hasAutomaticFailover: true,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 02:00–03:00 UTC',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'analytics-opensearch',
      serviceName: 'analytics-opensearch',
      serviceTypeId: 'opensearch',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Saturday 01:00–02:00 UTC',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'analytics-redis',
      serviceName: 'analytics-redis',
      serviceTypeId: 'redis',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'production',
      hasAutomaticFailover: true,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 03:00–04:00 UTC',
      alerts: [],
      severity: 'warning',
    },
  ],
  'online-store-staging': [
    {
      id: 'staging-pg',
      serviceName: 'staging-pg',
      serviceTypeId: 'postgresql',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 05:00–06:00 UTC',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'staging-kafka',
      serviceName: 'staging-kafka',
      serviceTypeId: 'kafka',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: false,
      hasAlertDestination: true,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 05:00–06:00 UTC',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'staging-redis',
      serviceName: 'staging-redis',
      serviceTypeId: 'redis',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: false,
      hasAlertDestination: false,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Sunday 05:00–06:00 UTC',
      alerts: [],
      severity: 'warning',
    },
  ],
  'online-store-dev': [
    {
      id: 'dev-pg',
      serviceName: 'dev-pg',
      serviceTypeId: 'postgresql',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: true,
      hasAlertDestination: false,
      isBackedUp: false,
      maintenanceWindowState: 'needs_review',
      versionEolState: 'supported',
      maintenance: 'Review required',
      alerts: [],
      severity: 'warning',
    },
    {
      id: 'dev-mysql',
      serviceName: 'dev-mysql',
      serviceTypeId: 'mysql',
      status: 'Running',
      nodeStatus: 'healthy',
      environment: 'development',
      hasAutomaticFailover: false,
      isPubliclyAccessible: false,
      hasAlertDestination: false,
      isBackedUp: true,
      maintenanceWindowState: 'configured',
      versionEolState: 'supported',
      maintenance: 'Weekdays 22:00–23:00 UTC',
      alerts: [],
      severity: 'warning',
    },
  ],
}

const PROJECT_PREVIEW_ICON_LIMIT = 5

export function getProjectPreviewServices(projectId: string, limit = PROJECT_PREVIEW_ICON_LIMIT): HomeServiceRow[] {
  const services = SERVICES_BY_PROJECT[projectId] ?? []
  const preview: HomeServiceRow[] = []
  const seenTypes = new Set<ServiceTypeId>()

  for (const service of services) {
    if (seenTypes.has(service.serviceTypeId)) continue
    seenTypes.add(service.serviceTypeId)
    preview.push(service)
    if (preview.length >= limit) break
  }

  return preview
}

export function getScopedServices(services: HomeServiceRow[], scope: HomeScope): HomeServiceRow[] {
  if (scope === 'all') return services
  return services.filter((service) => service.environment === 'production')
}

function toneFromGap(gap: number, total: number): HomePostureSignalTone {
  if (gap <= 0) return 'success'
  if (gap >= Math.ceil(total / 2)) return 'danger'
  return 'warning'
}

function countCopy(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function buildSignal({
  id,
  title,
  covered,
  total,
  summary,
  affectedServiceIds,
  fixLabel,
  whyMatters,
}: {
  id: HomePostureSignalId
  title: string
  covered: number
  total: number
  summary: string
  affectedServiceIds: string[]
  fixLabel: string
  whyMatters: string
}): HomePostureSignal {
  const gap = total - covered
  return {
    id,
    title,
    coverage: `${covered} of ${total}`,
    summary,
    tone: toneFromGap(gap, total),
    affectedServiceIds,
    fixLabel,
    whyMatters,
  }
}

export function getPostureSignals(services: HomeServiceRow[], scope: HomeScope): HomePostureSignal[] {
  const scopedServices = getScopedServices(services, scope)
  const total = scopedServices.length
  if (total === 0) return []

  const noFailover = scopedServices.filter((service) => !service.hasAutomaticFailover)
  const publicServices = scopedServices.filter((service) => service.isPubliclyAccessible)
  const missingDestinations = scopedServices.filter((service) => !service.hasAlertDestination)
  const notBackedUp = scopedServices.filter((service) => !service.isBackedUp)
  const maintenanceNeedsReview = scopedServices.filter((service) => service.maintenanceWindowState === 'needs_review')
  const eolServices = scopedServices.filter((service) => service.versionEolState !== 'supported')

  return [
    buildSignal({
      id: 'failover',
      title: 'Automatic failover',
      covered: total - noFailover.length,
      total,
      summary:
        noFailover.length === 0
          ? 'All services are protected by automatic failover.'
          : countCopy(
              noFailover.length,
              '1 service is missing automatic failover coverage.',
              `${noFailover.length} services are missing automatic failover coverage.`,
            ),
      affectedServiceIds: noFailover.map((service) => service.id),
      fixLabel: 'Review failover setup',
      whyMatters: 'Failover reduces incident blast radius and shortens recovery time during node or zone failures.',
    }),
    buildSignal({
      id: 'public-access',
      title: 'Public network exposure',
      covered: total - publicServices.length,
      total,
      summary:
        publicServices.length === 0
          ? 'No services are publicly accessible from any IP.'
          : countCopy(
              publicServices.length,
              '1 service is publicly accessible from any IP.',
              `${publicServices.length} services are publicly accessible from any IP.`,
            ),
      affectedServiceIds: publicServices.map((service) => service.id),
      fixLabel: 'Restrict public access',
      whyMatters: 'Public exposure expands attack surface and should be intentional, documented, and monitored.',
    }),
    buildSignal({
      id: 'alerts',
      title: 'Alert destination coverage',
      covered: total - missingDestinations.length,
      total,
      summary:
        missingDestinations.length === 0
          ? 'All services route alerts to at least one destination.'
          : countCopy(
              missingDestinations.length,
              '1 service has no alert destination configured.',
              `${missingDestinations.length} services have no alert destination configured.`,
            ),
      affectedServiceIds: missingDestinations.map((service) => service.id),
      fixLabel: 'Add alert destinations',
      whyMatters: 'Without destinations, alerts are invisible to responders and issues are detected too late.',
    }),
    buildSignal({
      id: 'backups',
      title: 'Backup coverage',
      covered: total - notBackedUp.length,
      total,
      summary:
        notBackedUp.length === 0
          ? 'All services are backed up.'
          : countCopy(
              notBackedUp.length,
              '1 service is not currently backed up.',
              `${notBackedUp.length} services are not currently backed up.`,
            ),
      affectedServiceIds: notBackedUp.map((service) => service.id),
      fixLabel: 'Enable backups',
      whyMatters: 'Backup coverage is a basic control for data durability and recovery from corruption or deletion.',
    }),
    buildSignal({
      id: 'maintenance',
      title: 'Maintenance window readiness',
      covered: total - maintenanceNeedsReview.length,
      total,
      summary:
        maintenanceNeedsReview.length === 0
          ? 'All services have a reviewed maintenance window.'
          : countCopy(
              maintenanceNeedsReview.length,
              '1 service needs maintenance window review.',
              `${maintenanceNeedsReview.length} services need maintenance window review.`,
            ),
      affectedServiceIds: maintenanceNeedsReview.map((service) => service.id),
      fixLabel: 'Review maintenance windows',
      whyMatters: 'Reviewed windows reduce the chance of disruptive maintenance during peak traffic.',
    }),
    buildSignal({
      id: 'eol',
      title: 'Version lifecycle readiness',
      covered: total - eolServices.length,
      total,
      summary:
        eolServices.length === 0
          ? 'All services are on supported versions.'
          : countCopy(
              eolServices.length,
              '1 service is approaching or beyond its version support window.',
              `${eolServices.length} services are approaching or beyond version support window.`,
            ),
      affectedServiceIds: eolServices.map((service) => service.id),
      fixLabel: 'Plan upgrades',
      whyMatters: 'Running supported versions keeps security updates and vendor support available.',
    }),
  ]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: 'pg-18',
    date: '12 Aug 2026',
    tag: 'PostgreSQL',
    title: 'PostgreSQL 18 is available on Aiven',
    description:
      'Create new PostgreSQL 18 services with improved query performance, better observability, and upgraded extensions. Existing services can plan an in-place upgrade when ready.',
    href: 'https://aiven.io/changelog',
  },
  {
    id: 'mcp-kafka',
    date: '8 Aug 2026',
    tag: 'Aiven MCP',
    title: 'Manage Kafka topics from Cursor and Claude Code',
    description:
      'Connect AI coding assistants to Kafka so you can list topics, inspect consumer groups, and apply configuration changes using natural language in your editor.',
    href: 'https://aiven.io/changelog',
  },
  {
    id: 'valkey-81',
    date: '1 Aug 2026',
    tag: 'Valkey',
    title: 'Valkey 8.1 with improved memory efficiency',
    description:
      'Valkey 8.1 reduces memory overhead for large key spaces and improves eviction behavior under pressure, which helps cache-heavy workloads stay predictable.',
    href: 'https://aiven.io/changelog',
  },
  {
    id: 'byoc',
    date: '24 Jul 2026',
    tag: 'BYOC',
    title: 'Bring your own cloud: faster custom-cloud onboarding',
    description:
      'Custom-cloud onboarding now completes with fewer manual steps, so teams can attach their own cloud accounts and start deploying services sooner.',
    href: 'https://aiven.io/changelog',
  },
]

export const PLATFORM_STATUS_UPDATED = '14 Aug 2026, 18:42 UTC'

export const MARKETPLACE_LINKS = [
  {
    id: 'google' as const,
    label: 'Google Marketplace',
    href: 'https://console.cloud.google.com/marketplace/product/aiven-public/aiven',
  },
  {
    id: 'aws' as const,
    label: 'AWS Marketplace',
    href: 'https://aws.amazon.com/marketplace/pp/prodview-fx7pxfq5uaxha',
  },
  {
    id: 'azure' as const,
    label: 'Azure Marketplace',
    href: 'https://azuremarketplace.microsoft.com/en-us/marketplace/apps/aivenltd1590663507662.aiven_managed_database_services',
  },
]
