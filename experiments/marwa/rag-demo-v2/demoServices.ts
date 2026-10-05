import type { ServiceRow } from '@/screens/ProjectServices'

/**
 * Demo starting state for the ProjectList experiment.
 *
 * Reproduces the exact services list used to kick off the demo. The OpenSearch
 * service `os-maxim-muzafarov-1c149c43` intentionally starts at 17 nodes.
 *
 * Local to this experiment (not in src/mocks) because it's a bespoke demo set.
 */
// prettier-ignore
export const DEMO_SERVICES: ServiceRow[] = [
  { id: 'mysql-a7006ab',                serviceName: 'mysql-a7006ab',                serviceType: 'MySQL',                 serviceTypeId: 'mysql',      status: 'Running',     nodes: 'Nodes 1',  nodeCount: 1,  planName: 'Developer-1',        planDetails: '1 CPU / 1 GB RAM / 8 GB storage',                                cloudRegion: 'DigitalOcean: fra',        location: 'Europe, Germany',              created: '7 hours ago',  iconLetter: 'M', cpuCount: 1, ramCapacity: '1 GB', storageCapacity: '8 GB'   },
  { id: 'kafka-rkar-3-classic',         serviceName: 'kafka-rkar-3-classic',         serviceType: 'Apache Kafka',          serviceTypeId: 'kafka',      status: 'Running',     nodes: 'Nodes 3',  nodeCount: 3,  planName: 'Startup-4',          planDetails: '1 CPU / 4 GB RAM / 90 GB storage - 3-node high availability set', cloudRegion: 'Google Cloud: europe-west1', location: 'Europe, Belgium',              created: '7 hours ago',  iconLetter: 'K', pricingType: 'Classic', cpuCount: 1, ramCapacity: '4 GB', storageCapacity: '90 GB' },
  { id: 'os-maxim-muzafarov-1c149c43',  serviceName: 'os-maxim-muzafarov-1c149c43',  serviceType: 'OpenSearch',            serviceTypeId: 'opensearch', status: 'Running',     nodes: 'Nodes 17', nodeCount: 17, planName: 'Startup-8',          planDetails: '2 CPU / 8 GB RAM / 175 GB storage',                              cloudRegion: 'Google Cloud: europe-west10', location: 'Europe, Germany',             created: '20 hours ago', iconLetter: 'O', cpuCount: 2, ramCapacity: '8 GB', storageCapacity: '175 GB' },
  { id: 'clickhouse-tilman-dev-plan',   serviceName: 'clickhouse-tilman-dev-plan',   serviceType: 'ClickHouse',            serviceTypeId: 'clickhouse', status: 'Running',     nodes: 'Nodes 1',  nodeCount: 1,  planName: 'Developer-8',        planDetails: '2 CPU / 8 GB RAM / 92 GB storage - 1 node',                       cloudRegion: 'DigitalOcean: fra',        location: 'Europe, Germany',              created: '23 hours ago', iconLetter: 'C', cpuCount: 2, ramCapacity: '8 GB', storageCapacity: '92 GB' },
  { id: 'kafka-3e10cc21',               serviceName: 'kafka-3e10cc21',               serviceType: 'Apache Kafka (Inkless)', serviceTypeId: 'kafka',     status: 'Running',     nodes: '',         planName: 'Kafka-professional-1', planDetails: '',                                                             cloudRegion: 'Google Cloud: us-east1',   location: 'United States, South Carolina', created: '23 hours ago', iconLetter: 'K', pricingType: 'Inkless' },
  { id: 'pg-cp-2',                      serviceName: 'pg-cp-2',                      serviceType: 'PostgreSQL',            serviceTypeId: 'postgresql', status: 'Running',     nodes: 'Nodes 1',  nodeCount: 1,  planName: 'Startup-4',          planDetails: '1 CPU / 4 GB RAM / 80 GB storage',                               cloudRegion: 'Google Cloud: europe-west8', location: 'Europe, Italy',                created: '23 hours ago', iconLetter: 'P', cpuCount: 1, ramCapacity: '4 GB', storageCapacity: '80 GB' },
  { id: 'mysql-vasilii',                serviceName: 'mysql-vasilii',                serviceType: 'MySQL',                 serviceTypeId: 'mysql',      status: 'Powered off', nodes: 'Nodes 1',  nodeCount: 1,  planName: 'Developer-1',        planDetails: '1 CPU / 1 GB RAM / 8 GB storage',                                cloudRegion: 'DigitalOcean: fra',        location: 'Europe, Germany',              created: '1 day ago',    iconLetter: 'M', cpuCount: 1, ramCapacity: '1 GB', storageCapacity: '8 GB'   },
]
