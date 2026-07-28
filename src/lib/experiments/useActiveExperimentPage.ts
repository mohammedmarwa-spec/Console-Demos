'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { DiscoveredPage, PageMeta } from './types'
import { FROM_EXPERIMENT_PARAM } from './fromExperiment'
import {
  resolveExperimentRef,
  toDiscoveredPage,
  writeStoredExperiment,
} from './experimentRef'
import { isExperimentRoute } from './useExperimentRouteMeta'

/**
 * Loads DiscoveredPage metadata for the active experiment/template.
 * Survives redirects from `/experiments/...` into `/console/...`.
 */
export function useActiveExperimentPage(): DiscoveredPage | null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [page, setPage] = useState<DiscoveredPage | null>(null)

  useEffect(() => {
    const ref = resolveExperimentRef(pathname, searchParams)
    if (!ref) {
      setPage(null)
      return
    }

    if (isExperimentRoute(pathname) || searchParams.get(FROM_EXPERIMENT_PARAM)) {
      writeStoredExperiment(ref.owner, ref.slug)
    }

    let cancelled = false
    setPage(null)

    import(`../../../experiments/${ref.owner}/${ref.slug}/index`)
      .then((mod) => {
        if (cancelled) return
        const pageMeta = (mod as { pageMeta?: PageMeta }).pageMeta
        if (!pageMeta?.title) {
          setPage(null)
          return
        }
        setPage(toDiscoveredPage(ref.owner, ref.slug, pageMeta))
      })
      .catch(() => {
        if (!cancelled) setPage(null)
      })

    return () => {
      cancelled = true
    }
  }, [pathname, searchParams])

  return page
}
