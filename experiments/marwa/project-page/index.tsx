'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShellV2 } from './ProjectPageShellV2'
import { projectPageData } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Project Overview — aggregation-first (Marwa)',
  description:
    'Redesigned project Overview: exception-first, grouped by System / Service type. Summary metrics, grouped rollup, and a grouped Needs-attention list that stays legible at 50+ services. Toggle "New Overview" to compare with the current layout.',
}

export default function Page() {
  return <ProjectPageShellV2 data={projectPageData} />
}
