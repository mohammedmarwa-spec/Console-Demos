import { useState } from 'react'
import { Box, Card, Modal, Typography } from '@aivenio/aquarium'
import listIcon from '@aivenio/aquarium/icons/list'
import uploadIcon from '@aivenio/aquarium/icons/upload'
import { ServiceIcon } from '../../components/ServiceIcon'
import { CodeSnippet, ONBOARDING_CHECKABLE_CARD_CSS, OnboardingIconTile } from './playgroundShared'

export type SandboxDataChoice = 'sample' | 'own'

export type PlaygroundSandboxModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (choice: SandboxDataChoice) => void
}

const CARD_RING_CSS = `
  .playground-sandbox-cards label.Aquarium-Card\\.Label.ring-2 {
    --tw-ring-offset-shadow: 0 0 #0000 !important;
    --tw-ring-shadow: 0 0 #0000 !important;
    --tw-ring-width: 0 !important;
    --tw-ring-offset-width: 0 !important;
    box-shadow: inset 0 0 0 2px var(--aquarium-border-color-primary-default) !important;
  }
  .playground-sandbox-cards label.Aquarium-Card\\.Label {
    min-width: 0 !important;
    width: 100%;
  }
`

export function PlaygroundSandboxModal({ open, onClose, onConfirm }: PlaygroundSandboxModalProps) {
  const [choice, setChoice] = useState<SandboxDataChoice>('sample')

  function handleClose() {
    setChoice('sample')
    onClose()
  }

  function handlePrimary() {
    onConfirm(choice)
    setChoice('sample')
  }

  const modalTitle = (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ServiceIcon serviceTypeId="postgresql" size={40} alt="" />
      PostgreSQL sandbox
    </Box>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={modalTitle as unknown as string}
      subtitle="Choose what to load before you start exploring."
      primaryAction={{
        text: choice === 'sample' ? 'Load sample data' : 'Continue',
        onClick: handlePrimary,
      }}
      secondaryActions={{ text: 'Cancel', onClick: handleClose }}
    >
      <style>{`${CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <Box
        className="playground-sandbox-cards onboarding-checkable-cards"
        style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <Card.Group
          checked={choice}
          onCheckedChange={({ value }) => setChoice((value as SandboxDataChoice) ?? 'sample')}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              alignItems: 'stretch',
            }}
          >
          <Card
            fullWidth
            checkable
            value="sample"
            title={
              <Card.Title>
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <OnboardingIconTile icon={listIcon} variant="recommended" size={36} />
                  <Typography.DefaultStrong color="intense">Load sample data</Typography.DefaultStrong>
                </Box>
              </Card.Title>
            }
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <Typography.Small color="muted">
                Pre-seeded realistic dataset so the service feels alive. Best for first-time exploration.
              </Typography.Small>
              <CodeSnippet>SELECT * FROM orders LIMIT 10;</CodeSnippet>
            </Box>
          </Card>

          <Card
            fullWidth
            checkable
            value="own"
            title={
              <Card.Title>
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <OnboardingIconTile icon={uploadIcon} variant="default" size={36} />
                  <Typography.DefaultStrong color="intense">Migrate your data</Typography.DefaultStrong>
                </Box>
              </Card.Title>
            }
          >
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <Typography.Small color="muted">
                Bring CSV, SQL dump, or connect a source. Stays sandboxed — nothing leaves the playground.
              </Typography.Small>
              <Box component="span" style={{ fontFamily: 'Menlo, monospace', fontSize: 11.5 }}>
                CSV · SQL dump · connector
              </Box>
            </Box>
          </Card>
          </Box>
        </Card.Group>

        <Card.Compact
          fullWidth
          title="You can swap data sources anytime from the dashboard."
        />
      </Box>
    </Modal>
  )
}

PlaygroundSandboxModal.displayName = 'PlaygroundSandboxModal'
