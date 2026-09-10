/**
 * Local data model for the redesigned (aggregation-first) project Overview.
 *
 * This is intentionally decoupled from the shared ProjectPageMockData so the V2
 * Overview can carry richer, aggregation-oriented fields (system grouping, spend,
 * storage headroom, version/EOL) without editing the shared shell or its types.
 *
 * All values are deterministic mock data — no backend, no fabricated live metrics.
 */

import type { ServiceTypeId } from '@/screens/ServiceTypeSelectModal'

export type OverviewSeverity = 'critical' | 'warning' | 'none'
export type GroupDim = 'system' | 'type' | 'none'

export type OverviewService = {
  id: string
  name: string
  /** Service type label, e.g. "PostgreSQL". */
  type: string
  typeId: ServiceTypeId
  status: string
  /** Business "system" the service belongs to (aggregation dimension). */
  system: string
  needsAttention: boolean
  severity: OverviewSeverity
  attentionReason?: string
  /** Month-to-date spend (USD). */
  spendMtd: number
  /** Forecast spend for the full month (USD). */
  spendForecast: number
  storageUsedGb: number
  storageTotalGb: number
  version: string
  latestVersion: string
  offLatest: boolean
  /** Days until end-of-life; null when not approaching EOL. */
  eolDays: number | null
}

