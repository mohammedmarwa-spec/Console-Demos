'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShell } from './ProjectPageShell'
import './tokens.css'

export const pageMeta: PageMeta = {
  title: 'Populated project page — pitch v1 (Marwa)',
  description:
    'Companion to the empty-state Overview. Scope toggle (Low-hanging fruit vs Full design) against one 52-service fixture. Pitch artifact — mocked data only.',
}

export default function Page() {
  return <ProjectPageShell />
}
