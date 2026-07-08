'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Box, Button, Card, Typography } from '@aivenio/aquarium'
import type { PlaygroundEntry } from '../../registry/types'
import { ScenarioBadges } from '../playground/ScenarioBadges'
import { CATEGORY_LABELS } from '../../registry/types'
import { getLaunchUrlForScenario } from '../../lib/navigation'
import {
  buildCursorPrompt,
  getCursorPromptIntent,
  storeOwnerSlug,
  suggestExperimentSlug,
  suggestOwnerSlug,
} from '../../lib/cursorDeeplink'
import { StartInCursorModal } from './StartInCursorModal'

export function PrototypeCard({ entry }: { entry: PlaygroundEntry }) {
  const launchUrl = entry.route || getLaunchUrlForScenario(entry.id)
  const [cursorModalOpen, setCursorModalOpen] = useState(false)

  function handleStartInCursor() {
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

  return (
    <>
      <Box style={{ height: '100%', display: 'flex' }}>
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
            <ScenarioBadges entry={entry} />
            <Typography.Small color="muted">{entry.description}</Typography.Small>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Typography.Small color="muted">Owner: {entry.owner}</Typography.Small>
              <Typography.Small color="muted">·</Typography.Small>
              <Typography.Small color="muted">{CATEGORY_LABELS[entry.category]}</Typography.Small>
            </Box>
            {entry.tags.length > 0 && (
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {entry.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="playground-badge playground-badge--tag">
                    {tag}
                  </span>
                ))}
              </Box>
            )}
            <Box
              style={{
                marginTop: 'auto',
                paddingTop: 8,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Link href={launchUrl} style={{ textDecoration: 'none' }}>
                <Button>Open prototype</Button>
              </Link>
              <Button kind="secondary" onClick={handleStartInCursor}>
                Start in Cursor
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
      <StartInCursorModal
        entry={entry}
        open={cursorModalOpen}
        onClose={() => setCursorModalOpen(false)}
      />
    </>
  )
}

PrototypeCard.displayName = 'PrototypeCard'