export type OverviewActivity = {
  id: string
  change: string
  resource: string
  actor: string
  when: string
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export type OverviewDataset = {
  projectName: string
  /** Monthly budget (USD) used to flag over-forecast spend. */
  budgetUsd: number
  appsCount: number
  agentsCount: number
  services: OverviewService[]
  activity: OverviewActivity[]
}

// ─── Deterministic generation ───────────────────────────────────────────────────

const SYSTEMS = ['Checkout', 'Catalog', 'Search', 'Analytics', 'Messaging', 'Platform'] as const

const TYPES: { id: ServiceTypeId; label: string; short: string; latest: string }[] = [
  { id: 'postgresql', label: 'PostgreSQL', short: 'pg', latest: '16.4' },
  { id: 'kafka', label: 'Apache Kafka', short: 'kafka', latest: '3.8' },
  { id: 'mysql', label: 'MySQL', short: 'mysql', latest: '8.4' },
  { id: 'valkey', label: 'Valkey', short: 'valkey', latest: '8.0' },
  { id: 'opensearch', label: 'OpenSearch', short: 'os', latest: '2.15' },
  { id: 'clickhouse', label: 'ClickHouse', short: 'ch', latest: '24.8' },
  { id: 'grafana', label: 'Grafana', short: 'grafana', latest: '11.2' },
]

const STORAGE_TIERS = [80, 175, 300, 480, 1024, 1536]

/** Older versions per type, used when a service is "off latest". */
const OLD_VERSIONS: Record<string, string[]> = {
  postgresql: ['13.14', '14.11', '15.6'],
  kafka: ['3.4', '3.5', '3.6'],
  mysql: ['8.0'],
  valkey: ['7.2'],
  opensearch: ['1.3', '2.11', '2.13'],
  clickhouse: ['23.8', '24.3'],
  grafana: ['9.5', '10.4'],
}

function rng(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const TOTAL_SERVICES = 54

function buildServices(): OverviewService[] {
  const services: OverviewService[] = []

  for (let i = 0; i < TOTAL_SERVICES; i++) {
    const r = rng(i * 101 + 7)
    const system = SYSTEMS[i % SYSTEMS.length]
    const type = TYPES[(i * 3) % TYPES.length]
    const seq = Math.floor(i / TYPES.length) + 1
    const name = `${system.toLowerCase()}-${type.short}-${String(seq).padStart(2, '0')}`

    const storageTotalGb = STORAGE_TIERS[(i + 2) % STORAGE_TIERS.length]
    const overFull = i % 13 === 0
    const storagePct = overFull ? 0.86 + r() * 0.11 : 0.18 + r() * 0.55
    const storageUsedGb = Math.round(storageTotalGb * storagePct)

    // Spend scales roughly with capacity, with per-service jitter.
    const sizeFactor = storageTotalGb / 240
    const spendMtd = Math.round((60 + r() * 260) * sizeFactor)
    // Forecast projects MTD forward through the month (~19 days elapsed of 30).
    const spendForecast = Math.round(spendMtd * (1.55 + r() * 0.25))

    const offLatest = i % 6 === 0
    const oldPool = OLD_VERSIONS[type.id] ?? [type.latest]
    const version = offLatest ? oldPool[i % oldPool.length] : type.latest
    const eolSoon = offLatest && i % 18 === 0
    const eolDays = eolSoon ? 6 + ((i * 7) % 23) : null

    let status = 'Running'
    if (i % 17 === 0) status = 'Rebuilding'
    else if (i % 23 === 0) status = 'Rebalancing'

    // Attention: a couple of explicit criticals, warnings from real signals.
    let severity: OverviewSeverity = 'none'
    let attentionReason: string | undefined
    if (i === 4 || i === 22) {
      severity = 'critical'
      attentionReason = i === 4 ? 'High query latency affecting checkout' : 'Data access revoked — downstream sync failing'
    } else if (overFull) {
      severity = 'warning'
      attentionReason = `Disk ${Math.round(storagePct * 100)}% — above 85%`
    } else if (status !== 'Running') {
      severity = 'warning'
      attentionReason = `${status} — capacity change in progress`
    } else if (eolSoon) {
      severity = 'warning'
      attentionReason = `Reaches end-of-life in ${eolDays} days`
    }

    services.push({
      id: name,
      name,
      type: type.label,
      typeId: type.id,
      status,
      system,
      needsAttention: severity !== 'none',
      severity,
      attentionReason,
      spendMtd,
      spendForecast,
      storageUsedGb,
      storageTotalGb,
      version,
      latestVersion: type.latest,
      offLatest,
      eolDays,
    })
  }

  return services
}

// ─── Datasets ────────────────────────────────────────────────────────────────────

export const overviewDataset: OverviewDataset = {
  projectName: 'online-store-prod',
  budgetUsd: 14000,
  appsCount: 9,
  agentsCount: 5,
  services: buildServices(),
  activity: [
    { id: '1', change: 'Deployment completed', resource: 'Storefront API', actor: 'CI deployment', when: '8 mins ago', variant: 'success' },
    { id: '2', change: 'High query latency detected', resource: 'checkout-pg-01', actor: 'Monitoring', when: '12 mins ago', variant: 'error' },
    { id: '3', change: 'Schema migrated', resource: 'catalog-pg-02', actor: 'Elena Ivanova', when: '42 mins ago', variant: 'default' },
    { id: '4', change: 'Disk usage above 85%', resource: 'search-os-01', actor: 'Monitoring', when: '1 hour ago', variant: 'warning' },
    { id: '5', change: 'Agent updated', resource: 'Support triage agent', actor: 'Jake Sullivan', when: '2 hours ago', variant: 'info' },
    { id: '6', change: 'Integration connected', resource: 'Kafka → ClickHouse', actor: 'Maria Pereira', when: 'Yesterday', variant: 'default' },
  ],
}

/** Fresh / zero-state variant for testing the empty design. */
export const overviewDatasetEmpty: OverviewDataset = {
  projectName: 'online-store-prod',
  budgetUsd: 14000,
  appsCount: 0,
  agentsCount: 0,
  services: [],
  activity: [],
}

// ─── Selectors ─────────────────────────────────────────────────────────────────

export type OverviewSummary = {
  total: number
  needsAttention: number
  spendMtd: number
  spendForecast: number
  budgetUsd: number
  overBudget: boolean
  storageUsedTb: number
  storageTotalTb: number
  storageOver85: number
  offLatest: number
  eolSoon: number
}

export function summarize(ds: OverviewDataset): OverviewSummary {
  const s = ds.services
  const spendMtd = s.reduce((a, x) => a + x.spendMtd, 0)
  const spendForecast = s.reduce((a, x) => a + x.spendForecast, 0)
  const storageUsedGb = s.reduce((a, x) => a + x.storageUsedGb, 0)
  const storageTotalGb = s.reduce((a, x) => a + x.storageTotalGb, 0)
  return {
    total: s.length,
    needsAttention: s.filter((x) => x.needsAttention).length,
    spendMtd,
    spendForecast,
    budgetUsd: ds.budgetUsd,
    overBudget: spendForecast > ds.budgetUsd,
    storageUsedTb: storageUsedGb / 1024,
    storageTotalTb: storageTotalGb / 1024,
    storageOver85: s.filter((x) => x.storageUsedGb / x.storageTotalGb > 0.85).length,
    offLatest: s.filter((x) => x.offLatest).length,
    eolSoon: s.filter((x) => x.eolDays != null && x.eolDays < 30).length,
  }
}

export type OverviewGroup = {
  key: string
  label: string
  services: OverviewService[]
  attentionCount: number
  spendMtd: number
  storageUsedGb: number
  storageTotalGb: number
}

const SEVERITY_RANK: Record<OverviewSeverity, number> = { critical: 0, warning: 1, none: 2 }

/** Rank services worst-first for exception-first lists. */
export function bySeverity(a: OverviewService, b: OverviewService): number {
  return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.name.localeCompare(b.name)
}

export function groupServices(services: OverviewService[], dim: GroupDim): OverviewGroup[] {
  if (dim === 'none') {
    return [makeGroup('all', 'All services', services)]
  }
  const map = new Map<string, { label: string; items: OverviewService[] }>()
  for (const svc of services) {
    const key = dim === 'system' ? svc.system : svc.typeId
    const label = dim === 'system' ? svc.system : svc.type
    if (!map.has(key)) map.set(key, { label, items: [] })
    map.get(key)!.items.push(svc)
  }
  return [...map.entries()]
    .map(([key, { label, items }]) => makeGroup(key, label, items))
    // Groups with issues first, then by size.
    .sort((a, b) => b.attentionCount - a.attentionCount || b.services.length - a.services.length)
}

function makeGroup(key: string, label: string, items: OverviewService[]): OverviewGroup {
  return {
    key,
    label,
    services: items,
    attentionCount: items.filter((x) => x.needsAttention).length,
    spendMtd: items.reduce((a, x) => a + x.spendMtd, 0),
    storageUsedGb: items.reduce((a, x) => a + x.storageUsedGb, 0),
    storageTotalGb: items.reduce((a, x) => a + x.storageTotalGb, 0),
  }
}

// ─── Formatting helpers ──────────────────────────────────────────────────────────

export function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function fmtTb(n: number): string {
  return `${n.toFixed(1)} TB`
}
