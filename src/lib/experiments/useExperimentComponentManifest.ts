'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ComponentManifest } from './types'
import { FROM_EXPERIMENT_PARAM } from './fromExperiment'
import { isExperimentRoute } from './useExperimentRouteMeta'

const EXPERIMENT_ROUTE = /^\/experiments\/([^/]+)\/([^/]+)/
/** Session key so maps survive ExperimentPageShell → /console redirects. */
const STORAGE_KEY = 'experiment:activeManifest'

function isComponentManifest(value: unknown): value is ComponentManifest {
  if (!value || typeof value !== 'object') return false
  const candidate = value as ComponentManifest
  return (
    Array.isArray(candidate.aquariumComponents) &&
    Array.isArray(candidate.prototypeComponents)
  )
}

function parseOwnerSlug(value: string | null | undefined): { owner: string; slug: string } | null {
  if (!value) return null
  const slash = value.indexOf('/')
  if (slash <= 0 || slash === value.length - 1) return null
  const owner = value.slice(0, slash)
  const slug = value.slice(slash + 1)
  if (!owner || !slug || slug.includes('/')) return null
  return { owner, slug }
}

function readStoredExperiment(): { owner: string; slug: string } | null {
  if (typeof window === 'undefined') return null
  try {
    return parseOwnerSlug(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function writeStoredExperiment(owner: string, slug: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, `${owner}/${slug}`)
  } catch {
    // ignore quota / private mode
  }
}

function clearStoredExperiment(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function resolveExperimentRef(
  pathname: string,
  searchParams: URLSearchParams,
): { owner: string; slug: string } | null {
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

/**
 * Loads a colocated `component-manifest.ts` for the current experiment.
 * Survives redirects from `/experiments/...` into `/console/...` via query
 * param + sessionStorage affinity.
 */
export function useExperimentComponentManifest(): ComponentManifest | null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [manifest, setManifest] = useState<ComponentManifest | null>(null)

  useEffect(() => {
    const ref = resolveExperimentRef(pathname, searchParams)
    if (!ref) {
      setManifest(null)
      return
    }

    if (isExperimentRoute(pathname) || searchParams.get(FROM_EXPERIMENT_PARAM)) {
      writeStoredExperiment(ref.owner, ref.slug)
    }

    let cancelled = false
    setManifest(null)

    import(`../../../experiments/${ref.owner}/${ref.slug}/component-manifest`)
      .then((mod) => {
        if (cancelled) return
        const exported = (mod as { componentManifest?: unknown }).componentManifest
        setManifest(isComponentManifest(exported) ? exported : null)
      })
      .catch(() => {
        if (!cancelled) setManifest(null)
      })

    return () => {
      cancelled = true
    }
  }, [pathname, searchParams])

  return manifest
}
