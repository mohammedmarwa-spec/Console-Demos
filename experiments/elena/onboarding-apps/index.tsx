'use client'

import { useState } from 'react'
import type { PageMeta } from '@/lib/experiments/types'
import { useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
import { usePlaygroundState } from '@/contexts/PlaygroundStateContext'
import { AivenRuntimePage } from './AivenRuntimePage'
import { OnboardingApps } from './OnboardingApps'

export const pageMeta: PageMeta = {
  title: 'Onboarding (Vertical sections)',
  description:
    'Working copy of Onboarding + apps for further exploration of the service vs application path, Runtime summary, and GitHub deploy flow.',
}

type ExperimentView = 'onboarding' | 'runtime'

export default function Page() {
  useEnsureScenario('onboarding-test-env')
  const {
    consoleContext,
    navigateToServices,
    handleTestEnvCreate,
    openCreationModal,
  } = usePlaygroundState()
  const [view, setView] = useState<ExperimentView>('onboarding')

  if (view === 'runtime') {
    return (
      <AivenRuntimePage
        orgName={consoleContext.orgName}
        projectName={consoleContext.projectName}
        userInitials={consoleContext.userInitials}
      />
    )
  }

  return (
    <OnboardingApps
      userInitials={consoleContext.userInitials}
      defaultProjectName={consoleContext.projectName}
      onSkip={navigateToServices}
      onCreate={handleTestEnvCreate}
      onCustomizePlan={(serviceTypeId) => openCreationModal(serviceTypeId, { returnToServiceType: false })}
      onGoToRuntime={() => setView('runtime')}
    />
  )
}
