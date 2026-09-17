'use client'

import { Box, Button, Card, Grid, InlineIcon, Typography } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/types'
import applications from '@aivenio/aquarium/icons/applications'
import arrowLeft from '@aivenio/aquarium/icons/arrowLeft'
import database from '@aivenio/aquarium/icons/database'
import memory from '@aivenio/aquarium/icons/memory'
import replicationFlow from '@aivenio/aquarium/icons/replicationFlow'
import search from '@aivenio/aquarium/icons/search'
import timelineAreaChart from '@aivenio/aquarium/icons/timelineAreaChart'

export type OutcomeId =
  | 'stream-events'
  | 'store-app-data'
  | 'search-logs'
  | 'realtime-analytics'
  | 'cache-sessions'
  | 'run-app'

type Outcome = {
  id: OutcomeId
  icon: IconifyIcon
  title: string
  description: string
}

/** Outcomes, not products — service names only appear once a blueprint is proposed. */
const OUTCOMES: Outcome[] = [
  {
    id: 'stream-events',
    icon: replicationFlow,
    title: 'Stream events',
    description: 'Move events between systems as they happen.',
  },
  {
    id: 'store-app-data',
    icon: database,
    title: 'Store app data',
    description: 'Keep your application records safe and queryable.',
  },
  {
    id: 'search-logs',
    icon: search,
    title: 'Search & logs',
    description: 'Make text and logs searchable in milliseconds.',
  },
  {
    id: 'realtime-analytics',
    icon: timelineAreaChart,
    title: 'Real-time analytics',
    description: 'Query large volumes of data as it arrives.',
  },
  {
    id: 'cache-sessions',
    icon: memory,
    title: 'Cache & sessions',
    description: 'Keep hot data and user sessions instantly available.',
  },
  {
    id: 'run-app',
    icon: applications,
    title: 'Run an app next to data',
    description: 'Deploy your app in the same place as its data.',
  },
]

export function ExploreSolutions({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (id: OutcomeId) => void
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Box style={{ alignSelf: 'flex-start' }}>
        <Button.Ghost type="button" dense icon={arrowLeft} onClick={onBack}>
          Back
        </Button.Ghost>
      </Box>

      <Box>
        <Typography.Subheading>What do you want to build?</Typography.Subheading>
        <Box marginTop="2">
          <Typography.Default color="muted">
            Pick an outcome. Nothing is created until you confirm what it proposes.
          </Typography.Default>
        </Box>
      </Box>

      <Grid gap="4" alignItems="stretch">
        {OUTCOMES.map((outcome) => (
          <Grid.Item key={outcome.id} xs={12} sm={6} md={4}>
            {/* Flex wrapper so every card fills its grid row and the rows line up. */}
            <Box height="full" style={{ display: 'flex' }}>
              <Card
                fullWidth
                onClick={() => onSelect(outcome.id)}
                title={
                  <Card.Title>
                    <InlineIcon icon={outcome.icon} width="20px" height="20px" color="primary-graphic" />
                    <span>{outcome.title}</span>
                  </Card.Title>
                }
              >
                <Typography.Small color="muted">{outcome.description}</Typography.Small>
              </Card>
            </Box>
          </Grid.Item>
        ))}
      </Grid>
    </Box>
  )
}

ExploreSolutions.displayName = 'ExploreSolutions'
