'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  ChoiceChip,
  ChoiceChipGroup,
  Divider,
  Icon,
  InlineIcon,
  Input,
  Section,
  Select,
  StatusChip,
  Typography,
  useToast,
} from '@aivenio/aquarium'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import containerIcon from '@aivenio/aquarium/icons/container'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import databaseIcon from '@aivenio/aquarium/icons/database'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import floppyDiskIcon from '@aivenio/aquarium/icons/floppyDisk'
import githubLogoIcon from '@aivenio/aquarium/icons/githubLogo'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import layersIcon from '@aivenio/aquarium/icons/layers'
import memoryIcon from '@aivenio/aquarium/icons/memory'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import tickIcon from '@aivenio/aquarium/icons/tick'
import { CloudProviderIcon } from '@experiments/_shared/components/CloudProviderIcon'
import { CreationFlowSection } from '@experiments/_shared/components/CreationFlowSection'
import { OnboardingTestEnvShell } from '@experiments/_shared/components/OnboardingTestEnvShell'
import { ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
} from '@experiments/_shared/lib/playgroundShared'
import {
  DEFAULT_TEST_ENV_SERVICE_ID,
  TEST_ENV_LOCATION_OPTIONS,
  TEST_ENV_SERVICES,
  type TestEnvLocationId,
  type TestEnvPlanDetail,
  type TestEnvServiceId,
  type TestEnvServiceOption,
} from '@experiments/_shared/lib/testEnvServicesCatalog'
import type { OnboardingTestEnvCreatePayload } from '@experiments/_shared/components/OnboardingTestEnv'
import { showPlaygroundToast } from '@/screens/playground/showPlaygroundToast'
import { ConnectGitHubModal } from './ConnectGitHubModal'

type BuildTarget = 'service' | 'application' | 'datahub'

/** Services shown in Figma onboarding + apps (no Grafana). */
const ONBOARDING_V2_SERVICE_IDS: TestEnvServiceId[] = [
  'postgresql',
  'clickhouse',
  'kafka',
  'valkey',
  'opensearch',
  'mysql',
]

const ONBOARDING_V2_SERVICES = ONBOARDING_V2_SERVICE_IDS.map(
  (id) => TEST_ENV_SERVICES.find((s) => s.id === id)!,
)

const PLAN_DETAIL_ICONS = {
  cpu: cpuChipIcon,
  memory: memoryIcon,
  storage: floppyDiskIcon,
  backups: dbBackupIcon,
} as const

