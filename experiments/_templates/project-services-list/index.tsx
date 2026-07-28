'use client'

import { useState } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { ProjectSidebar } from '@/components/ProjectSidebar'
import { ServicesListContent } from './ServicesListContent'
import { ORG_NAME, PROJECT_NAME } from './servicesData'

export const pageMeta: PageMeta = {
  title: 'Project services list',
  description:
    'Template: Console project Services list — header, search/filter, alerts switch, services table. Fork to start a new experiment.',
}

export default function Page() {
  const [activeItem, setActiveItem] = useState('services')

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
        orgSublabel="Engineering"
        userInitials="EI"
        activeProjectId="defaultdb"
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ProjectSidebar
          projectName={PROJECT_NAME}
          activeItem={activeItem}
          onItemClick={setActiveItem}
        />

        {activeItem === 'services' ? (
          <ServicesListContent />
        ) : (
          <Box style={{ flex: 1, padding: 36, overflow: 'auto' }}>
            <Typography.LargeHeading>
              {activeItem.replace(/-/g, ' ')}
            </Typography.LargeHeading>
            <Box style={{ marginTop: 8 }}>
              <Typography.Default color="muted">
                Placeholder — this template focuses on the Services list.
              </Typography.Default>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
