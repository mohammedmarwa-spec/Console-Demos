/** Shell-only mock data for Console header Projects / Organization panels. */

export type MockProject = {
  id: string
  name: string
}

export type MockOrgUnit = {
  id: string
  name: string
}

export type MockOrganization = {
  id: string
  name: string
  units: MockOrgUnit[]
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: 'defaultdb', name: 'defaultdb' },
  { id: 'kafka-prod', name: 'kafka-prod' },
  { id: 'pg-analytics', name: 'pg-analytics' },
  { id: 'clickhouse-metrics', name: 'clickhouse-metrics' },
  { id: 'opensearch-logs', name: 'opensearch-logs' },
  { id: 'redis-cache', name: 'redis-cache' },
]

/** First few projects shown under “Recent projects”. */
export const MOCK_RECENT_PROJECTS = MOCK_PROJECTS.slice(0, 4)

export const MOCK_ORGANIZATIONS: MockOrganization[] = [
  {
    id: 'org-my-org',
    name: 'My Organization',
    units: [
      { id: 'unit-engineering', name: 'Engineering' },
      { id: 'unit-product', name: 'Product' },
      { id: 'unit-finance', name: 'Finance' },
    ],
  },
  {
    id: 'org-acme',
    name: 'Acme Corp',
    units: [],
  },
  {
    id: 'org-demo',
    name: 'Demo Organization',
    units: [
      { id: 'unit-platform', name: 'Platform' },
      { id: 'unit-data', name: 'Data' },
    ],
  },
]

export const DEFAULT_ACTIVE_PROJECT_ID = MOCK_RECENT_PROJECTS[0]!.id
export const DEFAULT_CURRENT_ORG_ID = MOCK_ORGANIZATIONS[0]!.id
export const DEFAULT_CURRENT_UNIT_ID = MOCK_ORGANIZATIONS[0]!.units[0]!.id
