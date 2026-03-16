// ─── Scenario Registry ────────────────────────────────────────────────────────
// Add new scenarios here. Each scenario belongs to a group and gets a unique id.
// The rest of the system reads from this file — no other place needs editing.

export type Scenario = {
  id: string
  label: string
  /** Used to group scenarios in the panel. */
  group: string
  description?: string
}

export const SCENARIOS: Scenario[] = [
  // Service Creation
  { id: 'empty-state',             label: 'Empty state',                        group: 'Service Creation',   description: 'No services exist yet' },
  { id: 'first-time-user',         label: 'First-time user',                    group: 'Service Creation',   description: 'Onboarding state, no services' },

  // Existing customers
  { id: 'many-services',                        label: 'Project services: mixed pricing',      group: 'Existing customers', description: 'Pre-populated with multiple services' },
  { id: 'mysql-acu-rollout',                    label: 'Existing users – MySQL ACU rollout',   group: 'Existing customers', description: 'Services list + "Introducing new pricing" modal' },
  { id: 'invoice-mixed-services',               label: 'Mixed-service invoice',                group: 'Existing customers', description: 'Invoice with PG, MySQL, Kafka, OpenSearch across two projects (shuffled)' },
  { id: 'replica-mixed-pricing',                 label: 'Read replicas: mixed pricing',         group: 'Existing customers', description: '4 MySQL primaries covering all ACU/legacy replica combos' },
]

// ─── Derived helpers ──────────────────────────────────────────────────────────

const _map = new Map(SCENARIOS.map((s) => [s.id, s]))

export function getScenarioById(id: string): Scenario | undefined {
  return _map.get(id)
}

/** Returns ordered, deduplicated list of group names. */
export function getGroups(): string[] {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const s of SCENARIOS) {
    if (!seen.has(s.group)) {
      seen.add(s.group)
      groups.push(s.group)
    }
  }
  return groups
}

export function getScenariosByGroup(group: string): Scenario[] {
  return SCENARIOS.filter((s) => s.group === group)
}
