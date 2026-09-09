'use client'

import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
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
  Link,
  Section,
  Select,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import containerIcon from '@aivenio/aquarium/icons/container'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import floppyDiskIcon from '@aivenio/aquarium/icons/floppyDisk'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import githubLogoIcon from '@aivenio/aquarium/icons/githubLogo'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
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

type BuildTarget = 'service' | 'application'

/** Services shown in Figma onboarding + apps (no Grafana). */
const ONBOARDING_V2_SERVICE_IDS: TestEnvServiceId[] = [
  'postgresql',
  'clickhouse',
  'kafka',
  'valkey',
  'opensearch',
  'mysql',
  'grafana',
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

function MonthlyPriceCard({ price, description }: { price: string; description: string }) {
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
        <Typography.Subheading color="intense">{price}</Typography.Subheading>
      </Box>
      <Typography.Small color="muted">{description}</Typography.Small>
    </Box>
  )
}

MonthlyPriceCard.displayName = 'MonthlyPriceCard'

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

const INTEGRATION_SERVICE_IDS = ['postgresql', 'valkey', 'clickhouse', 'kafka'] as const

const RUNTIME_STEPS: Array<{
  title: string
  description: string | null
  serviceIds?: readonly (typeof INTEGRATION_SERVICE_IDS)[number][]
}> = [
  {
    title: 'Connect GitHub',
    description: 'Authorize access and select your repository and branch',
  },
  {
    title: 'Scan and configure',
    description: 'Aiven detects the apps and suggests services',
  },
  {
    title: 'Deploy',
    description: 'Launch your app inside your Aiven project.',
  },
  {
    title: 'Connect data services',
    description: 'PostgreSQL, Valkey, ClickHouse, and Kafka',
    serviceIds: INTEGRATION_SERVICE_IDS,
  },
]

function RuntimeVerticalStepper({ activeIndex = 0 }: { activeIndex?: number }) {
  const indicatorSize = 28

  return (
    <Box
      aria-label="How it works"
      style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    >
      {RUNTIME_STEPS.map((step, index) => {
        const state = index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'inactive'
        const isLast = index === RUNTIME_STEPS.length - 1
        const stepNumber = index + 1

        return (
          <Box
            key={step.title}
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
                width: indicatorSize,
                flexShrink: 0,
              }}
            >
              <Box
                style={{
                  width: indicatorSize,
                  height: indicatorSize,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  ...(state === 'completed'
                    ? {
                        backgroundColor: 'var(--aquarium-background-color-success-graphic)',
                        border: '2px solid var(--aquarium-background-color-success-graphic)',
                      }
                    : state === 'active'
                      ? {
                          backgroundColor: 'transparent',
                          border: '2px solid var(--aquarium-border-color-primary-intense)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          border: '2px solid var(--aquarium-border-color-default)',
                        }),
                }}
              >
                {state === 'completed' ? (
                  <InlineIcon icon={tickIcon} color="default" style={{ width: 14, height: 14 }} />
                ) : (
                  <Box style={{ lineHeight: 1 }}>
                    <Typography.Small color={state === 'active' ? 'intense' : 'muted'} htmlTag="span">
                      {stepNumber}
                    </Typography.Small>
                  </Box>
                )}
              </Box>
              {!isLast ? (
                <Box
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 12,
                    marginTop: 4,
                    marginBottom: 4,
                    backgroundColor: 'var(--aquarium-border-color-muted)',
                  }}
                />
              ) : null}
            </Box>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingTop: 4,
                paddingBottom: isLast ? 0 : 16,
                minWidth: 0,
              }}
            >
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <Typography.DefaultStrong color={state === 'inactive' ? 'muted' : 'intense'}>
                  {step.title}
                </Typography.DefaultStrong>
                {step.description ? (
                  step.serviceIds ? (
                    <Typography.Caption color="muted">{step.description}</Typography.Caption>
                  ) : (
                    <Typography.Small color="muted">{step.description}</Typography.Small>
                  )
                ) : null}
              </Box>
              {step.serviceIds ? (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {step.serviceIds.map((serviceId) => (
                    <ServiceIcon key={serviceId} serviceTypeId={serviceId} size={24} alt="" />
                  ))}
                </Box>
              ) : null}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

RuntimeVerticalStepper.displayName = 'RuntimeVerticalStepper'

const EXAMPLE_APP_REPO_URL = 'https://github.com/Aiven-Labs/app-multimodal-search-CLIP-PostgreSQL'

