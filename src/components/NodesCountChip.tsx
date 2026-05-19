import { StatusChip } from '@aivenio/aquarium'
import nodesIcon from '@aivenio/aquarium/icons/nodes'

export type NodesBadgeVariant = 'running' | 'rebuilding' | 'muted'

/** Maps a service status label to the nodes count badge fill variant (Aquarium DS tokens). */
export function serviceStatusToNodesBadgeVariant(status: string): NodesBadgeVariant {
  if (status === 'Running') return 'running'
  if (status === 'Rebuilding' || status === 'Rebalancing') return 'rebuilding'
  return 'muted'
}

type NodesCountChipProps = {
  count: number
  /** Service status label — drives badge indicator color. Defaults to Running. */
  serviceStatus?: string
}

/**
 * Nodes column / header chip: neutral StatusChip with nodes icon and a count badge.
 * Counter styling matches Aquarium DS (Figma Aquarium v6 25343:2370 / 25343:2360):
 * badge bg `--aquarium-text-color-success-default`, count `--aquarium-text-color-opposite-default`.
 */
export function NodesCountChip({ count, serviceStatus = 'Running' }: NodesCountChipProps) {
  const variant = serviceStatusToNodesBadgeVariant(serviceStatus)

  return (
    <span className={`nodes-chip nodes-chip--${variant}`}>
      <StatusChip text="Nodes" status="neutral" icon={nodesIcon} badge={count} dense />
    </span>
  )
}

NodesCountChip.displayName = 'NodesCountChip'
