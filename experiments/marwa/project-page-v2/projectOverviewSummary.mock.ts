/**
 * MOCK / fixture — ProjectOverviewSummary.
 *
 * Typed stand-in for GET /v1/project/{project_name}/overview-summary.
 * Values are authored as already-aggregated page payloads. This file must not
 * generate them by iterating a per-service list at runtime.
 */

import type { PageScale, ProjectOverviewSummary } from './projectOverviewSummary'

const EMPTY_CAPACITY = {
  nearLimit: 0,
  cpuSaturated: 0,
  overProvisioned: 0,
  estMonthlySavings: 0,
} as const

/** MOCK: 0 services — activation-first empty page. */
export const MOCK_PROJECT_OVERVIEW_EMPTY: ProjectOverviewSummary = {
  counts: { services: 0, apps: 0, agents: 0 },
  needsAttention: [],
  spend: { mtd: 0, forecast: 0, currency: 'USD' },
  storage: { usedBytes: 0, provisionedBytes: 0, overThresholdCount: 0 },
  versions: { offLatest: 0, eolWithin30d: 0 },
  byType: [],
  systems: [],
  capacity: { ...EMPTY_CAPACITY },
  recentActivity: { items: [], moreTodayCount: 0 },
}

/** MOCK: 8 services — under the aggregation threshold. */
export const MOCK_PROJECT_OVERVIEW_SMALL: ProjectOverviewSummary = {
  counts: { services: 8, apps: 2, agents: 1 },
  needsAttention: [
    {
      id: 'messaging-ch-01',
      severity: 'critical',
      title: 'High query latency affecting checkout',
      system: 'Messaging',
      serviceType: 'ClickHouse',
      startedAt: '2026-09-10T07:52:00.000Z',
    },
    {
      id: 'checkout-pg-01',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Checkout',
      serviceType: 'PostgreSQL',
      startedAt: '2026-09-10T07:35:00.000Z',
    },
  ],
  spend: { mtd: 4091, forecast: 6801, currency: 'USD' },
  storage: {
    usedBytes: 1_072_668_082_176,
    provisionedBytes: 4_697_620_480_000,
    overThresholdCount: 1,
  },
  versions: { offLatest: 2, eolWithin30d: 1 },
  byType: [
    { type: 'PostgreSQL', count: 2, issues: 1 },
    { type: 'ClickHouse', count: 1, issues: 1 },
    { type: 'Valkey', count: 1, issues: 0 },
    { type: 'Grafana', count: 1, issues: 0 },
    { type: 'MySQL', count: 1, issues: 0 },
    { type: 'Apache Kafka', count: 1, issues: 0 },
    { type: 'OpenSearch', count: 1, issues: 0 },
  ],
  systems: [
    { name: 'Messaging', serviceCount: 1, health: 'critical' },
    { name: 'Checkout', serviceCount: 2, health: 'warning' },
    { name: 'Catalog', serviceCount: 2, health: 'healthy' },
    { name: 'Search', serviceCount: 1, health: 'healthy' },
    { name: 'Analytics', serviceCount: 1, health: 'healthy' },
    { name: 'Platform', serviceCount: 1, health: 'healthy' },
  ],
  capacity: { nearLimit: 1, cpuSaturated: 1, overProvisioned: 1, estMonthlySavings: 120 },
  recentActivity: {
    items: [
      {
        id: '1',
        change: 'Deployment completed',
        resource: 'Storefront API',
        actor: 'CI deployment',
        occurredAt: '2026-09-10T07:52:00.000Z',
        severity: 'success',
      },
      {
        id: '2',
        change: 'High query latency detected',
        resource: 'checkout-pg-01',
        actor: 'Monitoring',
        occurredAt: '2026-09-10T07:48:00.000Z',
        severity: 'error',
      },
      {
        id: '3',
        change: 'Schema migrated',
        resource: 'catalog-pg-02',
        actor: 'Elena Ivanova',
        occurredAt: '2026-09-10T07:18:00.000Z',
        severity: 'neutral',
      },
    ],
    moreTodayCount: 0,
  },
}

