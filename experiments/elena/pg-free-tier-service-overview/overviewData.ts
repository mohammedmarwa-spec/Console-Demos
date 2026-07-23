/** Mock Free-tier PostgreSQL overview data — aligned with free-dev-upgrade + DOM capsule. */

export const ORG_NAME = 'Demo Org'
export const PROJECT_NAME = 'demo-project'

export const SERVICE = {
  id: 'pg-free-01',
  name: 'pg-free-01',
  serviceType: 'PostgreSQL',
  serviceTypeId: 'postgresql' as const,
  version: 'PostgreSQL 17.10',
  eolLabel: 'EOL : 8 November 2029 : OK',
  status: 'Running',
  nodeCount: 1,
  planName: 'Free',
  planDetails: '1 CPU / 1 GB RAM / 1 GB storage',
  ramCapacity: '1 GB',
  storageCapacity: '1 GB',
  memoryPercent: 68,
  storagePercent: 12.4,
  cloudProvider: 'DigitalOcean',
  cloudRegion: 'ams',
  deploymentModel: 'Public internet',
  ipAllowlist: 'Open to all',
  maintenanceWindow: 'Wednesdays after 14:53:07 UTC',
  backupLocation: 'do-ams3',
  latestBackup: '2 minutes ago',
  oldestBackup: '2 minutes ago',
  totalBackupsStored: '32 MB',
} as const

export const UPGRADE_BANNER = {
  title: 'Scale up your PostgreSQL for only $5/month',
  description:
    'Increase your storage, get Basic support, and prevent automatic power-offs during inactivity.',
  cta: 'Upgrade now',
} as const

export const CONNECTION_ROWS = [
  {
    label: 'Service URI',
    value:
      'postgres://USER:REDACTED@pg-free-01.example.aivencloud.com:12345/defaultdb?sslmode=require',
  },
  { label: 'Database name', value: 'defaultdb' },
  { label: 'Host', value: 'pg-free-01.example.aivencloud.com' },
  { label: 'Port', value: '12345' },
  { label: 'User', value: 'avnadmin' },
  { label: 'Password', value: '**********' },
  { label: 'SSL mode', value: 'require' },
  { label: 'CA certificate', value: 'Show' },
] as const

export const FREE_TIER_GATES = {
  readReplica:
    'Not available on the Free tier plans.',
  integrations:
    'Service integrations are only available on startup plans and higher.',
} as const
