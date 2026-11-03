'use client'

import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { ForceResolvedTheme } from '@/theme/ThemeProvider'
import { SchemasPage } from './SchemasPage'
import { ORG_NAME } from './schemaData'

export const pageMeta: PageMeta = {
  title: 'Improving schema',
  description:
    'Kafka Schemas for mirjam-dev-tier: a flat subject list and a subject detail page, with compatibility and delete actions.',
}

export default function Page() {
  return (
    <ForceResolvedTheme theme="dark">
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 48px)',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <ConsoleHeader activeNav="projects" orgName={ORG_NAME} orgSublabel="" userInitials="AV" />
        <SchemasPage />
      </Box>
    </ForceResolvedTheme>
  )
}
