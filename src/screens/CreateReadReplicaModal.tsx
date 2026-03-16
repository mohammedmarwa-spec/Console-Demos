import { useState } from 'react'
import { Alert, Box, Input, Modal, RadioButton, Typography } from '@aivenio/aquarium'
import databaseIcon from '@aivenio/aquarium/icons/database'
import database02Icon from '@aivenio/aquarium/icons/database02'
import tagIcon from '@aivenio/aquarium/icons/tag'
import type { ServiceRow } from './ProjectServices'
import { getServiceTypeDisplayName } from './ServiceTypeSelectModal'
import {
  LAYOUT_GAP,
  PricingBanner,
  Section,
  ServiceSummarySidebar,
  SummaryDetail,
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
          <Section icon={databaseIcon} title="Primary service for the replica">
            <Box
              style={{
                border: '1px solid #ededf0',
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
                <PrimaryDetail label="Monthly price" value={sourceService.monthlyPrice ?? '—'} />
              </Box>
            </Box>
          </Section>

          {/* Section 2 — Read-replica configuration */}
          <Section icon={database02Icon} title="Read-replica configuration">
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
          </Section>

          {/* Section 3 — Basics */}
          <Section icon={tagIcon} title="Basics">
            <Box style={{ maxWidth: 400 }}>
              <Input
                labelText="Read-replica name *"
                description="Cannot be changed afterwards"
                value={replicaName}
                onChange={(e) => setReplicaName(e.target.value)}
              />
            </Box>
          </Section>

        </Box>

        {/* ── Service summary sidebar ── */}
        <ServiceSummarySidebar>
          <PricingBanner
            title="Flexible configuration & pricing"
            checked={useAcuPricing}
            onChange={setUseAcuPricing}
          />
          <Typography.DefaultStrong>Service summary</Typography.DefaultStrong>

          <SummaryDetail label="Service" value={`${serviceDisplayName} 17`} />
          <SummaryDetail label="Name" value={replicaName || '—'} />
          <SummaryDetail label="Service tier" value="Business" />
          <SummaryDetail label="Cloud" value={sourceService.cloudRegion} />
          <SummaryDetail label="Plan" value={sourceService.planName} />

          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
            <Box aria-hidden="true" style={{ borderTop: '1px solid #ededf0', marginBottom: 8 }} />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Box style={{ color: '#16171a' }}>
                <Typography.SmallStrong>Est. monthly*</Typography.SmallStrong>
              </Box>
              <Typography.Heading>{sourceService.monthlyPrice ?? '—'}</Typography.Heading>
            </Box>
            <Box style={{ color: '#68696b' }}>
              <Typography.Caption>*Based on 730 hours of being powered on</Typography.Caption>
            </Box>
          </Box>
        </ServiceSummarySidebar>
      </Box>
    </Modal>
  )
}

CreateReadReplicaModal.displayName = 'CreateReadReplicaModal'

// ─── Local sub-components ─────────────────────────────────────────────────────

function PrimaryDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box style={{ color: '#787885' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
    </Box>
  )
}
