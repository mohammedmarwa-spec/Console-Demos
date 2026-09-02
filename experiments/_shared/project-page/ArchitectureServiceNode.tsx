'use client'

import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Box, Button, Icon, StatusChip, Typography } from '@aivenio/aquarium'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import warningSignIcon from '@aivenio/aquarium/icons/warningSign'
import { NodesCountChip } from '@/components/NodesCountChip'
import { ServiceIcon } from '@/components/ServiceIcon'
import { serviceStatusToChipStatus } from '@/components/ServiceStatusChip'
import type { ArchitectureNodeData } from './types'

type ArchitectureServiceNodeType = Node<ArchitectureNodeData>

const handleStyle = {
  width: 8,
  height: 8,
  background: 'var(--aquarium-background-color-primary-graphic)',
  border: 'none',
} as const

function ArchitectureServiceNodeComponent({
  data,
  selected,
}: NodeProps<ArchitectureServiceNodeType>) {
  const { service, showAlerts = false } = data
  const isRunning = service.status === 'Running'
  const highlightAlert = showAlerts && Boolean(service.hasAlerts)

  return (
    <Box
      style={{
        width: '100%',
        padding: 16,
        borderRadius: 8,
        border: highlightAlert
          ? '2px solid var(--aquarium-border-color-warning-intense)'
          : selected
            ? '1px solid var(--aquarium-border-color-intense)'
            : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        boxShadow: selected
          ? '0 0 0 1px var(--aquarium-border-color-primary-default)'
          : 'none',
        boxSizing: 'border-box',
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
          flexWrap: 'nowrap',
        }}
      >
        <ServiceIcon serviceTypeId={service.serviceTypeId} size={40} alt="" />
        <Box
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: '0 1 auto',
            minWidth: 0,
          }}
        >
          <Typography.DefaultStrong>{service.serviceName}</Typography.DefaultStrong>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: '0 0 auto',
            flexWrap: 'nowrap',
          }}
        >
          {highlightAlert ? (
            <Icon
              icon={warningSignIcon}
              style={{
                width: 16,
                height: 16,
                color: 'var(--aquarium-text-color-warning-intense)',
                flexShrink: 0,
              }}
              aria-label="Has alerts"
            />
          ) : null}
          <NodesCountChip count={service.nodeCount} serviceStatus={service.status} />
          <StatusChip
            dense
            text={service.status}
            status={serviceStatusToChipStatus(service.status)}
            icon={isRunning ? tickCircleIcon : undefined}
          />
          <Button.Icon
            type="button"
            dense
            icon={infoSignIcon}
            tooltip="Show details"
            aria-label="Show details"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          />
        </Box>
      </Box>
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </Box>
  )
}

export const ArchitectureServiceNode = memo(ArchitectureServiceNodeComponent)
ArchitectureServiceNode.displayName = 'ArchitectureServiceNode'
