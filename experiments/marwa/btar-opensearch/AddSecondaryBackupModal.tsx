'use client'

import { useState } from 'react'
import { Alert, Box, Button, Divider, Modal, Section, Select, StatusChip, Typography } from '@aivenio/aquarium'
import {
  choiceFromPrimary,
  formatGb,
  formatUsd,
  frequencyById,
  regionCents,
  STORAGE_GB,
  STORAGE_RATE,
  transferRate,
  type RegionChoice,
} from './backupCost'
import { BACKUP_REGION_OPTIONS, POSTGRES_SERVICE_NAME, PRIMARY_LOCATION } from './backupsData'

const REGION_PLACE: Record<string, string> = {
  'google-europe-north1': 'Finland',
  'google-europe-west4': 'Netherlands',
  'google-us-east1': 'South Carolina',
  'google-asia-east1': 'Taiwan',
}

type RegionOption = RegionChoice & { label: string }

function ExtraCostLine({ label, detail, amount }: { label: string; detail: string; amount: string }) {
  return (
    <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
      <Box>
        <Typography.DefaultStrong>{label}</Typography.DefaultStrong>
        <Typography.Small color="muted">{detail}</Typography.Small>
      </Box>
      <Typography.DefaultStrong>{amount}</Typography.DefaultStrong>
    </Box.Flex>
  )
}

