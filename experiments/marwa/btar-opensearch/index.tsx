'use client'

import { useState } from 'react'
import { Box, Tabs } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { PostgresBtarScreen } from './AddSecondaryBackupModal'
import { BackupsPage } from './BackupsPage'
import { CreateFollowerScreen } from './CreateFollowerModal'
import { ORG_NAME } from './backupsData'

export const pageMeta: PageMeta = {
  title: 'BTAR OpenSearch',
  description:
    'OpenSearch managed screens to build BTAR on: Backup management, and the Create follower popup.',
}

export default function Page() {
  const [screen, setScreen] = useState('backups')

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 48px)',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ConsoleHeader activeNav="projects" orgName={ORG_NAME} userInitials="AV" />
      <Box style={{ padding: '16px 24px 0' }}>
        <Tabs aria-label="Resiliency screens" value={screen} onChange={(key) => setScreen(String(key))}>
          <Tabs.Tab title="Backup management" value="backups">
            <Box style={{ margin: '0 -24px' }}>
              <BackupsPage />
            </Box>
          </Tabs.Tab>
          <Tabs.Tab title="CCR - OpenSearch" value="follower">
            <CreateFollowerScreen />
          </Tabs.Tab>
          <Tabs.Tab title="BTAR(PostgreSQL · Managed)" value="postgres">
            <PostgresBtarScreen />
          </Tabs.Tab>
        </Tabs>
      </Box>
    </Box>
  )
}
