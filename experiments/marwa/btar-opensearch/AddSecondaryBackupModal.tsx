'use client'

import { useState } from 'react'
import { Alert, Box, ChipContainer, Divider, Modal, Section, Select, StatusChip, Switch, Typography } from '@aivenio/aquarium'
import {
  choiceFromPrimary,
  formatGb,
  formatUsd,
  frequencyById,
  regionCents,
  STORAGE_GB,
  STORAGE_RATE,
  TRANSFER_RATE_DIFFERENT,
  TRANSFER_RATE_SAME,
  transferRate,
  type RegionChoice,
} from './backupCost'
import { BACKUP_REGION_OPTIONS, PRIMARY_LOCATION } from './backupsData'

const BACKUP_DOCS_URL = 'https://aiven.io/docs/platform/concepts/backup-to-another-region'

type RegionOption = RegionChoice & { label: string }

export function RateLine({ label, detail, rate, unit }: { label: string; detail: string; rate: string; unit: string }) {
  return (
    <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
      <Box>
        <Typography.DefaultStrong>{label}</Typography.DefaultStrong>
        <Typography.Small color="muted">{detail}</Typography.Small>
      </Box>
      <Box.Flex alignItems="baseline" gap="2" style={{ flexShrink: 0 }}>
        <Typography.LargeStrong>{rate}</Typography.LargeStrong>
        <Typography.Small color="muted">{unit}</Typography.Small>
      </Box.Flex>
    </Box.Flex>
  )
}

function PricingRates({ choice }: { choice: RegionChoice | null }) {
  const different = choice?.different ?? false
  const chips = choice ? [<StatusChip key="route" status={different ? 'warning' : 'success'} text={choice.route} />] : []
  return (
    <Box
      backgroundColor="body"
      borderColor="muted"
      borderWidth={1}
      padding="5"
      borderRadius={8}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
        <Box.Flex flexDirection="column" gap="2">
          <Typography.DefaultStrong>Additional costs</Typography.DefaultStrong>
          <Typography.Small color="muted">You are billed for actual usage at these rates.</Typography.Small>
        </Box.Flex>
        {chips.length > 0 ? <ChipContainer>{chips}</ChipContainer> : null}
      </Box.Flex>
      <Divider />
      <RateLine
        label="Backup storage"
        detail="For the copy kept in the secondary location."
        rate={`$${STORAGE_RATE.toFixed(2)}`}
        unit="per GB-month"
      />
      <RateLine
        label="Backup transfer"
        detail={
          different
            ? `Different continent. $${TRANSFER_RATE_SAME.toFixed(2)} per GB on the same continent.`
            : `Same continent. $${TRANSFER_RATE_DIFFERENT.toFixed(2)} per GB to a different continent.`
        }
        rate={`$${transferRate(different).toFixed(2)}`}
        unit="per GB transferred"
      />
    </Box>
  )
}

const BYOC_ORCHESTRATION_FEE = 20

/** BYOC storage and transfer stay in the customer's cloud account, so only the fixed fee applies. */
function ByocPricing() {
  return (
    <Box
      backgroundColor="body"
      borderColor="muted"
      borderWidth={1}
      padding="5"
      borderRadius={8}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
        <Box.Flex flexDirection="column" gap="2">
          <Typography.DefaultStrong>Additional costs</Typography.DefaultStrong>
          <Typography.Small color="muted">A fixed monthly price. No storage or transfer charges from Aiven.</Typography.Small>
        </Box.Flex>
        <StatusChip status="primary" text="BYOC" />
      </Box.Flex>
      <Divider />
      <RateLine
        label="BTAR orchestration fee"
        detail="Charged for each service with a secondary backup location."
        rate={`$${BYOC_ORCHESTRATION_FEE}`}
        unit="per service / month"
      />
      <Divider />
      <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
        <Typography.DefaultStrong>Fixed monthly total</Typography.DefaultStrong>
        <Typography.LargeStrong>{`$${BYOC_ORCHESTRATION_FEE.toFixed(2)}`}</Typography.LargeStrong>
      </Box.Flex>
    </Box>
  )
}

function toOption(choice: RegionChoice): RegionOption {
  return { ...choice, label: choice.value }
}

const SECONDARY_OPTIONS = BACKUP_REGION_OPTIONS.map((region) => toOption(choiceFromPrimary(region)))

function CostRow({ label, amount, strong }: { label: string; amount: string; strong?: boolean }) {
  const Text = strong ? Typography.SmallStrong : Typography.Small
  return (
    <Box.Flex justifyContent="space-between" gap="4">
      <Text color={strong ? undefined : 'muted'}>{label}</Text>
      <Text>{amount}</Text>
    </Box.Flex>
  )
}

