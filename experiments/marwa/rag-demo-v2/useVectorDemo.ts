'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  INITIAL_DEMO_DRAFT,
  PREP_STAGES,
  planFor,
  shouldFailAt,
  stageTotal,
  type DemoDataSource,
  type DemoDraft,
  type DemoPlan,
  type DemoStep,
  type DemoView,
  type PrepStageId,
  type SearchMode,
} from './ragDemo'

export type DemoStatus = 'idle' | 'preparing' | 'failed' | 'ready' | 'stopped'

export type DemoFeedback = { rating: string | null; comment: string }

const TICK_MS = 150
const TICKS_PER_STAGE = 22
const FAIL_RATIO = 0.42

/**
 * Demo state lives on the service shell, not in the modal, so setup keeps running
 * when the stepper is closed and the Overview / sidebar can show progress.
 */
export function useVectorDemo() {
  const [status, setStatus] = useState<DemoStatus>('idle')
  const [step, setStep] = useState<DemoStep>('choose-data')
  const [draft, setDraft] = useState<DemoDraft>(INITIAL_DEMO_DRAFT)
  const [source, setSource] = useState<DemoDataSource | null>(null)
  const [progress, setProgress] = useState<number[]>(() => PREP_STAGES.map(() => 0))
  const [stageIndex, setStageIndex] = useState(0)
  const [failedOnce, setFailedOnce] = useState(false)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('semantic')
  const [view, setView] = useState<DemoView>('query')
  const [feedback, setFeedback] = useState<DemoFeedback | null>(null)

  const plan: DemoPlan | null = useMemo(() => (source ? planFor(source) : null), [source])

  useEffect(() => {
    if (status !== 'preparing' || !source || !plan) return undefined
    const stage = PREP_STAGES[stageIndex]
    const total = stageTotal(stage, plan)
    const failStage = failedOnce ? null : shouldFailAt(source)
    const increment = Math.max(1, Math.ceil(total / TICKS_PER_STAGE))

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const done = current[stageIndex]
        const next = Math.min(total, done + increment)
        if (failStage === stage && next >= total * FAIL_RATIO) {
          window.clearInterval(timer)
          setFailedOnce(true)
          setStatus('failed')
          return current.map((value, index) => (index === stageIndex ? Math.floor(total * FAIL_RATIO) : value))
        }
        if (next >= total) {
          window.clearInterval(timer)
          if (stageIndex < PREP_STAGES.length - 1) {
            setStageIndex(stageIndex + 1)
          } else {
            setStatus('ready')
          }
        }
        return current.map((value, index) => (index === stageIndex ? next : value))
      })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [failedOnce, plan, source, stageIndex, status])

  const start = useCallback((next: DemoDataSource) => {
    setSource(next)
    setProgress(PREP_STAGES.map(() => 0))
    setStageIndex(0)
    setFailedOnce(false)
    setQuery('')
    setMode('semantic')
    setView('query')
    setStatus('preparing')
    setStep('processing')
  }, [])

  /** Resumes from the stage that failed; earlier stages stay complete. */
  const retry = useCallback(() => setStatus('preparing'), [])

  const cancelSetup = useCallback(() => {
    setStatus('idle')
    setSource(null)
    setStep('review')
  }, [])

  const stop = useCallback((nextFeedback: DemoFeedback) => {
    setFeedback(nextFeedback)
    setStatus('stopped')
    setStep('choose-data')
    setDraft(INITIAL_DEMO_DRAFT)
  }, [])

  const openAt = useCallback((next: DemoStep) => setStep(next), [])

  const failedStage: PrepStageId | null = status === 'failed' ? PREP_STAGES[stageIndex] : null
  const active = status === 'preparing' || status === 'failed' || status === 'ready'

  return {
    status,
    active,
    step,
    setStep: openAt,
    draft,
    setDraft,
    source,
    plan,
    progress,
    stageIndex,
    failedStage,
    query,
    setQuery,
    mode,
    setMode,
    view,
    setView,
    feedback,
    start,
    retry,
    cancelSetup,
    stop,
  }
}

export type VectorDemo = ReturnType<typeof useVectorDemo>
