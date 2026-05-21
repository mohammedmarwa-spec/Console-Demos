import type { ServiceTypeId } from '../ServiceTypeSelectModal'

export type BrowseServiceId = Extract<
  ServiceTypeId,
  'postgresql' | 'mysql' | 'kafka' | 'opensearch' | 'valkey' | 'grafana' | 'clickhouse'
>

export type BrowseServiceOption = {
  id: BrowseServiceId
  title: string
  description: string
}

export const BROWSE_SERVICES: BrowseServiceOption[] = [
  { id: 'postgresql', title: 'PostgreSQL', description: 'Open source relational database' },
  { id: 'mysql', title: 'MySQL', description: 'Most popular open source SQL database' },
  { id: 'kafka', title: 'Kafka', description: 'Distributed event streaming' },
  { id: 'opensearch', title: 'OpenSearch', description: 'Search & log analytics' },
  { id: 'valkey', title: 'Valkey', description: 'Redis-compatible in-memory cache' },
  { id: 'grafana', title: 'Grafana', description: 'Dashboards & visualization' },
  { id: 'clickhouse', title: 'ClickHouse', description: 'Fast analytical data warehouse' },
]

export const BROWSE_AI_SUGGESTIONS = [
  'Building an e-commerce backend',
  'Setting up event analytics',
  'Adding search to my app',
] as const
