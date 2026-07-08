'use client'

import { useEffect, useState } from 'react'
import { Box, Modal, Typography } from '@aivenio/aquarium'
import type { PlaygroundEntry } from '../../registry/types'
import {
  buildCursorPrompt,
  CURSOR_DEEPLINK_MAX_LENGTH,
  DESIGN_TEAM_OWNERS,
  getCursorPromptIntent,
  slugify,
  storeOwnerSlug,
  suggestExperimentSlug,
  suggestOwnerName,
  type DesignTeamOwner,
} from '../../lib/cursorDeeplink'

export type StartInCursorModalProps = {
  entry: PlaygroundEntry | null
  open: boolean
  onClose: () => void
}

export function StartInCursorModal({ entry, open, onClose }: StartInCursorModalProps) {
  const [ownerName, setOwnerName] = useState<DesignTeamOwner | ''>('')
  const [experimentName, setExperimentName] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (!entry || !open) return
    setOwnerName(suggestOwnerName(entry))
    setExperimentName(suggestExperimentSlug(entry))
    setCopyState('idle')
  }, [entry, open])

  if (!entry) return null

  const intent = getCursorPromptIntent(entry)
  const normalizedOwner = ownerName ? slugify(ownerName) : ''
  const normalizedExperiment = slugify(experimentName)
  const canSubmit = normalizedOwner.length > 0 && normalizedExperiment.length > 0

  const result = canSubmit
    ? buildCursorPrompt(entry, {
        ownerSlug: normalizedOwner,
        experimentSlug: normalizedExperiment,
      })
    : null

  function handleClose() {
    setCopyState('idle')
    onClose()
  }

  function handleOpenInCursor() {
    if (!result?.withinLimit) return
    storeOwnerSlug(normalizedOwner)
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
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Typography.SmallStrong color="intense">Owner</Typography.SmallStrong>
              <select
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value as DesignTeamOwner | '')}
                className="scenario-panel__search-input"
                aria-label="Owner"
              >
                <option value="">Select owner</option>
                {DESIGN_TEAM_OWNERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Typography.SmallStrong color="intense">Experiment name</Typography.SmallStrong>
              <input
                type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder="My experiment"
                className="scenario-panel__search-input"
                aria-label="Experiment name"
              />
            </label>
          </>
        )}

        <Box>
          <Typography.Small color="muted">
            Prerequisites: Cursor installed, this repo cloned locally, and the workspace open in Cursor.
            Review the pre-filled prompt before running the agent.
          </Typography.Small>
        </Box>

        {result && !result.withinLimit && (
          <Box style={{ color: 'var(--aquarium-text-color-danger, #c62828)' }}>
            <Typography.Small>
              Prompt is too long for a Cursor deeplink ({result.url.length} / {CURSOR_DEEPLINK_MAX_LENGTH}).
              Use Copy prompt instead.
            </Typography.Small>
          </Box>
        )}

        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="scenario-panel__filter-chip"
            onClick={handleCopyPrompt}
            disabled={!canSubmit}
          >
            {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy prompt'}
          </button>
        </Box>
      </Box>
    </Modal>
  )
}

StartInCursorModal.displayName = 'StartInCursorModal'
