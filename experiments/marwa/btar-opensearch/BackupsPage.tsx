'use client'

import { useState, type ReactNode } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  DataTable,
  DropdownMenu,
  Link,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import helpIcon from '@aivenio/aquarium/icons/help'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { NodesCountChip } from '@/components/NodesCountChip'
import { AddSecondaryBackupModal } from './AddSecondaryBackupModal'
import { OpenSearchBackupSidebar } from './OpenSearchBackupSidebar'
import {
  BACKUP_PAGE_DESCRIPTION,
  BACKUP_ROWS,
  ORG_NAME,
  PRIMARY_LOCATION,
  PROJECT_NAME,
  SERVICE_NAME,
  SERVICE_VERSION,
} from './backupsData'

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
      <Typography.Caption color="muted">{label}</Typography.Caption>
      <Typography.Small>{children}</Typography.Small>
    </Box>
  )
}

export function BackupsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Box style={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
      <Box style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100vh - 48px - 66px)' }}>
        <OpenSearchBackupSidebar />
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
        <Box style={{ marginBottom: 16 }}>
          <Breadcrumbs>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {ORG_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {PROJECT_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {SERVICE_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb>Backups</Breadcrumbs.Crumb>
          </Breadcrumbs>
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <ServiceIcon serviceTypeId="opensearch" size={44} alt="" />
            <Box style={{ minWidth: 0 }}>
              <Typography.LargeStrong color="intense">{SERVICE_NAME}</Typography.LargeStrong>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <Chip dense text={SERVICE_VERSION} />
                <ServiceStatusChip status="Running" />
                <NodesCountChip count={1} serviceStatus="Running" />
              </Box>
            </Box>
          </Box>
          <Button.Primary type="button" onClick={() => undefined}>
            Fork service
          </Button.Primary>
        </Box>

        <Box style={{ marginBottom: 20, maxWidth: 820 }}>
          <Typography.Small color="muted">{BACKUP_PAGE_DESCRIPTION}</Typography.Small>
        </Box>

        <Section
          title="Backup configuration"
          menuAriaLabel="Backup settings"
          menu={
            <DropdownMenu.Items>
              <DropdownMenu.Item id="backup-settings">Change backup settings</DropdownMenu.Item>
            </DropdownMenu.Items>
          }
          onAction={() => undefined}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                <Typography.Caption color="muted">Backup location</Typography.Caption>
                <Typography.LargeStrong>{PRIMARY_LOCATION}</Typography.LargeStrong>
              </Box>
              <Stat label="Secondary backup location">
                <Box.Flex flexDirection="column" alignItems="flex-start" gap="2">
                  <span>Not set</span>
                  <Link
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setModalOpen(true)
                    }}
                  >
                    Add backup
                  </Link>
                </Box.Flex>
              </Stat>
              <Stat label="Latest backup">40 minutes ago</Stat>
              <Stat label="Oldest backup">25 Sept 2026</Stat>
            </Box>
            <Stat label="Total backups stored">6 MiB</Stat>

            <DataTable
              ariaLabel="Service backups"
              rows={BACKUP_ROWS}
              sticky={false}
              noWrap
              columns={[
                { type: 'text', field: 'dataSize', headerName: 'Data size', width: '16%' },
                { type: 'text', field: 'backupTime', headerName: 'Backup time', width: '28%' },
                {
                  type: 'custom',
                  headerName: 'Primary backup location',
                  width: '28%',
                  UNSAFE_render: (row) => <StatusChip status="success" text={row.primaryLocation} />,
                },
                {
                  type: 'text',
                  field: 'secondaryLocation',
                  headerName: 'Secondary backup location',
                  width: '28%',
                  icon: helpIcon,
                  headerTooltip: {
                    content: 'Add a backup location with the button in this section.',
                  },
                },
              ]}
            />
          </Box>
        </Section>
      </Box>

      <AddSecondaryBackupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  )
}