function DeployPathCard({
  icon,
  title,
  titleAccessory,
  description,
  action,
}: {
  icon: typeof githubLogoIcon
  title: string
  titleAccessory?: ReactNode
  description: ReactNode
  action: ReactNode
}) {
  return (
    <Box
      style={{
        padding: 20,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: '100%',
        minHeight: '14.4rem',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
          <Icon icon={icon} style={{ width: 20, height: 20, flexShrink: 0 }} />
          <Typography.DefaultStrong color="intense">{title}</Typography.DefaultStrong>
          {titleAccessory}
        </Box>
        <Typography.Caption color="muted">{description}</Typography.Caption>
      </Box>

      <Box style={{ marginTop: 'auto', width: '100%' }}>{action}</Box>
    </Box>
  )
}

DeployPathCard.displayName = 'DeployPathCard'

function AivenRuntimeSummary() {
  return (
    <Section title="Aiven Runtime">
      <MonthlyPriceCard
        price="From $7"
        description="App + Free PostgreSQL bundle. Final cost depends on selected plans"
      />
    </Section>
  )
}

AivenRuntimeSummary.displayName = 'AivenRuntimeSummary'

function DeployApplicationPanel({ onConnectGitHub }: { onConnectGitHub: () => void }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        <DeployPathCard
          icon={githubLogoIcon}
          title="Connect your repository"
          titleAccessory={<StatusChip text="Read-only access" status="info" dense />}
          description="Docker Compose required. Your repository needs a compose.yaml or docker-compose.yml file."
          action={
            <Button.Primary type="button" fullWidth onClick={onConnectGitHub}>
              Connect GitHub
            </Button.Primary>
          }
        />

        <DeployPathCard
          icon={codeBlockIcon}
          title="Start with an example app"
          description="Ready to deploy. Docker Compose configuration is included."
          action={
            <Link.Button.Secondary
              href={EXAMPLE_APP_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              icon={linkExternalIcon}
              iconPlacement="right"
              style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
            >
              Clone repo with example apps
            </Link.Button.Secondary>
          }
        />
      </Box>

      <Box
        style={{
          padding: 20,
          borderRadius: 8,
          border: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Typography.DefaultStrong color="intense">How it works</Typography.DefaultStrong>
        <RuntimeVerticalStepper activeIndex={0} />
      </Box>
    </Box>
  )
}

DeployApplicationPanel.displayName = 'DeployApplicationPanel'

export type OnboardingAppsProps = {
  userInitials: string
  defaultProjectName: string
  onSkip: () => void
  onCreate: (payload: OnboardingTestEnvCreatePayload) => void
  onCustomizePlan: (serviceTypeId: TestEnvServiceId) => void
  onGoToRuntime: () => void
}

export function OnboardingApps({
  userInitials,
  defaultProjectName,
  onSkip,
  onCreate,
  onCustomizePlan,
  onGoToRuntime,
}: OnboardingAppsProps) {
  const buildTargetGroupName = useId()
  const [projectName, setProjectName] = useState(defaultProjectName)
  const [location, setLocation] = useState<TestEnvLocationId>('finland')
  const [buildTarget, setBuildTarget] = useState<BuildTarget>('service')
  const [selectedServiceId, setSelectedServiceId] = useState<TestEnvServiceId>(DEFAULT_TEST_ENV_SERVICE_ID)
  const [serviceName, setServiceName] = useState(
    () => ONBOARDING_V2_SERVICES.find((s) => s.id === DEFAULT_TEST_ENV_SERVICE_ID)!.defaultServiceName,
  )

  const selectedService = useMemo(
    () => ONBOARDING_V2_SERVICES.find((s) => s.id === selectedServiceId) ?? ONBOARDING_V2_SERVICES[0],
    [selectedServiceId],
  )

  const isTrial = selectedService.pricingModel === 'trial'
  const isApplication = buildTarget === 'application'

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
            <CreationFlowSection icon={containerIcon} title="What would you like to build?">
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ChoiceChipGroup
                  name={buildTargetGroupName}
                  selectionMode="radio"
                  value={buildTarget}
                  onChange={(v) => setBuildTarget((v as BuildTarget) ?? 'service')}
                >
                  <ChoiceChip value="service">Data service</ChoiceChip>
                  <ChoiceChip value="application">Application</ChoiceChip>
                </ChoiceChipGroup>

                {isApplication ? (
                  <DeployApplicationPanel onConnectGitHub={onGoToRuntime} />
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
                          gridAutoRows: '1fr',
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

            <CreationFlowSection icon={folderCloseIcon} title="Basic details" showConnector={false}>
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
          </Box>

          <Box
            style={{
              width: '100%',
              minWidth: 0,
              flexShrink: 0,
              alignSelf: 'flex-start',
              position: 'sticky',
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {isApplication ? (
              <AivenRuntimeSummary />
            ) : (
              <Section title={selectedService.title}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <RecommendedPlanCard service={selectedService} onCustomizePlan={handleCustomizePlan} />

                  {isTrial && selectedService.monthlyAfterTrial ? (
                    <TrialCostCard monthlyAfterTrial={selectedService.monthlyAfterTrial} />
                  ) : (
                    <MonthlyPriceCard price="Free" description="Free forever. No credit card required." />
                  )}

                  <Input
                    labelText="Service name"
                    required
                    reserveSpaceForError={false}
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />
                </Box>
              </Section>
            )}

            {!isApplication ? (
              <Button.Primary type="button" fullWidth onClick={handleCreate}>
                Create service
              </Button.Primary>
            ) : null}
          </Box>
        </Box>
      </Box>
    </OnboardingTestEnvShell>
  )
}

OnboardingApps.displayName = 'OnboardingApps'
