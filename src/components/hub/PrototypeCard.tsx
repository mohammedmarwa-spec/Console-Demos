'use client'

import { useRouter } from 'next/navigation'
import { Box, Card, Typography } from '@aivenio/aquarium'
import type { DiscoveredPage } from '@/lib/experiments/types'

const updatedAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
})

function formatUpdatedAt(iso: string): string {
  return updatedAtFormatter.format(new Date(iso))
}

export function PrototypeCard({ entry }: { entry: DiscoveredPage }) {
  const router = useRouter()

  function handleOpenPrototype() {
    router.push(entry.route)
  }

  function handleCardKeyDown(event: React.KeyboardEvent) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenPrototype()
    }
  }

  return (
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
        title={entry.title}
        {...(entry.thumbnail
          ? {
              image: entry.thumbnail,
              imageAlt: `${entry.title} preview`,
            }
          : {})}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <Typography.Small color="muted">{entry.description}</Typography.Small>
          {entry.updatedAt && (
            <Typography.Small color="muted">{formatUpdatedAt(entry.updatedAt)}</Typography.Small>
          )}
        </Box>
      </Card>
    </Box>
  )
}

PrototypeCard.displayName = 'PrototypeCard'
