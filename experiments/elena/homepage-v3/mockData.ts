import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import serverHddIcon from '@aivenio/aquarium/icons/serverHdd'
import type { IconifyIcon } from '@iconify/react'
import type { ServiceTypeId } from '@experiments/_shared/lib/serviceTypes'
import { projectPageData } from '@experiments/elena/project-page/mockData'

export type HomeProjectTag = 'prod' | 'staging' | 'dev'

export type HomeProject = {
  id: string
  name: string
  serviceCount: number
  tag: HomeProjectTag
}

export type IconTone = 'primary' | 'info' | 'warning' | 'danger'

export type FleetMetric = {
  id: 'projects' | 'resources'
  label: string
  value: string
  icon: IconifyIcon
  tone: IconTone
}

export type ProjectHealthLabel = 'Healthy' | 'Degraded' | 'Issue'

export type ProjectHealthSummary = {
  statusText: ProjectHealthLabel
  status: 'success' | 'warning' | 'danger'
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

export type HomeAttentionItem = {
  service: HomeServiceRow
  finding: string
  statusText: string
  status: 'warning' | 'danger'
  actionLabel: string
}

export type HomeImprovementRecommendation = {
  id: string
  summary: string
  affectedServiceName: string
  actionLabel: string
}

export type HomeProtectionMetric = {
  id: 'failover' | 'backups' | 'alerting' | 'network'
  label: string
  statusText: string
  tone: 'success' | 'warning'
}

export type HomeReviewRow = {
  id: string
  service: HomeServiceRow
  statusText: string
  status: 'success' | 'warning' | 'danger'
  finding: string
  actionLabel: string | null
}

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
  'kafka-events': {
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: ['Disk usage above 80%'],
    severity: 'warning',
  },
  'opensearch-logs': {
    maintenance: 'Monday 01:00–05:00 UTC',
    alerts: ['Node restart required', 'Certificate expires in 14 days'],
    severity: 'danger',
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
    isPubliclyAccessible: false,
    hasAlertDestination: false,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
  },
  'mysql-app': {
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: true,
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
    hasAlertDestination: true,
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
  { id: 'kafka-prod', name: 'kafka-prod', serviceCount: 3, tag: 'prod' },
  { id: 'pg-analytics', name: 'pg-analytics', serviceCount: 4, tag: 'staging' },
  { id: 'payments-prod', name: 'payments-prod', serviceCount: 3, tag: 'prod' },
  { id: 'data-platform', name: 'data-platform', serviceCount: 5, tag: 'prod' },
  { id: 'observability', name: 'observability', serviceCount: 3, tag: 'prod' },
  { id: 'ml-workloads', name: 'ml-workloads', serviceCount: 4, tag: 'staging' },
  { id: 'identity-prod', name: 'identity-prod', serviceCount: 2, tag: 'prod' },
  { id: 'staging-sandbox', name: 'staging-sandbox', serviceCount: 3, tag: 'dev' },
  { id: 'mobile-backend', name: 'mobile-backend', serviceCount: 4, tag: 'prod' },
]

function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export const FLEET_METRICS: FleetMetric[] = [
  {
    id: 'projects',
    label: 'Projects',
    value: formatCount(PROJECTS.length),
    icon: folderCloseIcon,
    tone: 'primary',
  },
  {
    id: 'resources',
    label: 'Resources',
    value: formatCount(PROJECTS.reduce((sum, project) => sum + project.serviceCount, 0)),
    icon: serverHddIcon,
    tone: 'info',
  },
]

export const LAST_INVOICE = {
  amount: '$23.80',
  currency: 'USD',
  period: '1 Feb – 1 Mar 2026',
  statusText: 'Paid',
  status: 'success' as const,
} as const

export const ORG_USERS = {
  count: 24,
} as const

function mockService(
  id: string,
  serviceName: string,
  serviceTypeId: ServiceTypeId,
  overrides: Partial<HomeServiceRow> = {},
): HomeServiceRow {
  return {
    id,
    serviceName,
    serviceTypeId,
    status: 'Running',
    nodeStatus: 'healthy',
    environment: 'production',
    hasAutomaticFailover: true,
    isPubliclyAccessible: false,
    hasAlertDestination: true,
    isBackedUp: true,
    maintenanceWindowState: 'configured',
    versionEolState: 'supported',
    maintenance: 'Sunday 02:00–06:00 UTC',
    alerts: [],
    severity: 'warning',
    ...overrides,
  }
}

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
    mockService('analytics-pg', 'analytics-pg', 'postgresql', {
      maintenance: 'Sunday 02:00–03:00 UTC',
    }),
    mockService('analytics-ch', 'analytics-ch', 'clickhouse'),
    mockService('analytics-kafka', 'analytics-kafka', 'kafka'),
    mockService('analytics-grafana', 'analytics-grafana', 'grafana', {
      environment: 'development',
      hasAutomaticFailover: false,
    }),
  ],
  'payments-prod': [
    mockService('payments-mysql', 'payments-mysql', 'mysql', {
      alerts: ['Replica lag above threshold'],
      nodeStatus: 'degraded',
    }),
    mockService('payments-kafka', 'payments-kafka', 'kafka'),
    mockService('payments-valkey', 'payments-valkey', 'valkey'),
  ],
  'data-platform': [
    mockService('platform-kafka', 'platform-kafka', 'kafka'),
    mockService('platform-clickhouse', 'platform-clickhouse', 'clickhouse'),
    mockService('platform-opensearch', 'platform-opensearch', 'opensearch', {
      alerts: ['Disk usage above 80%'],
      nodeStatus: 'degraded',
      severity: 'warning',
    }),
    mockService('platform-flink', 'platform-flink', 'flink'),
    mockService('platform-pg', 'platform-pg', 'postgresql'),
  ],
  observability: [
    mockService('obs-grafana', 'obs-grafana', 'grafana'),
    mockService('obs-opensearch', 'obs-opensearch', 'opensearch'),
    mockService('obs-metrics', 'obs-metrics', 'metrics'),
  ],
  'ml-workloads': [
    mockService('ml-pg', 'ml-pg', 'postgresql'),
    mockService('ml-clickhouse', 'ml-clickhouse', 'clickhouse'),
    mockService('ml-flink', 'ml-flink', 'flink', {
      alerts: ['Checkpoint delay above threshold'],
      nodeStatus: 'degraded',
    }),
    mockService('ml-valkey', 'ml-valkey', 'valkey', { environment: 'development' }),
  ],
  'identity-prod': [
    mockService('identity-pg', 'identity-pg', 'postgresql'),
    mockService('identity-valkey', 'identity-valkey', 'valkey'),
  ],
  'staging-sandbox': [
    mockService('sandbox-mysql', 'sandbox-mysql', 'mysql', { environment: 'development' }),
    mockService('sandbox-redis', 'sandbox-redis', 'redis', { environment: 'development' }),
    mockService('sandbox-grafana', 'sandbox-grafana', 'grafana', { environment: 'development' }),
  ],
  'mobile-backend': [
    mockService('mobile-kafka', 'mobile-kafka', 'kafka'),
    mockService('mobile-pg', 'mobile-pg', 'postgresql'),
    mockService('mobile-dragonfly', 'mobile-dragonfly', 'dragonfly'),
    mockService('mobile-opensearch', 'mobile-opensearch', 'opensearch', {
      isPubliclyAccessible: true,
      hasAlertDestination: false,
    }),
  ],
}

