/**
 * Node topology data model for the OpenSearch "Cluster nodes" view.
 *
 * Ported from the OS-NodeView Discovery reference (nodes-data.js) into typed TS.
 * Decodes Aiven's compact node-role string (e.g. "*mcD", "-dHicND") into readable
 * role chips + a tier for grouping, and generates a deterministic demo cluster.
 */

export type NodeTone = 'success' | 'info' | 'neutral' | 'warning' | 'danger'
export type NodeStatusKey =
  | 'running'
  | 'syncing_data'
  | 'setting_up_vm'
  | 'timing_out'
  | 'leaving'
  | 'unknown'

export type NodeStatus = { key: NodeStatusKey; label: string; tone: NodeTone }
export type RoleTier = 'Hot' | 'Warm' | 'Cold'
export type RoleChip = { key: string; label: string; tier?: RoleTier }
export type NodeSpec = { cpu?: number; ramGb?: number; storageGb?: number }
export type NodeSync = { done: number; total: number; unitDone: string; unitTotal: string }
export type NodeMetrics = {
  cpu: number
  mem: number
  disk: number
  heap: number
  diskUsed: number
  diskTotal: number
  shards: number
}

export type ClusterNode = {
  id: string
  n: number
  isLeader: boolean
  chips: RoleChip[]
  tier: string
  tierLabel: string
  raw: string
  status: NodeStatus
  zone: string
  stream: boolean
  sync: NodeSync | null
  spec: NodeSpec
  metrics: NodeMetrics
}

export type Cluster = {
  id: string
  name: string
  version: string
  state: string
  nodes: ClusterNode[]
}

// ─── Status catalog ────────────────────────────────────────────────────────────

export const STATUS: Record<NodeStatusKey, NodeStatus> = {
  running: { key: 'running', label: 'Running', tone: 'success' },
  syncing_data: { key: 'syncing_data', label: 'Syncing data', tone: 'info' },
  setting_up_vm: { key: 'setting_up_vm', label: 'Setting up VM', tone: 'neutral' },
  timing_out: { key: 'timing_out', label: 'Timing out', tone: 'warning' },
  leaving: { key: 'leaving', label: 'Leaving', tone: 'neutral' },
  unknown: { key: 'unknown', label: 'Unknown', tone: 'danger' },
}

export const STATUS_ORDER: NodeStatusKey[] = [
  'running',
  'syncing_data',
  'setting_up_vm',
  'timing_out',
  'leaving',
  'unknown',
]

// ─── Role decoder ──────────────────────────────────────────────────────────────

type RoleDef = { key: string; label: string; modifier?: boolean }

const ROLE_DEFS: Record<string, RoleDef> = {
  m: { key: 'manager', label: 'Cluster manager' },
  d: { key: 'data', label: 'Data' },
  H: { key: 'hot', label: 'Hot', modifier: true },
  W: { key: 'warm', label: 'Warm', modifier: true },
  C: { key: 'cold', label: 'Cold', modifier: true },
  i: { key: 'ingest', label: 'Ingest' },
  c: { key: 'coordinating', label: 'Coordinating' },
  l: { key: 'ml', label: 'ML' },
}

type DecodedRole = {
  isLeader: boolean
  chips: RoleChip[]
  tier: string
  tierLabel: string
  raw: string
}

export function decodeRole(code: string): DecodedRole {
  const isLeader = code[0] === '*'
  const body = code.replace(/^[*-]/, '')
  const roles: RoleDef[] = []
  let tierMod: RoleTier | null = null

  body.split('').forEach((ch) => {
    const def = ROLE_DEFS[ch]
    if (!def) return // unknown flag → only surfaced in the raw string
    if (def.modifier) tierMod = def.label as RoleTier
    else roles.push(def)
  })

  const chips: RoleChip[] = roles.map((r) =>
    r.key === 'data' && tierMod ? { key: 'data', label: 'Data', tier: tierMod } : { key: r.key, label: r.label },
  )

  let tier = 'data'
  let tierLabel = 'Data nodes'
  if (roles.some((r) => r.key === 'manager') && !roles.some((r) => r.key === 'data')) {
    tier = 'manager'
    tierLabel = 'Manager nodes'
  } else if (tierMod === 'Hot') {
    tier = 'data-hot'
    tierLabel = 'Data · Hot tier'
  } else if (tierMod === 'Warm') {
    tier = 'data-warm'
    tierLabel = 'Data · Warm tier'
  } else if (tierMod === 'Cold') {
    tier = 'data-cold'
    tierLabel = 'Data · Cold tier'
  }

  return { isLeader, chips, tier, tierLabel, raw: code }
}

// ─── Node generation (deterministic) ────────────────────────────────────────────

const ZONES = ['eu-west-1a', 'eu-west-1b', 'eu-west-1c']

