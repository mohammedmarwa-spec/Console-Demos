import type { ServiceRow } from '../../screens/ProjectServices'

export const DEEPTRACE_DEMO_PG_ID = 'pg-deeptrace-demo'

export const DEEPTRACE_DEMO_SERVICES: ServiceRow[] = [
  {
    id: DEEPTRACE_DEMO_PG_ID,
    serviceName: DEEPTRACE_DEMO_PG_ID,
    serviceType: 'PostgreSQL',
    serviceTypeId: 'postgresql',
    status: 'Running',
    nodes: 'Nodes 3',
    nodeCount: 3,
    planName: 'Business-4',
    planDetails: '4 CPU / 16 GB RAM / 480 GB storage',
    cloudRegion: 'AWS: eu-west-1',
    location: 'Europe, Ireland',
    created: '3 days ago',
    iconLetter: 'P',
    cpuCount: 4,
    ramCapacity: '16 GB',
    storageCapacity: '480 GB',
  },
]
