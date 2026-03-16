import { useState } from 'react'
import type { ReactNode } from 'react'
import { Modal, Stepper } from '@aivenio/aquarium'

// Light-blue placeholder banner matching Figma's Primary/10 (#E3E9FF) fill
const BANNER_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240" viewBox="0 0 600 240"><rect width="600" height="240" fill="#e3e9ff"/></svg>`
)}`

type StepContent = {
  primaryLabel: string
  items: ReactNode[]
}

const STEP_CONTENTS: StepContent[] = [
  // ── Step 1: Overview ──────────────────────────────────────────────────────
  {
    primaryLabel: 'Next',
    items: [
      <><strong>Simple service tiers:</strong>{' '}service configuration is now grouped into Free, Developer, and Professional tiers for easier comparison</>,
      <><strong>Familial compute types:</strong>{' '}select resource ratio to match your workload</>,
      <><strong>Fine-grained configuration:</strong>{' '}flexible compute and storage options</>,
    ],
  },
  // ── Step 2: Compute and storage ───────────────────────────────────────────
  {
    primaryLabel: 'Next',
    items: [
      <>New compute types: choose from <strong>Balanced</strong>, <strong>Storage-optimised</strong>, and <strong>Memory-optimised</strong> options designed for different workload needs</>,
      <>Configurable storage: <strong>local storage</strong> for low latency, <strong>SSD-backed volumes</strong> for high performance, or <strong>Block storage</strong> for scalable and durable capacity</>,
    ],
  },
  // ── Step 3: Pay as you go ─────────────────────────────────────────────────
  {
    primaryLabel: 'Create MySQL',
    items: [
      <>Pay only for the resources your service uses, with clear visibility into <strong>compute, storage, and networking costs</strong></>,
      <>Built for modern workloads. The pricing model supports dynamic scaling and evolving usage patterns, helping you <strong>optimize performance and cost</strong> from day one</>,
    ],
  },
]

type MysqlAcuRolloutModalProps = {
  open: boolean
  onClose: () => void
  onCreateService: () => void
}

export function MysqlAcuRolloutModal({ open, onClose, onCreateService }: MysqlAcuRolloutModalProps) {
  const [step, setStep] = useState(0)

  const { primaryLabel, items } = STEP_CONTENTS[step]
  const isLast = step === STEP_CONTENTS.length - 1

  function handlePrimary() {
    if (isLast) {
      setStep(0)
      onCreateService()
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleClose() {
    setStep(0)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title="New configuration and pricing for MySQL"
      primaryAction={{ text: primaryLabel, onClick: handlePrimary }}
      secondaryActions={[
        { text: 'Exit onboarding', onClick: handleClose },
        ...(step > 0 ? [{ text: 'Back', onClick: () => setStep((s) => s - 1) }] : []),
      ]}
    >
      {/* 1 — Stepper at top of content area */}
      <div style={{ fontSize: 14 }}>
        <Stepper activeIndex={step} dense>
          <Stepper.Step>Overview</Stepper.Step>
          <Stepper.Step>Compute and storage</Stepper.Step>
          <Stepper.Step>Pay as you go</Stepper.Step>
        </Stepper>
      </div>

      {/* 2 — Banner image: wrapper bleeds edge-to-edge by negating px-7 (28px) body padding.
           Block-level div with negative margins auto-expands to modal inner width without
           overflow, so the img inside at width:100% fills perfectly with no gaps. */}
      <div
        style={{
          marginLeft: -28,
          marginRight: -28,
          marginTop: 16,
          overflow: 'hidden',
        }}
      >
        <img
          src={BANNER_SRC}
          alt=""
          aria-hidden="true"
          style={{
            display: 'block',
            width: '100%',
            height: 240,
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 3 — Bullet list: minHeight locks the modal to the tallest step's size */}
      <ol
        style={{
          margin: 0,
          marginTop: 24,
          padding: 0,
          minHeight: 150,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {items.map((item, i) => (
          <li
            key={`${step}-${i}`}
            style={{
              color: 'var(--aquarium-text-color-default)',
              fontSize: 16,
              lineHeight: '24px',
            }}
          >
            {item}
          </li>
        ))}
      </ol>
    </Modal>
  )
}

MysqlAcuRolloutModal.displayName = 'MysqlAcuRolloutModal'
