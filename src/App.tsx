import { useEffect, useRef, useState } from 'react'
import { Box, Modal, ToastProvider, Typography, useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'
import CreateService, { type CreatedServicePayload } from './screens/CreateService'
import CreateReadReplicaModal from './screens/CreateReadReplicaModal'
import CreateForkModal from './screens/CreateForkModal'
import ProjectServices, { INITIAL_SERVICES, type ServiceRow } from './screens/ProjectServices'
import ServiceOverview from './screens/ServiceOverview'
import BillingInvoiceDetail from './screens/BillingInvoiceDetail'
import OrgHomePage from './screens/OrgHomePage'
import ServiceTypeSelectModal, { getServiceTypeDisplayName, type ServiceTypeId } from './screens/ServiceTypeSelectModal'
import { ScenarioProvider, ScenarioPanel, ScenarioTrigger, ScenarioBadge, useScenario } from './scenarios'
import { MysqlAcuRolloutModal } from './screens/MysqlAcuRolloutModal'

type View = 'org-home' | 'project-services' | 'service-overview' | 'billing-invoice'

// ─── Scenario service data ────────────────────────────────────────────────────
// Define what each scenario's initial service list looks like.
// Add new entries here when you add more scenarios.

// prettier-ignore
const MANY_SERVICES: ServiceRow[] = [
  // ── 20 PostgreSQL services ──────────────────────────────────────────────────
  { id: 'pg-prod-01',    serviceName: 'pg-prod-01',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',        created: '3 days ago',    iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-prod-02',    serviceName: 'pg-prod-02',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',        created: '3 days ago',    iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-staging-01', serviceName: 'pg-staging-01', serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',        created: '1 week ago',    iconLetter: 'P', cpuCount: 2, ramCapacity: '4 GB',   storageCapacity: '80 GB'  },
  { id: 'pg-staging-02', serviceName: 'pg-staging-02', serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'Google Cloud: us-east1', location: 'North America, S. Carolina', created: '5 days ago',  iconLetter: 'P', cpuCount: 2, ramCapacity: '4 GB',   storageCapacity: '80 GB'  },
  { id: 'pg-analytics',  serviceName: 'pg-analytics',  serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Premium-6',    planDetails: '6 CPU / 28 GB RAM / 700 GB storage',  cloudRegion: 'AWS: us-east-1',         location: 'North America, Virginia',  created: '2 weeks ago',   iconLetter: 'P', cpuCount: 6, ramCapacity: '28 GB',  storageCapacity: '700 GB' },
  { id: 'pg-reporting',  serviceName: 'pg-reporting',  serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-8',   planDetails: '8 CPU / 32 GB RAM / 600 GB storage',  cloudRegion: 'AWS: ap-southeast-1',    location: 'Asia, Singapore',          created: '10 days ago',   iconLetter: 'P', cpuCount: 8, ramCapacity: '32 GB',  storageCapacity: '600 GB' },
  { id: 'pg-users',      serviceName: 'pg-users',      serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: eu-central-1',      location: 'Europe, Frankfurt',        created: '20 days ago',   iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-orders',     serviceName: 'pg-orders',     serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: us-west-2',         location: 'North America, Oregon',    created: '1 month ago',   iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-payments',   serviceName: 'pg-payments',   serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Premium-6',    planDetails: '6 CPU / 28 GB RAM / 700 GB storage',  cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',          created: '1 month ago',   iconLetter: 'P', cpuCount: 6, ramCapacity: '28 GB',  storageCapacity: '700 GB' },
  { id: 'pg-inventory',  serviceName: 'pg-inventory',  serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Rebuilding',  nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'Google Cloud: eu-west1', location: 'Europe, Belgium',          created: '2 months ago',  iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-catalog',    serviceName: 'pg-catalog',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'AWS: ap-northeast-1',    location: 'Asia, Tokyo',              created: '2 months ago',  iconLetter: 'P', cpuCount: 2, ramCapacity: '4 GB',   storageCapacity: '80 GB'  },
  { id: 'pg-search',     serviceName: 'pg-search',     serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',     planDetails: '1 CPU / 2 GB RAM / 8 GB storage',     cloudRegion: 'AWS: eu-west-2',         location: 'Europe, London',           created: '3 months ago',  iconLetter: 'P', cpuCount: 1, ramCapacity: '2 GB',   storageCapacity: '8 GB'   },
  { id: 'pg-audit',      serviceName: 'pg-audit',      serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',          created: '3 months ago',  iconLetter: 'P', cpuCount: 2, ramCapacity: '4 GB',   storageCapacity: '80 GB'  },
  { id: 'pg-sessions',   serviceName: 'pg-sessions',   serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1', nodeCount: 1, planName: 'Developer',    planDetails: '1 CPU / 1 GB RAM / 8 GB storage',     cloudRegion: 'Google Cloud: us-central1', location: 'North America, Iowa',   created: '4 months ago',  iconLetter: 'P', cpuCount: 1, ramCapacity: '1 GB',   storageCapacity: '8 GB'   },
  { id: 'pg-crm',        serviceName: 'pg-crm',        serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-8',   planDetails: '8 CPU / 32 GB RAM / 600 GB storage',  cloudRegion: 'AWS: us-east-1',         location: 'North America, Virginia',  created: '4 months ago',  iconLetter: 'P', cpuCount: 8, ramCapacity: '32 GB',  storageCapacity: '600 GB' },
  { id: 'pg-metrics',    serviceName: 'pg-metrics',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: eu-north-1',        location: 'Europe, Stockholm',        created: '5 months ago',  iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-billing',    serviceName: 'pg-billing',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'PowerOff',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',    planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'AWS: eu-west-1',         location: 'Europe, Ireland',          created: '6 months ago',  iconLetter: 'P', cpuCount: 2, ramCapacity: '4 GB',   storageCapacity: '80 GB'  },
  { id: 'pg-notifications', serviceName: 'pg-notifications', serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist', planDetails: '1 CPU / 2 GB RAM / 8 GB storage',     cloudRegion: 'Google Cloud: asia-east1', location: 'Asia, Taiwan',           created: '6 months ago',  iconLetter: 'P', cpuCount: 1, ramCapacity: '2 GB',   storageCapacity: '8 GB'   },
  { id: 'pg-archive',    serviceName: 'pg-archive',    serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'Azure: eastus',          location: 'North America, Virginia',  created: '7 months ago',  iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB',  storageCapacity: '480 GB' },
  { id: 'pg-dr-replica', serviceName: 'pg-dr-replica', serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',   planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: ap-south-1',        location: 'Asia, Mumbai',             created: '8 months ago',  iconLetter: 'P', replicationRole: 'read_replica', sourceServiceId: 'pg-prod-01', cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '480 GB' },

  // ── 30 mixed services ───────────────────────────────────────────────────────
  // Kafka
  { id: 'kafka-events',     serviceName: 'kafka-events',     serviceType: 'Apache Kafka', serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM', cloudRegion: 'Google Cloud: us-central1',  location: 'North America, Iowa',       created: '5 days ago',    iconLetter: 'K', pricingType: 'Classic',  cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '600 GB' },
  { id: 'kafka-telemetry',  serviceName: 'kafka-telemetry',  serviceType: 'Apache Kafka', serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM', cloudRegion: 'AWS: eu-west-1',             location: 'Europe, Ireland',           created: '2 weeks ago',   iconLetter: 'K', pricingType: 'Inkless',  cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '600 GB' },
  { id: 'kafka-payments',   serviceName: 'kafka-payments',   serviceType: 'Apache Kafka', serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 6', nodeCount: 6, planName: 'Premium-6',  planDetails: '6 CPU / 28 GB RAM', cloudRegion: 'AWS: us-east-1',             location: 'North America, Virginia',   created: '1 month ago',   iconLetter: 'K', pricingType: 'Classic',  cpuCount: 6, ramCapacity: '28 GB', storageCapacity: '900 GB' },
  { id: 'kafka-audit-log',  serviceName: 'kafka-audit-log',  serviceType: 'Apache Kafka', serviceTypeId: 'kafka', status: 'Rebuilding', nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM', cloudRegion: 'AWS: eu-central-1',          location: 'Europe, Frankfurt',         created: '2 months ago',  iconLetter: 'K', pricingType: 'Inkless',  cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '600 GB' },
  { id: 'kafka-staging',    serviceName: 'kafka-staging',    serviceType: 'Apache Kafka', serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-2',  planDetails: '2 CPU / 4 GB RAM',  cloudRegion: 'Google Cloud: us-central1',  location: 'North America, Iowa',       created: '3 months ago',  iconLetter: 'K', pricingType: 'Classic',  cpuCount: 2, ramCapacity: '4 GB',  storageCapacity: '100 GB' },

  // MySQL (the seed row + more)
  ...INITIAL_SERVICES,
  { id: 'mysql-reporting', serviceName: 'mysql-reporting', serviceType: 'MySQL', serviceTypeId: 'mysql', status: 'Running',  nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4',  planDetails: '4 CPU / 16 GB RAM / 300 GB storage', cloudRegion: 'AWS: ap-southeast-1', location: 'Asia, Singapore', created: '1 month ago',  iconLetter: 'M', pricingType: 'ACU', cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '300 GB' },
  { id: 'mysql-legacy',    serviceName: 'mysql-legacy',    serviceType: 'MySQL', serviceTypeId: 'mysql', status: 'Running',  nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',    cloudRegion: 'AWS: eu-west-1',      location: 'Europe, Ireland',  created: '8 months ago', iconLetter: 'M', pricingType: 'ACU', cpuCount: 1, ramCapacity: '2 GB',  storageCapacity: '8 GB'   },

  // Redis / Valkey
  { id: 'redis-cache-eu',   serviceName: 'redis-cache-eu',   serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',  planDetails: '2 CPU / 4 GB RAM',   cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '1 hour ago',   iconLetter: 'R' },
  { id: 'redis-cache-us',   serviceName: 'redis-cache-us',   serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',  planDetails: '2 CPU / 4 GB RAM',   cloudRegion: 'AWS: us-east-1',          location: 'North America, Virginia', created: '2 hours ago',  iconLetter: 'R' },
  { id: 'redis-sessions',   serviceName: 'redis-sessions',   serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis', status: 'Rebuilding', nodes: 'Nodes 1', nodeCount: 1, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM',  cloudRegion: 'Google Cloud: us-central1', location: 'North America, Iowa',     created: '4 days ago',   iconLetter: 'R' },
  { id: 'valkey-prod',      serviceName: 'valkey-prod',      serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis', status: 'Running',    nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-8', planDetails: '8 CPU / 32 GB RAM',  cloudRegion: 'AWS: ap-northeast-1',     location: 'Asia, Tokyo',             created: '3 months ago', iconLetter: 'R' },

  // OpenSearch
  { id: 'os-logs-prod',     serviceName: 'os-logs-prod',     serviceType: 'OpenSearch',         serviceTypeId: 'opensearch', status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM / 480 GB storage', cloudRegion: 'AWS: eu-west-1',       location: 'Europe, Ireland',         created: '2 months ago', iconLetter: 'O' },
  { id: 'os-search',        serviceName: 'os-search',        serviceType: 'OpenSearch',         serviceTypeId: 'opensearch', status: 'Running',    nodes: 'Nodes 2', nodeCount: 2, planName: 'Startup-4',  planDetails: '2 CPU / 8 GB RAM / 200 GB storage',  cloudRegion: 'AWS: us-east-1',       location: 'North America, Virginia', created: '3 months ago', iconLetter: 'O' },
  { id: 'os-analytics',     serviceName: 'os-analytics',     serviceType: 'OpenSearch',         serviceTypeId: 'opensearch', status: 'PowerOff',   nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',   planDetails: '1 CPU / 2 GB RAM / 8 GB storage',    cloudRegion: 'AWS: eu-west-1',       location: 'Europe, Ireland',         created: '5 months ago', iconLetter: 'O' },

  // ClickHouse
  { id: 'ch-events',        serviceName: 'ch-events',        serviceType: 'ClickHouse',         serviceTypeId: 'clickhouse', status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-16', planDetails: '16 CPU / 64 GB RAM / 1.5 TB storage', cloudRegion: 'AWS: eu-west-1',      location: 'Europe, Ireland',          created: '1 month ago',  iconLetter: 'C' },
  { id: 'ch-analytics',     serviceName: 'ch-analytics',     serviceType: 'ClickHouse',         serviceTypeId: 'clickhouse', status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-8',  planDetails: '8 CPU / 32 GB RAM / 900 GB storage',  cloudRegion: 'Google Cloud: us-east1', location: 'North America, S. Carolina', created: '2 months ago', iconLetter: 'C' },

  // Grafana
  { id: 'grafana-dashboards', serviceName: 'grafana-dashboards', serviceType: 'Grafana',       serviceTypeId: 'grafana', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-1',  planDetails: '1 CPU / 2 GB RAM',   cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '1 month ago',  iconLetter: 'G' },
  { id: 'grafana-staging',    serviceName: 'grafana-staging',    serviceType: 'Grafana',       serviceTypeId: 'grafana', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',   planDetails: '1 CPU / 512 MB RAM', cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '2 months ago', iconLetter: 'G' },

  // Dragonfly
  { id: 'dragonfly-prod',   serviceName: 'dragonfly-prod',   serviceType: 'Dragonfly',          serviceTypeId: 'dragonfly', status: 'Running',   nodes: 'Nodes 1', nodeCount: 1, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM',  cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '3 weeks ago',  iconLetter: 'D' },

  // Kafka Connect
  { id: 'kc-sink-s3',       serviceName: 'kc-sink-s3',       serviceType: 'Apache Kafka',       serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-2',  planDetails: '2 CPU / 4 GB RAM',   cloudRegion: 'AWS: us-east-1',          location: 'North America, Virginia', created: '2 weeks ago',  iconLetter: 'K' },
  { id: 'kc-source-pg',     serviceName: 'kc-source-pg',     serviceType: 'Apache Kafka',       serviceTypeId: 'kafka', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-2',  planDetails: '2 CPU / 4 GB RAM',   cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '1 month ago',  iconLetter: 'K' },

  // Flink
  { id: 'flink-jobs',       serviceName: 'flink-jobs',       serviceType: 'Apache Flink',       serviceTypeId: 'flink', status: 'Running',    nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM',  cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '5 weeks ago',  iconLetter: 'F' },
  { id: 'flink-staging',    serviceName: 'flink-staging',    serviceType: 'Apache Flink',       serviceTypeId: 'flink', status: 'PowerOff',   nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-2',  planDetails: '2 CPU / 4 GB RAM',   cloudRegion: 'Google Cloud: us-central1', location: 'North America, Iowa',   created: '2 months ago', iconLetter: 'F' },

  // Theseus (M3)
  { id: 'm3-metrics-prod',  serviceName: 'm3-metrics-prod',  serviceType: 'M3DB',               serviceTypeId: 'm3db',  status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM / 300 GB storage', cloudRegion: 'AWS: us-east-1',          location: 'North America, Virginia', created: '4 months ago', iconLetter: 'M' },

  // Additional mixed services (to reach 50 total) ────────────────────────────
  { id: 'os-devlogs',       serviceName: 'os-devlogs',       serviceType: 'OpenSearch',         serviceTypeId: 'opensearch', status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',   planDetails: '1 CPU / 2 GB RAM / 8 GB storage',   cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '6 months ago', iconLetter: 'O' },
  { id: 'ch-billing',       serviceName: 'ch-billing',       serviceType: 'ClickHouse',         serviceTypeId: 'clickhouse', status: 'Running',    nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-8', planDetails: '8 CPU / 32 GB RAM / 900 GB storage', cloudRegion: 'AWS: us-east-1',          location: 'North America, Virginia', created: '3 months ago', iconLetter: 'C' },
  { id: 'redis-rate-limit', serviceName: 'redis-rate-limit', serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis',      status: 'Running',    nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',  planDetails: '2 CPU / 4 GB RAM',                  cloudRegion: 'Azure: westeurope',       location: 'Europe, Netherlands',     created: '7 weeks ago',  iconLetter: 'R' },
  { id: 'kafka-cdc',        serviceName: 'kafka-cdc',        serviceType: 'Apache Kafka',       serviceTypeId: 'kafka',      status: 'Running',    nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM',                 cloudRegion: 'AWS: eu-west-1',          location: 'Europe, Ireland',         created: '6 weeks ago',  iconLetter: 'K', pricingType: 'Inkless' },
  { id: 'flink-realtime',   serviceName: 'flink-realtime',   serviceType: 'Apache Flink',       serviceTypeId: 'flink',      status: 'Running',    nodes: 'Nodes 2', nodeCount: 2, planName: 'Business-4', planDetails: '4 CPU / 16 GB RAM',                 cloudRegion: 'Google Cloud: eu-west1',  location: 'Europe, Belgium',         created: '3 months ago', iconLetter: 'F' },
]

// Services for the MySQL ACU rollout scenario — existing users, no pricingType chip
const MYSQL_ACU_ROLLOUT_SERVICES: ServiceRow[] = [
  { id: 'mysql-prod-01',    serviceName: 'mysql-prod-01',    serviceType: 'MySQL',      serviceTypeId: 'mysql',      status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Business-4',  planDetails: '4 CPU / 16 GB RAM / 300 GB storage',  cloudRegion: 'AWS: eu-west-1',            location: 'Europe, Ireland',         created: '2 months ago',  iconLetter: 'M', cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '300 GB' },
  { id: 'mysql-prod-02',    serviceName: 'mysql-prod-02',    serviceType: 'MySQL',      serviceTypeId: 'mysql',      status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Business-4',  planDetails: '4 CPU / 16 GB RAM / 300 GB storage',  cloudRegion: 'AWS: us-east-1',            location: 'North America, Virginia', created: '2 months ago',  iconLetter: 'M', cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '300 GB' },
  { id: 'mysql-staging',    serviceName: 'mysql-staging',    serviceType: 'MySQL',      serviceTypeId: 'mysql',      status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4',   planDetails: '2 CPU / 4 GB RAM / 80 GB storage',    cloudRegion: 'AWS: eu-west-1',            location: 'Europe, Ireland',         created: '3 months ago',  iconLetter: 'M', cpuCount: 2, ramCapacity: '4 GB',  storageCapacity: '80 GB'  },
  { id: 'mysql-legacy-app', serviceName: 'mysql-legacy-app', serviceType: 'MySQL',      serviceTypeId: 'mysql',      status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Hobbyist',    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',     cloudRegion: 'Google Cloud: us-central1', location: 'North America, Iowa',     created: '8 months ago',  iconLetter: 'M', cpuCount: 1, ramCapacity: '2 GB',  storageCapacity: '8 GB'   },
  { id: 'pg-prod-01',       serviceName: 'pg-prod-01',       serviceType: 'PostgreSQL', serviceTypeId: 'postgresql', status: 'Running', nodes: 'Nodes 3', nodeCount: 3, planName: 'Business-4',  planDetails: '4 CPU / 16 GB RAM / 480 GB storage',  cloudRegion: 'AWS: eu-west-1',            location: 'Europe, Ireland',         created: '5 months ago',  iconLetter: 'P', cpuCount: 4, ramCapacity: '16 GB', storageCapacity: '480 GB' },
  { id: 'redis-sessions',   serviceName: 'redis-sessions',   serviceType: 'Caching & ValkeyDB', serviceTypeId: 'redis', status: 'Running', nodes: 'Nodes 1', nodeCount: 1, planName: 'Startup-4', planDetails: '2 CPU / 4 GB RAM',                   cloudRegion: 'AWS: eu-west-1',            location: 'Europe, Ireland',         created: '4 months ago',  iconLetter: 'R' },
]

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function getInitialServicesForScenario(scenarioId: string | null): ServiceRow[] {
  switch (scenarioId) {
    case 'empty-state':
    case 'first-time-user':
      return []
    case 'many-services':
      return shuffle(MANY_SERVICES)
    case 'mysql-acu-rollout':
      return MYSQL_ACU_ROLLOUT_SERVICES
    default:
      return INITIAL_SERVICES
  }
}

const SUBTITLE = (
  <Box style={{ color: '#4a4b57' }}>
    <Typography.Small>Project: ux-tests · Organization: BigCo Ltd.</Typography.Small>
  </Box>
)

function AppContent() {
  const addToast = useToast()
  const { activeScenarioId } = useScenario()
  const [view, setView] = useState<View>('project-services')
  const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false)
  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeId | null>(null)
  /** Service type for the overview page (set when navigating from create success or clicking a service). */
  const [overviewServiceType, setOverviewServiceType] = useState<ServiceTypeId | null>(null)
  /** Service id for the overview page (which service we're viewing; used for delete). */
  const [overviewServiceId, setOverviewServiceId] = useState<string | null>(null)
  /** List of services shown on the Services page (newly created ones are appended). */
  const [services, setServices] = useState<ServiceRow[]>(() => getInitialServicesForScenario(activeScenarioId))

  /** Controls the MySQL ACU rollout intro modal (shown automatically for that scenario). */
  const [mysqlRolloutModalOpen, setMysqlRolloutModalOpen] = useState(activeScenarioId === 'mysql-acu-rollout')

  // When the active scenario changes, reset the page state to match the scenario.
  const prevScenarioId = useRef(activeScenarioId)
  useEffect(() => {
    if (activeScenarioId === prevScenarioId.current) return
    prevScenarioId.current = activeScenarioId
    setServices(getInitialServicesForScenario(activeScenarioId))
    setView('project-services')
    setOverviewServiceId(null)
    setOverviewServiceType(null)
    setServiceTypeModalOpen(false)
    setCreationModalOpen(false)
    // Auto-open the rollout modal when entering the MySQL ACU rollout scenario
    setMysqlRolloutModalOpen(activeScenarioId === 'mysql-acu-rollout')
  }, [activeScenarioId])
  /** Tracks how many Kafka services have been created, used to rotate pricingType. */
  const kafkaCreationCount = useRef(0)
  /** Holds the current submit function exposed by CreateService via submitRef. */
  const createServiceSubmitRef = useRef<(() => void) | undefined>(undefined)
  /** Controls visibility of the Create read-replica modal. */
  const [createReplicaModalOpen, setCreateReplicaModalOpen] = useState(false)
  /** Controls visibility of the Create fork modal. */
  const [createForkModalOpen, setCreateForkModalOpen] = useState(false)
  /** Controls visibility of the Edit / Change plan modal. */
  const [editModalOpen, setEditModalOpen] = useState(false)
  /** Holds the current submit function exposed by CreateService (edit mode). */
  const editSubmitRef = useRef<(() => void) | undefined>(undefined)

  function openServiceTypeModal() {
    setServiceTypeModalOpen(true)
  }

  function openCreationModal(serviceType: ServiceTypeId) {
    setSelectedServiceType(serviceType)
    setServiceTypeModalOpen(false)
    setCreationModalOpen(true)
  }

  function closeCreationModal() {
    setCreationModalOpen(false)
  }

  /** Back from create form: close create modal and show Select service type again. */
  function handleBackToServiceTypeSelect() {
    setCreationModalOpen(false)
    setServiceTypeModalOpen(true)
  }

  function handleCreateSuccess(data?: CreatedServicePayload) {
    setCreationModalOpen(false)
    if (data) {
      const displayName = getServiceTypeDisplayName(data.serviceTypeId)
      const iconLetter = data.serviceTypeId === 'mysql' ? 'M' : data.serviceTypeId === 'postgresql' ? 'P' : displayName.charAt(0)
      const KAFKA_PRICING_ROTATION = ['Inkless', 'Classic'] as const
      const pricingType = data.serviceTypeId === 'kafka'
        ? KAFKA_PRICING_ROTATION[kafkaCreationCount.current++ % KAFKA_PRICING_ROTATION.length]
        : data.pricingModel === 'acu'
        ? 'ACU'
        : undefined
      setServices((prev) => [
        ...prev,
        {
          id: data.serviceName,
          serviceName: data.serviceName,
          serviceType: displayName,
          status: 'Running',
          nodes: `Nodes ${data.nodeCount}`,
          nodeCount: data.nodeCount,
          planName: data.planName,
          planDetails: data.planDetails,
          cloudRegion: `${data.cloud}: ${data.region}`,
          location: data.location,
          created: 'Just now',
          iconLetter,
          serviceTypeId: data.serviceTypeId,
          pricingType,
          cpuCount: data.cpuCount,
          ramCapacity: data.ramCapacity,
          storageCapacity: data.storageCapacity,
        },
      ])
      setOverviewServiceId(data.serviceName)
      setOverviewServiceType(data.serviceTypeId)
    } else {
      setOverviewServiceType(selectedServiceType)
    }
    setView('service-overview')
  }

  function handleChangePlan() {
    setEditModalOpen(true)
  }

  function handleEditSuccess(data?: CreatedServicePayload) {
    setEditModalOpen(false)
    if (!data || !overviewServiceId) return

    const currentService = services.find((s) => s.id === overviewServiceId)
    const wasSimpleTier = ['free', 'developer'].includes((currentService?.planName ?? '').toLowerCase())
    const verb = wasSimpleTier ? 'upgraded' : 'changed'
    const nodeText = `${data.nodeCount} ${data.nodeCount === 1 ? 'node' : 'nodes'}`
    addToast({
      message: `The service has been ${verb} to ${data.planName} · ${nodeText} · ${data.planDetails}`,
      icon: tickIcon,
      duration: 6000,
      position: 'top-right',
    })

    setServices((prev) =>
      prev.map((s) =>
        s.id === overviewServiceId
          ? {
              ...s,
              planName: data.planName,
              planDetails: data.planDetails,
              nodeCount: data.nodeCount,
              nodes: `Nodes ${data.nodeCount}`,
              cloudRegion: `${data.cloud}: ${data.region}`,
              location: data.location,
              cpuCount: data.cpuCount,
              ramCapacity: data.ramCapacity,
              storageCapacity: data.storageCapacity,
              // Reflect any pricing model toggle made during the edit.
              // Only update when the form emits pricingModel (PG / MySQL with the toggle).
              // For other service types the field is absent, so the existing chip is preserved.
              ...(data.pricingModel != null
                ? { pricingType: data.pricingModel === 'acu' ? 'ACU' : undefined }
                : {}),
            }
          : s,
      ),
    )
  }

  /** Delete triggered from the service overview page (⋯ menu). */
  function handleDeleteService() {
    if (overviewServiceId) {
      setServices((prev) => prev.filter((s) => s.id !== overviewServiceId))
      setOverviewServiceId(null)
      setOverviewServiceType(null)
    }
    setView('project-services')
  }

  /** Delete triggered from the project services table row menu. */
  function handleDeleteServiceFromList(serviceId: string) {
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  function handleCreateReplica(replicaName: string) {
    if (!overviewServiceId || !overviewServiceType) return
    const displayName = getServiceTypeDisplayName(overviewServiceType)
    const iconLetter = overviewServiceType === 'mysql' ? 'M' : overviewServiceType === 'postgresql' ? 'P' : displayName.charAt(0)
    const sourceServiceId = overviewServiceId
    setServices((prev) => [
      ...prev,
      {
        id: replicaName,
        serviceName: replicaName,
        serviceType: displayName,
        serviceTypeId: overviewServiceType,
        status: 'Running',
        nodes: 'Nodes 1',
        planName: 'Startup',
        planDetails: '1 CPU / 4 GB RAM',
        cloudRegion: 'Google Cloud: asia-east1',
        location: 'Asia, Taiwan',
        created: 'Just now',
        iconLetter,
        replicationRole: 'read_replica',
        sourceServiceId,
      },
    ])
    setCreateReplicaModalOpen(false)
    // Stay on the primary service overview so the new replica appears in the Read replica section.
    // (The user can click the replica link there to navigate to the replica's own overview.)
  }

  function handleCreateFork(forkName: string) {
    if (!overviewServiceId || !overviewServiceType) return
    const displayName = getServiceTypeDisplayName(overviewServiceType)
    const iconLetter = overviewServiceType === 'mysql' ? 'M' : overviewServiceType === 'postgresql' ? 'P' : displayName.charAt(0)
    const sourceServiceId = overviewServiceId
    const sourceService = services.find((s) => s.id === overviewServiceId)
    setServices((prev) => [
      ...prev,
      {
        id: forkName,
        serviceName: forkName,
        serviceType: displayName,
        serviceTypeId: overviewServiceType,
        status: 'Running',
        nodes: sourceService?.nodes ?? 'Nodes 1',
        planName: sourceService?.planName ?? 'Startup',
        planDetails: sourceService?.planDetails ?? '1 CPU / 2 GB RAM',
        cloudRegion: sourceService?.cloudRegion ?? 'Google Cloud: asia-east1',
        location: sourceService?.location ?? 'Asia, Taiwan',
        created: 'Just now',
        iconLetter,
        replicationRole: 'fork',
        sourceServiceId,
      },
    ])
    setCreateForkModalOpen(false)
    // Stay on the source service overview so the user sees context; they can navigate to the fork via the services list.
  }

  const createModalTitle = selectedServiceType
    ? `Create ${getServiceTypeDisplayName(selectedServiceType)} service`
    : 'Create service'

  const editOverviewService = services.find((s) => s.id === overviewServiceId)
  const isSimpleTierEdit = ['free', 'developer'].includes((editOverviewService?.planName ?? '').toLowerCase())
  const editVerb = isSimpleTierEdit ? 'Upgrade' : 'Change'
  const editModalTitle = `${editVerb} ${overviewServiceType ? getServiceTypeDisplayName(overviewServiceType) : 'service'} plan`

  return (
    <>
      {/* ── Prototype scenario layer — not part of the product UI ── */}
      <ScenarioTrigger />
      <ScenarioPanel />
      <ScenarioBadge />

      {/* ── Scenario: MySQL ACU rollout — intro modal ── */}
      <MysqlAcuRolloutModal
        open={mysqlRolloutModalOpen}
        onClose={() => setMysqlRolloutModalOpen(false)}
        onCreateService={() => {
          setMysqlRolloutModalOpen(false)
          setSelectedServiceType('mysql')
          setCreationModalOpen(true)
        }}
      />

      {view === 'org-home' && (
        <OrgHomePage
          onProjectsClick={() => setView('project-services')}
          onBillingClick={() => setView('billing-invoice')}
          onInvoiceClick={() => setView('billing-invoice')}
        />
      )}

      {view === 'billing-invoice' && (
        <BillingInvoiceDetail
          onBack={() => setView('billing-invoice')}
          onOrgHomeClick={() => setView('org-home')}
          onBillingClick={() => setView('billing-invoice')}
        />
      )}

      {view === 'service-overview' && (
        <ServiceOverview
          key={`overview:${overviewServiceId ?? ''}`}
          serviceId={overviewServiceId}
          serviceTypeId={overviewServiceType}
          services={services}
          onBackToProject={() => setView('project-services')}
          onDeleteService={handleDeleteService}
          onChangePlan={handleChangePlan}
          onCreateReplica={() => setCreateReplicaModalOpen(true)}
          onCreateFork={() => setCreateForkModalOpen(true)}
          onBillingClick={() => setView('billing-invoice')}
          onOrgHomeClick={() => setView('org-home')}
          onReplicaClick={(replicaId) => {
            const replica = services.find((s) => s.id === replicaId)
            if (replica) {
              setOverviewServiceId(replica.id)
              setOverviewServiceType(replica.serviceTypeId ?? 'postgresql')
              setView('service-overview')
            }
          }}
        />
      )}

      {view === 'project-services' && (
        <ProjectServices
          services={services}
          onCreateServiceClick={openServiceTypeModal}
          onServiceClick={(serviceId) => {
            const service = services.find((s) => s.id === serviceId)
            if (service) {
              setOverviewServiceId(service.id)
              setOverviewServiceType(service.serviceTypeId ?? 'mysql')
              setView('service-overview')
            }
          }}
          onDeleteService={handleDeleteServiceFromList}
          onBillingClick={() => setView('billing-invoice')}
          onOrgHomeClick={() => setView('org-home')}
        />
      )}

      {/* Create fork modal — opened from ServiceOverview's Backups overview section */}
      <CreateForkModal
        key={`fork-modal:${overviewServiceId ?? ''}`}
        open={createForkModalOpen}
        sourceService={services.find((s) => s.id === overviewServiceId) ?? null}
        onClose={() => setCreateForkModalOpen(false)}
        onCreateFork={handleCreateFork}
      />

      {/* Create read-replica modal — opened from ServiceOverview's Read replica section */}
      <CreateReadReplicaModal
        key={`replica-modal:${overviewServiceId ?? ''}`}
        open={createReplicaModalOpen}
        sourceService={services.find((s) => s.id === overviewServiceId) ?? null}
        onClose={() => setCreateReplicaModalOpen(false)}
        onCreateReplica={handleCreateReplica}
      />

      {/* Edit / Upgrade plan modal — opened from ServiceOverview "Change" / "Upgrade" button */}
      <Modal
        title={editModalTitle}
        subtitle={SUBTITLE}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        size="full"
        primaryAction={{
          text: isSimpleTierEdit ? 'Upgrade plan' : 'Apply changes',
          onClick: () => editSubmitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: () => setEditModalOpen(false),
        }}
      >
        {editModalOpen && overviewServiceId && (
          <CreateService
            key={`edit:${overviewServiceId}`}
            embedded
            editMode
            serviceTypeId={overviewServiceType}
            serviceDisplayName={overviewServiceType ? getServiceTypeDisplayName(overviewServiceType) : undefined}
            initialValues={services.find((s) => s.id === overviewServiceId)}
            onClose={() => setEditModalOpen(false)}
            onCreateSuccess={handleEditSuccess}
            submitRef={editSubmitRef}
          />
        )}
      </Modal>

      {/* Same modal flow for all entry points: select type (full) then create (full) */}
      <ServiceTypeSelectModal
        open={serviceTypeModalOpen}
        onClose={() => setServiceTypeModalOpen(false)}
        onSelectService={openCreationModal}
      />
      <Modal
        title={createModalTitle}
        subtitle={SUBTITLE}
        open={creationModalOpen}
        onClose={closeCreationModal}
        size="full"
        primaryAction={{
          text: createModalTitle,
          onClick: () => createServiceSubmitRef.current?.(),
        }}
        secondaryActions={{
          text: 'Cancel',
          onClick: handleBackToServiceTypeSelect,
        }}
      >
        {creationModalOpen && (
          <CreateService
            key={selectedServiceType ?? 'create'}
            embedded
            serviceTypeId={selectedServiceType ?? undefined}
            serviceDisplayName={selectedServiceType ? getServiceTypeDisplayName(selectedServiceType) : undefined}
            onClose={handleBackToServiceTypeSelect}
            onCreateSuccess={handleCreateSuccess}
            submitRef={createServiceSubmitRef}
          />
        )}
      </Modal>
    </>
  )
}

AppContent.displayName = 'AppContent'

function App() {
  return (
    <ScenarioProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ScenarioProvider>
  )
}

App.displayName = 'App'

export default App
