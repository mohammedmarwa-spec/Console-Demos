import { describe, expect, it } from 'vitest'
import type { DiscoveredPage } from '@/lib/experiments/types'
import {
  buildCursorPrompt,
  buildCursorPromptUrl,
  getCursorPromptIntent,
  slugify,
} from '../lib/cursorDeeplink'

const template: DiscoveredPage = {
  id: 'template/onboarding-starter',
  title: 'Onboarding starter',
  description: 'Template based on Create test environment — fork this to start a new experiment',
  slug: 'onboarding-starter',
  kind: 'template',
  route: '/experiments/_templates/onboarding-starter',
}

const experiment: DiscoveredPage = {
  id: 'experiment/elena/shorter-create-service',
  title: 'Shorter create service flow',
  description: 'Advanced settings hidden by default — experiment from Create test environment',
  slug: 'shorter-create-service',
  kind: 'experiment',
  ownerSlug: 'elena',
  route: '/experiments/elena/shorter-create-service',
}

describe('cursorDeeplink', () => {
  it('slugifies names', () => {
    expect(slugify('Shorter Create Service')).toBe('shorter-create-service')
    expect(slugify('Design team')).toBe('design-team')
  })

  it('detects fork vs edit intent', () => {
    expect(getCursorPromptIntent(template)).toBe('fork')
    expect(getCursorPromptIntent(experiment)).toBe('edit')
  })

  it('builds fork prompt with scaffold command', () => {
    const result = buildCursorPrompt(template, {
      ownerSlug: 'elena',
      experimentSlug: 'my-flow',
    })
    expect(result.intent).toBe('fork')
    expect(result.prompt).toContain('onboarding-starter')
    expect(result.prompt).toContain(
      'node scripts/create-experiment.mjs --owner elena --name my-flow --template onboarding-starter',
    )
    expect(result.url.startsWith('https://cursor.com/link/prompt?text=')).toBe(true)
    expect(result.withinLimit).toBe(true)
  })

  it('builds edit prompt for experiments', () => {
    const result = buildCursorPrompt(experiment)
    expect(result.intent).toBe('edit')
    expect(result.prompt).toContain('experiments/elena/shorter-create-service/')
    expect(result.withinLimit).toBe(true)
  })

  it('encodes prompt in cursor web URL', () => {
    const url = buildCursorPromptUrl('Hello world')
    expect(url).toBe('https://cursor.com/link/prompt?text=Hello+world')
  })
})
