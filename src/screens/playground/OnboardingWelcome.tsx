import { useState } from 'react'
import { Box, Button, Card, Divider, Input, Select, Typography } from '@aivenio/aquarium'
import gridIcon from '@aivenio/aquarium/icons/grid'
import lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import { ONBOARDING_PLAYGROUND_CONTEXT } from '../../scenarios/consoleContext'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
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

const REGION_OPTIONS = [
  { label: 'Europe — Ireland (AWS eu-west-1)', value: 'aws:eu-west-1' },
  { label: 'US East — N. Virginia (AWS us-east-1)', value: 'aws:us-east-1' },
  { label: 'Europe — Belgium (GCP europe-west1)', value: 'gcp:europe-west1' },
] as const

function WelcomeChoiceCard({
  value,
  icon,
  iconVariant,
  title,
  description,
}: {
  value: OnboardingStartChoice
  icon: typeof lightbulbIcon
  iconVariant: 'recommended' | 'default'
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
            <OnboardingIconTile icon={icon} variant={iconVariant} />
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
  const [region, setRegion] = useState<string>(REGION_OPTIONS[0].value)

  function handleContinue() {
    onContinue(choice, { projectName: projectName.trim() || DEFAULT_PROJECT_NAME, region })
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
                  icon={gridIcon}
                  iconVariant="default"
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
              options={[...REGION_OPTIONS]}
              value={region}
              onChange={(val) => setRegion(String(val ?? REGION_OPTIONS[0].value))}
            />
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button.Primary type="button" onClick={handleContinue}>
              {choice === 'playground' ? 'Open the playground' : 'Browse services'}
            </Button.Primary>
          </Box>
        </Box>
      </PlaygroundPanelShadow>
    </OnboardingPanelPage>
  )
}

OnboardingWelcome.displayName = 'OnboardingWelcome'
