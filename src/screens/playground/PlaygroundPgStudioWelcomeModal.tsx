import { Box, Modal, Typography } from '@aivenio/aquarium'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import { OnboardingIconTile } from './playgroundShared'

export type PlaygroundPgStudioWelcomeModalProps = {
  open: boolean
  onClose: () => void
}

export function PlaygroundPgStudioWelcomeModal({ open, onClose }: PlaygroundPgStudioWelcomeModalProps) {
  return (
    <div className="pg-studio-welcome-modal">
      <style>{`
        .pg-studio-welcome-modal .Aquarium-Modal.Container {
          position: relative;
        }
        .pg-studio-welcome-modal .Aquarium-Modal.TitleContainer {
          padding-left: 52px;
        }
        .pg-studio-welcome-modal .pg-studio-welcome-modal__icon {
          position: absolute;
          left: 28px;
          top: 24px;
          z-index: 1;
        }
      `}</style>
      <Modal
        open={open}
        onClose={onClose}
        size="sm"
        title="Welcome to PG Studio playground"
        subtitle="Your free tier sandbox is live"
        primaryAction={{ text: 'Start exploring', onClick: onClose }}
      >
        <Box className="pg-studio-welcome-modal__icon" aria-hidden>
          <OnboardingIconTile icon={codeBlockIcon} variant="recommended" size={40} />
        </Box>
        <Typography.Default color="muted">
          We loaded a pre-seeded dataset so PG Studio feels like a real project. Run SQL, browse tables, or
          let AI draft queries for you.
        </Typography.Default>
      </Modal>
    </div>
  )
}

PlaygroundPgStudioWelcomeModal.displayName = 'PlaygroundPgStudioWelcomeModal'
