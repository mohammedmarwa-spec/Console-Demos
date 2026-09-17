import type { ActivityEvent, OnlineStoreProdFixture } from './fixtures/onlineStoreProd'
import { latestActivity, needsAttentionCount } from './deriveLhf'

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

/** Latest 3 events in this project; grouped later in the UI by resource. */
export function latestActivityForFull(fixture: OnlineStoreProdFixture): ActivityEvent[] {
  return latestActivity(fixture, 3)
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
