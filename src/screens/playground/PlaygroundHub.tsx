import { Box, Button, Card, Chip, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '../../components/ServiceIcon'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import {
  CodeSnippet,
  PLAYGROUND_DEMOS,
  OnboardingPanelPage,
  OnboardingPanelTitle,
  PlaygroundPanelShadow,
  type PlaygroundDemo,
} from './playgroundShared'

export type PlaygroundHubProps = {
  onBackToSetup: () => void
  onDemoClick: (demo: PlaygroundDemo) => void
  onSkipToProjectDashboard: () => void
}

function DemoCard({ demo, onClick }: { demo: PlaygroundDemo; onClick: () => void }) {
  return (
    <Box style={{ height: '100%', display: 'flex' }}>
      <Card
        fullWidth
        onClick={onClick}
        title={
          <Card.Title>
            <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, width: '100%' }}>
              <ServiceIcon serviceTypeId={demo.serviceTypeId} size={28} alt="" />
              <Typography.DefaultStrong color="intense">{demo.title}</Typography.DefaultStrong>
              <Chip text="Free tier" dense />
            </Box>
          </Card.Title>
        }
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Typography.Small color="muted">{demo.description}</Typography.Small>
          <Box style={{ marginTop: 'auto', paddingTop: 4 }}>
            <CodeSnippet>{demo.codeSnippet}</CodeSnippet>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

DemoCard.displayName = 'DemoCard'

export function PlaygroundHub({ onBackToSetup, onDemoClick, onSkipToProjectDashboard }: PlaygroundHubProps) {
  return (
    <OnboardingPanelPage>
      <PlaygroundPanelShadow>
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 24px 17px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <OnboardingPanelTitle>Playground</OnboardingPanelTitle>
            <Typography.Small color="muted">
              Sandboxed free services with sample data
            </Typography.Small>
          </Box>
          <OnboardingStepIndicator step={2} />
        </Box>

        <Box style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          <Box style={{ marginBottom: 16 }}>
            <Button.Ghost dense type="button" onClick={onBackToSetup}>
              ← Back
            </Button.Ghost>
          </Box>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              alignItems: 'stretch',
            }}
          >
            {PLAYGROUND_DEMOS.map((demo) => (
              <DemoCard key={demo.id} demo={demo} onClick={() => onDemoClick(demo)} />
            ))}
          </Box>
          <Box style={{ marginTop: 16 }}>
            <Button.Ghost dense type="button" onClick={onSkipToProjectDashboard}>
              Skip to project dashboard
            </Button.Ghost>
          </Box>
        </Box>
      </PlaygroundPanelShadow>
    </OnboardingPanelPage>
  )
}

PlaygroundHub.displayName = 'PlaygroundHub'
