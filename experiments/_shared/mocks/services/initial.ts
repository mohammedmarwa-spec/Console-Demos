import type { ServiceRow } from '@/screens/ProjectServices'

export const INITIAL_SERVICES: ServiceRow[] = [
  {
    id: 'mysql-204e49c9',
    serviceName: 'mysql-204e49c9',
    serviceType: 'MySQL',
    status: 'Running',
    nodes: 'Nodes 1',
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',
    cloudRegion: 'Google Cloud: asia-east1',
    location: 'Asia, Taiwan',
    created: '16 minutes ago',
    createdByInitials: 'RS',
    createdByFullName: 'Rick Salevsky',
    iconLetter: 'M',
    serviceTypeId: 'mysql',
    pricingType: 'ACU',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '8 GB',
    storageCapacity: '8 GB',
    serviceTier: 'Professional',
    computeType: 'Standard',
  },
]