const PROJECT_PREVIEW_ICON_LIMIT = 5

export function getProjectHealth(projectId: string): ProjectHealthSummary {
  const services = getScopedServices(SERVICES_BY_PROJECT[projectId] ?? [], 'production')
  const scoped = services.length > 0 ? services : (SERVICES_BY_PROJECT[projectId] ?? [])

  if (scoped.some((service) => service.nodeStatus === 'down' || service.severity === 'danger')) {
    return { statusText: 'Issue', status: 'danger' }
  }
  if (scoped.some((service) => service.nodeStatus === 'degraded' || service.alerts.length > 0)) {
    return { statusText: 'Degraded', status: 'warning' }
  }
  return { statusText: 'Healthy', status: 'success' }
}

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

function countCopy(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function attentionStatus(service: HomeServiceRow): Pick<HomeAttentionItem, 'statusText' | 'status'> {
  if (service.nodeStatus === 'down' || service.severity === 'danger') {
    return { statusText: 'Critical', status: 'danger' }
  }
  if (service.nodeStatus === 'degraded' || service.alerts.length > 0) {
    return { statusText: 'Degraded', status: 'warning' }
  }
  return { statusText: 'Healthy', status: 'warning' }
}

function attentionAction(service: HomeServiceRow): string {
  const alert = service.alerts[0]?.toLowerCase() ?? ''
  if (alert.includes('disk') || alert.includes('storage')) return 'Review storage'
  if (alert.includes('restart') || alert.includes('node')) return 'Review restart'
  return 'Review service'
}

export function getAttentionServices(services: HomeServiceRow[], scope: HomeScope): HomeAttentionItem[] {
  return getScopedServices(services, scope)
    .filter((service) => service.alerts.length > 0 || service.nodeStatus !== 'healthy')
    .map((service) => {
      const { statusText, status } = attentionStatus(service)
      return {
        service,
        finding: service.alerts[0] ?? 'Node health requires attention',
        statusText,
        status,
        actionLabel: attentionAction(service),
      }
    })
}

export function getImprovementRecommendations(
  services: HomeServiceRow[],
  scope: HomeScope,
): HomeImprovementRecommendation[] {
  const scoped = getScopedServices(services, scope)
  const items: HomeImprovementRecommendation[] = []

  const publicServices = scoped.filter((service) => service.isPubliclyAccessible)
  if (publicServices.length > 0) {
    items.push({
      id: 'public-access',
      summary: countCopy(
        publicServices.length,
        '1 service is publicly accessible from any IP',
        `${publicServices.length} services are publicly accessible from any IP`,
      ),
      affectedServiceName: publicServices[0]!.serviceName,
      actionLabel: 'Review network access',
    })
  }

  const missingAlerts = scoped.filter((service) => !service.hasAlertDestination)
  if (missingAlerts.length > 0) {
    items.push({
      id: 'alert-destinations',
      summary: countCopy(
        missingAlerts.length,
        '1 service has no alert destination',
        `${missingAlerts.length} services have no alert destination`,
      ),
      affectedServiceName: missingAlerts[0]!.serviceName,
      actionLabel: 'Configure alerts',
    })
  }

  return items
}

export function getProtectionMetrics(services: HomeServiceRow[], scope: HomeScope): HomeProtectionMetric[] {
  const scoped = getScopedServices(services, scope)
  const total = scoped.length
  if (total === 0) return []

  const failoverCount = scoped.filter((service) => service.hasAutomaticFailover).length
  const backupCount = scoped.filter((service) => service.isBackedUp).length
  const alertCount = scoped.filter((service) => service.hasAlertDestination).length
  const restrictedCount = scoped.filter((service) => !service.isPubliclyAccessible).length

  return [
    {
      id: 'failover',
      label: 'Automatic failover',
      statusText: failoverCount === total ? `All ${total} protected` : `${failoverCount} of ${total} protected`,
      tone: failoverCount === total ? 'success' : 'warning',
    },
    {
      id: 'backups',
      label: 'Backups',
      statusText: backupCount === total ? `All ${total} protected` : `${backupCount} of ${total} protected`,
      tone: backupCount === total ? 'success' : 'warning',
    },
    {
      id: 'alerting',
      label: 'Alerting',
      statusText: `${alertCount} of ${total} configured`,
      tone: alertCount === total ? 'success' : 'warning',
    },
    {
      id: 'network',
      label: 'Network access',
      statusText: `${restrictedCount} of ${total} restricted`,
      tone: restrictedCount === total ? 'success' : 'warning',
    },
  ]
}

function reviewStatus(service: HomeServiceRow): Pick<HomeReviewRow, 'statusText' | 'status'> {
  if (service.nodeStatus === 'down' || service.severity === 'danger') {
    return { statusText: 'Critical', status: 'danger' }
  }
  if (service.nodeStatus === 'degraded') {
    return { statusText: 'Degraded', status: 'warning' }
  }
  return { statusText: 'Healthy', status: 'success' }
}

function reviewFinding(service: HomeServiceRow): { finding: string; actionLabel: string | null } {
  if (service.alerts.length > 0) {
    return { finding: service.alerts[0]!, actionLabel: attentionAction(service) }
  }
  if (service.isPubliclyAccessible) {
    return { finding: 'Publicly accessible from any IP', actionLabel: 'Restrict access' }
  }
  if (!service.hasAlertDestination) {
    return { finding: 'No alert destination configured', actionLabel: 'Configure alerts' }
  }
  return { finding: 'No recommendations', actionLabel: null }
}

export function getServicesRequiringReview(services: HomeServiceRow[], scope: HomeScope): HomeReviewRow[] {
  const scoped = getScopedServices(services, scope)
  const attentionIds = new Set(getAttentionServices(services, scope).map((item) => item.service.id))
  const improvementServiceNames = new Set(
    getImprovementRecommendations(services, scope).map((item) => item.affectedServiceName),
  )

  const prioritized = scoped.filter(
    (service) =>
      attentionIds.has(service.id) ||
      improvementServiceNames.has(service.serviceName) ||
      service.isPubliclyAccessible ||
      !service.hasAlertDestination,
  )

  const reviewRows = prioritized.map((service) => {
    const { statusText, status } = reviewStatus(service)
    const { finding, actionLabel } = reviewFinding(service)
    return {
      id: service.id,
      service,
      statusText,
      status,
      finding,
      actionLabel,
    }
  })

  const shownIds = new Set(reviewRows.map((row) => row.id))
  const healthyFallback = scoped.find((service) => service.nodeStatus === 'healthy' && !shownIds.has(service.id))
  if (healthyFallback) {
    reviewRows.push({
      id: healthyFallback.id,
      service: healthyFallback,
      statusText: 'Healthy',
      status: 'success',
      finding: 'No recommendations',
      actionLabel: null,
    })
  }

  return reviewRows
}

function toneFromGap(gap: number, total: number): HomePostureSignalTone {
  if (gap <= 0) return 'success'
  if (gap >= Math.ceil(total / 2)) return 'danger'
  return 'warning'
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
