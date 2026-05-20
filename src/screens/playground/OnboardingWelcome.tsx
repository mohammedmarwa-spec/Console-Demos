import { Box, Card, Link, Typography } from '@aivenio/aquarium'
import gridIcon from '@aivenio/aquarium/icons/grid'
import lightbulbIcon from '@aivenio/aquarium/icons/lightbulb'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import { PlaygroundPanelShadow, OnboardingIconTile } from './playgroundShared'

export type OnboardingWelcomeProps = {
  onOpenPlayground: () => void
  onBrowseServices: () => void
}

function WelcomeChoiceCard({
  icon,
  iconVariant,
  title,
  description,
  linkLabel,
  onClick,
}: {
  icon: typeof lightbulbIcon
  iconVariant: 'recommended' | 'default'
  title: string
  description: string
  linkLabel: string
  onClick: () => void
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Card
        fullWidth
        onClick={onClick}
        title={
          <Card.Title>
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <OnboardingIconTile icon={icon} variant={iconVariant} />
              <Typography.DefaultStrong color="intense">{title}</Typography.DefaultStrong>
            </Box>
          </Card.Title>
        }
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            flex: 1,
            minHeight: 120,
          }}
        >
          <Typography.Small color="muted">{description}</Typography.Small>
          <Link
            href="#"
            style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
            onClick={(e) => {
              e.preventDefault()
              onClick()
            }}
          >
            {linkLabel}
          </Link>
        </Box>
      </Card>
    </Box>
  )
}

WelcomeChoiceCard.displayName = 'WelcomeChoiceCard'

export function OnboardingWelcome({ onOpenPlayground, onBrowseServices }: OnboardingWelcomeProps) {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 24px',
        minHeight: '100%',
      }}
    >
      <PlaygroundPanelShadow>
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            padding: '24px 24px 20px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 240 }}>
            <Typography.LargeHeading>Welcome to Aiven</Typography.LargeHeading>
            <Typography.Small color="muted">
              How would you like to start? You can change your mind any time.
            </Typography.Small>
          </Box>
          <OnboardingStepIndicator step={1} />
        </Box>

        <Box style={{ padding: '20px 24px 24px' }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            <WelcomeChoiceCard
              icon={lightbulbIcon}
              iconVariant="recommended"
              title="I'm new to managed services"
              description="Open a sandboxed playground with sample data and AI guidance. Poke around real services — nothing to provision, nothing billed."
              linkLabel="Open the playground →"
              onClick={onOpenPlayground}
            />
            <WelcomeChoiceCard
              icon={gridIcon}
              iconVariant="default"
              title="I'll choose myself"
              description="Browse the full catalog and create a service directly. Best if you already know what you need."
              linkLabel="Browse services →"
              onClick={onBrowseServices}
            />
          </Box>
        </Box>
      </PlaygroundPanelShadow>
    </Box>
  )
}

OnboardingWelcome.displayName = 'OnboardingWelcome'
