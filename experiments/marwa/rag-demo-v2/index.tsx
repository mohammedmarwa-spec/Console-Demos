'use client'

import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { ProjectListContent, ORG_NAME, ORG_SUBLABEL, USER_INITIALS } from './ProjectListContent'

export const pageMeta: PageMeta = {
  title: 'RAG demo v2',
  description:
    'Copy of RAG demo for the next iteration. OpenSearch RAG demo: create a Free/Dev OpenSearch service with a vector search callout, then land on the pre-configured demo page.',
}

export default function Page() {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 48px)',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ConsoleHeader
        activeNav="projects"
        orgName={ORG_NAME}
        orgSublabel={ORG_SUBLABEL}
        userInitials={USER_INITIALS}
      />
      <ProjectListContent />
    </Box>
  )
}
