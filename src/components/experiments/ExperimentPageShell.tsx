'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useScenario } from '../../scenarios'
import { getInitialPathForScenario } from '../../lib/navigation'
import {
  fromExperimentQuery,
  FROM_EXPERIMENT_PARAM,
} from '../../lib/experiments/fromExperiment'

/** Sets the active scenario if it isn't already, without navigating away. */
export function useEnsureScenario(scenarioId: string): void {
  const { activeScenarioId, setScenario } = useScenario()

  useEffect(() => {
    if (activeScenarioId !== scenarioId) {
      setScenario(scenarioId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, activeScenarioId, setScenario])
}

export type ExperimentPageShellProps = {
  /** Underlying console scenario id to launch (e.g. 'onboarding-test-env'). */
  scenarioId: string
}

/**
 * Default launcher for experiments that just reuse an existing console
 * scenario with no custom UI of their own: sets the scenario and redirects
 * into the matching console route. Experiments with a custom component tree
 * (e.g. rendering their own screens) should skip this and render directly.
 */
export function ExperimentPageShell({ scenarioId }: ExperimentPageShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { activeScenarioId, setScenario } = useScenario()

  useEffect(() => {
    if (activeScenarioId !== scenarioId) {
      setScenario(scenarioId)
    }
    const path = getInitialPathForScenario(scenarioId)
    const params = new URLSearchParams()
    params.set('scenario', scenarioId)
    const fromExperiment = fromExperimentQuery(pathname)
    if (fromExperiment) params.set(FROM_EXPERIMENT_PARAM, fromExperiment)
    router.replace(`${path}?${params.toString()}`)
  }, [scenarioId, activeScenarioId, setScenario, router, pathname])

  return null
}

ExperimentPageShell.displayName = 'ExperimentPageShell'
