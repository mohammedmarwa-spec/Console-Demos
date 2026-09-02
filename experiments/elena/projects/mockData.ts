export type ProjectTag = {
  key: string
  value: string
}

export type ProjectRow = {
  id: string
  name: string
  tags: ProjectTag[]
  unitId?: string
  href?: string
}

export type OrgUnit = {
  id: string
  name: string
}

export const ORG_NAME = 'Aiven'
export const ORG_HEADER_NAME = 'Aiven org.'
export const USER_INITIALS = 'EI'

export const ORG_UNITS: OrgUnit[] = [
  { id: 'crabweek-hackathon-2026', name: 'Crabweek Hackathon 2026' },
  { id: 'employee-playground', name: 'Employee Playground' },
]

export const PROJECTS: ProjectRow[] = [
  {
    id: 'ux-tests',
    name: 'ux-tests',
    tags: [
      { key: 'unsafed', value: 'value' },
      { key: 'contact', value: 'alan franzoni or anybody' },
    ],
  },
  {
    id: 'dev-sandbox',
    name: 'dev-sandbox',
    tags: [{ key: 'PO', value: 'TEST123' }],
  },
  {
    id: 'online-store-prod',
    name: 'online-store-prod',
    tags: [{ key: 'env', value: 'prod' }],
  },
  {
    id: 'online-store-staging',
    name: 'online-store-staging',
    tags: [{ key: 'env', value: 'staging' }],
  },
  {
    id: 'online-store-dev',
    name: 'online-store-dev',
    tags: [{ key: 'env', value: 'dev' }],
  },
  {
    id: 'kafka-prod',
    name: 'kafka-prod',
    tags: [{ key: 'env', value: 'prod' }],
  },
  {
    id: 'pg-analytics',
    name: 'pg-analytics',
    tags: [{ key: 'env', value: 'staging' }],
  },
]
