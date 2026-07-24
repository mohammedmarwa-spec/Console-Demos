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
    'Template: Free-tier PostgreSQL service overview — upgrade banner, plan usage, gated replica/integrations. Fork to start a new experiment.',
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
          <Box style={{ flex: 1, padding: 36, overflow: 'auto' }}>
            <Typography.LargeHeading>
              {activeItem.replace(/-/g, ' ')}
            </Typography.LargeHeading>
            <Box style={{ marginTop: 8 }}>
              <Typography.Default color="muted">
                Placeholder — this template focuses on the Free-tier Overview.
              </Typography.Default>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
