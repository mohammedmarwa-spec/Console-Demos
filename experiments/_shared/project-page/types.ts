import type { Edge } from '@xyflow/react'
import type { ServiceTypeId } from '@/screens/ServiceTypeSelectModal'

export type ServiceListRow = {
  id: string
  serviceName: string
  serviceType: string
  serviceTypeId: ServiceTypeId
  status: string
  nodeCount: number
  planName: string
  planDetails: string
  cloudRegion: string
  location: string
  created: string
  /** When true, row is visible when “Show only services with alerts” is on. */
  hasAlerts?: boolean
  replicationRole?: 'primary' | 'read_replica' | 'fork'
}

export type MetricTone = 'primary' | 'success' | 'warning'

export type MetricCardData = {
  id: string
  label: string
  value: number
  detail: string
  tone: MetricTone
}

export type AttentionIssue = {
  id: string
  issue: string
  affectedResources: string
  impact: string
  started: string
  severity: 'critical' | 'warning' | 'neutral'
}

export type ArchitectureSummary = {
  connectedSystems: number
  connections: number
  unconnected: number
  description: string
}

export type SolutionCard = {
  id: string
  name: string
  description: string
  status: string
  storage: string
}

export type ActivityRow = {
  id: string
  change: string
  resource: string
  actor: string
  when: string
}

export type CtaBannerData = {
  title: string
  description: string
  actions: { id: string; label: string }[]
}

/** Nested Data Hub solution row for Aquarium ItemList (`items` = children). */
export type DataHubListItem = {
  id: string
  serviceName: string
  serviceType: string
  /** Used for service icon; omit for DataHub parent (generic icon). */
  serviceTypeId?: ServiceTypeId
  status: string
  nodeCount?: number
  planName: string
  planDetails?: string
  cloudRegion: string
  location: string
  created: string
  hasAlert?: boolean
  items?: DataHubListItem[]
}

/** Nested Apps row for Aquarium ItemList (application parent + backing services). */
export type AppsListItem = {
  id: string
  serviceName: string
  serviceType: string
  /** Used for service icon; omit for Application parent (console icon). */
  serviceTypeId?: ServiceTypeId
  status: string
  nodeCount?: number
  planName: string
  planDetails?: string
  cloudRegion: string
  location: string
  created: string
  items?: AppsListItem[]
}

export type ProjectTab = 'overview' | 'resources' | 'architecture'

export type ArchitectureEdgeMock = Pick<Edge, 'id' | 'source' | 'target' | 'label' | 'animated'> & {
  type?: string
}

/** Full mock payload for one Project page UI state (fresh vs existing). */
export type ProjectPageMockData = {
  orgName: string
  projectName: string
  projectSubtitle: string
  services: ServiceListRow[]
  metrics: MetricCardData[]
  attentionIssues: AttentionIssue[]
  architecture: ArchitectureSummary
  architectureEdges: ArchitectureEdgeMock[]
  solutions: SolutionCard[]
  recentActivity: ActivityRow[]
  ctaBanner: CtaBannerData
  dataHubItems: DataHubListItem[]
  appsItems: AppsListItem[]
}

export type ArchitectureNodeData = {
  service: ServiceListRow
  /** When true, alert services render warning border + icon (Data flow mock state). */
  showAlerts?: boolean
}