function ServicePickerCard({ service }: { service: TestEnvServiceOption }) {
  return (
    <Card
      fullWidth
      checkable
      value={service.id}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            <ServiceIcon serviceTypeId={service.id} size={40} alt="" />
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
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

function PlanDetailItem({ detail }: { detail: TestEnvPlanDetail }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Icon icon={PLAN_DETAIL_ICONS[detail.kind]} color="muted" style={{ width: 14, height: 14, flexShrink: 0 }} />
      <Typography.Small color="intense" htmlTag="span">
        {detail.label}
      </Typography.Small>
    </Box>
  )
}

PlanDetailItem.displayName = 'PlanDetailItem'

function RecommendedPlanCard({
  service,
  onCustomizePlan,
}: {
  service: TestEnvServiceOption
  onCustomizePlan: () => void
}) {
  const isTrial = service.pricingModel === 'trial'

  return (
    <Box
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: 'var(--aquarium-background-color-muted)',
        border: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Typography.DefaultStrong>Recommended plan</Typography.DefaultStrong>
        <StatusChip text={service.planChip} status="neutral" dense />
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <Typography.Small color="muted">Cloud</Typography.Small>
        {isTrial && service.cloudProviderId && service.cloudProviderLabel ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudProviderIcon id={service.cloudProviderId} size={16} />
              <Typography.Default color="intense">{service.cloudProviderLabel}</Typography.Default>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box
                aria-hidden
                style={{
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                🇫🇮
              </Box>
              <Typography.Default color="intense">{service.regionLabel}</Typography.Default>
            </Box>
          </Box>
        ) : (
          <Typography.Small color="intense">{service.regionLabel}</Typography.Small>
        )}
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <Typography.Small color="muted">Plan details</Typography.Small>
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', width: '100%' }}>
          {service.planDetails.map((detail) => (
            <PlanDetailItem key={detail.kind} detail={detail} />
          ))}
        </Box>
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <Divider />
        <Button.Ghost dense type="button" icon={settingsIcon} iconPlacement="right" onClick={onCustomizePlan}>
          View all plans and clouds
        </Button.Ghost>
      </Box>
    </Box>
  )
}

RecommendedPlanCard.displayName = 'RecommendedPlanCard'

function FreeCostCard() {
  return (
    <Box
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Typography.DefaultStrong color="muted">Monthly price</Typography.DefaultStrong>
        <Typography.Subheading color="intense">Free</Typography.Subheading>
      </Box>
      <Typography.Small color="muted">Free forever. No credit card required.</Typography.Small>
    </Box>
  )
}

FreeCostCard.displayName = 'FreeCostCard'

function TrialCostCard({ monthlyAfterTrial }: { monthlyAfterTrial: string }) {
  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Typography.Default color="intense">Cost during trial</Typography.Default>
        </Box>
        <StatusChip text="Uses trial credits" status="success" dense />
        <Typography.Heading color="intense">$0</Typography.Heading>
      </Box>
      <Typography.Small color="muted">
        Usage costs are deducted from your trial credits as the service runs. After the trial period ends or your
        credits run out, your service will be powered off unless you add a payment method.
      </Typography.Small>
      <Box style={{ paddingBlock: 8, width: '100%' }}>
        <Divider />
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
        <Typography.Default color="intense">Monthly cost after trial</Typography.Default>
        <Typography.Default color="intense">{monthlyAfterTrial}</Typography.Default>
      </Box>
      <Typography.Small color="muted">Based on 730 hours of usage</Typography.Small>
    </Box>
  )
}

TrialCostCard.displayName = 'TrialCostCard'

const RUNTIME_STEPS = ['Deploy from GitHub', 'Connect services', 'Test for free'] as const

type ExampleStackServiceId = Extract<
  TestEnvServiceId,
  'postgresql' | 'valkey' | 'clickhouse' | 'opensearch' | 'kafka'
>

const EXAMPLE_STACKS: Array<{
  label: string
  services: ExampleStackServiceId[]
  /** DataHub is a solution (not a service type) — show database icon instead of service logos. */
  dataHub?: boolean
}> = [
  { label: 'App + PostgreSQL', services: ['postgresql'] },
  { label: 'App + PostgreSQL + Valkey', services: ['postgresql', 'valkey'] },
  { label: 'App + PostgreSQL + ClickHouse', services: ['postgresql', 'clickhouse'] },
  { label: 'App + DataHub', services: [], dataHub: true },
]

function RuntimeVerticalStepper({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <Box
      aria-label="How Aiven Runtime works"
      style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    >
      {RUNTIME_STEPS.map((label, index) => {
        const state = index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'inactive'
        const isLast = index === RUNTIME_STEPS.length - 1
        const connectorCompleted = state === 'completed'

        return (
          <Box
            key={label}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 12,
              width: '100%',
            }}
          >
            <Box
              aria-hidden
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 16,
                flexShrink: 0,
              }}
            >
              <Box
                style={{
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {state === 'completed' ? (
                  <InlineIcon icon={tickIcon} color="success-intense" style={{ width: 14, height: 14 }} />
                ) : (
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor:
                        state === 'active'
                          ? 'var(--aquarium-background-color-inverse)'
                          : 'var(--aquarium-background-color-intense)',
                    }}
                  />
                )}
              </Box>
              {!isLast ? (
                <Box
                  style={{
                    width: 3,
                    flex: 1,
                    minHeight: 16,
                    marginTop: 4,
                    marginBottom: 4,
                    borderRadius: 1,
                    backgroundColor: connectorCompleted
                      ? 'var(--aquarium-background-color-success-graphic)'
                      : 'var(--aquarium-border-color-intense)',
                  }}
                />
              ) : null}
            </Box>
            <Typography.Small
              color={state === 'inactive' ? 'muted' : 'intense'}
              style={{ lineHeight: '20px', paddingBottom: isLast ? 0 : 16 }}
            >
              {label}
            </Typography.Small>
          </Box>
        )
      })}
    </Box>
  )
}

RuntimeVerticalStepper.displayName = 'RuntimeVerticalStepper'

