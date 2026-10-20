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

export function VectorDemoSetupCard({
  onGenerate,
  stopped = false,
  pending = false,
}: {
  onGenerate: () => void
  stopped?: boolean
  /** Service isn't running yet: same card, Generate demo disabled. */
  pending?: boolean
}) {
  return (
    <IllustratedCardFrame>
      <CardIllustration
        chip={pending ? <StatusChip dense status="info" text="Pending till service created" /> : null}
      />
      <Box.Flex flexDirection="column" alignItems="flex-start" gap="5" padding="5" component="section">
        <Box.Flex flexDirection="column" gap="2">
          <Typography.DefaultStrong color="intense">Try the RAG demo</Typography.DefaultStrong>
          <Typography.Small color="muted">
            {pending
              ? 'Start it here once the service is running.'
              : stopped
                ? `Demo deleted. The ${DEMO_RESOURCES.indexName} index stays on the service.`
                : 'Ask questions about sample data or your own files.'}
          </Typography.Small>
        </Box.Flex>
        <Button.Ghost
          dense
          type="button"
          icon={arrowRight}
          iconPlacement="right"
          disabled={pending}
          onClick={onGenerate}
        >
          Generate demo
        </Button.Ghost>
      </Box.Flex>
    </IllustratedCardFrame>
  )
}

function IllustratedCardFrame({ children }: { children: ReactNode }) {
  return (
    <Box.Flex
      flexDirection="column"
      borderRadius={6}
      borderWidth={1}
      borderColor="muted"
      height="full"
      style={{ overflow: 'hidden' }}
    >
      {children}
    </Box.Flex>
  )
}

/** Card image area. `dimmed` greys the image out while the demo is not usable yet. */
function CardIllustration({ chip, dimmed = false }: { chip?: ReactNode; dimmed?: boolean }) {
  return (
    <Box.Flex
      backgroundColor="primary-active"
      justifyContent="center"
      alignItems="center"
      paddingY="3"
      grow={1}
      style={{ minHeight: 136, position: 'relative' }}
    >
      {chip ? <Box style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>{chip}</Box> : null}
      <img
        src={imageSrc(vectorDemoCardImg)}
        alt=""
        style={{
          height: 168,
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          display: 'block',
          opacity: dimmed ? 0.4 : 1,
          filter: dimmed ? 'grayscale(1)' : undefined,
        }}
      />
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
  statusInfoText?: string
  body: ReactNode
  actions: ReactNode
  fill: boolean
}) {
  return (
    <Box.Flex
      flexDirection="column"
      backgroundColor="body"
      borderColor="muted"
      borderWidth={1}
      borderRadius={2}
      height={fill ? 'full' : undefined}
    >
      <Box.Flex
        paddingX="5"
        paddingTop="4"
        paddingBottom="3"
        justifyContent="space-between"
        alignItems="center"
        gap="3"
      >
        <Box.Flex alignItems="center" gap="3">
          <Typography.DefaultStrong>RAG demo</Typography.DefaultStrong>
          <StatusChip status={chipStatus} text={statusText} dense />
        </Box.Flex>
        {statusInfoText ? <Typography.Small color="muted">{statusInfoText}</Typography.Small> : null}
      </Box.Flex>
      <Box paddingX="5" paddingBottom="4">
        {body}
      </Box>
      <Box.Flex
        paddingX="5"
        paddingBottom="4"
        gap="4"
        alignItems="center"
        flexWrap="wrap"
        style={{ marginTop: 'auto' }}
      >
        {actions}
      </Box.Flex>
    </Box.Flex>
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

  if (status === 'ready' && !detailed) {
    return (
      <IllustratedCardFrame>
        <CardIllustration chip={<StatusChip dense status="success" text="Ready" />} />
        <Box.Flex flexDirection="column" alignItems="flex-start" gap="4" padding="5" component="section">
          <Box.Flex flexDirection="column" gap="2">
            <Typography.DefaultStrong color="intense">RAG demo</Typography.DefaultStrong>
            <Typography.Small color="default">
              {sourceLabel(source)} is indexed. Ask questions and compare keyword, semantic, and hybrid results.
            </Typography.Small>
          </Box.Flex>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, width: '100%' }}>
            <Stat label="Index" value={DEMO_RESOURCES.indexName} />
            <Stat label={source.kind === 'upload' ? 'Files' : 'Documents'} value={formatCount(plan.documents)} />
            <Stat label="Chunks" value={formatCount(plan.chunks)} />
            <Stat label="Storage" value={`~${formatBytes(plan.storageBytes)}`} />
          </Box>
          <Button dense type="button" onClick={onSearch}>
            Search data
          </Button>
        </Box.Flex>
      </IllustratedCardFrame>
    )
  }

  if (status === 'ready') {
    return (
      <StatusCardWrapper
        fill={!detailed}
        chipStatus="success"
        statusText="Ready"
        body={
          <Box.Flex flexDirection="column" gap="4">
            <Typography.Small color="muted">
              {sourceLabel(source)} is indexed. Ask questions and compare keyword, semantic, and hybrid results.
            </Typography.Small>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <Stat label="Index" value={DEMO_RESOURCES.indexName} />
              <Stat label={source.kind === 'upload' ? 'Files' : 'Documents'} value={formatCount(plan.documents)} />
              <Stat label="Chunks" value={formatCount(plan.chunks)} />
              <Stat label="Storage" value={`~${formatBytes(plan.storageBytes)}`} />
            </Box>
          </Box.Flex>
        }
        actions={
          <Button dense type="button" onClick={onSearch}>
            Search data
          </Button>
        }
      />
    )
  }

  if (status === 'preparing' && !detailed) {
    return (
      <IllustratedCardFrame>
        <CardIllustration dimmed chip={<StatusChip dense status="info" text="Setting up" />} />
        <Box.Flex flexDirection="column" alignItems="flex-start" gap="5" padding="5" component="section">
          <Box.Flex flexDirection="column" gap="2" width="full">
            <Typography.DefaultStrong color="intense">Setting up the RAG demo</Typography.DefaultStrong>
            <Typography.Small color="muted">{currentStageSummary(source, plan, progress, stageIndex)}</Typography.Small>
            <ProgressBar
              dense
              value={overall}
              min={0}
              max={100}
              progresStatus="info"
              completedStatus="success"
              aria-label="Demo setup progress"
            />
          </Box.Flex>
          <Button.Ghost dense type="button" icon={arrowRight} iconPlacement="right" onClick={onOpen}>
            View progress
          </Button.Ghost>
        </Box.Flex>
      </IllustratedCardFrame>
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
            <ProgressBar
              dense
              value={overall}
              min={0}
              max={100}
              progresStatus="info"
              completedStatus="success"
              aria-label="Demo setup progress"
            />
          )}
          {detailed ? (
            <PrepStageList
              source={source}
              plan={plan}
              progress={progress}
              stageIndex={stageIndex}
              failed={failed}
              showBar={false}
            />
          ) : null}
        </Box.Flex>
      }
      actions={
        <>
          <Button.Secondary dense type="button" onClick={onOpen}>
            View progress
          </Button.Secondary>
          {failed ? (
            <Button.Ghost dense type="button" onClick={onStop}>
              Delete demo
            </Button.Ghost>
          ) : null}
        </>
      }
    />
  )
}
