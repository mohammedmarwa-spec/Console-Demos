/**
 * Page-level contract for the aggregation-first Project Overview.
 *
 * Health, EOL, spend/forecast, capacity, and system clustering must arrive as one
 * server-side payload. The page must not fan out per-service calls to assemble this.
 *
 * TODO(api): GET /v1/project/{project_name}/overview-summary
 *   Response body: ProjectOverviewSummary
 *   Known open item from the 1 Sep 2026 UX review. No such endpoint exists in this
 *   prototype (or in the Console API surface used here). Until it ships, the V2
 *   Overview is gated by PROJECT_OVERVIEW_AGGREGATION_ENABLED and reads a typed mock.
 *   Do not substitute GET /v1/project/{project}/service (or per-service metrics).
 */

export const PROJECT_OVERVIEW_AGGREGATION_FLAG = 'project-overview-aggregation'

/** Gates the aggregation Overview. Off → legacy OverviewContent; never per-service fan-out. */
export const PROJECT_OVERVIEW_AGGREGATION_ENABLED = true

/** Roll-ups and grouped attention kick in at this service count. */
export const LARGE_SERVICE_THRESHOLD = 15

export type PageScale = 'empty' | 'small' | 'large'
export type AsyncStatus = 'loaded' | 'loading' | 'error'
export type GroupDim = 'system' | 'type' | 'none'

export type OverviewSeverity = 'critical' | 'warning' | 'none'
export type OverviewHealth = 'healthy' | 'warning' | 'critical'

export type ProjectOverviewIssue = {
  id: string
  severity: Exclude<OverviewSeverity, 'none'>
  title: string
  system: string
  serviceType: string
  startedAt: string
}

export type ProjectOverviewSpend = {
  mtd: number
  forecast: number
  currency: 'USD'
}

export type ProjectOverviewStorage = {
  usedBytes: number
  provisionedBytes: number
  overThresholdCount: number
}

export type ProjectOverviewVersions = {
  offLatest: number
  eolWithin30d: number
}

export type ProjectOverviewByType = {
  type: string
  count: number
  issues: number
}

export type ProjectOverviewSystem = {
  name: string
  serviceCount: number
  health: OverviewHealth
}

export type ProjectOverviewCapacity = {
  nearLimit: number
  cpuSaturated: number
  overProvisioned: number
  estMonthlySavings: number
}

export type ProjectOverviewActivityItem = {
  id: string
  change: string
  resource: string
  actor: string
  occurredAt: string
  severity: 'info' | 'success' | 'warning' | 'error' | 'neutral'
}

export type ProjectOverviewSummary = {
  counts: { services: number; apps: number; agents: number }
  needsAttention: ProjectOverviewIssue[]
  spend: ProjectOverviewSpend
  storage: ProjectOverviewStorage
  versions: ProjectOverviewVersions
  byType: ProjectOverviewByType[]
  systems: ProjectOverviewSystem[]
  capacity: ProjectOverviewCapacity
  recentActivity: { items: ProjectOverviewActivityItem[]; moreTodayCount: number }
}

export function pageScale(serviceCount: number): PageScale {
  if (serviceCount === 0) return 'empty'
  if (serviceCount < LARGE_SERVICE_THRESHOLD) return 'small'
  return 'large'
}

const SEVERITY_RANK: Record<Exclude<OverviewSeverity, 'none'>, number> = { critical: 0, warning: 1 }

export function byIssueSeverity(a: ProjectOverviewIssue, b: ProjectOverviewIssue): number {
  return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.id.localeCompare(b.id)
}

export function fmtUsd(amount: number, currency: ProjectOverviewSpend['currency'] = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const TEBIBYTE = 1024 ** 4

export function fmtTb(bytes: number): string {
  return `${(bytes / TEBIBYTE).toFixed(1)} TB`
}

import { getMockProjectOverviewSummary } from './projectOverviewSummary.mock'

/**
 * Load the page summary. Mock-only until TODO(api) lands.
 * Throws if the feature flag is off — callers must not catch this and fan out.
 */
export function getProjectOverviewSummary(volume: PageScale): ProjectOverviewSummary {
  if (!PROJECT_OVERVIEW_AGGREGATION_ENABLED) {
    throw new Error(
      `${PROJECT_OVERVIEW_AGGREGATION_FLAG} is off; do not fan out per-service calls for Overview`,
    )
  }
  // TODO(api): replace with GET /v1/project/{project_name}/overview-summary
  return getMockProjectOverviewSummary(volume)
}
