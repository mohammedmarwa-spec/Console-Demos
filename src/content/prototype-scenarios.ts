export type PrototypeScenario = {
  id: string
  title: string
  description: string
  owner: string
  /** Maps to scenarioRuntime config; defaults to id. */
  runtimeKey?: string
  /** Alias of another runtime key (e.g. first-time-user → empty-state). */
  aliasOf?: string
}

export const PROTOTYPE_SCENARIOS: PrototypeScenario[] = [
  {
    id: 'onboarding-playground',
    title: 'Playground',
    description: 'Just signed up — personal org, playground project, no services',
    owner: 'Elena',
  },
  {
    id: 'first-time-user',
    title: 'First-time user',
    description: 'Alias of Empty project — onboarding state, no services',
    owner: 'Elena',
    runtimeKey: 'empty-state',
    aliasOf: 'empty-state',
  },
  {
    id: 'mysql-acu-rollout',
    title: 'Existing users – MySQL ACU rollout',
    description: 'Services list + "Introducing new pricing" modal',
    owner: 'Elena',
  },
  {
    id: 'invoice-mixed-services',
    title: 'Mixed-service invoice',
    description: 'Invoice with PG, MySQL, Kafka, OpenSearch across two projects (shuffled)',
    owner: 'Elena',
  },
  {
    id: 'invoice-plan-acumixed',
    title: 'Invoice: ACU + Plan — $1,612.45',
    description: 'Two projects with ACU and Plan (legacy) services, total $1,612.45',
    owner: 'Elena',
  },
  {
    id: 'replica-mixed-pricing',
    title: 'Read replicas: mixed pricing',
    description: '4 MySQL primaries covering all ACU/legacy replica combos',
    owner: 'Elena',
  },
  {
    id: 'free-dev-upgrade-v2',
    title: 'Free & Dev: Quick Upgrade V2',
    description: 'Same services, V2 modal with tier headers',
    owner: 'Elena',
  },
  {
    id: 'free-dev-upgrade-v3',
    title: 'Free & Dev: Quick Upgrade V3',
    description: 'Same services, V2 modal with Hobbyist and Startup-4 plans',
    owner: 'Elena',
  },
  {
    id: 'free-dev-upgrade-v4',
    title: 'Free & Dev: Quick Upgrade V4',
    description: 'Developer + Hobbyist on AWS and GCP (europe-west-1)',
    owner: 'Elena',
  },
  {
    id: 'deeptrace-demo',
    title: 'Service event logs',
    description: 'PostgreSQL service, Logs view',
    owner: 'Elena',
  },
]

const _map = new Map(PROTOTYPE_SCENARIOS.map((s) => [s.id, s]))

export function getPrototypeScenario(id: string): PrototypeScenario {
  const scenario = _map.get(id)
  if (!scenario) {
    throw new Error(`Unknown prototype scenario: ${id}`)
  }
  return scenario
}

export function getPrototypeScenarioOrNull(id: string): PrototypeScenario | null {
  return _map.get(id) ?? null
}

export function getPrototypeRuntimeKey(id: string): string {
  const scenario = _map.get(id)
  if (!scenario) return id
  return scenario.runtimeKey ?? scenario.aliasOf ?? scenario.id
}

export const SCENARIO_ALIASES: Record<string, string> = Object.fromEntries(
  PROTOTYPE_SCENARIOS.filter((s) => s.aliasOf).map((s) => [s.id, s.aliasOf!]),
)
