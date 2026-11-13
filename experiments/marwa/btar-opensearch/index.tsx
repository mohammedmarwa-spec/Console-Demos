'use client'

import { useState } from 'react'
import { Box, EmptyState, Tabs } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { BackupsPage } from './BackupsPage'
import { CreateFollowerScreen } from './CreateFollowerModal'
import { PostgresBackupsPage } from './PostgresBackupsPage'
import { ORG_NAME } from './backupsData'

export const pageMeta: PageMeta = {
  title: 'BTAR OpenSearch',
  description:
    'OpenSearch managed screens to build BTAR on: Backup management, and the Create follower popup.',
}

export default function Page() {
  const [screen, setScreen] = useState('backups')
  const [byocScreen, setByocScreen] = useState('byoc-btar')

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
          <Tabs.Tab title="Backup management (simplified)" value="backups-simplified">
            <Box style={{ margin: '0 -24px' }}>
              <BackupsPage simplified />
            </Box>
          </Tabs.Tab>
          <Tabs.Tab title="CCR - OpenSearch" value="follower">
            <CreateFollowerScreen />
          </Tabs.Tab>
          <Tabs.Tab title="BTAR(PostgreSQL · Managed)" value="postgres">
            <Box style={{ margin: '0 -24px' }}>
              <PostgresBackupsPage />
            </Box>
          </Tabs.Tab>
          <Tabs.Tab title="BYOC" value="byoc">
            <Tabs aria-label="BYOC screens" value={byocScreen} onChange={(key) => setByocScreen(String(key))}>
              <Tabs.Tab title="BTAR" value="byoc-btar">
                <Box style={{ margin: '0 -24px' }}>
                  <BackupsPage simplified byoc />
                </Box>
              </Tabs.Tab>
              <Tabs.Tab title="CCR" value="byoc-ccr">
                <Box style={{ paddingTop: 24 }}>
                  <EmptyState title="CCR for BYOC" fullHeight={false}>
                    Screens for cross cluster replication on BYOC go here.
                  </EmptyState>
                </Box>
              </Tabs.Tab>
            </Tabs>
          </Tabs.Tab>
          <Tabs.Tab title="BYOC - CCR" value="byoc-ccr-modal">
            <CreateFollowerScreen byoc />
          </Tabs.Tab>
        </Tabs>
      </Box>
    </Box>
  )
}
