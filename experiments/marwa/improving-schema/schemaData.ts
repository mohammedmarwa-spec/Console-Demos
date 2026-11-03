export const ORG_NAME = 'Aiven'
export const PROJECT_NAME = 'dev-sandbox'
export const PROJECT_LABEL = 'DEV-SANDBOX'
export const SERVICE_NAME = 'mirjam-dev-tier'
export const SERVICE_VERSION = 'Apache Kafka 4.3.1'

/** Assumed: these are the Schema Registry compatibility levels. This prototype has no schema API to confirm the list. */
export const COMPATIBILITY_LEVELS = [
  'BACKWARD',
  'BACKWARD_TRANSITIVE',
  'FORWARD',
  'FORWARD_TRANSITIVE',
  'FULL',
  'FULL_TRANSITIVE',
  'NONE',
] as const

export type CompatibilityLevel = (typeof COMPATIBILITY_LEVELS)[number]

export const DEFAULT_GLOBAL_COMPATIBILITY: CompatibilityLevel = 'BACKWARD'

export type SchemaVersion = {
  id: string
  version: number
  schemaId: number
  softDeleted: boolean
}

export type SchemaSubject = {
  name: string
  /** null means the subject follows the global compatibility level. */
  compatibility: CompatibilityLevel | null
  versions: SchemaVersion[]
}

function versions(count: number, firstSchemaId: number, softDeletedFrom?: number): SchemaVersion[] {
  return Array.from({ length: count }, (_, index) => {
    const version = index + 1
    return {
      id: String(version),
      version,
      schemaId: firstSchemaId + index,
      softDeleted: softDeletedFrom != null && version >= softDeletedFrom,
    }
  })
}

const EXTRA_SUBJECTS = [
  'customers-key',
  'payments-value',
  'shipments-value',
  'inventory-key',
  'clicks-value',
  'sessions-key',
  'products-value',
  'reviews-value',
  'carts-value',
  'invoices-key',
  'users-value',
  'alerts-value',
  'audit-key',
  'notifications-value',
  'catalog-value',
  'prices-value',
  'stores-key',
  'regions-value',
  'devices-value',
  'events-key',
  'profiles-value',
  'tickets-value',
  'refunds-value',
  'loyalty-key',
  'search-value',
  'recommendations-value',
  'experiments-key',
  'features-value',
  'quotas-value',
  'heartbeats-key',
]

export function createDefaultSubjects(): SchemaSubject[] {
  const subjects: SchemaSubject[] = [
    {
      name: 'metrics_data_gen-value',
      compatibility: null,
      versions: versions(1, 1),
    },
    {
      name: 'orders-value',
      compatibility: 'FULL',
      versions: versions(3, 2, 3),
    },
  ]
  let schemaId = 5
  for (const name of EXTRA_SUBJECTS) {
    subjects.push({ name, compatibility: null, versions: versions(1, schemaId) })
    schemaId += 1
  }
  return subjects
}

export function latestVersion(subject: SchemaSubject): number | null {
  if (subject.versions.length === 0) return null
  return Math.max(...subject.versions.map((version) => version.version))
}

export function nextSchemaId(subjects: SchemaSubject[]): number {
  const ids = subjects.flatMap((subject) => subject.versions.map((version) => version.schemaId))
  return ids.length === 0 ? 1 : Math.max(...ids) + 1
}

const METRICS_SCHEMA = `{
  "fields": [
    {
      "examples": [
        "cpu_usage",
        "io_throughput"
      ],
      "name": "metric.name",
      "type": "string"
    },
    {
      "examples": [
        "24_hr",
        "12_hr",
        "1_hr",
        "instant"
      ],
      "name": "metric.window",
      "type": "string"
    },
    {
      "examples": [
        "100",
        "1"
      ],
      "name": "metric.value",
      "type": "string"
    }
  ]
}`

/** Mock schema text for the compare view. Assumed: this prototype has no schema documents from an API. */
export function schemaDocument(subjectName: string, version: number): string {
  if (subjectName === 'metrics_data_gen-value') return METRICS_SCHEMA
  return JSON.stringify(
    {
      type: 'record',
      name: subjectName.replace(/[^a-zA-Z0-9_]/g, '_'),
      fields: [
        { name: 'id', type: 'string' },
        { name: 'value', type: version === 1 ? 'string' : 'long' },
      ],
    },
    null,
    2,
  )
}
