import { describe, expect, it } from 'vitest'
import { getEntryById } from '../registry'
import {
  buildCursorPrompt,
  buildCursorPromptUrl,
  getCursorPromptIntent,
  getSourceScenarioId,
  ownerNameFromSlug,
  slugify,
} from '../lib/cursorDeeplink'

describe('cursorDeeplink', () => {
  it('slugifies names', () => {
    expect(slugify('Shorter Create Service')).toBe('shorter-create-service')
    expect(slugify('Design team')).toBe('design-team')
    expect(ownerNameFromSlug('elena')).toBe('Elena')
    expect(ownerNameFromSlug('unknown')).toBe('')
  })

  it('detects fork vs edit intent', () => {
    const reusable = getEntryById('onboarding-test-env')
    const experiment = getEntryById('experiment/elena/shorter-create-service')
    expect(reusable).toBeDefined()
    expect(experiment).toBeDefined()
    expect(getCursorPromptIntent(reusable!)).toBe('fork')
    expect(getCursorPromptIntent(experiment!)).toBe('edit')
  })

  it('resolves source scenario for aliases', () => {
    const alias = getEntryById('first-time-user')
    expect(alias).toBeDefined()
    expect(getSourceScenarioId(alias!)).toBe('empty-state')
  })

  it('builds fork prompt with scaffold command', () => {
    const entry = getEntryById('onboarding-test-env')!
    const result = buildCursorPrompt(entry, {
      ownerSlug: 'elena',
      experimentSlug: 'my-flow',
    })
    expect(result.intent).toBe('fork')
    expect(result.prompt).toContain('onboarding-test-env')
    expect(result.prompt).toContain(
      'node scripts/create-experiment.mjs --owner elena --name my-flow --from onboarding-test-env',
    )
    expect(result.url.startsWith('https://cursor.com/link/prompt?text=')).toBe(true)
    expect(result.withinLimit).toBe(true)
  })

  it('builds edit prompt for experiments', () => {
    const entry = getEntryById('experiment/elena/shorter-create-service')!
    const result = buildCursorPrompt(entry)
    expect(result.intent).toBe('edit')
    expect(result.prompt).toContain('src/experiments/elena/shorter-create-service/')
    expect(result.prompt).toContain('experiment/elena/shorter-create-service')
    expect(result.withinLimit).toBe(true)
  })

  it('encodes prompt in cursor web URL', () => {
    const url = buildCursorPromptUrl('Hello world')
    expect(url).toBe('https://cursor.com/link/prompt?text=Hello+world')
  })
})
