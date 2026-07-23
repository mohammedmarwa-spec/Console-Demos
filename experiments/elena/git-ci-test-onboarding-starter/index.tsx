'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
import { usePlaygroundState } from '@/contexts/PlaygroundStateContext'
import { ShortOnboarding } from './ShortOnboarding'

export const pageMeta: PageMeta = {
  title: 'Git CI test — shorter onboarding',
  description:
    'Fork of Onboarding starter: advanced plan/cloud settings collapsed by default to validate the create-experiment scaffold flow.',
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
    <ShortOnboarding
      userInitials={consoleContext.userInitials}
      defaultProjectName={consoleContext.projectName}
      onSkip={navigateToServices}
      onCreate={handleTestEnvCreate}
      onCustomizePlan={openCreationModal}
    />
  )
}
