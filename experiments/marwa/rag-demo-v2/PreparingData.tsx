'use client'

import { Alert, Box } from '@aivenio/aquarium'
import { StepWrapper } from './StepWrapper'
import { PrepStageList } from './PrepStageList'
import {
  DEMO_RESOURCES,
  formatCount,
  sourceLabel,
  stageLabel,
  type DemoDataSource,
  type DemoPlan,
  type PrepStageId,
} from './ragDemo'

/**
 * Step 4, the last step of the modal — named stages with counts. Runs on the shell,
 * so the user can close the stepper and follow progress on the Overview. Retry
 * resumes the failed stage. When ready it waits for the user to choose View demo.
 */
export function PreparingData({
  source,
  plan,
  progress,
  stageIndex,
  failedStage,
  ready,
  onRetry,
}: {
  source: DemoDataSource
  plan: DemoPlan
  progress: number[]
  stageIndex: number
  failedStage: PrepStageId | null
  ready: boolean
  onRetry: () => void
}) {
  return (
    <StepWrapper
      description={
        ready
          ? `${sourceLabel(source)} is chunked, embedded, and indexed.`
          : `Chunking, embedding, and indexing ${sourceLabel(source)}. You can close this window — setup keeps running and progress shows on the service Overview.`
      }
    >
      <Box.Flex flexDirection="column" gap="5">
        {ready ? (
          <Alert type="success" title="Your demo is ready">
            {formatCount(plan.chunks)} chunks are indexed in {DEMO_RESOURCES.indexName}. Select View demo to
            start searching your data.
          </Alert>
        ) : null}
        {failedStage ? (
          <Alert
            type="error"
            title={`${stageLabel(failedStage, source)} failed`}
            action={{ text: `Retry ${stageLabel(failedStage, source).toLowerCase()}`, onClick: onRetry }}
          >
            Amazon Bedrock didn’t return embeddings for some chunks. Earlier stages are complete —
            Retry picks up from this stage.
          </Alert>
        ) : null}
        <PrepStageList
          source={source}
          plan={plan}
          progress={progress}
          stageIndex={stageIndex}
          failed={Boolean(failedStage)}
        />
      </Box.Flex>
    </StepWrapper>
  )
}

PreparingData.displayName = 'PreparingData'
