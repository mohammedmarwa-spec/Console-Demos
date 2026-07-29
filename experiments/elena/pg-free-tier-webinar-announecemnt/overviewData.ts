/** Mock Free-tier PostgreSQL overview — Running state with polished layout. */

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
  planDetails: '1 CPU / 1 GB RAM / 8 GB storage',
  ramCapacity: '1 GB',
  storageCapacity: '8 GB',
  memoryPercent: 68,
  storagePercent: 12.4,
  cloudProvider: 'DigitalOcean',
  cloudProviderId: 'digitalocean' as const,
  cloudRegion: 'fra',
  cloudRegionFlag: '🇩🇪',
  deploymentModel: 'Public internet',
  ipAllowlist: 'Open to all',
  maintenanceWindow: 'Tuesdays after 09:54:08 UTC',
  backupLocation: 'do-fra1',
  latestBackup: '2 minutes ago',
  oldestBackup: '2 minutes ago',
  totalBackupsStored: '66 MB',
  connectionLimit: '15',
} as const

export const UPGRADE_BANNER = {
  title: 'Scale up your PostgreSQL for only $5/month',
  description:
    'Increase your storage, get Basic support, and prevent automatic power-offs during inactivity.',
  cta: 'Upgrade now',
} as const

/** In-product webinar promo for free-tier PG users (Alert.Banner information). */
export const WEBINAR_ANNOUNCEMENT = {
  title: 'New to PostgreSQL? Build your first database live',
  description:
    'Join a beginner-friendly walkthrough of Aiven for PostgreSQL using MCP and PGStudio.',
  schedule: 'August 5 at 18:00 · 45 min',
  registerCta: 'Register',
  href: '#',
} as const

export type ConnectionRow = {
  label: string
  value: string
  valueIsLink?: boolean
  actions: Array<'copy' | 'download' | 'reveal' | 'refresh'>
}

export const CONNECTION_ROWS: ConnectionRow[] = [
  {
    label: 'Service URI',
    value:
      'postgres://avnadmin:CLICK_TO_REVEAL_PASSWORD@pg-free-01.example.aivencloud.com:12345/defaultdb?sslmode=require',
    actions: ['copy'],
  },
  { label: 'Database name', value: 'defaultdb', actions: ['copy'] },
  { label: 'Host', value: 'pg-free-01.example.aivencloud.com', actions: ['copy'] },
  { label: 'Port', value: '12345', actions: ['copy'] },
  { label: 'User', value: 'avnadmin', actions: ['copy'] },
  {
    label: 'Password',
    value: '**********',
    actions: ['refresh', 'reveal', 'copy'],
  },
  { label: 'SSL mode', value: 'require', actions: ['copy'] },
  {
    label: 'CA certificate',
    value: 'Show',
    valueIsLink: true,
    actions: ['download', 'copy'],
  },
  { label: 'Connection limit', value: SERVICE.connectionLimit, actions: ['copy'] },
]

export const FREE_TIER_GATES = {
  readReplica: 'Not available on the Free tier plans.',
  integrations:
    'Connect this service to other Aiven services or external endpoints. Integrations enable features like metrics forwarding, log shipping, and cross-service data flows.',
} as const
