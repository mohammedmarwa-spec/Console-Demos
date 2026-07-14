'use client'

import { useToast } from '@aivenio/aquarium'
import { PlaygroundOnboarding, showPlaygroundToast } from '../../../../screens/playground'
import { usePlaygroundState } from '../../../../contexts/PlaygroundStateContext'

export default function PlaygroundOnboardingPage() {
  const addToast = useToast()
  const {
    navigateToOrg,
    navigateToServices,
    openCreationModal,
    handlePlaygroundSampleReady,
  } = usePlaygroundState()

  return (
    <PlaygroundOnboarding
      onBackToSetup={navigateToOrg}
      onBrowseServicesContinue={(selected) => {
        navigateToServices()
        if (selected.length === 1) {
          openCreationModal(selected[0])
          return
        }
        showPlaygroundToast(
          addToast,
          `${selected.length} services selected — create them from the Services page`,
        )
      }}
      onSkipToProjectDashboard={navigateToServices}
      onPlaygroundSampleReady={handlePlaygroundSampleReady}
    />
  )
}
