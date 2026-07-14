'use client'

import { usePlaygroundState } from '@/contexts/PlaygroundStateContext'
import { OwnershipTestEnv } from './OwnershipTestEnv'

export default function OwnershipTestEnvPage() {
  const {
    consoleContext,
    navigateToServices,
    handleTestEnvCreate,
    openCreationModal,
  } = usePlaygroundState()

  return (
    <OwnershipTestEnv
      userInitials={consoleContext.userInitials}
      defaultProjectName={consoleContext.projectName}
      onSkip={navigateToServices}
      onCreate={handleTestEnvCreate}
      onCustomizePlan={openCreationModal}
    />
  )
}
