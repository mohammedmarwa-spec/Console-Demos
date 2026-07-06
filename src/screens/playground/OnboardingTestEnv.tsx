import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  InlineIcon,
  Input,
  Section,
  Select,
  StatusChip,
  Tooltip,
  Typography,
  useToast,
} from '@aivenio/aquarium'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import { ServiceIcon } from '../../components/ServiceIcon'
import { CloudProviderIcon } from '../CloudProviderIcon'
import type { CloudProviderId } from '../serviceRegions'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
} from './playgroundShared'
import { OnboardingTestEnvShell } from './OnboardingTestEnvShell'
import { showPlaygroundToast } from './showPlaygroundToast'
import {
  DEFAULT_TEST_ENV_SERVICE_ID,
  TEST_ENV_LOCATION_OPTIONS,
  TEST_ENV_SERVICES,
  type TestEnvLocationId,
  type TestEnvServiceId,
  type TestEnvServiceOption,
} from './testEnvServicesCatalog'

export type OnboardingTestEnvCreatePayload = {
  serviceTypeId: TestEnvServiceId
  serviceName: string
  projectName: string
  location: TestEnvLocationId
}

export type OnboardingTestEnvProps = {
  userInitials: string
  defaultProjectName: string
  onSkip: () => void
  onCreate: (payload: OnboardingTestEnvCreatePayload) => void
}

const MONO_STYLE = {
  fontFamily: 'Menlo, Monaco, Consolas, monospace',
  fontSize: 12,
  lineHeight: 1.42,
} as const

/** Outer height of Aquarium `Button.Secondary` with `dense` (py-2 + typography-default-strong). */
const DENSE_SECONDARY_BUTTON_SIZE = 32

const CLOUD_PROVIDER_STACK: Array<{ id: CloudProviderId; label: string }> = [
  { id: 'aws', label: 'AWS' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
  { id: 'upcloud', label: 'UpCloud' },
  { id: 'digitalocean', label: 'DigitalOcean' },
]

/** Overlap between stacked cloud badges — lower = more spread, easier to read. */
const CLOUD_ICON_OVERLAP = 10

function CloudProviderStack({
  size = DENSE_SECONDARY_BUTTON_SIZE,
}: {
  size?: number
}) {
  const logoSize = Math.round(size * 0.56)

  return (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
      {CLOUD_PROVIDER_STACK.map((provider, index) => (
        <Box
          key={provider.id}
          aria-hidden
          title={provider.label}
          style={{
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -CLOUD_ICON_OVERLAP,
            borderRadius: '50%',
            border: '1px solid var(--aquarium-border-color-muted)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: CLOUD_PROVIDER_STACK.length - index,
          }}
        >
          <CloudProviderIcon id={provider.id} size={logoSize} />
        </Box>
      ))}
    </Box>
  )
}

CloudProviderStack.displayName = 'CloudProviderStack'

function ServicePickerCard({ service }: { service: TestEnvServiceOption }) {
  return (
    <Card
      fullWidth
      checkable
      value={service.id}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            <ServiceIcon serviceTypeId={service.id} size={28} alt="" />
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
              <Typography.DefaultStrong color="intense">{service.title}</Typography.DefaultStrong>
              <Typography.Small color="muted">{service.description}</Typography.Small>
            </Box>
          </Box>
        </Card.Title>
      }
    />
  )
}

ServicePickerCard.displayName = 'ServicePickerCard'