/** MOCK: 54 services — aggregation layout (systems / types / grouped attention). */
export const MOCK_PROJECT_OVERVIEW_LARGE: ProjectOverviewSummary = {
  counts: { services: 54, apps: 9, agents: 5 },
  needsAttention: [
    {
      id: 'messaging-ch-01',
      severity: 'critical',
      title: 'High query latency affecting checkout',
      system: 'Messaging',
      serviceType: 'ClickHouse',
      startedAt: '2026-09-10T07:52:00.000Z',
    },
    {
      id: 'messaging-valkey-04',
      severity: 'critical',
      title: 'Data access revoked — downstream sync failing',
      system: 'Messaging',
      serviceType: 'Valkey',
      startedAt: '2026-09-10T07:35:00.000Z',
    },
    {
      id: 'analytics-ch-06',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Analytics',
      serviceType: 'ClickHouse',
      startedAt: '2026-09-10T07:18:00.000Z',
    },
    {
      id: 'analytics-grafana-08',
      severity: 'warning',
      title: 'Rebuilding — capacity change in progress',
      system: 'Analytics',
      serviceType: 'Grafana',
      startedAt: '2026-09-10T07:01:00.000Z',
    },
    {
      id: 'catalog-os-02',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Catalog',
      serviceType: 'OpenSearch',
      startedAt: '2026-09-10T06:44:00.000Z',
    },
    {
      id: 'checkout-ch-03',
      severity: 'warning',
      title: 'Reaches end-of-life in 17 days',
      system: 'Checkout',
      serviceType: 'ClickHouse',
      startedAt: '2026-09-10T06:27:00.000Z',
    },
    {
      id: 'checkout-pg-01',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Checkout',
      serviceType: 'PostgreSQL',
      startedAt: '2026-09-10T06:10:00.000Z',
    },
    {
      id: 'checkout-valkey-06',
      severity: 'warning',
      title: 'Reaches end-of-life in 28 days',
      system: 'Checkout',
      serviceType: 'Valkey',
      startedAt: '2026-09-10T05:53:00.000Z',
    },
    {
      id: 'messaging-ch-07',
      severity: 'warning',
      title: 'Rebalancing — capacity change in progress',
      system: 'Messaging',
      serviceType: 'ClickHouse',
      startedAt: '2026-09-10T05:36:00.000Z',
    },
    {
      id: 'messaging-mysql-08',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Messaging',
      serviceType: 'MySQL',
      startedAt: '2026-09-10T05:19:00.000Z',
    },
    {
      id: 'messaging-os-05',
      severity: 'warning',
      title: 'Rebuilding — capacity change in progress',
      system: 'Messaging',
      serviceType: 'OpenSearch',
      startedAt: '2026-09-10T05:02:00.000Z',
    },
    {
      id: 'platform-grafana-04',
      severity: 'warning',
      title: 'Rebalancing — capacity change in progress',
      system: 'Platform',
      serviceType: 'Grafana',
      startedAt: '2026-09-10T04:45:00.000Z',
    },
    {
      id: 'platform-mysql-03',
      severity: 'warning',
      title: 'Rebuilding — capacity change in progress',
      system: 'Platform',
      serviceType: 'MySQL',
      startedAt: '2026-09-10T04:28:00.000Z',
    },
    {
      id: 'search-kafka-04',
      severity: 'warning',
      title: 'Disk 86% — above 85%',
      system: 'Search',
      serviceType: 'Apache Kafka',
      startedAt: '2026-09-10T04:11:00.000Z',
    },
  ],
  spend: { mtd: 25271, forecast: 42448, currency: 'USD' },
  storage: {
    usedBytes: 9_118_215_569_408,
    provisionedBytes: 34_740_916_715_520,
    overThresholdCount: 5,
  },
  versions: { offLatest: 9, eolWithin30d: 3 },
  byType: [
    { type: 'ClickHouse', count: 8, issues: 4 },
    { type: 'Valkey', count: 8, issues: 2 },
    { type: 'Grafana', count: 8, issues: 2 },
    { type: 'MySQL', count: 8, issues: 2 },
    { type: 'OpenSearch', count: 7, issues: 2 },
    { type: 'PostgreSQL', count: 8, issues: 1 },
    { type: 'Apache Kafka', count: 7, issues: 1 },
  ],
  systems: [
    { name: 'Messaging', serviceCount: 9, health: 'critical' },
    { name: 'Checkout', serviceCount: 9, health: 'warning' },
    { name: 'Catalog', serviceCount: 9, health: 'warning' },
    { name: 'Search', serviceCount: 9, health: 'warning' },
    { name: 'Analytics', serviceCount: 9, health: 'warning' },
    { name: 'Platform', serviceCount: 9, health: 'warning' },
  ],
  capacity: { nearLimit: 5, cpuSaturated: 2, overProvisioned: 6, estMonthlySavings: 840 },
  recentActivity: {
    items: [
      {
        id: '1',
        change: 'Deployment completed',
        resource: 'Storefront API',
        actor: 'CI deployment',
        occurredAt: '2026-09-10T07:52:00.000Z',
        severity: 'success',
      },
      {
        id: '2',
        change: 'High query latency detected',
        resource: 'checkout-pg-01',
        actor: 'Monitoring',
        occurredAt: '2026-09-10T07:48:00.000Z',
        severity: 'error',
      },
      {
        id: '3',
        change: 'Schema migrated',
        resource: 'catalog-pg-02',
        actor: 'Elena Ivanova',
        occurredAt: '2026-09-10T07:18:00.000Z',
        severity: 'neutral',
      },
      {
        id: '4',
        change: 'Disk usage above 85%',
        resource: 'search-os-01',
        actor: 'Monitoring',
        occurredAt: '2026-09-10T06:58:00.000Z',
        severity: 'warning',
      },
      {
        id: '5',
        change: 'Agent updated',
        resource: 'Support triage agent',
        actor: 'Jake Sullivan',
        occurredAt: '2026-09-10T05:58:00.000Z',
        severity: 'info',
      },
      {
        id: '6',
        change: 'Integration connected',
        resource: 'Kafka → ClickHouse',
        actor: 'Maria Pereira',
        occurredAt: '2026-09-09T16:00:00.000Z',
        severity: 'neutral',
      },
    ],
    moreTodayCount: 4,
  },
}

const FIXTURES: Record<PageScale, ProjectOverviewSummary> = {
  empty: MOCK_PROJECT_OVERVIEW_EMPTY,
  small: MOCK_PROJECT_OVERVIEW_SMALL,
  large: MOCK_PROJECT_OVERVIEW_LARGE,
}

export function getMockProjectOverviewSummary(volume: PageScale): ProjectOverviewSummary {
  return FIXTURES[volume]
}
