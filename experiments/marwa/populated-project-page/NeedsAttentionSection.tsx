'use client'

import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  EmptyState,
  InlineIcon,
  Link,
  Section,
  Typography,
} from '@aivenio/aquarium'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import {
  attentionSeverityCounts,
  topAttentionIssues,
  type AttentionRow,
  type AttentionSeverity,
} from './deriveLhf'
import type { OnlineStoreProdFixture } from './fixtures/onlineStoreProd'
import { IssueDetailDrawer } from './IssueDetailDrawer'

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
  const [openIssue, setOpenIssue] = useState<AttentionRow | null>(null)
  const counts = useMemo(() => attentionSeverityCounts(fixture), [fixture])
  const rows = useMemo(() => topAttentionIssues(fixture, severity), [fixture, severity])
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
              {counts.info > 0 ? <ChoiceChip value="info">info {counts.info}</ChoiceChip> : null}
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
                      <IssueLink row={row} onOpen={setOpenIssue} />
                      <Typography.Small color="muted">system: {row.systemNames}</Typography.Small>
                    </Box>
                  ) : (
                    <IssueLink row={row} onOpen={setOpenIssue} />
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
            {
              type: 'custom',
              headerName: 'Started',
              UNSAFE_render: (row) => (
                <Box.Flex alignItems="center" justifyContent="space-between" gap="3">
                  <Typography.Small color="muted">{row.started}</Typography.Small>
                  <InlineIcon icon={chevronRight} width="16px" height="16px" color="muted" />
                </Box.Flex>
              ),
            },
          ]}
        />
      )}
      <IssueDetailDrawer issue={openIssue} onClose={() => setOpenIssue(null)} />
    </Section>
  )
}

function IssueLink({ row, onOpen }: { row: AttentionRow; onOpen: (row: AttentionRow) => void }) {
  return (
    <Link
      href={`#/issues/${row.id}`}
      onClick={(event) => {
        event.preventDefault()
        onOpen(row)
      }}
    >
      {row.title}
    </Link>
  )
}

NeedsAttentionSection.displayName = 'NeedsAttentionSection'
IssueLink.displayName = 'IssueLink'
