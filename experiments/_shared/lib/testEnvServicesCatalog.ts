import type { ServiceTypeId } from './serviceTypes'
import type { CloudProviderId } from './serviceRegions'

export type TestEnvServiceId = Extract<
  ServiceTypeId,
  'postgresql' | 'valkey' | 'kafka' | 'mysql' | 'opensearch' | 'grafana' | 'clickhouse'
>

export type TestEnvPricingModel = 'free' | 'trial'

export type TestEnvPlanDetail = {
  kind: 'cpu' | 'memory' | 'storage' | 'backups'
  label: string
}

export type TestEnvServiceOption = {
  id: TestEnvServiceId
  title: string
  description: string
  defaultServiceName: string
  pricingModel: TestEnvPricingModel
  planChip: string
  regionLabel: string
  planDetails: TestEnvPlanDetail[]
  cloudProviderId?: CloudProviderId
  cloudProviderLabel?: string
  monthlyAfterTrial?: string
}

const FREE_PLAN_DETAILS: TestEnvPlanDetail[] = [
  { kind: 'cpu', label: '1 CPU' },
  { kind: 'memory', label: '1 GB RAM' },
  { kind: 'storage', label: '1 GB storage' },
  { kind: 'backups', label: 'Backups for disaster recovery' },
]

const FREE_SERVICE_DEFAULTS = {
  pricingModel: 'free' as const,
  planChip: 'Free',
  regionLabel: 'Finland, europe-north1',
  planDetails: FREE_PLAN_DETAILS,
}

export const TEST_ENV_SERVICES: TestEnvServiceOption[] = [
  {
    id: 'postgresql',
    title: 'PostgreSQL®',
    description: 'High-performance relational database with advanced extensions',
    defaultServiceName: 'pg-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'valkey',
    title: 'Valkey™',
    description: 'High-performance key/value datastore',
    defaultServiceName: 'valkey-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'kafka',
    title: 'Apache Kafka®',
    description: 'Distributed event streaming platform for high-throughput data pipelines',
    defaultServiceName: 'kafka-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'mysql',
    title: 'MySQL®',
    description: 'Popular general-purpose easy-to-use relational database',
    defaultServiceName: 'mysql-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'opensearch',
    title: 'OpenSearch®',
    description: 'Distributed real-time search and analytics',
    defaultServiceName: 'os-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'grafana',
    title: 'Grafana®',
    description: 'Data visualization and analytics platform',
    defaultServiceName: 'grafana-test',
    ...FREE_SERVICE_DEFAULTS,
  },
  {
    id: 'clickhouse',
    title: 'ClickHouse®',
    description: 'Fast analytics database for large datasets',
    defaultServiceName: 'ch-test',
    pricingModel: 'trial',
    planChip: 'Startup-4',
    regionLabel: 'Finland, europe-north1',
    cloudProviderId: 'google',
    cloudProviderLabel: 'Google Cloud',
    monthlyAfterTrial: '$149 USD',
    planDetails: [
      { kind: 'cpu', label: '1 CPU' },
      { kind: 'memory', label: '1 GB RAM' },
      { kind: 'storage', label: '8 GB storage' },
      { kind: 'backups', label: 'Backups for disaster recovery' },
    ],
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
