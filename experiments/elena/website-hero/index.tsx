'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { WebsiteHero } from './WebsiteHero'

export const pageMeta: PageMeta = {
  title: 'Website hero — isometric hive',
  description:
    'Aiven.io hero with a true isometric hive of human and agent cells and moving packets.',
}

export default function Page() {
  return <WebsiteHero />
}
