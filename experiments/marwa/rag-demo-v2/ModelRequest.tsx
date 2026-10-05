'use client'

import { useState } from 'react'
import { Alert, Box, Button, ChoiceChip, ChoiceChipGroup, Textarea, Typography } from '@aivenio/aquarium'
import { REQUESTABLE_MODELS } from './ragDemo'

/**
 * Rec 8 — the demo models are locked; this collects a request for others. Inline in
 * the step (not a second Modal) so it doesn't stack on top of the stepper modal.
 */
export function ModelRequest() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [comment, setComment] = useState('')

  if (sent) {
    return (
      <Alert type="success" title="Request sent" onDismiss={() => setSent(false)}>
        Thanks — we use these requests to decide which models to add to the demo next.
      </Alert>
    )
  }

  if (!open) {
    return (
      <Box.Flex alignItems="center" gap="3" flexWrap="wrap">
        <Typography.Small color="muted">The demo uses predefined models.</Typography.Small>
        <Button.Ghost dense type="button" onClick={() => setOpen(true)}>
          Request a different model
        </Button.Ghost>
      </Box.Flex>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 'var(--aquarium-border-radius-default)',
        border: '1px solid var(--aquarium-border-color-muted)',
      }}
    >
      <Box>
        <Typography.SmallStrong color="intense">Request a different model</Typography.SmallStrong>
        <Typography.Small color="muted">Which models would you like to try in this demo?</Typography.Small>
      </Box>
      <ChoiceChipGroup
        name="requested-models"
        dense
        value={models}
        onChange={(value: string[]) => setModels(value)}
      >
        {REQUESTABLE_MODELS.map((model) => (
          <ChoiceChip key={model} value={model}>
            {model}
          </ChoiceChip>
        ))}
      </ChoiceChipGroup>
      <Textarea
        labelText="Anything else? (optional)"
        rows={2}
        maxLength={500}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Box.Flex gap="3">
        <Button
          dense
          type="button"
          disabled={models.length === 0 && comment.trim() === ''}
          onClick={() => {
            setSent(true)
            setOpen(false)
            setModels([])
            setComment('')
          }}
        >
          Send request
        </Button>
        <Button.Secondary dense type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button.Secondary>
      </Box.Flex>
    </Box>
  )
}

ModelRequest.displayName = 'ModelRequest'
