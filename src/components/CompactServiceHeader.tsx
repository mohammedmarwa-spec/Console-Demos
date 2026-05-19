import { Box, StatusChip, Typography } from '@aivenio/aquarium'
import { SERVICE_ICON_BACKGROUND } from './ServiceIcon'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import { NodesCountChip } from './NodesCountChip'

export type CompactServiceHeaderProps = {
  serviceName: string
  iconUrl: string
  version: string
  statusText: string
  nodeCount: number
  /** Service status — drives nodes badge fill token. */
  serviceStatus?: string
}

export function CompactServiceHeader({
  serviceName,
  iconUrl,
  version,
  statusText,
  nodeCount,
  serviceStatus = 'Running',
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
        <Box
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: SERVICE_ICON_BACKGROUND,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={iconUrl}
            alt={serviceName}
            width={32}
            height={32}
            style={{ display: 'block' }}
          />
        </Box>
        <Box style={{ fontWeight: 600 }}>
          <Typography.Default>{serviceName}</Typography.Default>
        </Box>
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusChip text={version} status="neutral" icon={cpuChipIcon} dense />
          <StatusChip text={statusText} status="success" icon={tickCircleIcon} dense />
          <NodesCountChip count={nodeCount} serviceStatus={serviceStatus} />
        </Box>
      </Box>
    </Box>
  )
}

CompactServiceHeader.displayName = 'CompactServiceHeader'
