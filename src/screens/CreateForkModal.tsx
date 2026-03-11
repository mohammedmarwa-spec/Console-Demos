import { useState } from 'react'
import { Box, Button, Icon, Input, Modal, RadioButton, Select, TagLabel, Typography } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import databaseIcon from '@aivenio/aquarium/icons/database'
import database02Icon from '@aivenio/aquarium/icons/database02'
import type { ServiceRow } from './ProjectServices'
import { getServiceTypeDisplayName } from './ServiceTypeSelectModal'

type BackupType = 'latest' | 'specific'
type ConfigType = 'same-as-source' | 'different'

export type CreateForkModalProps = {
  open: boolean
  /** The source service to fork from. */
  sourceService: ServiceRow | null
  onClose: () => void
  /** Called with the chosen fork name once the user submits. */
  onCreateFork: (forkName: string) => void
}

export function defaultForkName(serviceName: string): string {
  return `fork-${serviceName}`
}

/** Format the current date as a human-readable backup timestamp, e.g. "Dec 2025 15:39:09 UTC" */
function latestTransactionLabel(): string {
  const now = new Date()
  return now.toLocaleString('en-GB', {
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }) + ' UTC'
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

  if (!open || !sourceService) return null

  const serviceDisplayName = getServiceTypeDisplayName(sourceService.serviceTypeId ?? 'postgresql')
  const cloudLabel = sourceService.cloudRegion.includes(':')
    ? sourceService.cloudRegion.split(':')[0].trim()
    : sourceService.cloudRegion

  function handleSubmit() {
    const name = forkName.trim()
    if (!name) return
    onCreateFork(name)
  }

  return (
    <Modal title={`Create ${serviceDisplayName} fork`} open={open} onClose={onClose} size="full">
      <Box style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        {/* ── Main content ── */}
        <Box style={{ flex: 1, minWidth: 0 }}>

          {/* Section 1 — Source service */}
          <ModalSection icon={databaseIcon} title="Source service">
            {/* Source service info card */}
            <Box
              style={{
                border: '1px solid #e5e7eb',
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
                <SourceDetail label="Region" value={sourceService.location} />
                <SourceDetail label="Cloud provider" value={cloudLabel} />
                <SourceDetail label="Current plan" value={sourceService.planName} />
                <SourceDetail label="Resources" value={sourceService.planDetails} />
                <SourceDetail label="Monthly price" value="~ $75" />
              </Box>
            </Box>

            {/* From backup radio group */}
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
          </ModalSection>

          {/* Section 2 — Fork configuration */}
          <ModalSection icon={database02Icon} title="Fork configuration">
            {/* Service name + project selector */}
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

            {/* Cloud / config radio buttons */}
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
            gap: 0,
          }}
        >
          <Box style={{ marginBottom: 16 }}>
            <Typography.SmallStrong>Service summary</Typography.SmallStrong>
          </Box>

          <SummarySection label="Service">
            <Typography.Default>{serviceDisplayName} 17</Typography.Default>
          </SummarySection>

          <SummaryDivider />

          <SummarySection label="Name">
            <Box style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Typography.Default>{forkName || '—'}</Typography.Default>
            </Box>
          </SummarySection>

          <SummaryDivider />

          <SummarySection label="Service tier">
            <TagLabel variant="primary" title="Business" />
          </SummarySection>

          <SummaryDivider />

          <SummarySection label="Cloud">
            <Typography.Default>{sourceService.cloudRegion}</Typography.Default>
          </SummarySection>

          <SummaryDivider />

          <SummarySection label="Plan">
            <Typography.Default>{sourceService.planName}</Typography.Default>
          </SummarySection>

          <SummaryDivider />

          {/* Estimated cost */}
          <Box style={{ paddingBlock: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box style={{ color: '#9696a0' }}>
              <Typography.Caption>Estimated monthly cost*</Typography.Caption>
            </Box>
            <Box style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, lineHeight: '36px', color: '#4a4b57' }}>
              $75 USD
            </Box>
            <Box style={{ color: '#9696a0' }}>
              <Typography.Caption>*Based on 730 hours of being powered on</Typography.Caption>
            </Box>
          </Box>

          <Button.Primary
            type="button"
            style={{ width: '100%' }}
            disabled={!forkName.trim()}
            onClick={handleSubmit}
          >
            Create fork
          </Button.Primary>
        </Box>
      </Box>
    </Modal>
  )
}

CreateForkModal.displayName = 'CreateForkModal'

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
      <Box style={{ paddingTop: 2 }}>
        <Icon icon={icon} aria-hidden style={{ fontSize: 20, color: '#9ca3af' }} />
      </Box>
      <Box style={{ paddingTop: 2, minWidth: 0 }}>
        <Box component="h3" className="typography-large text-intense" style={{ margin: 0 }}>
          {title}
        </Box>
      </Box>
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
      <Box style={{ paddingTop: 16, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  )
}

function SourceDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box style={{ color: '#787885' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
    </Box>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box style={{ paddingBlock: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Box style={{ color: '#9696a0' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      {children}
    </Box>
  )
}

function SummaryDivider() {
  return <Box aria-hidden style={{ height: 1, backgroundColor: '#e5e7eb', flexShrink: 0 }} />
}
