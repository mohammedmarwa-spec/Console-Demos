export const PRODUCT_UPDATES_DOCS = {
  changelog: 'https://aiven.io/changelog',
  changelogRss: 'https://aiven.io/changelog/feed.xml',
} as const

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

const changelog = PRODUCT_UPDATES_DOCS.changelog

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: 'clickhouse-263',
    date: '29 Jul',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'Aiven for ClickHouse® 26.3 available in Early Availability',
    href: changelog,
  },
  {
    id: 'mcp-assistants',
    date: '29 Jul',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Connect AI assistants to Aiven with Aiven MCP',
    href: changelog,
  },
  {
    id: 'opensearch-tiering',
    date: '22 Jul',
    tag: 'OpenSearch',
    serviceId: 'opensearch',
    title: 'Hot/warm data tiering for Aiven for OpenSearch®',
    href: changelog,
  },
  {
    id: 'kafka-diskless',
    date: '18 Jul',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Diskless topics for Aiven for Apache Kafka®',
    href: changelog,
  },
  {
    id: 'mysql-84',
    date: '15 Jul',
    tag: 'MySQL',
    serviceId: 'mysql',
    title: 'Aiven for MySQL® 8.4 is generally available',
    href: changelog,
  },
  {
    id: 'valkey-81',
    date: '12 Jul',
    tag: 'Valkey',
    serviceId: 'valkey',
    title: 'Valkey 8.1 with improved memory efficiency',
    href: changelog,
  },
  {
    id: 'pg-18',
    date: '8 Jul',
    tag: 'PostgreSQL',
    serviceId: 'postgresql',
    title: 'PostgreSQL 18 is available on Aiven',
    href: changelog,
  },
  {
    id: 'grafana-12',
    date: '3 Jul',
    tag: 'Grafana',
    serviceId: 'grafana',
    title: 'Grafana 12 dashboards with improved alerting',
    href: changelog,
  },
  {
    id: 'kafka-acls',
    date: '28 Jun',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Simpler ACL management for Aiven for Apache Kafka®',
    href: changelog,
  },
  {
    id: 'mcp-cursor',
    date: '21 Jun',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Manage Kafka topics from Cursor and Claude Code',
    href: changelog,
  },
  {
    id: 'clickhouse-query-cache',
    date: '14 Jun',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'Query cache for Aiven for ClickHouse®',
    href: changelog,
  },
  {
    id: 'kafka-tiered-storage',
    date: '11 Jun',
    tag: 'Kafka',
    serviceId: 'kafka',
    title: 'Tiered storage for Aiven for Apache Kafka®',
    href: changelog,
  },
  {
    id: 'mcp-claude-desktop',
    date: '4 Jun',
    tag: 'MCP',
    serviceId: 'mcp',
    title: 'Aiven MCP support for Claude Desktop',
    href: changelog,
  },
  {
    id: 'clickhouse-keeper',
    date: '2 Jun',
    tag: 'ClickHouse',
    serviceId: 'clickhouse',
    title: 'ClickHouse Keeper is generally available',
    href: changelog,
  },
]

export function filterReleaseNotes(
  items: ReleaseNote[],
  filter: ProductUpdateServiceFilter,
): ReleaseNote[] {
  if (filter === 'all') return items
  return items.filter((item) => item.serviceId === filter)
}
