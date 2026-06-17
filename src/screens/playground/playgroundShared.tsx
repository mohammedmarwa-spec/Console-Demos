import type { ReactNode } from 'react'
import { Box, Icon, Typography } from '@aivenio/aquarium'
import type lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import type { ServiceTypeId } from '../ServiceTypeSelectModal'

export type PlaygroundDemoId = 'postgresql' | 'kafka' | 'opensearch' | 'valkey'

export type PlaygroundDemo = {
  id: PlaygroundDemoId
  serviceTypeId: ServiceTypeId
  title: string
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
    description: 'Run queries on a pre-seeded e-commerce dataset — customers, orders, products.',
    codeSnippet: 'SELECT * FROM orders LIMIT 10;',
    opensSandboxModal: true,
  },
  {
    id: 'kafka',
    serviceTypeId: 'kafka',
    title: 'Kafka events',
    description: 'Watch a live event stream of simulated clickstream data. Produce + consume messages.',
    codeSnippet: 'clicks.events · 12.4k msg/s',
    opensSandboxModal: false,
  },
  {
    id: 'opensearch',
    serviceTypeId: 'opensearch',
    title: 'OpenSearch',
    description: 'Search across product catalog + product reviews. See ranking + facets in action.',
    codeSnippet: 'GET /products/_search?q=wireless',
    opensSandboxModal: false,
  },
  {
    id: 'valkey',
    serviceTypeId: 'valkey',
    title: 'Valkey',
    description: 'Try cache + pub/sub patterns. TTLs, sorted sets, streams.',
    codeSnippet: "SET session:42 'hello' EX 60",
    opensSandboxModal: false,
  },
]

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

/** Brand stroke colors: Kafka, PostgreSQL, OpenSearch, ClickHouse (2×2 grid order). */
const CATALOG_GRID_SQUARE_STROKES = [
  '#F19BFC', // Kafka pink (from service icon ring)
  '#336791', // PostgreSQL
  '#005EB8', // OpenSearch
  '#FFCC01', // ClickHouse
] as const

/** 2×2 grid icon for “I'll choose myself” — bordered squares in service brand colors. */
export function OnboardingCatalogGridIcon({ size = 22 }: { size?: number }) {
  const cell = 7.2
  const gap = 2.05
  const origin = 2.75
  const strokeWidth = 1.5
  const inset = strokeWidth / 2
  const positions = [
    { x: origin, y: origin },
    { x: origin + cell + gap, y: origin },
    { x: origin, y: origin + cell + gap },
    { x: origin + cell + gap, y: origin + cell + gap },
  ]

  return (
    <Box
      aria-hidden
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {positions.map((pos, i) => (
        <rect
          key={CATALOG_GRID_SQUARE_STROKES[i]}
          x={pos.x + inset}
          y={pos.y + inset}
          width={cell - strokeWidth}
          height={cell - strokeWidth}
          rx={1.2}
          fill="transparent"
          stroke={CATALOG_GRID_SQUARE_STROKES[i]}
          strokeWidth={strokeWidth}
        />
      ))}
    </Box>
  )
}

OnboardingCatalogGridIcon.displayName = 'OnboardingCatalogGridIcon'

export function OnboardingCatalogIconTile({ size = 40 }: { size?: number }) {
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
        backgroundColor: 'var(--aquarium-background-color-muted)',
        border: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <OnboardingCatalogGridIcon size={size <= 36 ? 20 : 22} />
    </Box>
  )
}

OnboardingCatalogIconTile.displayName = 'OnboardingCatalogIconTile'

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

/** Same max width as Aquarium `Modal` size `md` (940px). */
export const ONBOARDING_PANEL_MAX_WIDTH = 940

/**
 * Checkable Card.Label selection without layout shift:
 * - Always 2px border (DS default is 1px; jumping to 2px on select shifts content)
 * - Swap border-color only when selected; suppress DS ring-2
 */
export const ONBOARDING_CHECKABLE_CARD_RING_CSS = `
  .onboarding-checkable-cards label.Aquarium-Card\\.Label {
    box-sizing: border-box !important;
    border: 2px solid var(--aquarium-border-color-muted) !important;
    outline: none !important;
    outline-offset: 0 !important;
    box-shadow: none !important;
    min-width: 0 !important;
    width: 100%;
  }
  .onboarding-checkable-cards label.Aquarium-Card\\.Label.ring-2 {
    --tw-ring-offset-shadow: 0 0 #0000 !important;
    --tw-ring-shadow: 0 0 #0000 !important;
    --tw-ring-width: 0 !important;
    --tw-ring-offset-width: 0 !important;
    border-color: var(--aquarium-border-color-primary-default) !important;
  }
`

/** Top-align radio/checkbox in checkable card title row (DS CardInputWrapper defaults to vertical center). */
export const ONBOARDING_CHECKABLE_CARD_CSS = `
  .onboarding-checkable-cards label.Aquarium-Card\\.Label input[type="radio"],
  .onboarding-checkable-cards label.Aquarium-Card\\.Label input[type="checkbox"] {
    align-self: start !important;
  }
  .onboarding-checkable-cards label.Aquarium-Card\\.Label .flex.flex-col.flex-auto > div:first-child {
    align-items: start !important;
    align-content: start !important;
  }
`

/** Matches Aquarium `Modal.Title` (variant subheading, color intense). */
export function OnboardingPanelTitle({ children }: { children: ReactNode }) {
  return <Typography.Subheading color="intense">{children}</Typography.Subheading>
}

OnboardingPanelTitle.displayName = 'OnboardingPanelTitle'

export function OnboardingPanelPage({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 24px',
        minHeight: '100%',
      }}
    >
      {children}
    </Box>
  )
}

OnboardingPanelPage.displayName = 'OnboardingPanelPage'

export function PlaygroundPanelShadow({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        width: '100%',
        maxWidth: ONBOARDING_PANEL_MAX_WIDTH,
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
