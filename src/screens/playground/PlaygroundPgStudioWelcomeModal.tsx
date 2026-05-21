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
        /*
         * Aquarium-Modal is on the overlay, not the header. Title row lives in
         * .flex.flex-col.grow (TitleContainer): h2 + subtitle slot.
         */
        .pg-studio-welcome-modal .Aquarium-Modal .flex.flex-col.grow {
          display: grid;
          grid-template-columns: 48px 1fr;
          column-gap: 12px;
          row-gap: 4px;
          align-items: start;
        }
        .pg-studio-welcome-modal .Aquarium-Modal .flex.flex-col.grow > h2 {
          grid-column: 2;
          grid-row: 1;
          margin: 0;
        }
        .pg-studio-welcome-modal .Aquarium-Modal .flex.flex-col.grow > :nth-child(2) {
          display: contents;
          max-width: none;
        }
        .pg-studio-welcome-modal__icon {
          grid-column: 1;
          grid-row: 1 / span 2;
        }
        .pg-studio-welcome-modal__subtitle-line {
          grid-column: 2;
          grid-row: 2;
        }
      `}</style>
      <Modal
        open={open}
        onClose={onClose}
        size="sm"
        title="Welcome to PG Studio playground"
        subtitle={
          <>
            <Box className="pg-studio-welcome-modal__icon" aria-hidden>
              <OnboardingIconTile icon={codeBlockIcon} variant="recommended" size={40} />
            </Box>
            <Typography.Default className="pg-studio-welcome-modal__subtitle-line" color="muted">
              Your free tier sandbox is live
            </Typography.Default>
          </>
        }
        primaryAction={{ text: 'Start exploring', onClick: onClose }}
      >
        <Typography.Default color="muted">
          We loaded a pre-seeded dataset so PG Studio feels like a real project. Run SQL, browse tables, or
          let AI draft queries for you.
        </Typography.Default>
      </Modal>
    </div>
  )
}

PlaygroundPgStudioWelcomeModal.displayName = 'PlaygroundPgStudioWelcomeModal'
