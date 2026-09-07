'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
import { usePlaygroundState } from '@/contexts/PlaygroundStateContext'
import { OnboardingApps } from './OnboardingApps'

export const pageMeta: PageMeta = {
  title: 'Onboarding + apps',
  description:
    'Onboarding with service vs application choice, Aiven Runtime summary, and mocked Deploy from GitHub auth modal.',
}

export default function Page() {
  useEnsureScenario('onboarding-test-env')
  const {
    consoleContext,
    navigateToServices,
    handleTestEnvCreate,
    openCreationModal,
  } = usePlaygroundState()

  return (
    <OnboardingApps
      userInitials={consoleContext.userInitials}
      defaultProjectName={consoleContext.projectName}
      onSkip={navigateToServices}
      onCreate={handleTestEnvCreate}
      onCustomizePlan={openCreationModal}
    />
  )
}
