'use client'

import { Box, Button, Chip, DropdownMenu, Typography } from '@aivenio/aquarium'
import moreIcon from '@aivenio/aquarium/icons/more'
import { NodesCountChip } from '@/components/NodesCountChip'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { KafkaSchemasSidebar } from './KafkaSchemasSidebar'
import { SchemasScreen } from './SchemasScreen'
import { SERVICE_NAME, SERVICE_VERSION } from './schemaData'

export function SchemasPage() {
  return (
    <Box style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <KafkaSchemasSidebar />
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <Box.Flex
          alignItems="center"
          justifyContent="space-between"
          gap="4"
          paddingX="6"
          paddingY="4"
          style={{ borderBottom: '1px solid var(--aquarium-border-color-muted)' }}
        >
          <Box.Flex alignItems="center" gap="4" minWidth="0">
            <ServiceIcon serviceTypeId="kafka" size={36} alt="" />
            <Typography.DefaultStrong color="intense">{SERVICE_NAME}</Typography.DefaultStrong>
            <Chip dense text={SERVICE_VERSION} />
            <ServiceStatusChip status="Running" />
            <NodesCountChip count={3} serviceStatus="Running" />
          </Box.Flex>
          <DropdownMenu onAction={() => undefined}>
            <DropdownMenu.Trigger>
              <Button.Icon type="button" aria-label="Service actions" tooltip="More actions" icon={moreIcon} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              <DropdownMenu.Item id="power-off">Power off service</DropdownMenu.Item>
              <DropdownMenu.Item id="delete" kind="danger">
                Delete service
              </DropdownMenu.Item>
            </DropdownMenu.Items>
          </DropdownMenu>
        </Box.Flex>

        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto' }}>
          <SchemasScreen />
        </Box>
      </Box>
    </Box>
  )
}
