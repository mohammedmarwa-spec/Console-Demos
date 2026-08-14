'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShell } from '@experiments/_shared/project-page'
import { projectPageData } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Project page',
  description:
    'Platform Project Home — existing-user state with services, issues, architecture, and recent activity.',
}

export default function Page() {
  return <ProjectPageShell data={projectPageData} />
}
