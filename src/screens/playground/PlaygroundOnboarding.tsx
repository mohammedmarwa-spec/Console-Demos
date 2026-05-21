import { useState } from 'react'
import { useToast } from '@aivenio/aquarium'
import { BrowseServices } from './BrowseServices'
import { showPlaygroundToast } from './showPlaygroundToast'
import type { BrowseServiceId } from './browseServicesCatalog'
import { OnboardingWelcome, type OnboardingStartChoice } from './OnboardingWelcome'
import { PlaygroundHub } from './PlaygroundHub'
import { PlaygroundLoading } from './PlaygroundLoading'
import { PlaygroundSandboxModal, type SandboxDataChoice } from './PlaygroundSandboxModal'
import { PlaygroundShell } from './PlaygroundShell'
import type { PlaygroundDemo } from './playgroundShared'

export type PlaygroundOnboardingProps = {
  onBackToSetup: () => void
  onSkipToProjectDashboard: () => void
  /** After sample data finishes loading — open PG Studio with preloaded ecommerce schema. */
  onPlaygroundSampleReady: () => void
  /** User picked services from the browse catalog (I'll choose myself). */
  onBrowseServicesContinue: (selected: BrowseServiceId[]) => void
}

type Phase = 'welcome' | 'hub' | 'loading' | 'browse'

export function PlaygroundOnboarding({
  onSkipToProjectDashboard,
  onPlaygroundSampleReady,
  onBrowseServicesContinue,
}: PlaygroundOnboardingProps) {
  const addToast = useToast()
  const [phase, setPhase] = useState<Phase>('welcome')
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false)

  function handleDemoClick(demo: PlaygroundDemo) {
    if (demo.opensSandboxModal) {
      setSandboxModalOpen(true)
      return
    }
    showPlaygroundToast(addToast, `${demo.title} sandbox coming soon`, {
      duration: 3000,
      icon: undefined,
    })
  }

  function handleWelcomeContinue(choice: OnboardingStartChoice, _config: { projectName: string; region: string }) {
    if (choice === 'playground') {
      setPhase('hub')
      return
    }
    setPhase('browse')
  }

  function handleSandboxConfirm(choice: SandboxDataChoice) {
    setSandboxModalOpen(false)
    if (choice === 'sample') {
      setPhase('loading')
      return
    }
    showPlaygroundToast(addToast, 'Migrate your data will be available in a future release')
  }

  return (
    <PlaygroundShell>
      {phase === 'welcome' ? (
        <OnboardingWelcome onContinue={handleWelcomeContinue} />
      ) : phase === 'browse' ? (
        <BrowseServices
          onBack={() => setPhase('welcome')}
          onContinue={(selected) => onBrowseServicesContinue(selected)}
        />
      ) : phase === 'loading' ? (
        <PlaygroundLoading onComplete={onPlaygroundSampleReady} />
      ) : (
        <PlaygroundHub
          onBackToSetup={() => setPhase('welcome')}
          onDemoClick={handleDemoClick}
          onSkipToProjectDashboard={onSkipToProjectDashboard}
        />
      )}
      <PlaygroundSandboxModal
        open={sandboxModalOpen}
        onClose={() => setSandboxModalOpen(false)}
        onConfirm={handleSandboxConfirm}
      />
    </PlaygroundShell>
  )
}

PlaygroundOnboarding.displayName = 'PlaygroundOnboarding'
