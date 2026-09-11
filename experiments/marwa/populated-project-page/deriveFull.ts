import type { ActivityEvent, OnlineStoreProdFixture, ServiceTypeId, SystemId } from './fixtures/onlineStoreProd'
import { KIND_SEVERITY, latestActivity, needsAttentionCount, type AttentionSeverity } from './deriveLhf'

export type FullMetrics = {
  needsAttention: number
  spendMtdUsd: number
  spendForecastUsd: number
  budgetUsd: number
  overBudget: boolean
  storageUsedTb: number
  storageTotalTb: number
  storageOver85: number
  offLatest: number
  eolSoon: number
}

export type SystemHealth = AttentionSeverity | 'success' | 'muted'

export type SystemRow = {
  id: SystemId
  name: string
  serviceCount: number
  health: SystemHealth
}

export type TypeRollupRow = {
  id: ServiceTypeId
  label: string
  count: number
  issueCount: number
  issuesLabel: string
}

export type CapacityHotspots = {
  storageNearLimit: number
  cpuSaturated: number
  overProvisioned: number
  savingsUsd: number
}

export function deriveFullMetrics(fixture: OnlineStoreProdFixture): FullMetrics {
  const { spend, storage, services, issues, offLatestVersionCount } = fixture
  return {
    needsAttention: needsAttentionCount(fixture),
    spendMtdUsd: spend.monthToDateUsd,
    spendForecastUsd: spend.forecastUsd,
    budgetUsd: spend.budgetUsd,
    overBudget: spend.forecastUsd > spend.budgetUsd,
    storageUsedTb: storage.usedTb,
    storageTotalTb: storage.totalTb,
    storageOver85: services.filter((service) => service.storagePct > 85).length,
    offLatest: offLatestVersionCount,
    eolSoon: issues.filter((issue) => issue.kind === 'eol').length,
  }
}

const HEALTH_RANK: Record<SystemHealth, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
  muted: 4,
}

function worstHealth(severities: AttentionSeverity[]): SystemHealth | null {
  if (severities.includes('danger')) return 'danger'
  if (severities.includes('warning')) return 'warning'
  if (severities.includes('info')) return 'info'
  return null
}

/** Five system clusters including Unassigned. Worst health first; Unassigned always last. */
export function deriveSystemRows(fixture: OnlineStoreProdFixture): SystemRow[] {
  const issuesByService = new Map<string, AttentionSeverity[]>()
  for (const issue of fixture.issues) {
    const list = issuesByService.get(issue.serviceName) ?? []
    list.push(KIND_SEVERITY[issue.kind])
    issuesByService.set(issue.serviceName, list)
  }

  return fixture.systems
    .map((system) => {
      const members = fixture.services.filter((service) => service.system === system.id)
      const severities = members.flatMap((service) => issuesByService.get(service.name) ?? [])
      const fromIssues = worstHealth(severities)
      const health: SystemHealth =
        fromIssues ?? (system.id === 'unassigned' ? 'muted' : 'success')
      return {
        id: system.id,
        name: system.name,
        serviceCount: members.length,
        health,
      }
    })
    .sort((a, b) => {
      if (a.id === 'unassigned') return 1
      if (b.id === 'unassigned') return -1
      return HEALTH_RANK[a.health] - HEALTH_RANK[b.health] || b.serviceCount - a.serviceCount
    })
}

export function deriveTypeRollup(fixture: OnlineStoreProdFixture): TypeRollupRow[] {
  const issueCountByService = new Map<string, number>()
  for (const issue of fixture.issues) {
    issueCountByService.set(issue.serviceName, (issueCountByService.get(issue.serviceName) ?? 0) + 1)
  }

  const groups = new Map<ServiceTypeId, TypeRollupRow>()
  for (const service of fixture.services) {
    const existing = groups.get(service.type)
    const extraIssues = issueCountByService.get(service.name) ?? 0
    if (existing) {
      existing.count += 1
      existing.issueCount += extraIssues
    } else {
      groups.set(service.type, {
        id: service.type,
        label: service.typeLabel,
        count: 1,
        issueCount: extraIssues,
        issuesLabel: '',
      })
    }
  }

  return [...groups.values()]
    .map((row) => ({
      ...row,
      issuesLabel: row.issueCount > 0 ? String(row.issueCount) : '',
    }))
    .sort((a, b) => b.count - a.count)
}

export function deriveCapacityHotspots(fixture: OnlineStoreProdFixture): CapacityHotspots {
  const storageNearLimit = fixture.services.filter((service) => service.storagePct > 85).length
  const cpuSaturated = fixture.services.filter((service) => service.cpuPct > 90).length
  const overProvisioned = fixture.services.filter((service) => service.cpuPct < 15).length
  return {
    storageNearLimit,
    cpuSaturated,
    overProvisioned,
    savingsUsd: overProvisioned * 210,
  }
}

/** Same bound as LHF (5), grouped later in the UI by `resource`. */
export function latestActivityForFull(fixture: OnlineStoreProdFixture): ActivityEvent[] {
  return latestActivity(fixture, 5)
}

export function fmtUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function fmtTb(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
