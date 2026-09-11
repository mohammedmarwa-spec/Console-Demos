'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShellV2 } from './ProjectPageShellV2'
import { projectPageData } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Project Overview — concept 2 (Marwa)',
  description:
    'Second, independent concept of the project Overview. Forked from concept 1 so the two can diverge. Iterate here without changing /experiments/marwa/project-page.',
}

export default function Page() {
  return <ProjectPageShellV2 data={projectPageData} />
}
