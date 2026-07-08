'use client'

import { OnboardingTestEnv } from '../../../../screens/playground'
import { usePlaygroundState } from '../../../../contexts/PlaygroundStateContext'
import { useScenario } from '../../../../scenarios'
import { EXPERIMENT_VIEWS } from '../../../../registry/experiments'

export default function TestEnvOnboardingPage() {
  const { activeScenarioId } = useScenario()
  const {
    consoleContext,
    navigateToServices,
    handleTestEnvCreate,
    openCreationModal,
  } = usePlaygroundState()

  const ExperimentView = activeScenarioId ? EXPERIMENT_VIEWS[activeScenarioId] : undefined
  if (ExperimentView) return <ExperimentView />

  return (
    <OnboardingTestEnv
      userInitials={consoleContext.userInitials}
      defaultProjectName={consoleContext.projectName}
      onSkip={navigateToServices}
      onCreate={handleTestEnvCreate}
      onCustomizePlan={openCreationModal}
    />
  )
}
