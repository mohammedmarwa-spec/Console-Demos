import { useEffect, useState } from 'react'
import { Box, Input, Modal, RadioButton, Select, Typography } from '@aivenio/aquarium'
import databaseIcon from '@aivenio/aquarium/icons/database'
import database02Icon from '@aivenio/aquarium/icons/database02'
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

type BackupType = 'latest' | 'specific'
type ConfigType = 'same-as-source' | 'different'

export type CreateForkModalProps = {
  open: boolean
  /** The source service to fork from. */
  sourceService: ServiceRow | null
  onClose: () => void
  /** Called with the chosen fork name and pricing mode once the user submits. */
  onCreateFork: (forkName: string, useAcuPricing: boolean) => void
}

export function defaultForkName(serviceName: string): string {
  return `fork-${serviceName}`
}

/** Format the current date as a human-readable backup timestamp, e.g. "Dec 2025 15:39:09 UTC" */
function latestTransactionLabel(): string {
  const now = new Date()
  return (
    now.toLocaleString('en-GB', {
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) + ' UTC'
  )
}

const PROJECT_NAME = 'ux-tests'

export default function CreateForkModal({
  open,
  sourceService,
  onClose,
  onCreateFork,
}: CreateForkModalProps) {
  const [forkName, setForkName] = useState(() =>
    sourceService ? defaultForkName(sourceService.serviceName) : '',
  )
  const [backupType, setBackupType] = useState<BackupType>('latest')
  const [configType, setConfigType] = useState<ConfigType>('same-as-source')
  const [targetProject] = useState(PROJECT_NAME)
  const [useAcuPricing, setUseAcuPricing] = useState(sourceService?.pricingType === 'ACU')

  useEffect(() => {
    if (!open || !sourceService) return
    setForkName(defaultForkName(sourceService.serviceName))
    setUseAcuPricing(sourceService.pricingType === 'ACU')
    setBackupType('latest')
    setConfigType('same-as-source')
  }, [open, sourceService?.id])

  if (!open || !sourceService) return null

  const serviceDisplayName = getServiceTypeDisplayName(sourceService.serviceTypeId ?? 'postgresql')
  const cloudLabel = sourceService.cloudRegion.includes(':')
    ? sourceService.cloudRegion.split(':')[0].trim()
    : sourceService.cloudRegion

  const isAcu = sourceService.pricingType === 'ACU'

  // "Current plan" — service tier label for ACU, plan name for legacy
  const planLabel = isAcu && sourceService.serviceTier
    ? sourceService.serviceTier
    : sourceService.planName

  // "Resources" — computed from individual fields for ACU, planDetails for legacy
  const resourcesLabel = (() => {
    if (isAcu && sourceService.computeType) {
      const nodes = sourceService.nodeCount ?? 1
      const parts: string[] = [
        sourceService.computeType,
        `${nodes} ${nodes === 1 ? 'node' : 'nodes'}`,
      ]
      if (sourceService.cpuCount) parts.push(`${sourceService.cpuCount} CPU`)
      if (sourceService.ramCapacity) parts.push(`${sourceService.ramCapacity} RAM`)
      if (sourceService.storageCapacity) parts.push(`${sourceService.storageCapacity} storage`)
      return parts.join(' · ')
    }
    return sourceService.planDetails
  })()

  function handleSubmit() {
    const name = forkName.trim()
    if (!name) return
    onCreateFork(name, useAcuPricing)
  }

  return (
    <Modal
      title={`Create ${serviceDisplayName} fork`}
      open={open}
      onClose={onClose}
      size="full"
      primaryAction={{
        text: 'Create fork',
        onClick: handleSubmit,
        disabled: !forkName.trim(),
      }}
      secondaryActions={{ text: 'Cancel', onClick: onClose }}
    >
      <Box style={{ display: 'flex', gap: LAYOUT_GAP, alignItems: 'flex-start' }}>

        {/* ── Main content ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>

          {/* Section 1 — Source service */}
          <CreationFlowSection icon={databaseIcon} title="Source service">
            <Box
              style={{
                border: '1px solid var(--aquarium-border-color-muted)',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Typography.DefaultStrong>{sourceService.serviceName}</Typography.DefaultStrong>
              <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <DetailField label="Region" value={sourceService.location} valueTypography="defaultStrong" />
                <DetailField label="Cloud provider" value={cloudLabel} valueTypography="defaultStrong" />
                <DetailField label="Current plan" value={planLabel} valueTypography="defaultStrong" />
                <DetailField label="Resources" value={resourcesLabel} valueTypography="defaultStrong" />
                <DetailField label="Monthly price" value={sourceService.monthlyPrice ?? '—'} valueTypography="defaultStrong" />
              </Box>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box style={{ marginBottom: 8 }}>
                <Typography.SmallStrong>From backup</Typography.SmallStrong>
              </Box>
              <RadioButton
                name="backup-type"
                value="latest"
                checked={backupType === 'latest'}
                onChange={() => setBackupType('latest')}
              >
                Latest transaction ({latestTransactionLabel()})
              </RadioButton>
              <RadioButton
                name="backup-type"
                value="specific"
                checked={backupType === 'specific'}
                onChange={() => setBackupType('specific')}
                caption="You can restore to any point within the backup retention period"
              >
                Specific point in time
              </RadioButton>
            </Box>
          </CreationFlowSection>

          {/* Section 2 — Fork configuration */}
          <CreationFlowSection icon={database02Icon} title="Fork configuration">
            <Box style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Input
                  labelText="Service name *"
                  description="Cannot be changed afterwards"
                  value={forkName}
                  onChange={(e) => setForkName(e.target.value)}
                />
              </Box>
              <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Select
                  labelText="Fork to project *"
                  options={[{ label: targetProject, value: targetProject }]}
                  value={targetProject}
                  onChange={() => {}}
                />
              </Box>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <RadioButton
                name="fork-config"
                value="same-as-source"
                checked={configType === 'same-as-source'}
                onChange={() => setConfigType('same-as-source')}
              >
                Same as source
              </RadioButton>
              <RadioButton
                name="fork-config"
                value="different"
                checked={configType === 'different'}
                onChange={() => setConfigType('different')}
                caption="You can create a fork in a different cloud provider or region"
              >
                Different configuration
              </RadioButton>
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
          <DetailField
            label="Name"
            value={
              <Box style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Typography.Small color="intense">{forkName || '—'}</Typography.Small>
              </Box>
            }
          />
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

CreateForkModal.displayName = 'CreateForkModal'
