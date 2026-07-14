import type { ServiceTypeId } from './serviceTypes'

export type TestEnvServiceId = Extract<
  ServiceTypeId,
  'postgresql' | 'valkey' | 'kafka' | 'mysql' | 'opensearch' | 'grafana' | 'clickhouse'
>

export type TestEnvServiceOption = {
  id: TestEnvServiceId
  title: string
  description: string
  defaultServiceName: string
  planResources: string
  cloudRegionLabel: string
}

export const TEST_ENV_SERVICES: TestEnvServiceOption[] = [
  {
    id: 'postgresql',
    title: 'PostgreSQL®',
    description: 'Relational database for apps and transactions',
    defaultServiceName: 'pg-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'valkey',
    title: 'Valkey™',
    description: 'In-memory key-value store for caching',
    defaultServiceName: 'valkey-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'kafka',
    title: 'Apache Kafka®',
    description: 'Event streaming for real-time data pipelines',
    defaultServiceName: 'kafka-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'mysql',
    title: 'MySQL®',
    description: 'Relational database for web apps and transactions',
    defaultServiceName: 'mysql-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'opensearch',
    title: 'OpenSearch®',
    description: 'Search and analytics engine',
    defaultServiceName: 'os-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'grafana',
    title: 'Grafana®',
    description: 'Dashboards and observability',
    defaultServiceName: 'grafana-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
  {
    id: 'clickhouse',
    title: 'ClickHouse®',
    description: 'Fast analytics database for large datasets',
    defaultServiceName: 'ch-test',
    planResources: '1 vCPU · 1 GB RAM · 1 GB Disk',
    cloudRegionLabel: 'Auto-assigned cloud, Europe',
  },
]

export const TEST_ENV_LOCATION_OPTIONS = [
  { label: 'Finland', value: 'finland' },
  { label: 'Germany', value: 'germany' },
  { label: 'United States', value: 'us' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'Australia', value: 'australia' },
] as const

export type TestEnvLocationId = (typeof TEST_ENV_LOCATION_OPTIONS)[number]['value']

export const DEFAULT_TEST_ENV_SERVICE_ID: TestEnvServiceId = 'postgresql'
