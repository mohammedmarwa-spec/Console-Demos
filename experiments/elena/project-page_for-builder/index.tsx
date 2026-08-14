'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShell } from '@experiments/_shared/project-page'
import { projectPageData } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Project page [For builder]',
  description:
    'Platform Project Home — fresh-user state with no services; shared shell with Project page.',
}

export default function Page() {
  return <ProjectPageShell data={projectPageData} />
}
