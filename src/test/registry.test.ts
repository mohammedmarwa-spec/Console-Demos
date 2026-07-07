import { describe, expect, it } from 'vitest'
import {
  getEntryById,
  getGroups,
  PLAYGROUND_ENTRIES,
} from '../registry'

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

  it('includes three reusable scenarios', () => {
    const reusables = PLAYGROUND_ENTRIES.filter((e) => e.type === 'reusable-scenario')
    expect(reusables.length).toBeGreaterThanOrEqual(3)
    expect(reusables.some((e) => e.id === 'onboarding-test-env')).toBe(true)
    expect(reusables.some((e) => e.id === 'empty-state')).toBe(true)
    expect(reusables.some((e) => e.id === 'existing-customer')).toBe(true)
  })

  it('returns ordered category groups', () => {
    const groups = getGroups()
    expect(groups.length).toBeGreaterThan(0)
    expect(groups).toContain('Onboarding')
  })
})
