'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScenario } from '../../scenarios'
import { getInitialPathForScenario } from '../../lib/navigation'

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
  const { activeScenarioId, setScenario } = useScenario()

  useEffect(() => {
    if (activeScenarioId !== scenarioId) {
      setScenario(scenarioId)
    }
    const path = getInitialPathForScenario(scenarioId)
    router.replace(`${path}?scenario=${encodeURIComponent(scenarioId)}`)
  }, [scenarioId, activeScenarioId, setScenario, router])

  return null
}

ExperimentPageShell.displayName = 'ExperimentPageShell'
