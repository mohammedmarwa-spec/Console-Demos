import { useEffect, useState, type CSSProperties } from 'react'
import { Box, ProgressBar, Typography } from '@aivenio/aquarium'
import { ServiceIcon } from '../../components/ServiceIcon'
import {
  OnboardingPanelPage,
  OnboardingPanelTitle,
  PG_LOADING_STEPS,
  PlaygroundPanelShadow,
  type LoadingStep,
  type LoadingStepStatus,
} from './playgroundShared'

export type PlaygroundLoadingProps = {
  onComplete: () => void
}

function stepIndicatorStyle(status: LoadingStepStatus): CSSProperties {
  if (status === 'done') {
    return {
      width: 18,
      height: 18,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--aquarium-background-color-success-graphic)',
      color: 'var(--aquarium-text-color-opposite-default)',
      fontSize: 11,
      flexShrink: 0,
    }
  }
  if (status === 'active') {
    return {
      width: 18,
      height: 18,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
      color: 'var(--aquarium-text-color-opposite-default)',
      fontSize: 11,
      fontWeight: 600,
      flexShrink: 0,
    }
  }
  return {
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--aquarium-background-color-muted)',
    color: 'var(--aquarium-text-color-muted)',
    fontSize: 11,
    flexShrink: 0,
  }
}

function LoadingStepRow({ step, index }: { step: LoadingStep; index: number }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Box aria-hidden style={stepIndicatorStyle(step.status)}>
        {step.status === 'done' ? '✓' : index + 1}
      </Box>
      <Box component="span">
        <Typography.Small color={step.status === 'active' ? undefined : 'muted'}>{step.label}</Typography.Small>
      </Box>
    </Box>
  )
}

LoadingStepRow.displayName = 'LoadingStepRow'

export function PlaygroundLoading({ onComplete }: PlaygroundLoadingProps) {
  const [progress, setProgress] = useState(38)
  const [steps, setSteps] = useState<LoadingStep[]>(PG_LOADING_STEPS)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return Math.min(100, p + 4)
      })
    }, 400)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress < 55) {
      setSteps(PG_LOADING_STEPS)
    } else if (progress < 80) {
      setSteps([
        { id: '1', label: 'Initializing PostgreSQL sandbox', status: 'done' },
        { id: '2', label: 'Loading sample dataset', status: 'done' },
        { id: '3', label: 'Building indexes & seeding rows', status: 'active' },
        { id: '4', label: 'Warming up the query engine', status: 'pending' },
      ])
    } else if (progress < 100) {
      setSteps([
        { id: '1', label: 'Initializing PostgreSQL sandbox', status: 'done' },
        { id: '2', label: 'Loading sample dataset', status: 'done' },
        { id: '3', label: 'Building indexes & seeding rows', status: 'done' },
        { id: '4', label: 'Warming up the query engine', status: 'active' },
      ])
    } else {
      setSteps([
        { id: '1', label: 'Initializing PostgreSQL sandbox', status: 'done' },
        { id: '2', label: 'Loading sample dataset', status: 'done' },
        { id: '3', label: 'Building indexes & seeding rows', status: 'done' },
        { id: '4', label: 'Warming up the query engine', status: 'done' },
      ])
      const t = window.setTimeout(onComplete, 600)
      return () => window.clearTimeout(t)
    }
  }, [progress, onComplete])

  return (
    <OnboardingPanelPage>
      <style>{`
        .playground-loading-progress [role="progressbar"] {
          background-color: var(--aquarium-background-color-primary-graphic) !important;
        }
      `}</style>
      <PlaygroundPanelShadow>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            width: '100%',
            padding: '40px 24px',
          }}
        >
        <Box
          aria-hidden
          style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--aquarium-background-color-muted)',
          }}
        >
          <ServiceIcon serviceTypeId="postgresql" size={52} alt="" />
        </Box>

        <Box style={{ textAlign: 'center' }}>
          <OnboardingPanelTitle>Creating your PG free service with pre-loaded data</OnboardingPanelTitle>
        </Box>

        <Box className="playground-loading-progress" style={{ width: '100%', paddingTop: 8 }}>
          <ProgressBar
            value={progress}
            max={100}
            startLabel="Loading sample dataset…"
            endLabel={`${progress}%`}
          />
        </Box>

        <Box style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
          {steps.map((step, index) => (
            <LoadingStepRow key={step.id} step={step} index={index} />
          ))}
        </Box>
        </Box>
      </PlaygroundPanelShadow>
    </OnboardingPanelPage>
  )
}

PlaygroundLoading.displayName = 'PlaygroundLoading'
