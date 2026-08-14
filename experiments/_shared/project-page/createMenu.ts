/** Shared Create CTA menu — grouped DropdownMenu.Section structure. */
export const CREATE_MENU_SECTIONS = [
  {
    title: 'Data service',
    items: [
      { id: 'postgresql', label: 'PostgreSQL' },
      { id: 'kafka', label: 'Kafka' },
      { id: 'clickhouse', label: 'ClickHouse' },
      { id: 'opensearch', label: 'OpenSearch' },
    ],
  },
  {
    title: 'Application',
    items: [{ id: 'deploy-runtime', label: 'Deploy with Aiven Runtime' }],
  },
] as const

export const CREATE_MENU_AGENT = { id: 'agent', label: 'Agent' } as const

export const CREATE_MENU_SOLUTION = {
  title: 'Solution',
  items: [{ id: 'datahub', label: 'DataHub' }],
} as const
