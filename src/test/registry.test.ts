import { describe, expect, it } from 'vitest'
import {
  getEntryById,
  getGroups,
  PLAYGROUND_ENTRIES,
  REUSABLE_SCENARIOS,
} from '../registry'
import { PROTOTYPE_SCENARIOS } from '../content/prototype-scenarios'
import { discoverExperiments } from '../lib/experiments/discover.server'
import { getInitialPathForScenario, getLaunchUrlForScenario } from '../lib/navigation'
import { resolveRuntime } from '../scenarios/scenarioRuntime'

describe('playground registry', () => {
  it('has unique ids', () => {
    const ids = PLAYGROUND_ENTRIES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has required metadata', () => {
    for (const entry of PLAYGROUND_ENTRIES) {
      expect(entry.id).toBeTruthy()
      expect(entry.title).toBeTruthy()
      expect(entry.description).toBeTruthy()
      expect(entry.category).toBeTruthy()
      expect(entry.type).toBeTruthy()
      expect(entry.status).toBeTruthy()
      expect(entry.owner).toBeTruthy()
      expect(entry.runtimeKey).toBeTruthy()
      expect(entry.route.startsWith('/')).toBe(true)
      expect(Array.isArray(entry.tags)).toBe(true)
    }
  })

  it('validates sourceScenarioId references', () => {
    for (const entry of PLAYGROUND_ENTRIES) {
      if (entry.sourceScenarioId) {
        expect(getEntryById(entry.sourceScenarioId)).toBeDefined()
      }
      if (entry.aliasOf) {
        expect(getEntryById(entry.aliasOf)).toBeDefined()
      }
    }
  })

  it('includes reusable scenarios only (no prototypes)', () => {
    expect(PLAYGROUND_ENTRIES.every((e) => e.type === 'reusable-scenario')).toBe(true)
    expect(PLAYGROUND_ENTRIES.length).toBe(REUSABLE_SCENARIOS.length)
    expect(REUSABLE_SCENARIOS.some((e) => e.id === 'onboarding-test-env')).toBe(true)
    expect(REUSABLE_SCENARIOS.some((e) => e.id === 'empty-state')).toBe(true)
    expect(REUSABLE_SCENARIOS.some((e) => e.id === 'existing-customer')).toBe(true)
  })

  it('returns ordered category groups', () => {
    const groups = getGroups()
    expect(groups.length).toBeGreaterThan(0)
    expect(groups).toContain('Onboarding')
  })
})

describe('prototype scenario launch smoke', () => {
  it.each(PROTOTYPE_SCENARIOS.map((s) => [s.id, s.title] as const))(
    '%s (%s) resolves runtime and console launch path',
    (scenarioId) => {
      const runtime = resolveRuntime(scenarioId)
      expect(runtime.initialView).toBeTruthy()
      expect(runtime.getInitialServices()).toBeDefined()

      const path = getInitialPathForScenario(scenarioId)
      expect(path.startsWith('/console') || path.startsWith('/experiments')).toBe(true)

      const launchUrl = getLaunchUrlForScenario(scenarioId)
      expect(launchUrl).toContain('scenario=')
      expect(launchUrl.startsWith('/')).toBe(true)
    },
  )

  it('mysql-acu-rollout auto-opens rollout modal via runtime flags', () => {
    const flags = resolveRuntime('mysql-acu-rollout').flags
    expect(flags?.autoOpenMysqlRolloutModal).toBe(true)
  })

  it('deeptrace-demo opens service overview on logs sidebar', () => {
    const runtime = resolveRuntime('deeptrace-demo')
    expect(runtime.initialView).toBe('service-overview')
    expect(runtime.flags?.initialSidebarItem).toBe('logs')
    expect(runtime.initialOverviewServiceId).toBeTruthy()
  })

  it('first-time-user aliases to empty-state runtime', () => {
    const empty = resolveRuntime('empty-state')
    const alias = resolveRuntime('first-time-user')
    expect(alias.initialView).toBe(empty.initialView)
    expect(alias.getInitialServices()).toEqual(empty.getInitialServices())
  })
})

describe('reusable scenario launch smoke', () => {
  it.each(REUSABLE_SCENARIOS.map((s) => [s.id, s.title] as const))(
    '%s (%s) resolves runtime and console launch path',
    (scenarioId) => {
      const runtime = resolveRuntime(scenarioId)
      expect(runtime.initialView).toBeTruthy()
      expect(runtime.getInitialServices()).toBeDefined()

      const path = getInitialPathForScenario(scenarioId)
      expect(path.startsWith('/console')).toBe(true)

      const entry = getEntryById(scenarioId)
      expect(entry?.runtimeKey).toBeTruthy()
    },
  )
})

describe('experiment discovery', () => {
  it('discovers 11 Elena experiments including migrated prototypes', () => {
    const elena = discoverExperiments().filter((e) => e.ownerSlug === 'elena')
    expect(elena.length).toBe(11)

    for (const scenario of PROTOTYPE_SCENARIOS) {
      expect(elena.some((e) => e.slug === scenario.id)).toBe(true)
    }
    expect(elena.some((e) => e.slug === 'shorter-create-service')).toBe(true)
  })
})
