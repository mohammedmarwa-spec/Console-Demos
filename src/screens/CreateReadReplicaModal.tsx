import { useEffect, useState } from 'react'
import { Alert, Box, Input, Modal, RadioButton, Typography } from '@aivenio/aquarium'
import databaseIcon from '@aivenio/aquarium/icons/database'
import database02Icon from '@aivenio/aquarium/icons/database02'
import tagIcon from '@aivenio/aquarium/icons/tag'
import type { ServiceRow } from './ProjectServices'
import { getServiceTypeDisplayName } from './ServiceTypeSelectModal'
import {
  CreationFlowSection,
  DetailField,
  FORK_REPLICA_PRICING_BANNER,
  LAYOUT_GAP,
  PricingBanner,
  ServiceSummarySidebar,
} from './ServiceCreationShared'

type ReplicaConfig = 'same-as-primary' | 'different'

export type CreateReadReplicaModalProps = {
  open: boolean
  /** The primary service this replica will be created for. */
  sourceService: ServiceRow | null
  onClose: () => void
  /** Called with the chosen replica name and pricing mode once the user submits. */
  onCreateReplica: (replicaName: string, useAcuPricing: boolean) => void
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
  const [useAcuPricing, setUseAcuPricing] = useState(sourceService?.pricingType === 'ACU')

  useEffect(() => {
    if (!open || !sourceService) return
    setReplicaName(defaultReplicaName(sourceService.id))
    setUseAcuPricing(sourceService.pricingType === 'ACU')
    setConfig('same-as-primary')
  }, [open, sourceService?.id])

  if (!open || !sourceService) return null

  const serviceDisplayName = getServiceTypeDisplayName(sourceService.serviceTypeId ?? 'postgresql')
  const cloudLabel = sourceService.cloudRegion.includes(':')
    ? sourceService.cloudRegion.split(':')[0].trim()
    : sourceService.cloudRegion

  function handleSubmit() {
    const name = replicaName.trim()
    if (!name) return
    onCreateReplica(name, useAcuPricing)
  }

  return (
    <Modal
      title="Create read-replica"
      open={open}
      onClose={onClose}
      size="full"
      primaryAction={{
        text: 'Create read-replica',
        onClick: handleSubmit,
        disabled: !replicaName.trim(),
      }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Box style={{ display: 'flex', gap: LAYOUT_GAP, alignItems: 'flex-start' }}>

        {/* ── Main content ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>

          {/* Section 1 — Primary service */}
          <CreationFlowSection icon={databaseIcon} title="Primary service for the replica">
            <Box
              style={{
                border: '1px solid var(--aquarium-border-color-muted)',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <Typography.DefaultStrong>{sourceService.serviceName}</Typography.DefaultStrong>
              <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <DetailField label="Region" value={sourceService.location} valueTypography="defaultStrong" />
                <DetailField label="Cloud provider" value={cloudLabel} valueTypography="defaultStrong" />
                <DetailField label="Current plan" value={sourceService.planName} valueTypography="defaultStrong" />
                <DetailField label="Resources" value={sourceService.planDetails} valueTypography="defaultStrong" />
                <DetailField label="Monthly price" value={sourceService.monthlyPrice ?? '—'} valueTypography="defaultStrong" />
              </Box>
            </Box>
          </CreationFlowSection>

          {/* Section 2 — Read-replica configuration */}
          <CreationFlowSection icon={database02Icon} title="Read-replica configuration">
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
          </CreationFlowSection>

          {/* Section 3 — Basics */}
          <CreationFlowSection icon={tagIcon} title="Basics">
            <Box style={{ maxWidth: 400 }}>
              <Input
                labelText="Read-replica name *"
                description="Cannot be changed afterwards"
                value={replicaName}
                onChange={(e) => setReplicaName(e.target.value)}
              />
            </Box>
          </CreationFlowSection>

        </Box>

        {/* ── Service summary sidebar ── */}
        <ServiceSummarySidebar>
          <PricingBanner
            checked={useAcuPricing}
            onChange={setUseAcuPricing}
            {...FORK_REPLICA_PRICING_BANNER}
          />
          <Typography.DefaultStrong>Service summary</Typography.DefaultStrong>

          <DetailField label="Service" value={`${serviceDisplayName} 17`} />
          <DetailField label="Name" value={replicaName || '—'} />
          <DetailField label="Service tier" value="Business" />
          <DetailField label="Cloud" value={sourceService.cloudRegion} />
          <DetailField label="Plan" value={sourceService.planName} />

          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
            <Box aria-hidden="true" style={{ borderTop: '1px solid var(--aquarium-border-color-muted)', marginBottom: 8 }} />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Typography.SmallStrong color="intense">Est. monthly*</Typography.SmallStrong>
              <Typography.Heading>{sourceService.monthlyPrice ?? '—'}</Typography.Heading>
            </Box>
            <Typography.Caption color="muted">*Based on 730 hours of being powered on</Typography.Caption>
          </Box>
        </ServiceSummarySidebar>
      </Box>
    </Modal>
  )
}

CreateReadReplicaModal.displayName = 'CreateReadReplicaModal'
