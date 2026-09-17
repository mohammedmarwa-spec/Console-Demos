'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShellV2 } from './ProjectPageShellV2'
import { projectPageData } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Project Overview — concept 1 (Marwa)',
  description:
    'First concept of the project Overview. Aggregation-first, gated on service volume: empty (activation + per-module empty states), small (detailed), large (aggregation).',
}

export default function Page() {
  return <ProjectPageShellV2 data={projectPageData} />
}
