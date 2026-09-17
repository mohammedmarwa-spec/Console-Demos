import type { OutcomeId } from './ExploreSolutions'

/**
 * Project context the Explore-solutions flow reads from: environment drives plan tier
 * and the <type>-<env> naming convention, region default seeds the region selector.
 */
export type EnvironmentId = 'development' | 'staging' | 'production'

export type PlanTier = 'startup' | 'business'

export type ProjectContext = {
  id: string
  name: string
  /** Environment the project represents in the by-environment topology. */
  environment: EnvironmentId
  environmentLabel: string
  /** Suffix used by this project's naming convention (<type>-<env>). */
  nameToken: string
  regionDefault: string
  /** Org + business unit — the switcher only offers siblings inside the same one. */
  unitId: string
}

export const PROJECT_UNIT_ID = 'acme-platform'

export const SIBLING_PROJECTS: ProjectContext[] = [
  {
    id: 'acme-dev',
    name: 'acme-dev',
    environment: 'development',
    environmentLabel: 'Development',
    nameToken: 'dev',
    regionDefault: 'google-europe-west1',
    unitId: PROJECT_UNIT_ID,
  },
  {
    id: 'acme-staging',
    name: 'acme-staging',
    environment: 'staging',
    environmentLabel: 'Staging',
    nameToken: 'staging',
    regionDefault: 'google-europe-west1',
    unitId: PROJECT_UNIT_ID,
  },
  {
    id: 'acme-prod',
    name: 'acme-prod',
    environment: 'production',
    environmentLabel: 'Production',
    nameToken: 'prod',
    regionDefault: 'google-europe-west1',
    unitId: PROJECT_UNIT_ID,
  },
]

/** Development and staging get single-node plans; production gets HA. */
export function planTierFor(environment: EnvironmentId): PlanTier {
  return environment === 'production' ? 'business' : 'startup'
}

export type RegionOption = { value: string; label: string }

export const REGION_OPTIONS: RegionOption[] = [
  { value: 'google-europe-west1', label: 'Google Cloud · europe-west1' },
  { value: 'aws-eu-west-1', label: 'AWS · eu-west-1' },
  { value: 'aws-us-east-1', label: 'AWS · us-east-1' },
  { value: 'azure-germany-westcentral', label: 'Azure · germany-westcentral' },
]

type PlanOption = { name: string; eur: number }

/**
 * UC2 edge — this org has not enabled Aiven Apps, so Runtime nodes render as a gated
 * amber row with a request-access action while the data services still deploy.
 */
export const APPS_ENABLED = false

export type BlueprintNode = {
  id: string
  /** Service-type prefix the naming convention builds on. */
  typePrefix: string
  typeLabel: string
  /** Icon id from the shared ServiceIcon set. */
  iconId: 'postgresql' | 'kafka' | 'opensearch' | 'valkey' | 'clickhouse' | null
  /** Apps run on Runtime: not billed per plan here, and gated on org access. */
  kind: 'service' | 'app'
  /** Optional nodes render as toggles, off by default. */
  optional: boolean
  /** Why this node is in the blueprint — shown under the row. */
  note?: string
  plans: Record<PlanTier, PlanOption> | null
}

const NODES = {
  kafka: {
    typePrefix: 'kafka',
    typeLabel: 'Apache Kafka',
    iconId: 'kafka',
    kind: 'service',
    plans: { startup: { name: 'Startup-2', eur: 199 }, business: { name: 'Business-4', eur: 715 } },
  },
  postgres: {
    typePrefix: 'postgres',
    typeLabel: 'PostgreSQL',
    iconId: 'postgresql',
    kind: 'service',
    plans: { startup: { name: 'Startup-4', eur: 120 }, business: { name: 'Business-4', eur: 480 } },
  },
  opensearch: {
    typePrefix: 'opensearch',
    typeLabel: 'OpenSearch',
    iconId: 'opensearch',
    kind: 'service',
    plans: { startup: { name: 'Startup-2', eur: 89 }, business: { name: 'Business-4', eur: 399 } },
  },
  valkey: {
    typePrefix: 'valkey',
    typeLabel: 'Valkey',
    iconId: 'valkey',
    kind: 'service',
    plans: { startup: { name: 'Startup-4', eur: 70 }, business: { name: 'Business-4', eur: 280 } },
  },
  clickhouse: {
    typePrefix: 'clickhouse',
    typeLabel: 'ClickHouse',
    iconId: 'clickhouse',
    kind: 'service',
    plans: { startup: { name: 'Startup-16', eur: 350 }, business: { name: 'Business-16', eur: 980 } },
  },
  app: {
    typePrefix: 'orders-api',
    typeLabel: 'Aiven Runtime',
    iconId: null,
    kind: 'app',
    plans: null,
  },
} satisfies Record<string, Omit<BlueprintNode, 'id' | 'optional' | 'note'>>

