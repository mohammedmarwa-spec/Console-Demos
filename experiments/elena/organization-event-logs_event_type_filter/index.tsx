'use client'

import { useState } from 'react'
import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { EventLogsSidebar } from './EventLogsSidebar'
import { EventLogsContent } from './EventLogsContent'

export const pageMeta: PageMeta = {
  title: 'Organization event logs_event_type_filter',
  description:
    'Admin › Event logs with a standalone Event type filter (no Quick views). Interactive search, filters, and expandable log table.',
}

export default function Page() {
  const [activeItem, setActiveItem] = useState('event-logs')

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
        activeNav="admin"
        orgName="Big Co Ltd."
        orgSublabel="Organization"
        userInitials="IN"
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <EventLogsSidebar activeItem={activeItem} onItemClick={setActiveItem} />
        <EventLogsContent />
      </Box>
    </Box>
  )
}
