'use client'

import { useEffect, useState } from 'react'
import { Alert, Box, Button, EmptyState, ProgressBar, Stepper } from '@aivenio/aquarium'
import type { DemoDataSource } from './ragDemo'

function sourceLabel(source: DemoDataSource): string {
  return source.kind === 'template' ? source.title : source.fileName
}

function shouldFail(source: DemoDataSource): boolean {
  return source.kind === 'upload' && source.fileName.toLowerCase().includes('fail')
}

/**
 * Screen 4 — preparing / ingesting wait. Auto-advances on success. Fail → Retry.
 */
export function PreparingData({
  source,
  onComplete,
  onBack,
}: {
  source: DemoDataSource
  onComplete: () => void
  onBack: () => void
}) {
  const [value, setValue] = useState(0)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (failed) return undefined
    setValue(0)
    const failAt = shouldFail(source) && attempt === 0 ? 42 : null
    const timer = window.setInterval(() => {
      setValue((current) => {
        if (failAt !== null && current >= failAt) {
          window.clearInterval(timer)
          setFailed(true)
          return failAt
        }
        if (current >= 100) {
          window.clearInterval(timer)
          return 100
        }
        return Math.min(100, current + 4)
      })
    }, 80)
    return () => window.clearInterval(timer)
  }, [attempt, failed, source])

  useEffect(() => {
    if (value < 100 || failed) return undefined
    const done = window.setTimeout(() => onComplete(), 400)
    return () => window.clearTimeout(done)
  }, [failed, onComplete, value])

  function handleRetry() {
    setFailed(false)
    setValue(0)
    setAttempt((current) => current + 1)
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Stepper activeIndex={1}>
        <Stepper.Step>Choose data</Stepper.Step>
        <Stepper.Step>Prepare</Stepper.Step>
        <Stepper.Step>Search</Stepper.Step>
      </Stepper>

      {failed ? (
        <Alert
          type="error"
          title="Couldn’t prepare your data"
          action={{ text: 'Retry', onClick: handleRetry }}
        >
          Something went wrong while indexing {sourceLabel(source)}. Retry to try again, or go back
          and pick a different source.
        </Alert>
      ) : (
        <EmptyState title="Preparing your data…" fullHeight={false}>
          Embedding and indexing {sourceLabel(source)}. This usually takes a few seconds in the demo.
        </EmptyState>
      )}

      <ProgressBar
        value={value}
        min={0}
        max={100}
        progresStatus={failed ? 'warning' : 'info'}
        completedStatus={failed ? 'error' : 'success'}
        startLabel="Preparing your data"
        endLabel={failed ? 'Failed' : `${value}%`}
      />

      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button.Ghost type="button" onClick={onBack}>
          Back
        </Button.Ghost>
      </Box>
    </Box>
  )
}

PreparingData.displayName = 'PreparingData'
