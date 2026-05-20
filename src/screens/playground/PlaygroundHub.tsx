import { Box, Button, Card, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '../../components/ServiceIcon'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import {
  CategoryPill,
  CodeSnippet,
  PLAYGROUND_DEMOS,
  PlaygroundPanelShadow,
  type PlaygroundDemo,
} from './playgroundShared'

export type PlaygroundHubProps = {
  onBackToSetup: () => void
  onSetUpProject: () => void
  onDemoClick: (demo: PlaygroundDemo) => void
}

function DemoCard({ demo, onClick }: { demo: PlaygroundDemo; onClick: () => void }) {
  return (
    <Card
      fullWidth
      onClick={onClick}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, width: '100%' }}>
            <ServiceIcon serviceTypeId={demo.serviceTypeId} size={28} alt="" />
            <Typography.DefaultStrong color="intense">{demo.title}</Typography.DefaultStrong>
            <CategoryPill label={demo.categoryLabel} />
          </Box>
        </Card.Title>
      }
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Typography.Small color="muted">{demo.description}</Typography.Small>
        <CodeSnippet>{demo.codeSnippet}</CodeSnippet>
      </Box>
    </Card>
  )
}

DemoCard.displayName = 'DemoCard'

function SetUpProjectCard({ onSetUpProject }: { onSetUpProject: () => void }) {
  return (
    <Card.Compact
      fullWidth
      color="primary-10"
      title={
        <Card.Title>
          <Box component="span" style={{ color: 'var(--aquarium-text-color-success-intense)', fontWeight: 600 }}>
            Ready to build something real?
          </Box>
        </Card.Title>
      }
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-start',
          minHeight: 72,
        }}
      >
        <Typography.Small>
          Create a project and we&apos;ll spin up your own services with your data.
        </Typography.Small>
        <Button.Primary type="button" onClick={onSetUpProject} style={{ marginTop: 'auto' }}>
          Set up my project →
        </Button.Primary>
      </Box>
    </Card.Compact>
  )
}

SetUpProjectCard.displayName = 'SetUpProjectCard'

export function PlaygroundHub({ onBackToSetup, onSetUpProject, onDemoClick }: PlaygroundHubProps) {
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
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 24px 17px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography.LargeHeading>Playground</Typography.LargeHeading>
            <Typography.Small color="muted">
              Sandboxed demos with sample data · nothing provisioned, nothing billed.
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
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {PLAYGROUND_DEMOS.map((demo) => (
              <DemoCard key={demo.id} demo={demo} onClick={() => onDemoClick(demo)} />
            ))}
          </Box>

          <Box style={{ marginTop: 16 }}>
            <SetUpProjectCard onSetUpProject={onSetUpProject} />
          </Box>
        </Box>
      </PlaygroundPanelShadow>
    </Box>
  )
}

PlaygroundHub.displayName = 'PlaygroundHub'
