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
  const ownerOptions = useMemo(
    () => listOwnerSlugs().map((slug) => ({ label: getOwnerDisplayName(slug), value: slug })),
    [],
  )
  const fallbackOwner = ownerOptions[0]?.value ?? ''

  // Always start controlled with a real option value — empty string makes Aquarium Select
  // flip Downshift between uncontrolled and controlled.
  const [ownerSlug, setOwnerSlug] = useState(fallbackOwner)
  const [experimentName, setExperimentName] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (!entry || !open) return
    const suggested = suggestOwnerSlug(entry)
    setOwnerSlug(suggested || fallbackOwner)
    setExperimentName(suggestExperimentSlug(entry))
    setCopyState('idle')
  }, [entry, open, fallbackOwner])

  if (!entry) return null

  const intent = getCursorPromptIntent(entry)
  const normalizedExperiment = slugify(experimentName)
  const resolvedOwner = ownerSlug || fallbackOwner
  const canSubmit = resolvedOwner.length > 0 && normalizedExperiment.length > 0

  const result = canSubmit
    ? buildCursorPrompt(entry, {
        ownerSlug: resolvedOwner,
        experimentSlug: normalizedExperiment,
      })
    : null

  function handleClose() {
    setCopyState('idle')
    onClose()
  }

  function handleOpenInCursor() {
    if (!result?.withinLimit) return
    storeOwnerSlug(resolvedOwner)
    window.open(result.url, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  async function handleCopyPrompt() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.prompt)
    } catch {
      setCopyState('error')
      return
    }
    setCopyState('copied')
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
        {isFork && open && (
          <>
            <Select
              key={`owner-${entry.id}`}
              labelText="Owner"
              options={ownerOptions}
              value={resolvedOwner}
              onChange={(selected) => setOwnerSlug(aquariumSelectValue(selected, fallbackOwner))}
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
