import { StatusChip } from '@aivenio/aquarium'
import type { ComponentProps } from 'react'

type StatusChipStatus = NonNullable<ComponentProps<typeof StatusChip>['status']>

/** Maps a service status label to Aquarium StatusChip status (overview page pattern). */
export function serviceStatusToChipStatus(status: string): StatusChipStatus {
  if (status === 'Running') return 'success'
  if (status === 'Rebuilding' || status === 'Rebalancing') return 'info'
  return 'neutral'
}

type ServiceStatusChipProps = {
  status: string
}

/** Service status chip — matches ServiceOverview subtitle (dense StatusChip, no icon). */
export function ServiceStatusChip({ status }: ServiceStatusChipProps) {
  return <StatusChip text={status} status={serviceStatusToChipStatus(status)} dense />
}

ServiceStatusChip.displayName = 'ServiceStatusChip'
