import type { CSSProperties, ReactNode } from 'react'
import { Box, Icon } from '@aivenio/aquarium'
import type lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import type { ServiceTypeId } from '../ServiceTypeSelectModal'

export type PlaygroundDemoId = 'postgresql' | 'kafka' | 'opensearch' | 'valkey'

export type PlaygroundDemo = {
  id: PlaygroundDemoId
  serviceTypeId: ServiceTypeId
  title: string
  categoryLabel: string
  description: string
  codeSnippet: string
  /** Opens the sandbox data-source modal (PostgreSQL only in v1). */
  opensSandboxModal: boolean
}

export const PLAYGROUND_DEMOS: PlaygroundDemo[] = [
  {
    id: 'postgresql',
    serviceTypeId: 'postgresql',
    title: 'PostgreSQL',
    categoryLabel: 'SQL queries',
    description: 'Run queries on a pre-seeded e-commerce dataset — customers, orders, products.',
    codeSnippet: 'SELECT * FROM orders LIMIT 10;',
    opensSandboxModal: true,
  },
  {
    id: 'kafka',
    serviceTypeId: 'kafka',
    title: 'Kafka events',
    categoryLabel: 'Streaming',
    description: 'Watch a live event stream of simulated clickstream data. Produce + consume messages.',
    codeSnippet: 'clicks.events · 12.4k msg/s',
    opensSandboxModal: false,
  },
  {
    id: 'opensearch',
    serviceTypeId: 'opensearch',
    title: 'OpenSearch',
    categoryLabel: 'Full-text',
    description: 'Search across product catalog + product reviews. See ranking + facets in action.',
    codeSnippet: 'GET /products/_search?q=wireless',
    opensSandboxModal: false,
  },
  {
    id: 'valkey',
    serviceTypeId: 'valkey',
    title: 'Valkey',
    categoryLabel: 'Cache / queue',
    description: 'Try cache + pub/sub patterns. TTLs, sorted sets, streams.',
    codeSnippet: "SET session:42 'hello' EX 60",
    opensSandboxModal: false,
  },
]

const CATEGORY_PILL_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 9px',
  borderRadius: 4,
  border: '1px solid var(--aquarium-border-color-info-muted, #b7f2f1)',
  backgroundColor: 'var(--aquarium-background-color-success-muted)',
  flexShrink: 0,
}

const CATEGORY_DOT_STYLE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
  flexShrink: 0,
}

export function CategoryPill({ label }: { label: string }) {
  return (
    <Box style={CATEGORY_PILL_STYLE}>
      <Box aria-hidden style={CATEGORY_DOT_STYLE} />
      <Box component="span" style={{ color: 'var(--aquarium-text-color-success-intense)', fontWeight: 500, fontSize: 11 }}>
        {label}
      </Box>
    </Box>
  )
}

CategoryPill.displayName = 'CategoryPill'

export function CodeSnippet({ children }: { children: string }) {
  return (
    <Box
      style={{
        width: '100%',
        padding: '4px 6px',
        borderRadius: 4,
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      <Box
        component="span"
        style={{
          fontFamily: 'Menlo, Monaco, Consolas, monospace',
          fontSize: 11.5,
          lineHeight: 'normal',
          color: 'var(--aquarium-text-color-default)',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

CodeSnippet.displayName = 'CodeSnippet'

/** Icon tile used in onboarding choice cards (welcome + sandbox modal). */
export function OnboardingIconTile({
  icon,
  variant = 'default',
  size = 40,
}: {
  icon: typeof lightbulbIcon
  variant?: 'recommended' | 'default'
  size?: number
}) {
  const isRecommended = variant === 'recommended'
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: isRecommended
          ? 'var(--aquarium-background-color-success-muted)'
          : 'var(--aquarium-background-color-muted)',
        border: isRecommended
          ? '1px solid var(--aquarium-border-color-primary-muted)'
          : '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Icon
        icon={icon}
        color={isRecommended ? 'success-intense' : 'muted'}
        style={{ width: size <= 36 ? 22 : 22, height: size <= 36 ? 22 : 22 }}
      />
    </Box>
  )
}

OnboardingIconTile.displayName = 'OnboardingIconTile'

export type LoadingStepStatus = 'done' | 'active' | 'pending'

export type LoadingStep = {
  id: string
  label: string
  status: LoadingStepStatus
}

export const PG_LOADING_STEPS: LoadingStep[] = [
  { id: '1', label: 'Initializing PostgreSQL sandbox', status: 'done' },
  { id: '2', label: 'Loading sample dataset', status: 'active' },
  { id: '3', label: 'Building indexes & seeding rows', status: 'pending' },
  { id: '4', label: 'Warming up the query engine', status: 'pending' },
]

export function PlaygroundPanelShadow({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        width: '100%',
        maxWidth: 1080,
        maxHeight: 'calc(100vh - 200px)',
        borderRadius: 12,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        border: '1px solid var(--aquarium-border-color-muted)',
        boxShadow:
          '0 24px 48px -8px color-mix(in srgb, var(--aquarium-colors-black) 10%, transparent), 0 12px 24px -8px color-mix(in srgb, var(--aquarium-colors-black) 6%, transparent)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  )
}

PlaygroundPanelShadow.displayName = 'PlaygroundPanelShadow'