function PlanDetailRow({ label, value, info }: { label: string; value: string; info?: string }) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
      }}
    >
      <Typography.Small color="muted">{label}</Typography.Small>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        <Box component="span" style={{ ...MONO_STYLE, color: 'var(--aquarium-text-color-default)' }}>
          {value}
        </Box>
        {info && (
          <Tooltip content={info}>
            <InlineIcon icon={infoSignIcon} color="muted" style={{ width: 16, height: 16 }} />
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

PlanDetailRow.displayName = 'PlanDetailRow'

export function OnboardingTestEnv({
  userInitials,
  defaultProjectName,
  onSkip,
  onCreate,
}: OnboardingTestEnvProps) {
  const addToast = useToast()
  const [projectName, setProjectName] = useState(defaultProjectName)
  const [location, setLocation] = useState<TestEnvLocationId>('finland')
  const [selectedServiceId, setSelectedServiceId] = useState<TestEnvServiceId>(DEFAULT_TEST_ENV_SERVICE_ID)
  const [serviceName, setServiceName] = useState(
    () => TEST_ENV_SERVICES.find((s) => s.id === DEFAULT_TEST_ENV_SERVICE_ID)!.defaultServiceName,
  )

  const selectedService = useMemo(
    () => TEST_ENV_SERVICES.find((s) => s.id === selectedServiceId) ?? TEST_ENV_SERVICES[0],
    [selectedServiceId],
  )

  useEffect(() => {
    setServiceName(selectedService.defaultServiceName)
  }, [selectedService])

  function handleCustomizePlan() {
    showPlaygroundToast(addToast, 'Customize plan and cloud coming soon')
  }

  function handleCreate() {
    onCreate({
      serviceTypeId: selectedServiceId,
      serviceName: serviceName.trim() || selectedService.defaultServiceName,
      projectName: projectName.trim() || defaultProjectName,
      location,
    })
  }

  return (
    <OnboardingTestEnvShell userInitials={userInitials} onSkip={onSkip}>
      <style>{`${ONBOARDING_CHECKABLE_CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <Box
        style={{
          maxWidth: 1252,
          margin: '0 auto',
          padding: '64px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Typography.Heading color="intense">
            Welcome to Aiven! Create your test environment in minutes
          </Typography.Heading>
          <Box style={{ display: 'inline-flex', maxWidth: '100%' }}>
            <StatusChip text="$50 trial credits active · No card needed" status="success" dense />
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <Section title="Project details">
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                <Input
                  labelText="Project name"
                  description="Used to organize your services"
                  reserveSpaceForError={false}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <Select
                  labelText="Location"
                  description="To recommend nearby cloud regions"
                  reserveSpaceForError={false}
                  options={TEST_ENV_LOCATION_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                  value={location}
                  onChange={(val) => {
                    const next = String(val ?? '')
                    const found = TEST_ENV_LOCATION_OPTIONS.find((o) => o.value === next)
                    if (found) setLocation(found.value)
                  }}
                />
              </Box>
            </Section>

            <Section title="Choose service">
              <Box className="onboarding-checkable-cards">
                <Card.Group
                  checked={selectedServiceId}
                  onCheckedChange={({ value }) =>
                    setSelectedServiceId((value as TestEnvServiceId) ?? DEFAULT_TEST_ENV_SERVICE_ID)
                  }
                >
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 16,
                      alignItems: 'stretch',
                    }}
                  >
                    {TEST_ENV_SERVICES.map((service) => (
                      <ServicePickerCard key={service.id} service={service} />
                    ))}
                  </Box>
                </Card.Group>
              </Box>
            </Section>
          </Box>

          <Box
            style={{
              width: '100%',
              minWidth: 0,
              flexShrink: 0,
              alignSelf: 'flex-start',
              position: 'sticky',
              top: 0,
            }}
            className="onboarding-summary-section"
          >
            <style>{`
              .onboarding-summary-section {
                position: relative;
              }
              .onboarding-summary-section .Aquarium-Section > div:first-child {
                position: relative;
              }
              .onboarding-summary-section .Aquarium-Section > div:first-child > div:first-child {
                max-width: calc(100% - 340px);
              }
              .onboarding-summary-section__header-actions {
                position: absolute;
                top: 0;
                right: 20px;
                height: 62px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 1;
              }
            `}</style>
            <Box className="onboarding-summary-section__header-actions">
              <Button.Secondary dense type="button" onClick={handleCustomizePlan}>
                Customize plan and cloud
              </Button.Secondary>
              <CloudProviderStack />
            </Box>
            <Section title={selectedService.title}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Box
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      backgroundColor: 'var(--aquarium-background-color-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      width: '100%',
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <Typography.DefaultStrong>Recommended plan</Typography.DefaultStrong>
                      <StatusChip text="Free" status="neutral" dense />
                    </Box>
                    <PlanDetailRow
                      label="Cloud & region"
                      value={selectedService.cloudRegionLabel}
                      info="Cloud and region are auto-assigned based on your location for the fastest setup."
                    />
                    <PlanDetailRow label="Resources" value={selectedService.planResources} />
                  </Box>

                  <Box
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--aquarium-border-color-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      width: '100%',
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <Typography.DefaultStrong>
                        Price{' '}
                        <Typography.Small color="muted" htmlTag="span">
                          /per month
                        </Typography.Small>
                      </Typography.DefaultStrong>
                      <Typography.Subheading color="intense">Free</Typography.Subheading>
                    </Box>
                    <Typography.Small color="muted">
                      No credit card. No expiry. Auto-pauses when idle
                    </Typography.Small>
                  </Box>

                <Input
                  labelText="Service name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />

                <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  <Button.Primary type="button" fullWidth onClick={handleCreate}>
                    Create {selectedService.title} service
                  </Button.Primary>
                  <Box style={{ textAlign: 'center' }}>
                    <Typography.Caption color="muted">
                      Usually takes 2–5 minutes to provision
                    </Typography.Caption>
                  </Box>
                </Box>
                </Box>
            </Section>
          </Box>
        </Box>
      </Box>
    </OnboardingTestEnvShell>
  )
}

OnboardingTestEnv.displayName = 'OnboardingTestEnv'
