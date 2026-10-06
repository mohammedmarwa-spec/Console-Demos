'use client'

import type { ReactNode } from 'react'
import { Alert, Box, Button, ProgressBar, StatusChip, Typography } from '@aivenio/aquarium'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import { imageSrc } from '@/lib/image'
import vectorDemoCardImg from './assets/vector-demo-card.svg'
import { PrepStageList, currentStageSummary } from './PrepStageList'
import { formatBytes } from './DemoSetup'
import { DEMO_RESOURCES, PREP_STAGES, formatCount, sourceLabel, stageLabel, stageTotal } from './ragDemo'
import type { VectorDemo } from './useVectorDemo'

/**
 * Port of Console's `KafkaStartStreamCardWrapper` / `KafkaDataGeneratorSetupCard`:
 * illustration on `primary-active`, DefaultStrong title, Small description, ghost CTA.
 */
export function VectorDemoSetupCard({ onGenerate, stopped = false }: { onGenerate: () => void; stopped?: boolean }) {
  return (
    <Box.Flex flexDirection="column" borderRadius={6} borderWidth={1} borderColor="muted" height="full" style={{ overflowY: 'hidden' }}>
      <Box backgroundColor="primary-active">
        <img src={imageSrc(vectorDemoCardImg)} alt="Vector search demo" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </Box>
      <Box.Flex
        flexDirection="column"
        paddingX="l2"
        paddingTop="l2"
        paddingBottom="5"
        alignItems="flex-start"
        justifyContent="space-between"
        height="full"
        gap="3"
        component="section"
      >
        <Box>
          <Typography.DefaultStrong color="intense">Try the vector search demo</Typography.DefaultStrong>
          <Typography.Small>
            {stopped
              ? `Demo stopped. Its index ${DEMO_RESOURCES.indexName} is still on the service — generate a new demo any time.`
              : 'Search sample data or your own .txt files with keyword, semantic, and hybrid queries.'}
          </Typography.Small>
        </Box>
        <Button.Ghost dense type="button" icon={arrowRight} iconPlacement="right" onClick={onGenerate}>
          Generate demo
        </Button.Ghost>
      </Box.Flex>
    </Box.Flex>
  )
}

/** Port of Console's `KafkaDataGeneratorCardWrapper` (title + status chip, body, actions). */
function StatusCardWrapper({
  chipStatus,
  statusText,
  statusInfoText,
  body,
  actions,
  fill,
}: {
  chipStatus: 'info' | 'success' | 'danger'
  statusText: string
  statusInfoText: string
  body: ReactNode
  actions: ReactNode
  fill: boolean
}) {
  return (
    <Box backgroundColor="body" borderColor="muted" borderWidth={1} borderRadius={2} height={fill ? 'full' : undefined}>
      <Box.Flex paddingX="5" paddingTop="4" paddingBottom="3" justifyContent="space-between" alignItems="center" gap="3">
        <Box.Flex alignItems="center" gap="3">
          <Typography.DefaultStrong>Vector search demo</Typography.DefaultStrong>
          <StatusChip status={chipStatus} text={statusText} dense />
        </Box.Flex>
        <Typography.Small color="muted">{statusInfoText}</Typography.Small>
      </Box.Flex>
      <Box paddingX="5" paddingBottom="4">
        {body}
      </Box>
      <Box.Flex paddingX="5" paddingBottom="4" gap="4" alignItems="center" flexWrap="wrap">
        {actions}
      </Box.Flex>
    </Box>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ minWidth: 0 }}>
      <Typography.Caption color="muted">{label}</Typography.Caption>
      <Typography.SmallStrong color="intense">{value}</Typography.SmallStrong>
    </Box>
  )
}

/**
 * Overview / sidebar page status for a demo that is setting up, failed, or running
 * (Kafka Initializing / Error / Active cards). `detailed` always lists every stage.
 */
export function VectorDemoStatusCard({
  demo,
  detailed = false,
  onOpen,
  onSearch,
  onStop,
}: {
  demo: VectorDemo
  detailed?: boolean
  onOpen: () => void
  onSearch: () => void
  onStop: () => void
}) {
  const { source, plan, status, progress, stageIndex, failedStage } = demo
  if (!source || !plan) return null

  const overall = Math.round(
    (PREP_STAGES.reduce((sum, stage, index) => {
      const total = stageTotal(stage, plan)
      return sum + (total === 0 ? 1 : Math.min(1, (progress[index] ?? 0) / total))
    }, 0) /
      PREP_STAGES.length) *
      100,
  )

  if (status === 'ready') {
    return (
      <StatusCardWrapper
        fill={!detailed}
        chipStatus="success"
        statusText="Running"
        statusInfoText={sourceLabel(source)}
        body={
          <Box.Flex flexDirection="column" gap="4">
            <Typography.Small color="muted">
              Your data is indexed. Ask questions and compare keyword, semantic, and hybrid results.
            </Typography.Small>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
              <Stat label="Index" value={DEMO_RESOURCES.indexName} />
              <Stat label={source.kind === 'upload' ? 'Files' : 'Documents'} value={formatCount(plan.documents)} />
              <Stat label="Chunks" value={formatCount(plan.chunks)} />
              <Stat label="Storage" value={`~${formatBytes(plan.storageBytes)}`} />
            </Box>
          </Box.Flex>
        }
        actions={
          <>
            <Button dense type="button" onClick={onSearch}>
              Search your data
            </Button>
            <Button.Ghost dense type="button" onClick={onStop}>
              Stop demo
            </Button.Ghost>
          </>
        }
      />
    )
  }

  const failed = status === 'failed'
  return (
    <StatusCardWrapper
      fill={!detailed}
      chipStatus={failed ? 'danger' : 'info'}
      statusText={failed ? 'Error' : 'Setting up'}
      statusInfoText={failed && failedStage ? `${stageLabel(failedStage, source)} failed` : `${overall}%`}
      body={
        <Box.Flex flexDirection="column" gap="4">
          <Typography.Small color="muted">{currentStageSummary(source, plan, progress, stageIndex)}</Typography.Small>
          {failed && failedStage ? (
            <Alert
              type="error"
              action={{ text: `Retry ${stageLabel(failedStage, source).toLowerCase()}`, onClick: demo.retry }}
            >
              Amazon Bedrock didn’t return embeddings for some chunks. Earlier stages are complete.
            </Alert>
          ) : (
            <ProgressBar dense value={overall} min={0} max={100} progresStatus="info" completedStatus="success" aria-label="Demo setup progress" />
          )}
          {detailed ? (
            <PrepStageList source={source} plan={plan} progress={progress} stageIndex={stageIndex} failed={failed} showBar={false} />
          ) : null}
        </Box.Flex>
      }
      actions={
        <>
          <Button.Secondary dense type="button" onClick={onOpen}>
            View progress
          </Button.Secondary>
          <Button.Ghost dense type="button" onClick={onStop}>
            Stop demo
          </Button.Ghost>
        </>
      }
    />
  )
}
