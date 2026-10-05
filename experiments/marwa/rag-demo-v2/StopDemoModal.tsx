'use client'

import { useState } from 'react'
import { Box, ChoiceChip, ChoiceChipGroup, Modal, Textarea, Typography } from '@aivenio/aquarium'
import { formatBytes } from './DemoSetup'
import { DEMO_RESOURCES, formatCount, type DemoDataSource, type DemoPlan } from './ragDemo'
import type { DemoFeedback } from './useVectorDemo'

const RATINGS = ['Not useful', 'Somewhat useful', 'Useful', 'Very useful'] as const

/**
 * Rec 7 — stop confirmation with feedback. Stopping keeps the index, pipeline, and
 * files on the service (nothing is deleted yet); the copy says so, like Kafka's
 * "Stop streaming" dialog does for produced messages.
 */
export function StopDemoModal({
  open,
  source,
  plan,
  onCancel,
  onConfirm,
}: {
  open: boolean
  source: DemoDataSource | null
  plan: DemoPlan | null
  onCancel: () => void
  onConfirm: (feedback: DemoFeedback) => void
}) {
  const [rating, setRating] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  function reset() {
    setRating(null)
    setComment('')
  }

  const dataLine =
    source?.kind === 'upload'
      ? `${formatCount(source.fileNames.length)} uploaded ${source.fileNames.length === 1 ? 'file' : 'files'}`
      : 'The sample documents'

  return (
    <Modal
      open={open}
      size="sm"
      title="Stop vector search demo?"
      onClose={() => {
        reset()
        onCancel()
      }}
      primaryAction={{
        text: 'Stop demo',
        onClick: () => {
          onConfirm({ rating, comment: comment.trim() })
          reset()
        },
      }}
      secondaryActions={[
        {
          text: 'Cancel',
          onClick: () => {
            reset()
            onCancel()
          },
        },
      ]}
    >
      <Box.Flex flexDirection="column" gap="5">
        <Typography.Default>
          The demo stops and its shortcuts leave the Overview. Your OpenSearch service keeps running.
        </Typography.Default>

        <Box>
          <Typography.DefaultStrong color="intense">Kept on your service for now</Typography.DefaultStrong>
          <Box component="ul" style={{ margin: '6px 0 0', paddingLeft: 20, listStyle: 'disc' }}>
            <li>
              <Typography.Small>
                Index <strong>{DEMO_RESOURCES.indexName}</strong>
                {plan ? ` · ${formatCount(plan.chunks)} chunks, ~${formatBytes(plan.storageBytes)}` : ''}
              </Typography.Small>
            </li>
            <li>
              <Typography.Small>
                Ingest pipeline <strong>{DEMO_RESOURCES.pipelineName}</strong>
              </Typography.Small>
            </li>
            <li>
              <Typography.Small>{dataLine}</Typography.Small>
            </li>
          </Box>
          <Box paddingTop="2">
            <Typography.Small color="muted">
              They still use disk space. You can delete the index later from Indexes.
            </Typography.Small>
          </Box>
        </Box>

        <Box.Flex flexDirection="column" gap="3">
          <Typography.DefaultStrong color="intense">How useful was the demo?</Typography.DefaultStrong>
          <ChoiceChipGroup
            name="demo-rating"
            selectionMode="radio"
            dense
            value={rating ?? ''}
            onChange={(value: string) => setRating(value)}
          >
            {RATINGS.map((item) => (
              <ChoiceChip key={item} value={item}>
                {item}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
          <Textarea
            labelText="What would make it more useful? (optional)"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Box.Flex>
      </Box.Flex>
    </Modal>
  )
}

StopDemoModal.displayName = 'StopDemoModal'
