'use client'

import { useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  DataTable,
  DropdownMenu,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import databaseIcon from '@aivenio/aquarium/icons/database'
import helpIcon from '@aivenio/aquarium/icons/help'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { NodesCountChip } from '@/components/NodesCountChip'
import { AddSecondaryBackupModal } from './AddSecondaryBackupModal'
import { Stat } from './BackupsPage'
import { PostgresBackupSidebar } from './PostgresBackupSidebar'
import {
  ORG_NAME,
  POSTGRES_BACKUP_ROWS,
  POSTGRES_EOL,
  POSTGRES_SERVICE_NAME,
  POSTGRES_SERVICE_VERSION,
  PRIMARY_LOCATION,
  PROJECT_NAME,
} from './backupsData'

export function PostgresBackupsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Box style={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
      <Box style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100vh - 48px - 66px)' }}>
        <PostgresBackupSidebar />
      </Box>

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: 24,
          overflow: 'auto',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <ServiceIcon serviceTypeId="postgresql" size={28} alt="" />
          <Typography.DefaultStrong color="intense">{POSTGRES_SERVICE_NAME}</Typography.DefaultStrong>
          <Chip dense icon={databaseIcon} text={POSTGRES_SERVICE_VERSION} />
          <StatusChip dense status="success" text={POSTGRES_EOL} />
          <ServiceStatusChip status="Running" />
          <NodesCountChip count={1} serviceStatus="Running" />
        </Box>

        <Box style={{ marginBottom: 8 }}>
          <Breadcrumbs>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {ORG_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {PROJECT_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {POSTGRES_SERVICE_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb>Backups</Breadcrumbs.Crumb>
          </Breadcrumbs>
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Typography.Heading>Backups</Typography.Heading>
          <Button.Primary type="button" onClick={() => undefined}>
            Fork service
          </Button.Primary>
        </Box>

        <Box style={{ marginBottom: 24 }}>
          <Section
            title="Backup configuration"
            menuAriaLabel="Backup settings"
            menu={
              <DropdownMenu.Items>
                <DropdownMenu.Item id="backup-settings">Change backup settings</DropdownMenu.Item>
                <DropdownMenu.Item id="add-secondary-backup">Add secondary backup</DropdownMenu.Item>
              </DropdownMenu.Items>
            }
            onAction={(action) => {
              if (action === 'add-secondary-backup') setModalOpen(true)
            }}
          >
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              <Stat label="Backup region">{PRIMARY_LOCATION}</Stat>
              <Stat label="Secondary backup region">Not set</Stat>
              <Stat label="Latest backup">6 hours ago</Stat>
              <Stat label="Oldest backup">21 hours ago</Stat>
              <Stat label="Total backups stored">73 MiB</Stat>
            </Box>
          </Section>
        </Box>

        <DataTable
          ariaLabel="Service backups"
          rows={POSTGRES_BACKUP_ROWS}
          sticky={false}
          noWrap
          columns={[
            { type: 'text', field: 'dataSize', headerName: 'Data size', width: '16%' },
            { type: 'text', field: 'backupTime', headerName: 'Backup time', width: '28%' },
            {
              type: 'custom',
              headerName: 'Primary backup region',
              width: '28%',
              UNSAFE_render: (row) => <StatusChip status="success" text={row.primaryLocation} />,
            },
            {
              type: 'text',
              field: 'secondaryLocation',
              headerName: 'Secondary backup region',
              width: '28%',
              icon: helpIcon,
              headerTooltip: {
                content: 'Add a backup region from the Backup configuration menu.',
              },
            },
          ]}
        />
      </Box>

      <AddSecondaryBackupModal open={modalOpen} onClose={() => setModalOpen(false)} service="postgresql" />
    </Box>
  )
}
