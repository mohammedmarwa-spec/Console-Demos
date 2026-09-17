'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShell } from './ProjectPageShell'
import './tokens.css'

export const pageMeta: PageMeta = {
  title: 'Populated project page — pitch v1 (Marwa)',
  description:
    'Companion to concept 1 Overview (empty / small / large volume). Scope toggle (Low-hanging fruit vs Full design) for the Production project. Staging and Development are separate projects — not mixed on this dashboard. Pitch artifact — mocked data only.',
}

export default function Page() {
  return <ProjectPageShell />
}
