'use client'

import { useState, type ReactNode } from 'react'
import { Box, Button, Combobox, Divider, InlineIcon, Modal, RadioButton, RadioButtonGroup, StatusChip, Typography } from '@aivenio/aquarium'
import power from '@aivenio/aquarium/icons/power'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import { ServiceIcon } from '@/components/ServiceIcon'
import { RateLine } from './AddSecondaryBackupModal'
import { routeFor, TRANSFER_RATE_DIFFERENT, TRANSFER_RATE_SAME, transferRate } from './backupCost'
import { PRIMARY_LOCATION, PROJECT_NAME, SERVICE_NAME } from './backupsData'

type FollowerType = 'existing' | 'new'

const BYOC_CCR_FEE = 40

type NamedOption = { value: string; label: string }

type ServiceOption = {
  value: string
  label: string
  version: string
  region: string
  poweredOn: boolean
}

const PROJECT_OPTIONS: NamedOption[] = [{ value: PROJECT_NAME, label: PROJECT_NAME }]

/** Other OpenSearch services in the same project. The leader itself is excluded. */
const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'logs-os', label: 'logs-os', version: '3.6', region: 'google-europe-north1', poweredOn: true },
  { value: 'product-search-os', label: 'product-search-os', version: '3.6', region: 'google-europe-west4', poweredOn: true },
  { value: 'orders-os', label: 'orders-os', version: '3.6', region: 'google-us-east1', poweredOn: false },
  { value: 'metrics-os', label: 'metrics-os', version: '3.6', region: 'google-asia-east1', poweredOn: true },
  { value: 'archive-os', label: 'archive-os', version: '3.6', region: 'google-europe-west4', poweredOn: false },
]

function CostCard({ children }: { children: ReactNode }) {
  return (
    <Box
      backgroundColor="body"
      borderColor="muted"
      borderWidth={1}
      padding="5"
      borderRadius={8}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {children}
    </Box>
  )
}

/** Network rates only. The follower region is chosen on the next screen, so both continents are shown. */
function NewFollowerNetworkCost() {
  return (
    <Box.Flex flexDirection="column" marginTop="2">
      <CostCard>
        <Box.Flex flexDirection="column" gap="2">
          <Typography.DefaultStrong>Estimated additional cost per month</Typography.DefaultStrong>
          <Typography.Small color="muted">
            You are billed for actual usage at these rates. The rate depends on the follower region you choose next.
          </Typography.Small>
        </Box.Flex>
        <Divider />
        <Typography.Small color="muted">
          The follower cluster runs on its own service plan and is billed separately.
        </Typography.Small>
        <RateLine
          label="Same continent"
          detail="Follower region on the same continent as the leader."
          rate={`$${TRANSFER_RATE_SAME.toFixed(2)}`}
          unit="per GB replicated"
        />
        <RateLine
          label="Different continent"
          detail="Follower region on a different continent from the leader."
          rate={`$${TRANSFER_RATE_DIFFERENT.toFixed(2)}`}
          unit="per GB replicated"
        />
      </CostCard>
    </Box.Flex>
  )
}

function ByocFollowerCost() {
  return (
    <Box.Flex flexDirection="column">
      <CostCard>
        <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
          <Box.Flex flexDirection="column" gap="2">
            <Typography.DefaultStrong>Estimated additional cost</Typography.DefaultStrong>
            <Typography.Small color="muted">
              A fixed monthly price. No replication transfer charges from Aiven.
            </Typography.Small>
          </Box.Flex>
          <StatusChip status="primary" text="BYOC" />
        </Box.Flex>
        <Divider />
        <RateLine
          label="CCR orchestration fee"
          detail="Charged for each follower service."
          rate={`$${BYOC_CCR_FEE}`}
          unit="per service / month"
        />
        <Divider />
        <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
          <Typography.DefaultStrong>Fixed monthly total</Typography.DefaultStrong>
          <Typography.LargeStrong>{`$${BYOC_CCR_FEE.toFixed(2)}`}</Typography.LargeStrong>
        </Box.Flex>
      </CostCard>
    </Box.Flex>
  )
}

function serviceLabel(option: ServiceOption | null): string {
  if (!option) return ''
  const route = routeFor(option.region, PRIMARY_LOCATION, false).route
  const power = option.poweredOn ? '' : ' · Powered off'
  return `${option.label} · ${option.region} · ${route}${power}`
}

