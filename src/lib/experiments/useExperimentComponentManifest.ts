'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ComponentManifest } from './types'
import { FROM_EXPERIMENT_PARAM } from './fromExperiment'
import {
  resolveExperimentRef,
  writeStoredExperiment,
} from './experimentRef'
import { isExperimentRoute } from './useExperimentRouteMeta'

function isComponentManifest(value: unknown): value is ComponentManifest {
  if (!value || typeof value !== 'object') return false
  const candidate = value as ComponentManifest
  return (
    Array.isArray(candidate.aquariumComponents) &&
    Array.isArray(candidate.prototypeComponents)
  )
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
