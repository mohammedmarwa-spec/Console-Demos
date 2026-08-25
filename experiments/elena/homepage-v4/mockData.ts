import type { IconifyIcon } from '@iconify/react'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import type { ServiceTypeId } from '@experiments/_shared/lib/serviceTypes'

export const ORG_NAME = 'Aiven org.'
export const USER_NAME = 'Elena'
export const USER_INITIALS = 'EI'

export type IconTone = 'primary' | 'info' | 'success'

export type FirstResourceAction = {
  id: 'create-service' | 'deploy-app' | 'setup-mcp'
  title: string
  description: string
  actionLabel: string
  actionKind: 'primary' | 'secondary'
  icon?: IconifyIcon
  tone?: IconTone
  serviceTypes?: ServiceTypeId[]
  href?: string
}

export type GettingStartedStepStatus = 'current' | 'next'

export type GettingStartedStep = {
  id: string
  label: string
  status: GettingStartedStepStatus
}

export type LearnLink = {
  id: string
  label: string
  href: string
}

export const PROJECT = {
  id: 'my-first-project',
  name: 'my-first-project',
  caption: 'Resources you create will appear here.',
  resourceCountLabel: '0 resources',
  statusLabel: 'Ready to set up',
  createdLabel: 'Created today',
}

export const DOCS = {
  gettingStarted: 'https://aiven.io/docs/platform/howto/get-started',
  documentation: 'https://aiven.io/docs',
  askAi: 'https://aiven.io/docs',
  mcp: 'https://aiven.io/docs/tools/mcp',
} as const

/** Unique branded marks from experiments/_shared/assets/service-icons (aliases omitted). */
export const CREATE_SERVICE_TYPES: ServiceTypeId[] = [
  'postgresql',
  'kafka',
  'mysql',
  'opensearch',
  'clickhouse',
  'valkey',
  'grafana',
  'metrics',
]

export const FIRST_RESOURCE_ACTIONS: FirstResourceAction[] = [
  {
    id: 'create-service',
    title: 'Create a service',
    description: 'PostgreSQL, Kafka, ClickHouse, and more',
    actionLabel: 'Create service',
    actionKind: 'primary',
    serviceTypes: CREATE_SERVICE_TYPES,
  },
  {
    id: 'deploy-app',
    title: 'Deploy an app',
    description: 'Run your application on Aiven',
    actionLabel: 'Deploy app',
    actionKind: 'secondary',
    icon: codeBlockIcon,
    tone: 'info',
  },
  {
    id: 'setup-mcp',
    title: 'Connect AI tools',
    description: 'Use Aiven MCP with your AI assistant',
    actionLabel: 'Set up MCP',
    actionKind: 'secondary',
    icon: proPlansIcon,
    tone: 'success',
    href: DOCS.mcp,
  },
]

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  { id: 'create-resource', label: 'Create a resource', status: 'current' },
  { id: 'connect-resource', label: 'Connect to your resource', status: 'next' },
  { id: 'configure-alerts', label: 'Configure alerts and access', status: 'next' },
]

export const LEARN_LINKS: LearnLink[] = [
  { id: 'platform', label: 'Platform overview', href: 'https://aiven.io/docs/platform' },
  { id: 'choose-service', label: 'Choose a service', href: 'https://aiven.io/docs/products' },
  { id: 'mcp', label: 'Aiven MCP', href: DOCS.mcp },
]