export function CreateFollowerModal({
  open,
  onClose,
  byoc = false,
}: {
  open: boolean
  onClose: () => void
  byoc?: boolean
}) {
  const [followerType, setFollowerType] = useState<FollowerType>('existing')
  const [project, setProject] = useState<NamedOption | null>(PROJECT_OPTIONS[0])
  const [service, setService] = useState<ServiceOption | null>(null)

  function close() {
    setFollowerType('existing')
    setProject(PROJECT_OPTIONS[0])
    setService(null)
    onClose()
  }

  const isExisting = followerType === 'existing'
  const route = service ? routeFor(service.region, PRIMARY_LOCATION, false) : null

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={byoc ? 'Enable CCR' : `Create follower for ${SERVICE_NAME}`}
      subtitle={
        byoc ? (
          <Box.Flex alignItems="center" gap="2">
            <span>{`Cross-Cluster Replication · ${SERVICE_NAME} ·`}</span>
            <StatusChip dense status="primary" text="BYOC" />
          </Box.Flex>
        ) : undefined
      }
      primaryAction={{
        text: isExisting ? 'Create follower' : 'Create service',
        onClick: () => undefined,
        disabled: isExisting && !service,
      }}
      secondaryActions={{ text: 'Cancel', onClick: close }}
    >
      <Box.Flex flexDirection="column" gap="4">
        {byoc ? (
          <Box.Flex flexDirection="column" gap="2">
            <Typography.DefaultStrong>{`Which OpenSearch service should follow ${SERVICE_NAME}?`}</Typography.DefaultStrong>
            <Typography.Small color="muted">{`Leader region: ${PRIMARY_LOCATION} (your account).`}</Typography.Small>
          </Box.Flex>
        ) : (
          <>
            <Typography.Small color="muted">
              {`Which OpenSearch service would you like to make a follower of ${SERVICE_NAME}?`}
            </Typography.Small>
            <Typography.Default>
              <Typography.DefaultStrong htmlTag="span">Leader region</Typography.DefaultStrong>
              {': '}
              {PRIMARY_LOCATION}
            </Typography.Default>
          </>
        )}

        <RadioButtonGroup
          name="follower-type"
          cols="1"
          value={followerType}
          onChange={(value) => setFollowerType(value === 'new' ? 'new' : 'existing')}
        >
          <RadioButton
            value="existing"
            caption={
              byoc
                ? 'Connect an existing BYOC OpenSearch service as a follower.'
                : 'Connect to an existing OpenSearch service as a follower.'
            }
          >
            Existing service
          </RadioButton>
          <RadioButton
            value="new"
            caption={
              byoc
                ? 'Create a new BYOC OpenSearch service that replicates this cluster.'
                : 'Create a new OpenSearch service that will replicate data from this cluster.'
            }
          >
            New service
          </RadioButton>
        </RadioButtonGroup>

        {isExisting ? (
          <Box.Flex flexDirection="column" marginTop="2">
            <Combobox<NamedOption>
              labelText="Project"
              options={PROJECT_OPTIONS}
              value={project}
              placeholder="Select a project"
              clearSelectionEnabled={false}
              optionToString={(option) => option?.label ?? ''}
              getOptionKey={(option) => option.value}
              onChange={(option) => {
                setProject(option ?? null)
                setService(null)
              }}
            />
            <Combobox<ServiceOption>
              labelText="Service"
              options={SERVICE_OPTIONS}
              value={service}
              placeholder="Select a service..."
              clearSelectionEnabled={false}
              emptyState="No compatible OpenSearch services available"
              optionToString={serviceLabel}
              getOptionKey={(option) => option.value}
              onChange={(option) => setService(option ?? null)}
              renderOption={(option) => (
                <Box.Flex alignItems="center" justifyContent="space-between" style={{ width: '100%' }}>
                  <Box.Flex alignItems="center" gap="3">
                    <ServiceIcon serviceTypeId="opensearch" size={24} alt="" />
                    <Box>
                      <Typography.Small>{option.label}</Typography.Small>
                      <Typography.Caption color="muted">{option.region}</Typography.Caption>
                    </Box>
                  </Box.Flex>
                  <Box.Flex alignItems="center" gap="3">
                    <InlineIcon
                      icon={option.poweredOn ? tickCircle : power}
                      color={option.poweredOn ? 'success-default' : 'muted'}
                      width={16}
                      aria-label={option.poweredOn ? 'Powered on' : 'Powered off'}
                    />
                    <Typography.Small color="muted">OS {option.version}</Typography.Small>
                  </Box.Flex>
                </Box.Flex>
              )}
            />
            {service && byoc ? (
              <Box marginTop="4">
                <ByocFollowerCost />
              </Box>
            ) : service && route ? (
              <Box.Flex flexDirection="column" gap="4" marginTop="4">
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
                      <Typography.DefaultStrong>Estimated additional cost per month</Typography.DefaultStrong>
                      <Typography.Small color="muted">You are billed for actual usage at these rates.</Typography.Small>
                    </Box.Flex>
                    <StatusChip status={route.different ? 'warning' : 'info'} text={route.route} />
                  </Box.Flex>
                  <Divider />
                  <Typography.Small color="muted">
                    The follower cluster runs on its own service plan and is billed separately.
                  </Typography.Small>
                  <RateLine
                    label="Monthly estimate"
                    detail="For data replicated to this follower."
                    rate={`$${transferRate(route.different).toFixed(2)}`}
                    unit="per GB replicated"
                  />
                </Box>
              </Box.Flex>
            ) : null}
          </Box.Flex>
        ) : byoc ? (
          <Box marginTop="2">
            <ByocFollowerCost />
          </Box>
        ) : (
          <NewFollowerNetworkCost />
        )}
      </Box.Flex>
    </Modal>
  )
}

/** Second screen: the create-follower popup only. Closing it leaves a way to open it again. */
export function CreateFollowerScreen({ byoc = false }: { byoc?: boolean }) {
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
          Create follower
        </Button.Primary>
      )}
      <CreateFollowerModal open={open} onClose={() => setOpen(false)} byoc={byoc} />
    </Box>
  )
}
