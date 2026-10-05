'use client'

import { Box, Modal, Stepper } from '@aivenio/aquarium'
import { ChooseDataStep, ConfigureStep, ReviewStep } from './DemoSetup'
import { PreparingData } from './PreparingData'
import { draftToSource, type DemoStep } from './ragDemo'
import type { VectorDemo } from './useVectorDemo'

const STEPS: { id: DemoStep; label: string }[] = [
  { id: 'choose-data', label: 'Choose data' },
  { id: 'configure', label: 'Configure' },
  { id: 'review', label: 'Review' },
  { id: 'processing', label: 'Prepare' },
]

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
  const { step, setStep, draft, setDraft, source, plan, status } = demo
  const draftSource = draftToSource(draft)
  const preparing = status === 'preparing'
  const ready = status === 'ready'
  const stepIndex = STEPS.findIndex((item) => item.id === step)

  let next: Action
  let back: Action | undefined
  let body = null

  switch (step) {
    case 'choose-data':
      next = { text: 'Next', onClick: () => setStep('configure'), disabled: !draft.selection }
      body = <ChooseDataStep draft={draft} onDraftChange={setDraft} />
      break
    case 'configure':
      next = { text: 'Next', onClick: () => setStep('review'), disabled: !draftSource }
      back = { text: 'Back', onClick: () => setStep('choose-data') }
      body = <ConfigureStep draft={draft} onDraftChange={setDraft} />
      break
    case 'review':
      next = {
        text: 'Generate demo',
        disabled: !draftSource,
        onClick: () => {
          if (draftSource) demo.start(draftSource)
        },
      }
      back = { text: 'Back', onClick: () => setStep('configure') }
      body = (
        <ReviewStep
          draft={draft}
          onEditData={() => setStep('choose-data')}
          onEditConfiguration={() => setStep('configure')}
        />
      )
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
      title="Generate vector search demo"
      primaryAction={{ ...next, actionKey: `${step}-next` }}
      secondaryActions={[
        { text: 'Cancel', onClick: onClose, actionKey: `${step}-cancel` },
        ...(back ? [{ ...back, actionKey: `${step}-back` }] : []),
      ]}
    >
      <Box.Flex flexDirection="column" gap="6" paddingBottom="4">
        <Stepper dense activeIndex={ready ? STEPS.length : stepIndex}>
          {STEPS.map((item) => (
            <Stepper.Step key={item.id}>{item.label}</Stepper.Step>
          ))}
        </Stepper>
        {body}
      </Box.Flex>
    </Modal>
  )
}

VectorSearchDemoWizard.displayName = 'VectorSearchDemoWizard'