type NodeKey = keyof typeof NODES

function node(key: NodeKey, extra: { optional?: boolean; note?: string } = {}): BlueprintNode {
  return { id: key, optional: extra.optional ?? false, note: extra.note, ...NODES[key] }
}

/** Gated nodes still render — they just cannot be created or priced yet. */
export function isNodeAvailable(node: BlueprintNode): boolean {
  return node.kind !== 'app' || APPS_ENABLED
}

/** Billable items are the ones that get their own gate row. */
export function billableNodes(nodes: BlueprintNode[]): BlueprintNode[] {
  return nodes.filter((n) => isNodeAvailable(n) && n.plans !== null)
}

export type Blueprint = {
  outcomeId: OutcomeId
  title: string
  nodes: BlueprintNode[]
  /** Three plain-language capabilities the blueprint unlocks. */
  capabilities: [string, string, string]
  /** Integration created automatically once both parents are running. */
  integration?: { label: string; between: [string, string] }
}

export const BLUEPRINTS: Record<OutcomeId, Blueprint> = {
  'stream-events': {
    outcomeId: 'stream-events',
    title: 'Stream events',
    nodes: [node('kafka'), node('postgres', { optional: true, note: 'Store processed events for querying' })],
    capabilities: [
      'Publish and consume events with a few lines of code.',
      'Replay the last 7 days when a consumer falls behind.',
      'Fan the same stream out to new services later.',
    ],
    integration: { label: 'Stream events into the database', between: ['kafka', 'postgres'] },
  },
  'store-app-data': {
    outcomeId: 'store-app-data',
    title: 'Store app data',
    nodes: [node('postgres'), node('valkey', { optional: true, note: 'Cache hot reads in front of the database' })],
    capabilities: [
      'Run SQL against your application data.',
      'Restore to any point in the last 2 days.',
      'Add read replicas when traffic grows.',
    ],
  },
  'search-logs': {
    outcomeId: 'search-logs',
    title: 'Search & logs',
    nodes: [node('opensearch'), node('kafka', { optional: true, note: 'Buffer high-volume ingest' })],
    capabilities: [
      'Search text and logs with typo tolerance.',
      'Build dashboards over everything you ingest.',
      'Keep 30 days of logs queryable.',
    ],
  },
  'realtime-analytics': {
    outcomeId: 'realtime-analytics',
    title: 'Real-time analytics',
    nodes: [node('clickhouse'), node('kafka', { optional: true, note: 'Ingest events continuously' })],
    capabilities: [
      'Query billions of rows in under a second.',
      'Aggregate as data lands, not overnight.',
      'Point your BI tool straight at it.',
    ],
  },
  'cache-sessions': {
    outcomeId: 'cache-sessions',
    title: 'Cache & sessions',
    nodes: [node('valkey'), node('postgres', { optional: true, note: 'Persist what must outlive the cache' })],
    capabilities: [
      'Serve hot keys in under a millisecond.',
      'Keep user sessions out of your database.',
      'Expire data automatically with TTLs.',
    ],
  },
  'run-app': {
    outcomeId: 'run-app',
    title: 'Run an app next to data',
    nodes: [node('kafka'), node('postgres'), node('app')],
    capabilities: [
      'Deploy from a GitHub repo on every push.',
      'Reach your data over the private network.',
      'Scale the app without touching the data layer.',
    ],
    integration: { label: 'Stream events into the database', between: ['kafka', 'postgres'] },
  },
}

/** <type>-<env>, e.g. kafka-dev in acme-dev and kafka-prod in acme-prod. */
export function serviceNameFor(node: BlueprintNode, project: ProjectContext): string {
  return `${node.typePrefix}-${project.nameToken}`
}

export function planFor(node: BlueprintNode, project: ProjectContext): PlanOption | null {
  return node.plans?.[planTierFor(project.environment)] ?? null
}

export function fmtEurPerMonth(eur: number): string {
  return `€${eur.toLocaleString('en-US')}/mo`
}

export function blueprintTotal(
  blueprint: Blueprint,
  project: ProjectContext,
  enabled: Record<string, boolean>,
): number {
  return blueprint.nodes
    .filter((n) => !n.optional || enabled[n.id])
    .reduce((sum, n) => sum + (planFor(n, project)?.eur ?? 0), 0)
}

export function sumPrices(nodes: BlueprintNode[], project: ProjectContext): number {
  return nodes.reduce((sum, n) => sum + (planFor(n, project)?.eur ?? 0), 0)
}

/** Only projects in the same org/unit, current project excluded. */
export function siblingsOf(project: ProjectContext, projects: ProjectContext[]): ProjectContext[] {
  return projects.filter((p) => p.unitId === project.unitId && p.id !== project.id)
}
