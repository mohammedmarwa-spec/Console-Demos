import { useMemo, useState, type ReactNode } from 'react'
import { Box, Button, Card, Divider, Input, Select, Typography } from '@aivenio/aquarium'
import lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import { ONBOARDING_PLAYGROUND_CONTEXT } from '../../scenarios/consoleContext'
import {
  findRegionBySelectValue,
  formatRegionSelectValue,
  REGIONS_BY_CLOUD,
  regionsToGroupedSelectOptions,
  type CloudProviderId,
  type Region,
} from '../serviceRegions'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
  OnboardingCatalogIconTile,
  OnboardingIconTile,
  OnboardingPanelPage,
  OnboardingPanelTitle,
  PlaygroundPanelShadow,
} from './playgroundShared'

export type OnboardingStartChoice = 'playground' | 'catalog'

export type OnboardingWelcomeConfig = {
  projectName: string
  region: string
}

export type OnboardingWelcomeProps = {
  onContinue: (choice: OnboardingStartChoice, config: OnboardingWelcomeConfig) => void
}

const DEFAULT_PROJECT_NAME = ONBOARDING_PLAYGROUND_CONTEXT.projectName

function pickRegion(cloud: CloudProviderId, id: string): Region {
  const region = REGIONS_BY_CLOUD[cloud].find((r) => r.id === id)
  if (!region) throw new Error(`Unknown region: ${cloud}/${id}`)
  return region
}

/** Curated regions for onboarding — grouped by continent in the Select. */
const ONBOARDING_REGION_PICKS: Array<[CloudProviderId, string]> = [
  ['aws', 'eu-west-1'],
  ['aws', 'eu-central-1'],
  ['aws', 'eu-west-2'],
  ['google', 'europe-west1'],
  ['google', 'europe-west4'],
  ['azure', 'westeurope'],
  ['aws', 'us-east-1'],
  ['aws', 'us-west-2'],
  ['aws', 'ca-central-1'],
  ['google', 'us-central1'],
  ['google', 'us-east1'],
  ['aws', 'ap-southeast-1'],
  ['aws', 'ap-northeast-1'],
  ['google', 'asia-southeast1'],
  ['aws', 'ap-southeast-2'],
  ['google', 'australia-southeast1'],
]

const ONBOARDING_REGIONS: Region[] = ONBOARDING_REGION_PICKS.map(([cloud, id]) => pickRegion(cloud, id))

function WelcomeChoiceCard({
  value,
  icon,
  iconVariant,
  iconTile,
  title,
  description,
}: {
  value: OnboardingStartChoice
  icon?: typeof lightbulbIcon
  iconVariant?: 'recommended' | 'default'
  iconTile?: ReactNode
  title: string
  description: string
}) {
  return (
    <Card
      fullWidth
      checkable
      value={value}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            {iconTile ?? (
              <OnboardingIconTile icon={icon!} variant={iconVariant ?? 'default'} />
            )}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
              <Typography.DefaultStrong color="intense">{title}</Typography.DefaultStrong>
              <Typography.Small color="muted">{description}</Typography.Small>
            </Box>
          </Box>
        </Card.Title>
      }
    />
  )
}

WelcomeChoiceCard.displayName = 'WelcomeChoiceCard'

export function OnboardingWelcome({ onContinue }: OnboardingWelcomeProps) {
  const [choice, setChoice] = useState<OnboardingStartChoice>('playground')
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME)
  const [regionId, setRegionId] = useState(ONBOARDING_REGIONS[0].id)
  const groupedRegionOptions = useMemo(
    () => regionsToGroupedSelectOptions(ONBOARDING_REGIONS),
    [],
  )
  const selectedRegion = useMemo(
    () => ONBOARDING_REGIONS.find((r) => r.id === regionId) ?? ONBOARDING_REGIONS[0],
    [regionId],
  )

  function handleContinue() {
    onContinue(choice, {
      projectName: projectName.trim() || DEFAULT_PROJECT_NAME,
      region: regionId,
    })
  }

  return (
    <OnboardingPanelPage>
      <style>{`${ONBOARDING_CHECKABLE_CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <PlaygroundPanelShadow>
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 24px 17px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 240 }}>
            <OnboardingPanelTitle>Welcome to Aiven</OnboardingPanelTitle>
            <Typography.Small color="muted">
              How would you like to start? You can change your mind any time.
            </Typography.Small>
          </Box>
          <OnboardingStepIndicator step={1} />
        </Box>

        <Box style={{ padding: '20px 24px 24px' }}>
          <Box className="onboarding-checkable-cards">
            <Card.Group
              checked={choice}
              onCheckedChange={({ value }) => setChoice((value as OnboardingStartChoice) ?? 'playground')}
            >
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 16,
                  alignItems: 'stretch',
                }}
              >
                <WelcomeChoiceCard
                  value="playground"
                  icon={lightbulbIcon}
                  iconVariant="recommended"
                  title="I'm new to managed services"
                  description="Open a sandboxed playground with sample data and AI guidance. Poke around real services — nothing to provision, nothing billed."
                />
                <WelcomeChoiceCard
                  value="catalog"
                  iconTile={<OnboardingCatalogIconTile />}
                  title="I'll choose myself"
                  description="Browse the full catalog and create a service directly. Best if you already know what you need."
                />
              </Box>
            </Card.Group>
          </Box>

          <Box style={{ margin: '24px 0' }}>
            <Divider />
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Input
              labelText="Project name"
              description="Name for your first project in this organization"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Select
              labelText="Region"
              description="Default region for services in this project"
              options={groupedRegionOptions}
              value={formatRegionSelectValue(selectedRegion)}
              onChange={(val) => {
                const found = findRegionBySelectValue(ONBOARDING_REGIONS, String(val ?? ''))
                if (found) setRegionId(found.id)
              }}
            />
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button.Primary type="button" onClick={handleContinue}>
              {choice === 'playground' ? 'Continue' : 'Browse services'}
            </Button.Primary>
          </Box>
        </Box>
      </PlaygroundPanelShadow>
    </OnboardingPanelPage>
  )
}

OnboardingWelcome.displayName = 'OnboardingWelcome'
