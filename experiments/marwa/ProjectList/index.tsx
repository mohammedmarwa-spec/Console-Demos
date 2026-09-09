'use client'

import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { ProjectListContent, ORG_NAME, ORG_SUBLABEL, USER_INITIALS } from './ProjectListContent'

export const pageMeta: PageMeta = {
  title: 'Free & Dev: Quick Upgrade V4',
  description:
    'Project services list with a self-contained Quick Upgrade flow (Developer + Hobbyist on AWS and GCP).',
}

export default function Page() {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        minHeight: 0,
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
