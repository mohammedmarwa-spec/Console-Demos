'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Card, Typography } from '@aivenio/aquarium'
import type { PlaygroundEntry } from '../../registry/types'
import { getLaunchUrlForScenario } from '../../lib/navigation'
import {
  buildCursorPrompt,
  getCursorPromptIntent,
  storeOwnerSlug,
  suggestExperimentSlug,
  suggestOwnerSlug,
} from '../../lib/cursorDeeplink'
import { StartInCursorModal } from './StartInCursorModal'
import { PrototypePreviewPopover } from './PrototypePreviewPopover'

export function PrototypeCard({ entry }: { entry: PlaygroundEntry }) {
  const router = useRouter()
  const launchUrl = entry.route || getLaunchUrlForScenario(entry.id)
  const [cursorModalOpen, setCursorModalOpen] = useState(false)

  function handleOpenPrototype() {
    router.push(launchUrl)
  }

  function handleStartInCursor(event: React.MouseEvent) {
    event.stopPropagation()
    const intent = getCursorPromptIntent(entry)
    if (intent === 'edit') {
      const ownerSlug = suggestOwnerSlug(entry)
      const experimentSlug = suggestExperimentSlug(entry)
      const result = buildCursorPrompt(entry, { ownerSlug, experimentSlug })
      if (result.withinLimit) {
        storeOwnerSlug(ownerSlug)
        window.open(result.url, '_blank', 'noopener,noreferrer')
        return
      }
    }
    setCursorModalOpen(true)
  }

  function handleCardKeyDown(event: React.KeyboardEvent) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenPrototype()
    }
  }

  return (
    <>
      <PrototypePreviewPopover entry={entry}>
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Open ${entry.title}`}
          onClick={handleOpenPrototype}
          onKeyDown={handleCardKeyDown}
          style={{ height: '100%', display: 'flex', cursor: 'pointer' }}
        >
          <Card
          fullWidth
          title={
            <Card.Title>
              <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, width: '100%' }}>
                <Typography.DefaultStrong color="intense">{entry.title}</Typography.DefaultStrong>
              </Box>
            </Card.Title>
          }
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
            <Typography.Small color="muted">{entry.description}</Typography.Small>
            <Box
              style={{
                marginTop: 'auto',
                paddingTop: 8,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Button.Secondary dense type="button" onClick={handleStartInCursor}>
                Start in Cursor
              </Button.Secondary>
            </Box>
          </Box>
          </Card>
        </Box>
      </PrototypePreviewPopover>
      <StartInCursorModal
        entry={entry}
        open={cursorModalOpen}
        onClose={() => setCursorModalOpen(false)}
      />
    </>
  )
}

PrototypeCard.displayName = 'PrototypeCard'
