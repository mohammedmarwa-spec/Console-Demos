// ─── Playground registry types ────────────────────────────────────────────────

export type ScenarioCategory =
  | 'onboarding'
  | 'service-creation'
  | 'existing-customers'
  | 'pricing-upgrade'
  | 'platform-observability'

export type PlaygroundEntryType = 'reusable-scenario' | 'prototype' | 'archived'

export type ScenarioStatus =
  | 'active'
  | 'rough'
  | 'review-ready'
  | 'validated'
  | 'archived'

/** Human-readable category labels for the scenario panel. */
export const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  onboarding: 'Onboarding',
  'service-creation': 'Service Creation',
  'existing-customers': 'Existing customers',
  'pricing-upgrade': 'Pricing upgrade',
  'platform-observability': 'Platform observability',
}

export type PlaygroundEntry = {
  id: string
  title: string
  description: string
  category: ScenarioCategory
  type: PlaygroundEntryType
  status: ScenarioStatus
  owner: string
  reusable: boolean
  tags: string[]
  /** Deep-link hint, e.g. ?scenario=onboarding-test-env */
  route: string
  /** Maps to scenarioRuntime config; defaults to id for built-in scenarios. */
  runtimeKey: string
  /** For experiments/prototypes copied from a reusable base. */
  sourceScenarioId?: string
  /** Alias of another entry (e.g. first-time-user → empty-state). */
  aliasOf?: string
  /** Optional override; defaults to convention path under /public/previews */
  previewImage?: string
}

/** Legacy shape kept for backward compatibility with existing imports. */
export type Scenario = {
  id: string
  label: string
  group: string
  description?: string
}

export function entryToLegacyScenario(entry: PlaygroundEntry): Scenario {
  return {
    id: entry.id,
    label: entry.title,
    group: CATEGORY_LABELS[entry.category],
    description: entry.description,
  }
}
