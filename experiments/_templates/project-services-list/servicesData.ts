import type { ServiceTypeId } from '@/screens/ServiceTypeSelectModal'

export const ORG_NAME = 'My Organization'
export const PROJECT_NAME = 'demo-project'

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

export const SERVICES: ServiceListRow[] = [
  {
    id: 'pg-prod-01',
    serviceName: 'pg-prod-01',
    serviceType: 'PostgreSQL',
    serviceTypeId: 'postgresql',
    status: 'Running',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM / 480 GB storage',
    cloudRegion: 'AWS: eu-west-1',
    location: 'Europe, Ireland',
    created: '3 days ago',
  },
  {
    id: 'kafka-events',
    serviceName: 'kafka-events',
    serviceType: 'Apache Kafka',
    serviceTypeId: 'kafka',
    status: 'Running',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM',
    cloudRegion: 'Google Cloud: us-central1',
    location: 'North America, Iowa',
    created: '5 days ago',
    hasAlerts: true,
  },
  {
    id: 'mysql-app',
    serviceName: 'mysql-app',
    serviceType: 'MySQL',
    serviceTypeId: 'mysql',
    status: 'Running',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM / 300 GB storage',
    cloudRegion: 'AWS: us-east-1',
    location: 'North America, Virginia',
    created: '1 week ago',
  },
  {
    id: 'valkey-cache',
    serviceName: 'valkey-cache',
    serviceType: 'Valkey',
    serviceTypeId: 'valkey',
    status: 'Running',
    nodeCount: 1,
    planName: 'Startup-4',
    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',
    cloudRegion: 'AWS: eu-central-1',
    location: 'Europe, Frankfurt',
    created: '2 weeks ago',
  },
  {
    id: 'opensearch-logs',
    serviceName: 'opensearch-logs',
    serviceType: 'OpenSearch',
    serviceTypeId: 'opensearch',
    status: 'Rebuilding',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM / 350 GB storage',
    cloudRegion: 'Azure: westeurope',
    location: 'Europe, Netherlands',
    created: '3 weeks ago',
    hasAlerts: true,
  },
  {
    id: 'clickhouse-analytics',
    serviceName: 'clickhouse-analytics',
    serviceType: 'ClickHouse',
    serviceTypeId: 'clickhouse',
    status: 'Running',
    nodeCount: 3,
    planName: 'Business-16',
    planDetails: '16 CPU / 64 GB RAM / 1.5 TB storage',
    cloudRegion: 'AWS: eu-west-1',
    location: 'Europe, Ireland',
    created: '1 month ago',
  },
  {
    id: 'grafana-dash',
    serviceName: 'grafana-dash',
    serviceType: 'Grafana',
    serviceTypeId: 'grafana',
    status: 'Running',
    nodeCount: 1,
    planName: 'Startup-4',
    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',
    cloudRegion: 'Google Cloud: europe-west1',
    location: 'Europe, Belgium',
    created: '1 month ago',
  },
  {
    id: 'pg-prod-01-replica',
    serviceName: 'pg-prod-01-replica',
    serviceType: 'PostgreSQL',
    serviceTypeId: 'postgresql',
    status: 'Running',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM / 480 GB storage',
    cloudRegion: 'AWS: us-east-1',
    location: 'North America, Virginia',
    created: '2 months ago',
    replicationRole: 'read_replica',
  },
]
