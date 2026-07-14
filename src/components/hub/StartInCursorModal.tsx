'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Input, Modal, Select, Typography } from '@aivenio/aquarium'
import type { DiscoveredPage } from '@/lib/experiments/types'
import { aquariumSelectValue } from '../../lib/aquariumSelect'
import {
  buildCursorPrompt,
  CURSOR_DEEPLINK_MAX_LENGTH,
  getCursorPromptIntent,
  slugify,
  storeOwnerSlug,
  suggestExperimentSlug,
  suggestOwnerSlug,
} from '../../lib/cursorDeeplink'
import { getOwnerDisplayName, listOwnerSlugs } from '../../lib/designTeamOwners'

export type StartInCursorModalProps = {
  entry: DiscoveredPage | null
  open: boolean
  onClose: () => void
}

export function StartInCursorModal({ entry, open, onClose }: StartInCursorModalProps) {
  const [ownerSlug, setOwnerSlug] = useState('')
  const [experimentName, setExperimentName] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const ownerOptions = useMemo(
    () => listOwnerSlugs().map((slug) => ({ label: getOwnerDisplayName(slug), value: slug })),
    [],
  )

  useEffect(() => {
    if (!entry || !open) return
    setOwnerSlug(suggestOwnerSlug(entry))
    setExperimentName(suggestExperimentSlug(entry))
    setCopyState('idle')
  }, [entry, open])

  if (!entry) return null

  const intent = getCursorPromptIntent(entry)
  const normalizedExperiment = slugify(experimentName)
  const canSubmit = ownerSlug.length > 0 && normalizedExperiment.length > 0

  const result = canSubmit
    ? buildCursorPrompt(entry, {
        ownerSlug,
        experimentSlug: normalizedExperiment,
      })
    : null

  function handleClose() {
    setCopyState('idle')
    onClose()
  }

  function handleOpenInCursor() {
    if (!result?.withinLimit) return
    storeOwnerSlug(ownerSlug)
    window.open(result.url, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  async function handleCopyPrompt() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.prompt)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  const isFork = intent === 'fork'
  const copyLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy prompt'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title="Start in Cursor"
      subtitle={
        isFork
          ? `Fork "${entry.title}" into your experiment folder.`
          : `Open "${entry.title}" in Cursor with the right context.`
      }
      primaryAction={{
        text: 'Open in Cursor',
        onClick: handleOpenInCursor,
        disabled: !canSubmit || !result?.withinLimit,
      }}
      secondaryActions={{ text: 'Cancel', onClick: handleClose }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isFork && (
          <>
            <Select
              labelText="Owner"
              options={ownerOptions}
              value={ownerSlug}
              onChange={(selected) => setOwnerSlug(aquariumSelectValue(selected))}
            />
            <Input
              labelText="Experiment name"
              placeholder="My experiment"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
            />
          </>
        )}

        <Typography.Small color="muted">
          Prerequisites: Cursor installed, this repo cloned locally, and the workspace open in Cursor.
          Review the pre-filled prompt before running the agent.
        </Typography.Small>

        {result && !result.withinLimit && (
          <Alert type="warning">
            Prompt is too long for a Cursor deeplink ({result.url.length} / {CURSOR_DEEPLINK_MAX_LENGTH}).
            Use Copy prompt instead.
          </Alert>
        )}

        <Box>
          <Button.Secondary dense type="button" onClick={handleCopyPrompt} disabled={!canSubmit}>
            {copyLabel}
          </Button.Secondary>
        </Box>
      </Box>
    </Modal>
  )
}

StartInCursorModal.displayName = 'StartInCursorModal'
