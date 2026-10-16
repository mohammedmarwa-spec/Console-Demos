'use client'

import { useState } from 'react'
import { Box, Modal, SegmentedControl, SegmentedControlGroup, Stepper, Typography } from '@aivenio/aquarium'
import { ChooseDataStep, IndexingStep, ReviewStep } from './DemoSetup'
import { PreparingData } from './PreparingData'
import { DEMO_CHUNK_SIZE_ID, draftToSource, type DemoStep } from './ragDemo'
import type { VectorDemo } from './useVectorDemo'

/** Prototype-only switch between the two setup flows being compared. */
type SetupFlow = 'predefined' | 'chunk-choice'

const STEPS: Record<SetupFlow, { id: DemoStep; label: string }[]> = {
  predefined: [
    { id: 'choose-data', label: 'Choose data' },
    { id: 'review', label: 'Review' },
    { id: 'processing', label: 'Generate' },
  ],
  'chunk-choice': [
    { id: 'choose-data', label: 'Choose data' },
    { id: 'configure', label: 'Indexing' },
    { id: 'review', label: 'Review' },
    { id: 'processing', label: 'Generate' },
  ],
}

type Action = { text: string; onClick: () => void; disabled?: boolean; loading?: boolean }

/**
 * Generate-demo flow as an Aquarium `Modal` with a dense `Stepper` in the body.
 * Each action has a per-step `actionKey`, so a label reused across steps never keeps the same button.
 * State stays on the service shell, so closing the modal does not lose progress.
 */
export function VectorSearchDemoWizard({
  open,
  onClose,
  demo,
  onViewDemo,
}: {
  open: boolean
  onClose: () => void
  demo: VectorDemo
  onViewDemo: () => void
}) {
  const { setStep, draft, setDraft, source, plan, status } = demo
  const [flow, setFlow] = useState<SetupFlow>('predefined')
  const steps = STEPS[flow]
  const chunkSizeChosen = flow === 'chunk-choice'
  const step: DemoStep = !chunkSizeChosen && demo.step === 'configure' ? 'choose-data' : demo.step
  const draftSource = draftToSource(draft)
  const preparing = status === 'preparing'
  const ready = status === 'ready'
  const stepIndex = steps.findIndex((item) => item.id === step)

  function changeFlow(next: SetupFlow) {
    setFlow(next)
    setDraft({ ...draft, chunkSizeId: DEMO_CHUNK_SIZE_ID })
    setStep('choose-data')
  }

  let next: Action
  let back: Action | undefined
  let body = null

  switch (step) {
    case 'choose-data':
      next = chunkSizeChosen
        ? { text: 'Next', onClick: () => setStep('configure'), disabled: !draftSource }
        : { text: 'Continue to review', onClick: () => setStep('review'), disabled: !draftSource }
      body = <ChooseDataStep draft={draft} onDraftChange={setDraft} />
      break
    case 'configure':
      next = { text: 'Continue to review', onClick: () => setStep('review'), disabled: !draftSource }
      back = { text: 'Back', onClick: () => setStep('choose-data') }
      body = <IndexingStep draft={draft} onDraftChange={setDraft} />
      break
    case 'review':
      next = {
        text: 'Generate demo',
        disabled: !draftSource,
        onClick: () => {
          if (draftSource) demo.start(draftSource)
        },
      }
      back = { text: 'Back', onClick: () => setStep(chunkSizeChosen ? 'configure' : 'choose-data') }
      body = <ReviewStep draft={draft} chunkSizeChosen={chunkSizeChosen} />
      break
    default:
      next = { text: 'View demo', onClick: onViewDemo, disabled: !ready, loading: preparing }
      back =
        status === 'failed'
          ? { text: 'Back to review', onClick: demo.cancelSetup }
          : ready
            ? undefined
            : { text: 'Continue in background', onClick: onClose }
      body =
        source && plan ? (
          <PreparingData
            source={source}
            plan={plan}
            progress={demo.progress}
            stageIndex={demo.stageIndex}
            failedStage={demo.failedStage}
            ready={ready}
            onRetry={demo.retry}
          />
        ) : null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate RAG demo"
      primaryAction={{ ...next, actionKey: `${step}-next` }}
      secondaryActions={[
        { text: 'Cancel', onClick: onClose, actionKey: `${step}-cancel` },
        ...(back ? [{ ...back, actionKey: `${step}-back` }] : []),
      ]}
    >
      <Box.Flex flexDirection="column" gap="6" paddingBottom="4">
        {step === 'processing' ? null : (
          <Box.Flex alignItems="center" gap="3" flexWrap="wrap">
            <Typography.Small color="muted">Prototype flow</Typography.Small>
            <SegmentedControlGroup value={flow} onChange={changeFlow} ariaLabel="Prototype setup flow">
              <SegmentedControl value="predefined">A · Predefined chunking</SegmentedControl>
              <SegmentedControl value="chunk-choice">B · Choose chunk size</SegmentedControl>
            </SegmentedControlGroup>
          </Box.Flex>
        )}
        <Stepper dense activeIndex={ready ? steps.length : stepIndex}>
          {steps.map((item) => (
            <Stepper.Step key={item.id}>{item.label}</Stepper.Step>
          ))}
        </Stepper>
        {body}
      </Box.Flex>
    </Modal>
  )
}

VectorSearchDemoWizard.displayName = 'VectorSearchDemoWizard'
