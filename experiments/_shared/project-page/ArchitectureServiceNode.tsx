'use client'

import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Box, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import type { ArchitectureNodeData } from './types'

type ArchitectureServiceNodeType = Node<ArchitectureNodeData>

function ArchitectureServiceNodeComponent({
  data,
  selected,
}: NodeProps<ArchitectureServiceNodeType>) {
  const { service } = data

  return (
    <Box
      style={{
        width: '100%',
        padding: 12,
        borderRadius: 8,
        border: selected
          ? '1px solid var(--aquarium-border-color-intense)'
          : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        boxShadow: selected
          ? '0 0 0 1px var(--aquarium-border-color-primary-default)'
          : 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: 'var(--aquarium-background-color-primary-graphic)',
          border: 'none',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          width: 8,
          height: 8,
          background: 'var(--aquarium-background-color-primary-graphic)',
          border: 'none',
        }}
      />
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ServiceIcon serviceTypeId={service.serviceTypeId} size={34} alt="" />
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Typography.DefaultStrong>{service.serviceName}</Typography.DefaultStrong>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
              flexWrap: 'wrap',
            }}
          >
            <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
              <Typography.Caption>{service.serviceType}</Typography.Caption>
            </Box>
            <ServiceStatusChip status={service.status} />
          </Box>
          <Box style={{ color: 'var(--aquarium-text-color-muted)', marginTop: 4 }}>
            <Typography.Caption>
              {service.planName} · {service.cloudRegion}
            </Typography.Caption>
          </Box>
        </Box>
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          width: 8,
          height: 8,
          background: 'var(--aquarium-background-color-primary-graphic)',
          border: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: 'var(--aquarium-background-color-primary-graphic)',
          border: 'none',
        }}
      />
    </Box>
  )
}

export const ArchitectureServiceNode = memo(ArchitectureServiceNodeComponent)
ArchitectureServiceNode.displayName = 'ArchitectureServiceNode'
