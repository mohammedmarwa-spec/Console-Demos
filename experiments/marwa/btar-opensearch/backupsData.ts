/** OpenSearch managed service used for the BTAR prototype. Matches the console screenshot. */
export const SERVICE_NAME = 'os-50f7b82'
export const PROJECT_NAME = 'dev-sandbox'
export const PROJECT_LABEL = 'DEV-SANDBOX'
export const ORG_NAME = 'Aiven'
export const SERVICE_VERSION = 'OpenSearch 3.6.0'
export const PRIMARY_LOCATION = 'google-europe-west1'

/** PostgreSQL service this BTAR window is for. OpenSearch stays on SERVICE_NAME. */
export const POSTGRES_SERVICE_NAME = 'orders-pg'

/**
 * Placeholder monthly plan price in dollars. The PostgreSQL cost card adds it to the BTAR estimate.
 * Set SHOW_COMBINED_TOTAL to false to hide that line and the two plan-total rows.
 */
export const PLAN_MONTHLY_PRICE = 75
export const SHOW_COMBINED_TOTAL = true

/**
 * Same-cloud Google regions offered as a secondary backup location.
 * The primary region is omitted; the console disables it in this list.
 */
export const BACKUP_REGION_OPTIONS = [
  'google-europe-north1',
  'google-europe-west4',
  'google-us-east1',
  'google-asia-east1',
] as const

export const BACKUP_PAGE_DESCRIPTION =
  'Your data is backed up every 60 minutes, and the backups are retained for 24 hours. Additional backups are taken every 24 hours and retained according to your service plan.'

export const ADD_SECONDARY_COPY =
  'Set a secondary backup location for comprehensive disaster recovery. This enables forking from the secondary location in case of downtime in the primary region. Restoration from a secondary backup location is limited to the region where the secondary backup is located.'

export const LEARN_MORE_HREF = 'https://aiven.io/docs/platform/concepts/backup-to-another-region'

export type BackupRow = {
  id: string
  dataSize: string
  backupTime: string
  primaryLocation: string
  secondaryLocation: string
}

/** Five rows sampled from the top of the console backups table. */
export const BACKUP_ROWS: BackupRow[] = [
  {
    id: 'backup-1',
    dataSize: '171.3 KiB',
    backupTime: '27 Oct 2026 8:21:01 UTC',
    primaryLocation: PRIMARY_LOCATION,
    secondaryLocation: 'No secondary backup location',
  },
  {
    id: 'backup-2',
    dataSize: '171.3 KiB',
    backupTime: '27 Oct 2026 6:21:48 UTC',
    primaryLocation: PRIMARY_LOCATION,
    secondaryLocation: 'No secondary backup location',
  },
  {
    id: 'backup-3',
    dataSize: '180.2 KiB',
    backupTime: '27 Oct 2026 7:21:47 UTC',
    primaryLocation: PRIMARY_LOCATION,
    secondaryLocation: 'No secondary backup location',
  },
  {
    id: 'backup-4',
    dataSize: '180.2 KiB',
    backupTime: '27 Oct 2026 6:21:48 UTC',
    primaryLocation: PRIMARY_LOCATION,
    secondaryLocation: 'No secondary backup location',
  },
  {
    id: 'backup-5',
    dataSize: '180.2 KiB',
    backupTime: '27 Oct 2026 5:21:43 UTC',
    primaryLocation: PRIMARY_LOCATION,
    secondaryLocation: 'No secondary backup location',
  },
]
