import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import serverHddIcon from '@aivenio/aquarium/icons/serverHdd'
import type { IconifyIcon } from '@iconify/react'
import type { ServiceTypeId } from '@experiments/_shared/lib/serviceTypes'
import { projectPageData } from '@experiments/elena/project-page/mockData'

export const ORG_NAME = projectPageData.orgName
export const USER_NAME = 'Elena'
export const USER_INITIALS = 'EI'

export const DOCS = {
  documentation: 'https://aiven.io/docs',
  askAi: 'https://aiven.io/docs',
  mcp: 'https://aiven.io/docs/tools/mcp',
  cli: 'https://aiven.io/docs/tools/cli',
  changelog: 'https://aiven.io/changelog',
  changelogRss: 'https://aiven.io/changelog/feed.xml',
} as const

export type IconTone = 'primary' | 'info' | 'warning' | 'danger'

export type FleetMetric = {
  id: 'projects' | 'resources'
  label: string
  value: string
  icon: IconifyIcon
  tone: IconTone
}

export type ResourceTag = {
  id: string
  label: string
}

export type ProjectHealthStatus = 'success' | 'warning' | 'danger'

export type HomeProject = {
  id: string
  name: string
  serviceTypeIds: ServiceTypeId[]
  tags: ResourceTag[]
  resourceCount: number
  statusText: string
  status: ProjectHealthStatus
  lastActivity: string
}

export type AttentionCategory = 'incidents' | 'eol' | 'upgrades' | 'security' | 'alerts'

export type AttentionTone = 'danger' | 'warning' | 'info'

export type AttentionItem = {
  id: string
  title: string
  description: string
  actionLabel: string
  tone: AttentionTone
  category: AttentionCategory
}

export type AttentionFilterId = 'all' | AttentionCategory

export type ReliabilityItem = {
  id: string
  summary: string
  tone: 'success' | 'warning'
}

export type ProductUpdateServiceId =
  | 'kafka'
  | 'clickhouse'
  | 'opensearch'
  | 'mysql'
  | 'valkey'
  | 'postgresql'
  | 'grafana'
  | 'mcp'

export type ProductUpdateServiceFilter = 'all' | ProductUpdateServiceId

export type ReleaseNote = {
  id: string
  title: string
  date: string
  tag: string
  serviceId: ProductUpdateServiceId
  href: string
}

export const PRODUCT_UPDATE_SERVICE_OPTIONS: { label: string; value: ProductUpdateServiceFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Kafka', value: 'kafka' },
  { label: 'ClickHouse', value: 'clickhouse' },
  { label: 'OpenSearch', value: 'opensearch' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Valkey', value: 'valkey' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Grafana', value: 'grafana' },
  { label: 'MCP', value: 'mcp' },
]

export const PRODUCT_UPDATES_PREVIEW_COUNT = 3

export const CLI_QUICK_START = {
  title: 'CLI quick start',
  command: 'pip install aiven-client\navn user login',
  docsHref: DOCS.cli,
} as const

export const FLEET_METRICS: FleetMetric[] = [
  { id: 'projects', label: 'Projects', value: '258', icon: folderCloseIcon, tone: 'primary' },
  { id: 'resources', label: 'Resources', value: '1,248', icon: serverHddIcon, tone: 'info' },
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

export const PROJECTS: HomeProject[] = [
  {
    id: 'managed-agents-prod',
    name: 'managed-agents-prod',
    serviceTypeIds: ['postgresql'],
    tags: [
      { id: 'pg', label: 'PostgreSQL' },
      { id: 'agent', label: 'Agent' },
    ],
    resourceCount: 2,
    statusText: 'Healthy',
    status: 'success',
    lastActivity: 'Last activity 2 hours ago',
  },
  {
    id: 'aiven-mcp-prod',
    name: 'aiven-mcp-prod',
    serviceTypeIds: ['kafka', 'postgresql'],
    tags: [
      { id: 'kafka', label: 'Kafka' },
      { id: 'pg', label: 'PostgreSQL' },
      { id: 'mcp', label: 'MCP' },
    ],
    resourceCount: 4,
    statusText: '1 update',
    status: 'warning',
    lastActivity: 'Last activity 5 hours ago',
  },
  {
    id: 'customer-platform',
    name: 'customer-platform',
    serviceTypeIds: ['clickhouse'],
    tags: [
      { id: 'ch', label: 'ClickHouse' },
      { id: 'app', label: 'App' },
    ],
    resourceCount: 8,
    statusText: '1 issue',
    status: 'danger',
    lastActivity: 'Last activity 1 day ago',
  },
]

export const ATTENTION_FILTERS: { id: AttentionFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'eol', label: 'End of life' },
  { id: 'upgrades', label: 'Upgrades' },
  { id: 'security', label: 'Security' },
  { id: 'alerts', label: 'Alerts' },
]

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'storage-limit',
    title: 'Storage limit approaching',
    description: 'customer-platform PostgreSQL is at 82% used.',
    actionLabel: 'Review storage',
    tone: 'danger',
    category: 'incidents',
  },
  {
    id: 'public-access',
    title: 'Public network access',
    description: '2 services allow connections from any IP.',
    actionLabel: 'Review access',
    tone: 'warning',
    category: 'security',
  },
  {
    id: 'alert-destinations',
    title: 'Alert destinations missing',
    description: '3 services have no alert destination.',
    actionLabel: 'Configure alerts',
    tone: 'warning',
    category: 'alerts',
  },
  {
    id: 'upgrades',
    title: 'Upgrade available',
    description: '12 services have a newer version available.',
    actionLabel: 'Review upgrades',
    tone: 'info',
    category: 'upgrades',
  },
]

