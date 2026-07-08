import type { PlaygroundEntry } from '../registry/types'

/** Stable filename slug for preview assets under /public/previews. */
export function slugifyPreviewId(id: string): string {
  return id.replace(/\//g, '--')
}

/** Registry id used to resolve a preview file (follows aliasOf). */
export function previewIdForEntry(entry: Pick<PlaygroundEntry, 'id' | 'aliasOf'>): string {
  return entry.aliasOf ?? entry.id
}

/** Public URL for a prototype hover preview image. */
export function getPrototypePreviewUrl(entry: PlaygroundEntry): string {
  if (entry.previewImage) return entry.previewImage
  return `/previews/${slugifyPreviewId(previewIdForEntry(entry))}.png`
}

const previewAvailabilityCache = new Map<string, boolean>()

/** Check whether a preview image exists (cached per URL). */
export function checkPreviewImageAvailable(url: string): Promise<boolean> {
  const cached = previewAvailabilityCache.get(url)
  if (cached !== undefined) return Promise.resolve(cached)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      previewAvailabilityCache.set(url, true)
      resolve(true)
    }
    img.onerror = () => {
      previewAvailabilityCache.set(url, false)
      resolve(false)
    }
    img.src = url
  })
}

/** @internal test helper */
export function _clearPreviewAvailabilityCache(): void {
  previewAvailabilityCache.clear()
}
