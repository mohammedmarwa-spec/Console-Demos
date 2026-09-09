'use client'

import { useState } from 'react'
import type { PageMeta } from '@/lib/experiments/types'
import { useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
import { usePlaygroundState } from '@/contexts/PlaygroundStateContext'
import { AivenRuntimePage } from './AivenRuntimePage'
import { OnboardingApps } from './OnboardingApps'

export const pageMeta: PageMeta = {
  title: 'Onboarding + apps (build target cards)',
  description:
    'Copy of onboarding-v2 with Basic details first, prominent Data service / Application cards instead of chips, and a third section for Select service or Connect repository.',
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
      onCustomizePlan={openCreationModal}
      onGoToRuntime={() => setView('runtime')}
    />
  )
}
