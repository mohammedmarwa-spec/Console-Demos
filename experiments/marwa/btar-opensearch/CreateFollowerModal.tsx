'use client'

import { useState } from 'react'
import { Box, Button, Combobox, InlineIcon, Input, Modal, RadioButton, RadioButtonGroup, StatusChip, Typography } from '@aivenio/aquarium'
import power from '@aivenio/aquarium/icons/power'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import { ServiceIcon } from '@/components/ServiceIcon'
import { formatUsd, routeFor, transferRate } from './backupCost'
import { PRIMARY_LOCATION, PROJECT_NAME, SERVICE_NAME } from './backupsData'

type FollowerType = 'existing' | 'new'

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

const DEFAULT_REPLICATION_GB = '50'

function serviceLabel(option: ServiceOption | null): string {
  if (!option) return ''
  const route = routeFor(option.region, PRIMARY_LOCATION, false).route
  const power = option.poweredOn ? '' : ' · Powered off'
  return `${option.label} · ${option.region} · ${route}${power}`
}

export function CreateFollowerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [followerType, setFollowerType] = useState<FollowerType>('existing')
  const [project, setProject] = useState<NamedOption | null>(PROJECT_OPTIONS[0])
  const [service, setService] = useState<ServiceOption | null>(null)
  const [replicationGb, setReplicationGb] = useState(DEFAULT_REPLICATION_GB)

  function close() {
    setFollowerType('existing')
    setProject(PROJECT_OPTIONS[0])
    setService(null)
    setReplicationGb(DEFAULT_REPLICATION_GB)
    onClose()
  }

  const isExisting = followerType === 'existing'
  const route = service ? routeFor(service.region, PRIMARY_LOCATION, false) : null
  const gigabytes = Number(replicationGb)
  const volume = Number.isFinite(gigabytes) && gigabytes > 0 ? gigabytes : 0
  const transferCents = route ? Math.round(volume * transferRate(route.different) * 100) : 0

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={`Create follower for ${SERVICE_NAME}`}
      primaryAction={{
        text: isExisting ? 'Connect' : 'Create service',
        onClick: () => undefined,
        disabled: isExisting && !service,
      }}
      secondaryActions={{ text: 'Cancel', onClick: close }}
    >
      <Box.Flex flexDirection="column" gap="4">
        <Typography.Small color="muted">
          {`Which OpenSearch service would you like to make a follower of ${SERVICE_NAME}?`}
        </Typography.Small>
        <Typography.Default>
          <Typography.DefaultStrong htmlTag="span">Leader location</Typography.DefaultStrong>
          {': '}
          {PRIMARY_LOCATION}
        </Typography.Default>

        <RadioButtonGroup
          name="follower-type"
          cols="1"
          value={followerType}
          onChange={(value) => setFollowerType(value === 'new' ? 'new' : 'existing')}
        >
          <RadioButton value="existing" caption="Connect to an existing OpenSearch service as a follower.">
            Existing service
          </RadioButton>
          <RadioButton value="new" caption="Create a new OpenSearch service that will replicate data from this cluster.">
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
            {service && route ? (
              <Box.Flex flexDirection="column" gap="4" marginTop="4">
                <Box
                  backgroundColor="muted"
                  borderColor="muted"
                  borderWidth={1}
                  padding="5"
                  borderRadius={8}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <Box.Flex justifyContent="space-between" alignItems="center" gap="3">
                    <Typography.DefaultStrong>Estimated additional cost</Typography.DefaultStrong>
                    <StatusChip dense status={route.different ? 'warning' : 'success'} text={route.route} />
                  </Box.Flex>

                  <Box.Flex flexDirection="column" gap="2">
                    <Typography.Caption color="muted">Fixed monthly</Typography.Caption>
                    <Box.Flex justifyContent="space-between" alignItems="flex-start" gap="4">
                      <Box>
                        <Typography.Small>No new compute charge</Typography.Small>
                        <Typography.Caption color="muted">This service is already billed on its own plan.</Typography.Caption>
                      </Box>
                      <Typography.Small>{formatUsd(0)}</Typography.Small>
                    </Box.Flex>
                  </Box.Flex>

                  <Box.Flex flexDirection="column" gap="3">
                    <Typography.Caption color="muted">Usage-based estimate</Typography.Caption>
                    <Box style={{ width: 200, maxWidth: '100%' }}>
                      <Input
                        labelText="Replication"
                        type="number"
                        min={0}
                        value={replicationGb}
                        endAdornment={<Typography.Small color="muted">GB</Typography.Small>}
                        onChange={(event) => setReplicationGb(event.target.value)}
                      />
                    </Box>
                    <Box.Flex justifyContent="space-between" alignItems="center" gap="4">
                      <Typography.Small color="muted">
                        {`Replication · ${volume} GB × $${transferRate(route.different).toFixed(2)}`}
                      </Typography.Small>
                      <Typography.Small>{formatUsd(transferCents)}</Typography.Small>
                    </Box.Flex>
                  </Box.Flex>

                  <Box.Flex justifyContent="space-between" alignItems="center" gap="4">
                    <Typography.DefaultStrong>Fixed monthly</Typography.DefaultStrong>
                    <Typography.DefaultStrong>{formatUsd(0)}</Typography.DefaultStrong>
                  </Box.Flex>
                  <Box backgroundColor="primary-active" paddingX="5" paddingY="4" borderRadius={8}>
                    <Box.Flex justifyContent="space-between" alignItems="baseline" gap="4">
                      <Typography.DefaultStrong>Usage-based estimate</Typography.DefaultStrong>
                      <Box.Flex alignItems="baseline" gap="2">
                        <Typography.LargeHeading>{formatUsd(transferCents)}</Typography.LargeHeading>
                        <Typography.Small color="muted">per month</Typography.Small>
                      </Box.Flex>
                    </Box.Flex>
                  </Box>

                  <Typography.Caption color="muted">
                    Compute stays on the follower’s existing plan, so the fixed charge does not increase. Replication
                    transfer is the amount that changes, billed to the leader’s project at the route rate. The bill uses
                    actual GB. Estimates only.
                  </Typography.Caption>
                </Box>
              </Box.Flex>
            ) : null}
          </Box.Flex>
        ) : null}
      </Box.Flex>
    </Modal>
  )
}

/** Second screen: the create-follower popup only. Closing it leaves a way to open it again. */
export function CreateFollowerScreen() {
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
      <CreateFollowerModal open={open} onClose={() => setOpen(false)} />
    </Box>
  )
}