function ExampleStackCard({
  label,
  services,
  dataHub,
}: {
  label: string
  services: ExampleStackServiceId[]
  dataHub?: boolean
}) {
  return (
    <Box
      style={{
        padding: 12,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
        <Icon icon={codeBlockIcon} style={{ width: 20, height: 20, flexShrink: 0 }} />
        {dataHub ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Typography.Small color="muted" htmlTag="span">
              +
            </Typography.Small>
            <Icon icon={databaseIcon} style={{ width: 20, height: 20, flexShrink: 0 }} />
          </Box>
        ) : (
          services.map((serviceId) => (
            <Box key={serviceId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Typography.Small color="muted" htmlTag="span">
                +
              </Typography.Small>
              <ServiceIcon serviceTypeId={serviceId} size={20} alt="" />
            </Box>
          ))
        )}
      </Box>
      <Typography.Small color="intense">{label}</Typography.Small>
    </Box>
  )
}

ExampleStackCard.displayName = 'ExampleStackCard'

function AivenRuntimeSummary({
  githubConnected,
  onConnectGitHub,
}: {
  githubConnected: boolean
  onConnectGitHub: () => void
}) {
  return (
    <Section title="Aiven Runtime">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography.Default color="intense">
          Aiven Runtime lets you build and deploy applications from GitHub onto the Aiven Platform, then connect them to
          managed services — all in one place.
        </Typography.Default>

        <RuntimeVerticalStepper activeIndex={githubConnected ? 1 : 0} />

        {githubConnected ? (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--aquarium-border-color-muted)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Icon icon={githubLogoIcon} style={{ width: 20, height: 20, flexShrink: 0 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Typography.Default color="intense">GitHub account connected</Typography.Default>
            </Box>
            <StatusChip text="Connected" status="success" dense />
          </Box>
        ) : (
          <Button.Primary type="button" fullWidth icon={githubLogoIcon} onClick={onConnectGitHub}>
            Connect GitHub account
          </Button.Primary>
        )}
      </Box>
    </Section>
  )
}

AivenRuntimeSummary.displayName = 'AivenRuntimeSummary'

function DeployFromGitHubPanel() {
  return (
    <Box
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <Typography.DefaultStrong color="intense">Deploy from GitHub</Typography.DefaultStrong>
        <Typography.Small color="muted">
          Connect a repository and deploy with a recommended stack — start from common App + service combinations.
        </Typography.Small>
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <Typography.Small color="muted">Example stacks</Typography.Small>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            width: '100%',
          }}
        >
          {EXAMPLE_STACKS.map((stack) => (
            <ExampleStackCard
              key={stack.label}
              label={stack.label}
              services={stack.services}
              dataHub={stack.dataHub}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

DeployFromGitHubPanel.displayName = 'DeployFromGitHubPanel'

function DataHubPanel({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <Box
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <Typography.DefaultStrong color="intense">Data Hub</Typography.DefaultStrong>
        <Typography.Small color="muted">
          Create a Data Hub solution to group PostgreSQL, OpenSearch, and Kafka into a unified catalog — so teams can
          discover, govern, and use data across services in one place.
        </Typography.Small>
      </Box>
      <Box>
        <Button.Secondary type="button" onClick={onBookDemo}>
          Book demo
        </Button.Secondary>
      </Box>
    </Box>
  )
}

DataHubPanel.displayName = 'DataHubPanel'

function DataHubSummary({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <Section title="Data Hub">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography.Default color="intense">
          Unified data solutions that combine streaming, search, and relational workloads under one governed catalog.
        </Typography.Default>
        <Typography.Small color="muted">
          Talk with our team to see how Data Hub fits your architecture and get early access.
        </Typography.Small>
        <Button.Primary type="button" fullWidth onClick={onBookDemo}>
          Book demo
        </Button.Primary>
      </Box>
    </Section>
  )
}

DataHubSummary.displayName = 'DataHubSummary'

export type OnboardingAppsProps = {
  userInitials: string
  defaultProjectName: string
  onSkip: () => void
  onCreate: (payload: OnboardingTestEnvCreatePayload) => void
  onCustomizePlan: (serviceTypeId: TestEnvServiceId) => void
}

export function OnboardingApps({
  userInitials,
  defaultProjectName,
  onSkip,
  onCreate,
  onCustomizePlan,
}: OnboardingAppsProps) {
  const addToast = useToast()
  const buildTargetGroupName = useId()
  const [projectName, setProjectName] = useState(defaultProjectName)
  const [location, setLocation] = useState<TestEnvLocationId>('finland')
  const [buildTarget, setBuildTarget] = useState<BuildTarget>('service')
  const [selectedServiceId, setSelectedServiceId] = useState<TestEnvServiceId>(DEFAULT_TEST_ENV_SERVICE_ID)
  const [serviceName, setServiceName] = useState(
    () => ONBOARDING_V2_SERVICES.find((s) => s.id === DEFAULT_TEST_ENV_SERVICE_ID)!.defaultServiceName,
  )
  const [githubModalOpen, setGithubModalOpen] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)

  const selectedService = useMemo(
    () => ONBOARDING_V2_SERVICES.find((s) => s.id === selectedServiceId) ?? ONBOARDING_V2_SERVICES[0],
    [selectedServiceId],
  )

  const isTrial = selectedService.pricingModel === 'trial'
  const isApplication = buildTarget === 'application'
  const isDataHub = buildTarget === 'datahub'

  useEffect(() => {
    setServiceName(selectedService.defaultServiceName)
  }, [selectedService])

  function handleCustomizePlan() {
    onCustomizePlan(selectedServiceId)
  }

  function handleCreate() {
    onCreate({
      serviceTypeId: selectedServiceId,
      serviceName: serviceName.trim() || selectedService.defaultServiceName,
      projectName: projectName.trim() || defaultProjectName,
      location,
    })
  }

  function handleGithubConnected() {
    setGithubConnected(true)
    showPlaygroundToast(addToast, 'GitHub account connected')
  }

  function handleBookDemo() {
    showPlaygroundToast(addToast, 'Demo booking coming soon in this prototype')
  }

  return (
    <OnboardingTestEnvShell userInitials={userInitials} onSkip={onSkip}>
      <style>{`${ONBOARDING_CHECKABLE_CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <Box
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          padding: '32px 64px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Typography.Heading color="intense">Start building on Aiven Platform</Typography.Heading>
          <StatusChip text="$50 trial credits active · No credit card to get started" status="success" />
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 402px)',
            gap: 54,
            alignItems: 'start',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <CreationFlowSection icon={infoSignIcon} title="Basic details">
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
                  required
                  reserveSpaceForError={false}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <Select
                  labelText="Location"
                  required
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
            </CreationFlowSection>

            <CreationFlowSection icon={containerIcon} title="What you would like to build?">
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ChoiceChipGroup
                  name={buildTargetGroupName}
                  selectionMode="radio"
                  value={buildTarget}
                  onChange={(v) => setBuildTarget((v as BuildTarget) ?? 'service')}
                >
                  <ChoiceChip value="service">
                    <InlineIcon icon={databaseIcon} />
                    A service
                  </ChoiceChip>
                  <ChoiceChip value="application">
                    <InlineIcon icon={codeBlockIcon} />
                    An application
                  </ChoiceChip>
                  <ChoiceChip value="datahub">
                    <InlineIcon icon={layersIcon} />
                    Data Hub
                  </ChoiceChip>
                </ChoiceChipGroup>

                {isApplication ? (
                  <DeployFromGitHubPanel />
                ) : isDataHub ? (
                  <DataHubPanel onBookDemo={handleBookDemo} />
                ) : (
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
                        {ONBOARDING_V2_SERVICES.map((service) => (
                          <ServicePickerCard key={service.id} service={service} />
                        ))}
                      </Box>
                    </Card.Group>
                  </Box>
                )}
              </Box>
            </CreationFlowSection>
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
          >
            {isApplication ? (
              <AivenRuntimeSummary
                githubConnected={githubConnected}
                onConnectGitHub={() => setGithubModalOpen(true)}
              />
            ) : isDataHub ? (
              <DataHubSummary onBookDemo={handleBookDemo} />
            ) : (
              <Section title={selectedService.title}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <RecommendedPlanCard service={selectedService} onCustomizePlan={handleCustomizePlan} />

                  {isTrial && selectedService.monthlyAfterTrial ? (
                    <TrialCostCard monthlyAfterTrial={selectedService.monthlyAfterTrial} />
                  ) : (
                    <FreeCostCard />
                  )}

                  <Input
                    labelText="Service name"
                    required
                    reserveSpaceForError={false}
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />

                  <Button.Primary type="button" fullWidth onClick={handleCreate}>
                    Create service
                  </Button.Primary>
                </Box>
              </Section>
            )}
          </Box>
        </Box>
      </Box>

      <ConnectGitHubModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onConnected={handleGithubConnected}
      />
    </OnboardingTestEnvShell>
  )
}

OnboardingApps.displayName = 'OnboardingApps'