export const RELIABILITY_ITEMS: ReliabilityItem[] = [
  { id: 'failover', summary: '6 of 8 services protected by automatic failover', tone: 'success' },
  { id: 'backups', summary: '8 of 8 services backed up', tone: 'success' },
]

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: 'clickhouse-263',
    date: '29 Jul',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'Aiven for ClickHouse® 26.3 available in Early Availability',
    href: DOCS.changelog,
  },
  {
    id: 'mcp-assistants',
    date: '29 Jul',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Connect AI assistants to Aiven with Aiven MCP',
    href: DOCS.changelog,
  },
  {
    id: 'opensearch-tiering',
    date: '22 Jul',
    tag: 'OpenSearch',
    serviceId: 'opensearch',
    title: 'Hot/warm data tiering for Aiven for OpenSearch®',
    href: DOCS.changelog,
  },
  {
    id: 'kafka-diskless',
    date: '18 Jul',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Diskless topics for Aiven for Apache Kafka®',
    href: DOCS.changelog,
  },
  {
    id: 'mysql-84',
    date: '15 Jul',
    tag: 'MySQL',
    serviceId: 'mysql',
    title: 'Aiven for MySQL® 8.4 is generally available',
    href: DOCS.changelog,
  },
  {
    id: 'valkey-81',
    date: '12 Jul',
    tag: 'Valkey',
    serviceId: 'valkey',
    title: 'Valkey 8.1 with improved memory efficiency',
    href: DOCS.changelog,
  },
  {
    id: 'pg-18',
    date: '8 Jul',
    tag: 'PostgreSQL',
    serviceId: 'postgresql',
    title: 'PostgreSQL 18 is available on Aiven',
    href: DOCS.changelog,
  },
  {
    id: 'grafana-12',
    date: '3 Jul',
    tag: 'Grafana',
    serviceId: 'grafana',
    title: 'Grafana 12 dashboards with improved alerting',
    href: DOCS.changelog,
  },
  {
    id: 'kafka-acls',
    date: '28 Jun',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Simpler ACL management for Aiven for Apache Kafka®',
    href: DOCS.changelog,
  },
  {
    id: 'mcp-cursor',
    date: '21 Jun',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Manage Kafka topics from Cursor and Claude Code',
    href: DOCS.changelog,
  },
  {
    id: 'clickhouse-query-cache',
    date: '14 Jun',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'Query cache for Aiven for ClickHouse®',
    href: DOCS.changelog,
  },
  {
    id: 'kafka-tiered-storage',
    date: '11 Jun',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Tiered storage for Aiven for Apache Kafka®',
    href: DOCS.changelog,
  },
  {
    id: 'mcp-claude-desktop',
    date: '4 Jun',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Aiven MCP support for Claude Desktop',
    href: DOCS.changelog,
  },
  {
    id: 'clickhouse-keeper',
    date: '2 Jun',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'ClickHouse Keeper is generally available',
    href: DOCS.changelog,
  },
]

export function filterReleaseNotes(
  items: ReleaseNote[],
  filter: ProductUpdateServiceFilter,
): ReleaseNote[] {
  if (filter === 'all') return items
  return items.filter((item) => item.serviceId === filter)
}

export function filterAttentionItems(
  items: AttentionItem[],
  filter: AttentionFilterId,
  query: string,
): AttentionItem[] {
  const normalized = query.trim().toLowerCase()
  return items.filter((item) => {
    if (filter !== 'all' && item.category !== filter) return false
    if (!normalized) return true
    return `${item.title} ${item.description} ${item.actionLabel}`.toLowerCase().includes(normalized)
  })
}
