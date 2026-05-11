import { Box, StatusChip, Typography } from '@aivenio/aquarium'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'

export type CompactServiceHeaderProps = {
  serviceName: string
  iconUrl: string
  version: string
  statusText: string
  nodeCount: number
}

export function CompactServiceHeader({
  serviceName,
  iconUrl,
  version,
  statusText,
  nodeCount,
}: CompactServiceHeaderProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 12,
        marginBottom: 12,
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <img
          src={iconUrl}
          alt={serviceName}
          width={32}
          height={32}
          style={{ borderRadius: 999, display: 'block' }}
        />
        <Box style={{ fontWeight: 600 }}>
          <Typography.Default>{serviceName}</Typography.Default>
        </Box>
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusChip text={version} status="neutral" icon={cpuChipIcon} dense />
          <StatusChip text={statusText} status="success" icon={tickCircleIcon} dense />
          <StatusChip text="Nodes" status="success" icon={nodesIcon} badge={nodeCount} dense />
        </Box>
      </Box>
    </Box>
  )
}

CompactServiceHeader.displayName = 'CompactServiceHeader'
