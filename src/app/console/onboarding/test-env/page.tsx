'use client'

import { OnboardingTestEnv } from '../../../../screens/playground'
import { usePlaygroundState } from '../../../../contexts/PlaygroundStateContext'

export default function TestEnvOnboardingPage() {
  const {
    consoleContext,
    navigateToServices,
    handleTestEnvCreate,
    openCreationModal,
  } = usePlaygroundState()

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