const SPEC_BY_TIER: Record<string, NodeSpec> = {
  manager: { cpu: 2, ramGb: 4 },
  'data-hot': { cpu: 2, ramGb: 8, storageGb: 100 },
  'data-warm': { cpu: 2, ramGb: 4, storageGb: 500 },
  'data-cold': { cpu: 2, ramGb: 4, storageGb: 1024 },
  data: { cpu: 2, ramGb: 4, storageGb: 100 },
}

function rng(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function makeNode(
  prefix: string,
  i: number,
  code: string,
  statusKey: NodeStatusKey,
  salt = 0,
): ClusterNode {
  const r = rng(i * 97 + code.length * 13 + salt)
  const decoded = decodeRole(code)
  const spec = SPEC_BY_TIER[decoded.tier] ?? SPEC_BY_TIER.data
  const diskTotal = spec.storageGb ?? 256
  const settled = statusKey === 'running' || statusKey === 'timing_out'
  const diskPct = settled ? 0.28 + r() * 0.5 : 0.02 + r() * 0.08

  const metrics: NodeMetrics = settled
    ? {
        cpu: Math.round((0.12 + r() * 0.55) * 100),
        mem: Math.round((0.35 + r() * 0.45) * 100),
        disk: Math.round(diskPct * 100),
        heap: Math.round((0.3 + r() * 0.45) * 100),
        diskUsed: +(diskPct * diskTotal).toFixed(1),
        diskTotal,
        shards: Math.round(8 + r() * 40),
      }
    : {
        cpu: statusKey === 'unknown' ? 0 : Math.round(r() * 20),
        mem: statusKey === 'unknown' ? 0 : Math.round(r() * 25),
        disk: Math.round(diskPct * 100),
        heap: statusKey === 'unknown' ? 0 : Math.round(r() * 20),
        diskUsed: +(diskPct * diskTotal).toFixed(1),
        diskTotal,
        shards: statusKey === 'unknown' ? 0 : Math.round(r() * 4),
      }

  return {
    id: `${prefix}-${i}`,
    n: i,
    ...decoded,
    status: STATUS[statusKey],
    zone: ZONES[(i - 1) % 3],
    stream: settled,
    sync:
      statusKey === 'syncing_data'
        ? { done: [0, 208, 416][i % 3], total: [57.0, 69.1, 74.3][i % 3], unitDone: 'bytes', unitTotal: 'KiB' }
        : null,
    spec,
    metrics,
  }
}

/**
 * 17-node demo cluster: 3 cluster managers + 7 hot-tier + 7 warm-tier data nodes.
 * Mirrors the reference "popup" cluster and matches the 17-node starting state.
 */
export function buildClusterForService(serviceName: string): Cluster {
  const prefix = serviceName
  const nodes: ClusterNode[] = []

  // 3 cluster managers (no data role, no storage)
  nodes.push(makeNode(prefix, 1, '-mc', 'running', 1))
  nodes.push(makeNode(prefix, 2, '*mc', 'running', 2))
  nodes.push(makeNode(prefix, 3, '-mc', 'running', 3))

  // 7 hot-tier data nodes (fast SSD, recent indices)
  for (let i = 4; i <= 10; i++) {
    nodes.push(makeNode(prefix, i, '-dHicND', i === 7 ? 'syncing_data' : 'running', i + 30))
  }

  // 7 warm-tier data nodes (high-density, aged indices)
  for (let i = 11; i <= 17; i++) {
    nodes.push(makeNode(prefix, i, '-dWicND', i === 14 ? 'timing_out' : 'running', i + 30))
  }

  return { id: prefix, name: serviceName, version: 'OpenSearch 3.3.2', state: 'Running', nodes }
}

// ─── Rollup + progress helpers ───────────────────────────────────────────────────

export type RollupSegment = { key: NodeStatusKey; status: NodeStatus; count: number }

export function rollup(nodes: ClusterNode[]): RollupSegment[] {
  const counts: Partial<Record<NodeStatusKey, number>> = {}
  nodes.forEach((n) => {
    counts[n.status.key] = (counts[n.status.key] ?? 0) + 1
  })
  return STATUS_ORDER.filter((k) => counts[k]).map((k) => ({
    key: k,
    status: STATUS[k],
    count: counts[k] as number,
  }))
}

export function isSettled(node: ClusterNode): boolean {
  return node.status.key === 'running' || node.status.key === 'timing_out'
}

/** Deterministic recovery % for in-progress nodes (demo only). */
export function progressPct(node: ClusterNode): number {
  if (node.status.key === 'syncing_data') return 12 + ((node.n * 37) % 78)
  if (node.status.key === 'timing_out') return 55 + ((node.n * 17) % 40)
  if (node.status.key === 'setting_up_vm') return 8 + ((node.n * 13) % 30)
  return 100
}

export function specLabel(spec: NodeSpec): string {
  const parts: string[] = []
  if (spec.cpu != null) parts.push(`${spec.cpu} vCPU`)
  if (spec.ramGb != null) parts.push(`${spec.ramGb} GB RAM`)
  if (spec.storageGb != null) parts.push(`${spec.storageGb} GB disk`)
  return parts.join(' · ')
}
