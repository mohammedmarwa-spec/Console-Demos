'use client'

import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  EmptyState,
  Section,
  Typography,
} from '@aivenio/aquarium'
import {
  attentionSeverityCounts,
  needsAttentionCount,
  topAttentionIssues,
  type AttentionSeverity,
} from './deriveLhf'
import type { OnlineStoreProdFixture } from './fixtures/onlineStoreProd'

const DOT_COLOR: Record<AttentionSeverity, 'danger-default' | 'warning-default' | 'muted'> = {
  danger: 'danger-default',
  warning: 'warning-default',
  info: 'muted',
}

export function NeedsAttentionSection({
  fixture,
  showSystem = false,
  filterName,
}: {
  fixture: OnlineStoreProdFixture
  showSystem?: boolean
  filterName: string
}) {
  const [severity, setSeverity] = useState<AttentionSeverity | 'all'>('all')
  const counts = useMemo(() => attentionSeverityCounts(fixture), [fixture])
  const rows = useMemo(() => topAttentionIssues(fixture, 5, severity), [fixture, severity])
  const visibleCount = severity === 'all' ? counts.all : counts[severity]
  const hasAny = counts.all > 0

  return (
    <Section title="Needs attention" badge={visibleCount}>
      {hasAny ? (
        <Box marginBottom="4">
          <Typography.Small color="muted">Severity</Typography.Small>
          <Box marginTop="2">
            <ChoiceChipGroup
              name={filterName}
              dense
              selectionMode="radio"
              value={severity}
              onChange={(value) => setSeverity(value as AttentionSeverity | 'all')}
            >
              <ChoiceChip value="all">all {counts.all}</ChoiceChip>
              <ChoiceChip value="danger">critical {counts.danger}</ChoiceChip>
              <ChoiceChip value="warning">warning {counts.warning}</ChoiceChip>
              <ChoiceChip value="info">info {counts.info}</ChoiceChip>
            </ChoiceChipGroup>
          </Box>
        </Box>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState
          title={hasAny ? 'No issues at this severity' : 'Nothing needs attention'}
          primaryAction={
            hasAny
              ? { text: 'Show all', onClick: () => setSeverity('all') }
              : { text: 'Create service', onClick: () => undefined }
          }
          borderStyle="solid"
          fullHeight={false}
        >
          {hasAny
            ? 'Try a different severity, or show all'
            : 'Issues will appear as services report problems'}
        </EmptyState>
      ) : (
        <DataTable
          ariaLabel="Needs attention"
          sticky={false}
          rows={rows}
          columns={[
            {
              type: 'custom',
              headerName: 'Issue',
              UNSAFE_render: (row) => (
                <Box.Flex alignItems="center" gap="3">
                  <Typography color={DOT_COLOR[row.severity]} htmlTag="span">
                    <Badge.Dot />
                  </Typography>
                  {showSystem ? (
                    <Box>
                      <Typography.SmallStrong>{row.title}</Typography.SmallStrong>
                      <Typography.Small color="muted">system: {row.systemNames}</Typography.Small>
                    </Box>
                  ) : (
                    <Typography.SmallStrong>{row.title}</Typography.SmallStrong>
                  )}
                </Box.Flex>
              ),
            },
            { type: 'text', field: 'serviceNames', headerName: 'Service' },
            {
              type: 'status',
              headerName: 'Severity',
              status: (row) => ({ text: row.severityLabel, status: row.severity }),
            },
            { type: 'text', field: 'started', headerName: 'Started' },
          ]}
        />
      )}
    </Section>
  )
}

NeedsAttentionSection.displayName = 'NeedsAttentionSection'
