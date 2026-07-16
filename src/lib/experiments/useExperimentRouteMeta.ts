'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { PageMeta } from './types'
import { getOwnerDisplayName } from '../designTeamOwners'

const EXPERIMENT_ROUTE = /^\/experiments\/([^/]+)\/([^/]+)/

export type ExperimentRouteMeta = {
  title: string
  owner: string
}

export function isExperimentRoute(pathname: string): boolean {
  return EXPERIMENT_ROUTE.test(pathname)
}

export function useExperimentRouteMeta(): ExperimentRouteMeta | null {
  const pathname = usePathname()
  const [meta, setMeta] = useState<ExperimentRouteMeta | null>(null)

  useEffect(() => {
    const match = pathname.match(EXPERIMENT_ROUTE)
    if (!match) {
      setMeta(null)
      return
    }

    const [, ownerSlug, slug] = match
    let cancelled = false
    setMeta(null)

    import(`../../../experiments/${ownerSlug}/${slug}/index`)
      .then((mod) => {
        if (cancelled) return
        const pageMeta = (mod as { pageMeta?: PageMeta }).pageMeta
        if (!pageMeta?.title) return

        const owner =
          ownerSlug === '_templates' ? 'Template' : getOwnerDisplayName(ownerSlug)

        setMeta({ title: pageMeta.title, owner })
      })
      .catch(() => {
        if (!cancelled) setMeta(null)
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  return meta
}
