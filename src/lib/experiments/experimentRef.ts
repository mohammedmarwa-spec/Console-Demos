/** Shared helpers for resolving which experiment/template is active. */

import { FROM_EXPERIMENT_PARAM } from './fromExperiment'
import type { DiscoveredPage, PageMeta } from './types'

export const EXPERIMENT_ROUTE = /^\/experiments\/([^/]+)\/([^/]+)/
export const TEMPLATES_OWNER = '_templates'
/** Session key so affinity survives ExperimentPageShell → /console redirects. */
export const ACTIVE_EXPERIMENT_STORAGE_KEY = 'experiment:activeManifest'

export type ExperimentRef = {
  owner: string
  slug: string
}

export function parseOwnerSlug(value: string | null | undefined): ExperimentRef | null {
  if (!value) return null
  const slash = value.indexOf('/')
  if (slash <= 0 || slash === value.length - 1) return null
  const owner = value.slice(0, slash)
  const slug = value.slice(slash + 1)
  if (!owner || !slug || slug.includes('/')) return null
  return { owner, slug }
}

export function readStoredExperiment(): ExperimentRef | null {
  if (typeof window === 'undefined') return null
  try {
    return parseOwnerSlug(sessionStorage.getItem(ACTIVE_EXPERIMENT_STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeStoredExperiment(owner: string, slug: string): void {
  try {
    sessionStorage.setItem(ACTIVE_EXPERIMENT_STORAGE_KEY, `${owner}/${slug}`)
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredExperiment(): void {
  try {
    sessionStorage.removeItem(ACTIVE_EXPERIMENT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Resolve owner/slug from the experiment route, `fromExperiment` query, or
 * sessionStorage affinity (console routes after redirect).
 */
export function resolveExperimentRef(
  pathname: string,
  searchParams: URLSearchParams,
): ExperimentRef | null {
  const pathMatch = pathname.match(EXPERIMENT_ROUTE)
  if (pathMatch) {
    return { owner: pathMatch[1], slug: pathMatch[2] }
  }

  const fromQuery = parseOwnerSlug(searchParams.get(FROM_EXPERIMENT_PARAM))
  if (fromQuery) return fromQuery

  // Hub clears affinity; console routes keep the last launched experiment.
  if (pathname === '/' || pathname === '') {
    clearStoredExperiment()
    return null
  }

  return readStoredExperiment()
}

export function toDiscoveredPage(
  owner: string,
  slug: string,
  pageMeta: PageMeta,
): DiscoveredPage {
  const isTemplate = owner === TEMPLATES_OWNER
  return {
    ...pageMeta,
    id: isTemplate ? `template/${slug}` : `experiment/${owner}/${slug}`,
    slug,
    kind: isTemplate ? 'template' : 'experiment',
    route: `/experiments/${owner}/${slug}`,
    ...(isTemplate ? {} : { ownerSlug: owner }),
  }
}
