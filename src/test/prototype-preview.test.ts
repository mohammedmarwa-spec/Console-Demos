import { describe, expect, it } from 'vitest'
import type { PlaygroundEntry } from '../registry/types'
import {
  getPrototypePreviewUrl,
  previewIdForEntry,
  slugifyPreviewId,
} from '../lib/prototypePreview'

const baseEntry: PlaygroundEntry = {
  id: 'first-time-user',
  title: 'First-time user',
  description: 'Alias test',
  category: 'service-creation',
  type: 'prototype',
  status: 'active',
  owner: 'Elena',
  reusable: false,
  tags: [],
  route: '/console/project/services?scenario=first-time-user',
  runtimeKey: 'empty-state',
  aliasOf: 'empty-state',
}

describe('prototypePreview', () => {
  it('slugifies ids for filenames', () => {
    expect(slugifyPreviewId('experiment/caio/ownership-test')).toBe(
      'experiment--caio--ownership-test',
    )
  })

  it('resolves alias preview id', () => {
    expect(previewIdForEntry(baseEntry)).toBe('empty-state')
  })

  it('builds convention preview url', () => {
    expect(getPrototypePreviewUrl(baseEntry)).toBe('/previews/empty-state.png')
  })

  it('uses previewImage override when set', () => {
    expect(getPrototypePreviewUrl({ ...baseEntry, previewImage: '/custom.png' })).toBe('/custom.png')
  })
})
