'use client'

import { useMemo } from 'react'
import {
  Box,
  Card,
  ChipContainer,
  EmptyState,
  Grid,
  ProgressBar,
  Section,
  StatusChip,
  Timeline,
  Typography,
} from '@aivenio/aquarium'
import {
  attentionSeverityCounts,
  criticalActivity,
  needsAttentionCount,
} from './deriveLhf'
import { fmtTb } from './deriveFull'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import type {
  ArchitectureSnapshot,
  OnlineStoreProdFixture,
  Solution,
} from './fixtures/onlineStoreProd'

function SummaryRow({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const attention = needsAttentionCount(fixture)
  const breakdown = useMemo(() => attentionSeverityCounts(fixture), [fixture])
  const storageUsedPct = Math.round((fixture.storage.usedTb / fixture.storage.totalTb) * 100)
  const storageOver85 = fixture.services.filter((service) => service.storagePct > 85).length
  const over85Label =
    storageOver85 === 1 ? '1 service over 85%' : `${storageOver85} services over 85%`
  const eolSoon = fixture.issues.filter((issue) => issue.kind === 'eol').length
  const eolLabel = eolSoon === 1 ? '1 reaches EOL < 30 days' : `${eolSoon} reach EOL < 30 days`

  return (
    <Grid gap="4" alignItems="stretch">
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card
            fullWidth
            title={
              <Card.Title>
                <Box.Flex alignItems="center" justifyContent="space-between" gap="3">
                  Services
                  {attention > 0 ? (
                    <StatusChip
                      dense
                      status="danger"
                      text={attention === 1 ? '1 needs attention' : `${attention} need attention`}
                    />
                  ) : null}
                </Box.Flex>
              </Card.Title>
            }
          >
            <Typography.Heading>{fixture.services.length}</Typography.Heading>
            {attention > 0 ? (
              <Box marginTop="3">
                <ChipContainer dense>
                  {[
                    <StatusChip key="danger" dense status="danger" text={`${breakdown.danger} critical`} />,
                    <StatusChip key="warning" dense status="warning" text={`${breakdown.warning} warning`} />,
                    ...(breakdown.info > 0
                      ? [<StatusChip key="info" dense status="info" text={`${breakdown.info} info`} />]
                      : []),
                  ]}
                </ChipContainer>
              </Box>
            ) : null}
          </Card>
        </Box>
      </Grid.Item>
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card fullWidth title="Storage used">
            <Typography.Heading>
              {fmtTb(fixture.storage.usedTb)} / {fmtTb(fixture.storage.totalTb)} TB
            </Typography.Heading>
            <Box marginTop="3">
              <ProgressBar
                dense
                value={fixture.storage.usedTb}
                min={0}
                max={fixture.storage.totalTb}
                progresStatus={storageUsedPct >= 85 ? 'warning' : 'info'}
                aria-label="Storage used"
              />
            </Box>
            <Box marginTop="2">
              <Typography.Small color="muted">{over85Label}</Typography.Small>
            </Box>
          </Card>
        </Box>
      </Grid.Item>
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card fullWidth title="Off latest version">
            <Typography.Heading>{fixture.offLatestVersionCount}</Typography.Heading>
            <Box marginTop="2">
              <Typography.Small color={eolSoon > 0 ? 'warning-default' : 'muted'}>{eolLabel}</Typography.Small>
            </Box>
          </Card>
        </Box>
      </Grid.Item>
    </Grid>
  )
}

function NeedsAttentionModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return <NeedsAttentionSection fixture={fixture} filterName="lhf-attention-severity" />
}

function RecentActivityModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const events = useMemo(() => criticalActivity(fixture), [fixture])

  return (
    <Section title="Recent activity" subtitle="Critical and warning changes in this project">
      {events.length === 0 ? (
        <EmptyState
          title="No recent activity"
          primaryAction={{ text: 'View event log', onClick: () => undefined }}
          borderStyle="solid"
          fullHeight={false}
        >
          Changes across services, applications and agents will appear here
        </EmptyState>
      ) : (
        <Timeline aria-label="Recent project activity">
          {events.map((event) => (
            <Timeline.Item key={event.id} title={event.change} variant={event.variant}>
              <Typography.Small color="muted">
                {event.resource} · {event.actor} · {event.when}
              </Typography.Small>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Section>
  )
}

function SolutionsModule({ solutions }: { solutions: Solution[] }) {
  return (
    <Section title="Solutions">
      <Box.Flex flexDirection="column" gap="4">
        {solutions.map((solution) => (
          <Card key={solution.id} fullWidth title={solution.name}>
            <Typography.Small color="muted">{solution.description}</Typography.Small>
          </Card>
        ))}
      </Box.Flex>
    </Section>
  )
}

function ArchitectureModule({ snapshot }: { snapshot: ArchitectureSnapshot }) {
  return (
    <Card
      fullWidth
      title="Architecture"
      primaryAction={{ text: 'Explore architecture', onClick: () => undefined }}
    >
      <Typography.DefaultStrong>
        {snapshot.connectedSystems} connected systems
      </Typography.DefaultStrong>
      <Box marginTop="2">
        <Typography.Small color="muted">{snapshot.connections} connections</Typography.Small>
      </Box>
    </Card>
  )
}

export function LhfBody({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return (
    <Box.Flex flexDirection="column" gap="6">
      <SummaryRow fixture={fixture} />
      <NeedsAttentionModule fixture={fixture} />
      <RecentActivityModule fixture={fixture} />
      {fixture.solutions.length > 0 ? <SolutionsModule solutions={fixture.solutions} /> : null}
      {fixture.architecture ? <ArchitectureModule snapshot={fixture.architecture} /> : null}
    </Box.Flex>
  )
}

LhfBody.displayName = 'LhfBody'
SummaryRow.displayName = 'SummaryRow'
NeedsAttentionModule.displayName = 'NeedsAttentionModule'
RecentActivityModule.displayName = 'RecentActivityModule'
SolutionsModule.displayName = 'SolutionsModule'
ArchitectureModule.displayName = 'ArchitectureModule'
