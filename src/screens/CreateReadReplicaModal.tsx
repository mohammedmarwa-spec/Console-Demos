import { useState } from 'react'
import { Alert, Box, Button, Icon, Input, Modal, RadioButton, TagLabel, Typography } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import databaseIcon from '@aivenio/aquarium/icons/database'
import database02Icon from '@aivenio/aquarium/icons/database02'
import tagIcon from '@aivenio/aquarium/icons/tag'
import type { ServiceRow } from './ProjectServices'
import { getServiceTypeDisplayName } from './ServiceTypeSelectModal'

type ReplicaConfig = 'same-as-primary' | 'different'

export type CreateReadReplicaModalProps = {
  open: boolean
  /** The primary service this replica will be created for. */
  sourceService: ServiceRow | null
  onClose: () => void
  /** Called with the chosen replica name once the user submits. */
  onCreateReplica: (replicaName: string) => void
}

function defaultReplicaName(serviceId: string): string {
  return `replica-${serviceId}`
}

export default function CreateReadReplicaModal({
  open,
  sourceService,
  onClose,
  onCreateReplica,
}: CreateReadReplicaModalProps) {
  const [config, setConfig] = useState<ReplicaConfig>('same-as-primary')
  const [replicaName, setReplicaName] = useState(() =>
    sourceService ? defaultReplicaName(sourceService.id) : '',
  )

  if (!open || !sourceService) return null

  const serviceDisplayName = getServiceTypeDisplayName(sourceService.serviceTypeId ?? 'postgresql')
  const cloudLabel = sourceService.cloudRegion.includes(':')
    ? sourceService.cloudRegion.split(':')[0].trim()
    : sourceService.cloudRegion

  function handleSubmit() {
    const name = replicaName.trim()
    if (!name) return
    onCreateReplica(name)
  }

  return (
    <Modal title="Create read-replica" open={open} onClose={onClose} size="full">
      <Box style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        {/* ── Main content ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <ModalSection icon={databaseIcon} title="Primary service for the replica">
            <Box
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <Typography.DefaultStrong>{sourceService.serviceName}</Typography.DefaultStrong>
              <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <PrimaryDetail label="Region" value={sourceService.location} />
                <PrimaryDetail label="Cloud provider" value={cloudLabel} />
                <PrimaryDetail label="Current plan" value={sourceService.planName} />
                <PrimaryDetail label="Resources" value={sourceService.planDetails} />
                <PrimaryDetail label="Monthly price" value="~ $75" />
              </Box>
            </Box>
          </ModalSection>

          <ModalSection icon={database02Icon} title="Read-replica configuration">
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Alert type="information">
                Read replicas are single-node by design. They offload read traffic from the primary
                service, while availability is handled by the primary and read scaling is achieved
                by adding more replicas.
              </Alert>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RadioButton
                  name="replica-config"
                  value="same-as-primary"
                  checked={config === 'same-as-primary'}
                  onChange={() => setConfig('same-as-primary')}
                >
                  Same as primary (Cloud, Region, CPU, RAM, Storage)
                </RadioButton>
                <RadioButton
                  name="replica-config"
                  value="different"
                  checked={config === 'different'}
                  onChange={() => setConfig('different')}
                  caption="You can configure a read-replica node in a different cloud provider or region"
                >
                  Different configuration
                </RadioButton>
              </Box>
            </Box>
          </ModalSection>

          <ModalSection icon={tagIcon} title="Basics">
            <Box style={{ maxWidth: 400 }}>
              <Input
                labelText="Read-replica name *"
                description="Cannot be changed afterwards"
                value={replicaName}
                onChange={(e) => setReplicaName(e.target.value)}
              />
            </Box>
          </ModalSection>
        </Box>

        {/* ── Service summary sidebar ── */}
        <Box
          style={{
            width: 300,
            flexShrink: 0,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            backgroundColor: '#fff',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Typography.SmallStrong>Service summary</Typography.SmallStrong>
          <SummaryRow label="Service" value={`${serviceDisplayName} 17`} highlight />
          <SummaryRow label="Name" value={replicaName || '—'} />
          <SummaryRow label="Service tier">
            <TagLabel variant="primary" title="Business" />
          </SummaryRow>
          <SummaryRow label="Cloud" value={sourceService.cloudRegion} highlight />
          <SummaryRow label="Plan" value={sourceService.planName} />
          <Box>
            <Box style={{ color: '#787885' }}>
              <Typography.Caption>Estimated monthly cost*</Typography.Caption>
            </Box>
            <Box style={{ marginTop: 4 }}>
              <Typography.Heading>$75 USD</Typography.Heading>
            </Box>
          </Box>
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>*Based on 730 hours of being powered on</Typography.Caption>
          </Box>
          <Button.Primary
            type="button"
            style={{ width: '100%' }}
            disabled={!replicaName.trim()}
            onClick={handleSubmit}
          >
            Create read-replica
          </Button.Primary>
        </Box>
      </Box>
    </Modal>
  )
}

CreateReadReplicaModal.displayName = 'CreateReadReplicaModal'

// ─── Local sub-components ────────────────────────────────────────────────────

const SECTION_ICON_WIDTH = 32

function ModalSection({
  icon,
  title,
  children,
}: {
  icon: IconifyIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `${SECTION_ICON_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: 'auto auto',
        gap: 0,
        marginBottom: 32,
        minWidth: 0,
        alignItems: 'start',
      }}
    >
      {/* Top-left: icon */}
      <Box style={{ paddingTop: 2 }}>
        <Icon icon={icon} aria-hidden style={{ fontSize: 20, color: '#9ca3af' }} />
      </Box>
      {/* Top-right: title */}
      <Box style={{ paddingTop: 2, minWidth: 0 }}>
        <Box component="h3" className="typography-large text-intense" style={{ margin: 0 }}>
          {title}
        </Box>
      </Box>
      {/* Bottom-left: vertical divider line */}
      <Box
        style={{
          paddingTop: 16,
          width: SECTION_ICON_WIDTH,
          minWidth: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            width: 1,
            backgroundColor: '#d1d5db',
            alignSelf: 'stretch',
            minHeight: 40,
          }}
        />
      </Box>
      {/* Bottom-right: content */}
      <Box style={{ paddingTop: 16, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  )
}

function PrimaryDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box style={{ color: '#787885' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
    </Box>
  )
}

function SummaryRow({
  label,
  value,
  highlight,
  children,
}: {
  label: string
  value?: string
  highlight?: boolean
  children?: React.ReactNode
}) {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Box style={{ textAlign: 'right' }}>
        {value !== undefined ? (
          <Box style={{ color: highlight ? '#3545be' : '#292a31', fontWeight: highlight ? 600 : 400 }}>
            <Typography.Caption>{value}</Typography.Caption>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  )
}
