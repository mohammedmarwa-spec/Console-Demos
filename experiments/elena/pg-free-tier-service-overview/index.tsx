'use client'

import { useState } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { FreeTierServiceSidebar } from './FreeTierServiceSidebar'
import { OverviewContent } from './OverviewContent'
import { ORG_NAME } from './overviewData'

export const pageMeta: PageMeta = {
  title: 'PG — Free tier — Service overview',
  description:
    'Free-tier PostgreSQL service overview facsimile from a production DOM capsule — upgrade banner, plan usage, and gated replica/integrations.',
}

export default function Page() {
  const [activeItem, setActiveItem] = useState('overview')

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
        orgSublabel="Organization"
        userInitials="EI"
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <FreeTierServiceSidebar activeItem={activeItem} onNavigate={setActiveItem} />

        {activeItem === 'overview' ? (
          <OverviewContent />
        ) : (
          <Box style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            <Typography.LargeHeading>
              {activeItem.replace(/-/g, ' ')}
            </Typography.LargeHeading>
            <Box style={{ marginTop: 8 }}>
              <Typography.Default color="muted">
                Placeholder — this experiment focuses on the Free-tier Overview from the DOM capsule.
              </Typography.Default>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