function ExtraCost({ choices, perDay }: { choices: RegionChoice[]; perDay: number }) {
  const rows = choices.map((choice) => {
    const cents = regionCents(choice.different, perDay)
    const rate = transferRate(choice.different).toFixed(2)
    const prefix = choices.length > 1 ? `${choice.value} · ` : ''
    return { choice, cents, rate, prefix }
  })
  const total = rows.reduce((sum, row) => sum + row.cents.total, 0)
  return (
    <Box
      backgroundColor="body"
      borderColor="muted"
      borderWidth={1}
      padding="5"
      borderRadius={8}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Typography.DefaultStrong>Estimated extra cost</Typography.DefaultStrong>
      <Typography.Small color="muted">Based on your current usage. The final amount may differ.</Typography.Small>
      <Divider />
      {rows.map((row) => (
        <Box key={row.choice.value} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ExtraCostLine
            label="Backup storage"
            detail={`${row.prefix}${STORAGE_GB} GB × $${STORAGE_RATE.toFixed(2)} per GB-month`}
            amount={formatUsd(row.cents.storage)}
          />
          <ExtraCostLine
            label="Transfer between regions"
            detail={`${row.prefix}${formatGb(row.cents.transferGb)} GB × $${row.rate} per GB`}
            amount={formatUsd(row.cents.transfer)}
          />
        </Box>
      ))}
      <Divider />
      <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
        <Typography.DefaultStrong>Total cost estimate</Typography.DefaultStrong>
        <Box.Flex alignItems="baseline" gap="2">
          <Typography.LargeHeading>{formatUsd(total)}</Typography.LargeHeading>
          <Typography.Small color="muted">/ month</Typography.Small>
        </Box.Flex>
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
        label={`Backup storage · ${STORAGE_GB} GB × $${STORAGE_RATE.toFixed(2)}`}
        amount={formatUsd(cents.storage)}
      />
      <CostRow
        label={`Transfer · ${formatGb(cents.transferGb)} GB × $${rate}`}
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
}: {
  open: boolean
  onClose: () => void
  service?: 'opensearch' | 'postgresql'
}) {
  const isPostgres = service === 'postgresql'
  const [secondary, setSecondary] = useState<string | null>(null)

  function close() {
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
      title={isPostgres ? 'Add secondary backup region' : 'Add secondary backup location'}
      primaryAction={{ text: 'Add backup region', onClick: close, disabled: !secondary }}
      secondaryActions={{ text: 'Cancel', onClick: close }}
    >
      <Box.Flex flexDirection="column" gap="6">
        {isPostgres ? (
          <Typography.Default>
            Protect your backups from a regional failure by keeping a second copy in a different region.
          </Typography.Default>
        ) : (
          <Alert type="information">
            A second copy is stored in the region you choose, and a restore from it happens there. Amounts are
            estimates.
          </Alert>
        )}

        {isPostgres ? null : (
          <Typography.Default>
            <Typography.DefaultStrong htmlTag="span">Primary location</Typography.DefaultStrong>
            {': '}
            {PRIMARY_LOCATION}
          </Typography.Default>
        )}

        <Select<RegionOption>
          labelText={isPostgres ? 'Region' : 'Secondary backup region'}
          required={!isPostgres}
          reserveSpaceForError={false}
          placeholder={isPostgres ? 'Select a region' : 'Select backup region'}
          options={SECONDARY_OPTIONS}
          value={secondary}
          optionToString={(option) =>
            isPostgres ? `${option.label} · ${REGION_PLACE[option.value] ?? option.route}` : `${option.label} · ${option.route}`
          }
          onChange={(option) => setSecondary(option?.value ?? null)}
        />

        {isPostgres ? null : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography.Caption color="muted">Backup frequency</Typography.Caption>
            <Typography.Default>Hourly (plan default)</Typography.Default>
          </Box>
        )}

        {isPostgres && secondaryChoice ? <ExtraCost choices={[secondaryChoice]} perDay={perDay} /> : null}
        {isPostgres && !secondaryChoice ? (
          <Typography.Small color="muted">Select a region to see the cost.</Typography.Small>
        ) : null}

        {isPostgres ? null : (
          <Box
            backgroundColor="body"
            borderColor="muted"
            borderWidth={1}
            padding="5"
            borderRadius={8}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <Typography.DefaultStrong>Estimated additional cost</Typography.DefaultStrong>
            {secondaryChoice ? (
              <Box.Flex flexDirection="column" gap="4">
                <RegionCostBlock choice={secondaryChoice} perDay={perDay} />
                <Divider />
                <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
                  <Typography.DefaultStrong>Total cost estimate</Typography.DefaultStrong>
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

        {isPostgres ? null : (
          <Section title="How the estimate works, and what to confirm" collapsible defaultCollapsed>
            <Box.Flex flexDirection="column" gap="4">
              <Typography.Small>
                Storage costs $0.10 per GB-month. Backup transfer costs $0.03 per GB on the same continent and $0.15 per
                GB across continents. A restore costs $0.03 or $0.17 per GB, and only when you restore.
              </Typography.Small>
              <Typography.Small>
                Backup frequency comes from the service plan. Business-4 backs up hourly. More frequent backups transfer
                more data, so the estimate goes up.
              </Typography.Small>
              <Typography.Small>
                Example: 200 GB of data, about 6 GB of changes a day, kept for 14 days. That is about {STORAGE_GB} GB
                stored.
              </Typography.Small>
              <Typography.Small>
                Each backup region is charged for its own storage and transfer. The total adds them together.
              </Typography.Small>
              <Box.Flex flexDirection="column" gap="2">
                <Typography.SmallStrong>To confirm</Typography.SmallStrong>
                <Typography.Small>
                  Real backup frequency per plan and billing parameters, from Metering and Engineering.
                </Typography.Small>
                <Typography.Small>
                  If frequency changes after enabling, does it apply from the next snapshot, and is stored data billed as
                  before?
                </Typography.Small>
              </Box.Flex>
            </Box.Flex>
          </Section>
        )}
      </Box.Flex>
    </Modal>
  )
}

/** PostgreSQL managed entry. Same window as OpenSearch, without a tertiary region. */
export function PostgresBtarScreen() {
  const [open, setOpen] = useState(true)

  return (
    <Box
      style={{
        flex: 1,
        minHeight: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      {open ? null : (
        <Button.Primary type="button" onClick={() => setOpen(true)}>
          {`Add secondary backup region for ${POSTGRES_SERVICE_NAME}`}
        </Button.Primary>
      )}
      <AddSecondaryBackupModal open={open} onClose={() => setOpen(false)} service="postgresql" />
    </Box>
  )
}