function RegionCostBlock({ choice, perDay }: { choice: RegionChoice; perDay: number }) {
  const cents = regionCents(choice.different, perDay)
  const rate = transferRate(choice.different).toFixed(2)
  return (
    <Box.Flex flexDirection="column" gap="2">
      <Box.Flex alignItems="center" gap="2" flexWrap="wrap">
        <Typography.SmallStrong>{choice.value}</Typography.SmallStrong>
        <StatusChip dense status={choice.different ? 'warning' : 'success'} text={choice.route} />
      </Box.Flex>
      <CostRow
        label={`Backup storage · ${STORAGE_GB} GB × $${STORAGE_RATE.toFixed(2)} per GB-month`}
        amount={formatUsd(cents.storage)}
      />
      <CostRow
        label={`Backup transfer · ${formatGb(cents.transferGb)} GB × $${rate} per GB transferred`}
        amount={formatUsd(cents.transfer)}
      />
      <CostRow label="Subtotal" amount={formatUsd(cents.total)} strong />
    </Box.Flex>
  )
}

export function AddSecondaryBackupModal({
  open,
  onClose,
  service = 'opensearch',
  simplified = false,
  byoc = false,
}: {
  open: boolean
  onClose: () => void
  service?: 'opensearch' | 'postgresql'
  /** Rates-only layout. PostgreSQL always uses it. */
  simplified?: boolean
  byoc?: boolean
}) {
  const isSimple = service === 'postgresql' || simplified
  const [enabled, setEnabled] = useState(false)
  const [secondary, setSecondary] = useState<string | null>(null)

  function close() {
    setEnabled(false)
    setSecondary(null)
    onClose()
  }

  const perDay = frequencyById('hourly').perDay

  const secondaryChoice = secondary ? choiceFromPrimary(secondary) : null
  const totalCents = secondaryChoice ? regionCents(secondaryChoice.different, perDay).total : 0

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Add secondary backup location"
      primaryAction={{ text: 'Add backup location', onClick: close, disabled: !enabled || !secondary }}
      secondaryActions={{ text: 'Cancel', onClick: close }}
    >
      <Box.Flex flexDirection="column" gap="6">
        <Alert type="information" action={{ text: 'Learn more', href: BACKUP_DOCS_URL }}>
          Keep a second copy of your backups in another region, so you can restore if the primary region fails.
        </Alert>

        <Box.Flex flexDirection="column" gap="4">
          <Typography.Default>
            <Typography.DefaultStrong htmlTag="span">Primary location</Typography.DefaultStrong>
            {': '}
            {PRIMARY_LOCATION}
          </Typography.Default>
          <Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)}>
            Secondary backup location enabled
          </Switch>
        </Box.Flex>

        {enabled ? (
          <>
            <Select<RegionOption>
              labelText="Secondary backup location"
              required={!isSimple}
              reserveSpaceForError={false}
              placeholder="Select backup location"
              options={SECONDARY_OPTIONS}
              value={secondary}
              optionToString={(option) => `${option.label} · ${option.route}`}
              onChange={(option) => setSecondary(option?.value ?? null)}
            />

            {isSimple ? null : (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography.Caption color="muted">Backup frequency</Typography.Caption>
                <Typography.Default>Hourly, set by your service plan</Typography.Default>
              </Box>
            )}

            {isSimple ? byoc ? <ByocPricing /> : <PricingRates choice={secondaryChoice} /> : null}

            {isSimple ? null : (
              <Box
                backgroundColor="body"
                borderColor="muted"
                borderWidth={1}
                padding="5"
                borderRadius={8}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <Box.Flex flexDirection="column" gap="2">
                  <Typography.DefaultStrong>Estimated additional cost</Typography.DefaultStrong>
                  {secondaryChoice ? (
                    <Typography.Small color="muted">
                      Based on your current usage. You are billed for actual usage, so the final amount may differ.
                    </Typography.Small>
                  ) : null}
                </Box.Flex>
                {secondaryChoice ? (
                  <Box.Flex flexDirection="column" gap="4">
                    <RegionCostBlock choice={secondaryChoice} perDay={perDay} />
                    <Divider />
                    <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
                      <Typography.DefaultStrong>Total estimate per month</Typography.DefaultStrong>
                      <Box.Flex alignItems="baseline" gap="2">
                        <Typography.LargeHeading>{formatUsd(totalCents)}</Typography.LargeHeading>
                        <Typography.Small color="muted">/ month</Typography.Small>
                      </Box.Flex>
                    </Box.Flex>
                  </Box.Flex>
                ) : (
                  <Typography.Small color="muted">Select a region to see the cost.</Typography.Small>
                )}
              </Box>
            )}

            {isSimple ? null : (
              <Section title="How the estimate works, and what to confirm" collapsible defaultCollapsed>
                <Box.Flex flexDirection="column" gap="4">
                  <Typography.Small>
                    Storage costs $0.10 per GB-month. The rate varies by secondary region.
                  </Typography.Small>
                  <Typography.Small>
                    Backup transfer costs $0.03 per GB on the same continent and $0.15 per GB on a different continent.
                  </Typography.Small>
                  <Typography.Small>
                    Your service plan sets how often backups run. More frequent backups transfer more data, which
                    increases the estimate.
                  </Typography.Small>
                  <Typography.Small>
                    Each backup location is charged for its own storage and transfer. The total adds them together.
                  </Typography.Small>
                </Box.Flex>
              </Section>
            )}
          </>
        ) : null}
      </Box.Flex>
    </Modal>
  )
}