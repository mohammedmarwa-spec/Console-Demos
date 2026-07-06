import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Icon,
  InlineIcon,
  Input,
  Link,
  Section,
  Select,
  StatusChip,
  Tooltip,
  Typography,
  useToast,
} from '@aivenio/aquarium'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import { ServiceIcon } from '../../components/ServiceIcon'
import { getAwsIcon } from '../../assets/icons/awsIcon'
import gcpIcon from '../../assets/icons/gcpIcon'
import { useResolvedTheme } from '../../theme/ThemeProvider'
import { ServiceSummarySidebar } from '../ServiceCreationShared'
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

function SectionPanel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
      }}
    >
      {children}
    </Box>
  )
}

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

function CloudProviderStack() {
  const theme = useResolvedTheme()
  const providers = [
    { id: 'aws', label: 'AWS', icon: getAwsIcon(theme) },
    { id: 'gcp', label: 'Google Cloud', icon: gcpIcon },
    { id: 'azure', label: 'Azure', text: 'Az' },
    { id: 'do', label: 'DigitalOcean', text: 'DO' },
  ] as const

  return (
    <Box style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
      {providers.map((provider, index) => (
        <Box
          key={provider.id}
          aria-hidden
          title={provider.label}
          style={{
            width: 26,
            height: 26,
            marginLeft: index === 0 ? 0 : -14,
            borderRadius: '50%',
            border: '1px solid var(--aquarium-border-color-muted)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: providers.length - index,
          }}
        >
          {'icon' in provider ? (
            <Icon icon={provider.icon} style={{ width: 14, height: 14 }} />
          ) : (
            <Typography.Caption color="muted">{provider.text}</Typography.Caption>
          )}
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
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography.Heading color="intense">
            Welcome to Aiven! Create your test environment in minutes
          </Typography.Heading>
          <StatusChip text="$50 trial credits active · No card needed" status="success" dense />
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 400px',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <SectionPanel>
              <Section title="Project details">
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 16,
                  }}
                >
                  <Input
                    labelText="Project name"
                    description="Used to organize your services and environments"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                  <Select
                    labelText="Location"
                    description="To recommend nearby cloud regions"
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
            </SectionPanel>

            <SectionPanel>
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
            </SectionPanel>
          </Box>

          <ServiceSummarySidebar style={{ width: 400 }} top={0}>
            <Typography.Heading color="intense">{selectedService.title}</Typography.Heading>

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
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Link href="#" onClick={(e) => { e.preventDefault(); handleCustomizePlan() }}>
                  Customize plan and cloud
                </Link>
                <CloudProviderStack />
              </Box>
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
          </ServiceSummarySidebar>
        </Box>
      </Box>
    </OnboardingTestEnvShell>
  )
}

OnboardingTestEnv.displayName = 'OnboardingTestEnv'
