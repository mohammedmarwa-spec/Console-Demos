import { useState } from 'react'
import { Box, Card, Modal, Typography } from '@aivenio/aquarium'
import listIcon from '@aivenio/aquarium/icons/list'
import uploadIcon from '@aivenio/aquarium/icons/upload'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
  OnboardingIconTile,
} from './playgroundShared'

export type SandboxDataChoice = 'sample' | 'own'

export type PlaygroundSandboxModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (choice: SandboxDataChoice) => void
}

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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title="PostgreSQL sandbox"
      subtitle="Choose what to load before you start exploring."
      primaryAction={{
        text: choice === 'sample' ? 'Load sample data' : 'Continue',
        onClick: handlePrimary,
      }}
      secondaryActions={{ text: 'Cancel', onClick: handleClose }}
    >
      <style>{`${ONBOARDING_CHECKABLE_CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <Box
        className="onboarding-checkable-cards"
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
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
                    <Typography.DefaultStrong color="intense">Load sample data</Typography.DefaultStrong>
                    <Typography.Small color="muted">
                      Pre-seeded realistic dataset so the service feels alive. Best for first-time exploration.
                    </Typography.Small>
                  </Box>
                </Box>
              </Card.Title>
            }
          />

          <Card
            fullWidth
            checkable
            value="own"
            title={
              <Card.Title>
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <OnboardingIconTile icon={uploadIcon} variant="default" size={36} />
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
                    <Typography.DefaultStrong color="intense">Migrate your data</Typography.DefaultStrong>
                    <Typography.Small color="muted">
                      Bring CSV, SQL dump, or connect a source. Stays sandboxed — nothing leaves the playground.
                    </Typography.Small>
                  </Box>
                </Box>
              </Card.Title>
            }
          />
          </Box>
        </Card.Group>
      </Box>
    </Modal>
  )
}

PlaygroundSandboxModal.displayName = 'PlaygroundSandboxModal'
