import { REUSABLE_SCENARIOS } from './scenarios'
import {
  CATEGORY_LABELS,
  entryToLegacyScenario,
  type PlaygroundEntry,
  type PlaygroundEntryType,
  type Scenario,
  type ScenarioCategory,
  type ScenarioStatus,
} from './types'

export type {
  PlaygroundEntry,
  PlaygroundEntryType,
  Scenario,
  ScenarioCategory,
  ScenarioStatus,
}
export { CATEGORY_LABELS, entryToLegacyScenario, REUSABLE_SCENARIOS }

/**
 * Reusable + prototype scenarios only — experiments and templates are no longer
 * registered here. They're discovered from the filesystem at build time via
 * experiments/discover.server.ts and are not part of this registry.
 */
export const PLAYGROUND_ENTRIES: PlaygroundEntry[] = [...REUSABLE_SCENARIOS]

const _map = new Map(PLAYGROUND_ENTRIES.map((e) => [e.id, e]))

export function getEntryById(id: string): PlaygroundEntry | undefined {
  return _map.get(id)
}

/** Legacy helper — returns Scenario shape for backward compatibility. */
export function getScenarioById(id: string): Scenario | undefined {
  const entry = getEntryById(id)
  return entry ? entryToLegacyScenario(entry) : undefined
}

/** Returns ordered, deduplicated list of category display labels. */
export function getGroups(): string[] {
  const seen = new Set<ScenarioCategory>()
  const groups: string[] = []
  for (const e of PLAYGROUND_ENTRIES) {
    if (!seen.has(e.category)) {
      seen.add(e.category)
      groups.push(CATEGORY_LABELS[e.category])
    }
  }
  return groups
}

export function getCategoryLabel(category: ScenarioCategory): string {
  return CATEGORY_LABELS[category]
}

export function getEntriesByCategory(category: ScenarioCategory): PlaygroundEntry[] {
  return PLAYGROUND_ENTRIES.filter((e) => e.category === category)
}

/** Legacy helper — group name is the display label. */
export function getScenariosByGroup(group: string): Scenario[] {
  const category = (Object.entries(CATEGORY_LABELS).find(([, label]) => label === group)?.[0] ??
    null) as ScenarioCategory | null
  if (!category) return []
  return getEntriesByCategory(category).map(entryToLegacyScenario)
}

export function getEntriesByGroupLabel(group: string): PlaygroundEntry[] {
  const category = Object.entries(CATEGORY_LABELS).find(([, label]) => label === group)?.[0] as
    | ScenarioCategory
    | undefined
  if (!category) return []
  return getEntriesByCategory(category)
}

/** Legacy export — SCENARIOS array in old shape. */
export const SCENARIOS: Scenario[] = PLAYGROUND_ENTRIES.map(entryToLegacyScenario)

export function isPrototypeEntry(entry: PlaygroundEntry): boolean {
  return entry.type === 'prototype'
}

export function isArchivedEntry(entry: PlaygroundEntry): boolean {
  return entry.status === 'archived' || entry.type === 'archived'
}
