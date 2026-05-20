import { useState } from 'react'
import { useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'
import { OnboardingWelcome, type OnboardingStartChoice } from './OnboardingWelcome'
import { PlaygroundHub } from './PlaygroundHub'
import { PlaygroundLoading } from './PlaygroundLoading'
import { PlaygroundSandboxModal, type SandboxDataChoice } from './PlaygroundSandboxModal'
import { PlaygroundShell } from './PlaygroundShell'
import type { PlaygroundDemo } from './playgroundShared'

export type PlaygroundOnboardingProps = {
  onBackToSetup: () => void
  onSetUpProject: () => void
  onSkipToProjectDashboard: () => void
  /** After sample data finishes loading — open PG Studio with preloaded ecommerce schema. */
  onPlaygroundSampleReady: () => void
}

type Phase = 'welcome' | 'hub' | 'loading'

export function PlaygroundOnboarding({
  onSetUpProject,
  onSkipToProjectDashboard,
  onPlaygroundSampleReady,
}: PlaygroundOnboardingProps) {
  const addToast = useToast()
  const [phase, setPhase] = useState<Phase>('welcome')
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false)

  function handleDemoClick(demo: PlaygroundDemo) {
    if (demo.opensSandboxModal) {
      setSandboxModalOpen(true)
      return
    }
    addToast({
      message: `${demo.title} sandbox coming soon`,
      duration: 3000,
      position: 'top-right',
    })
  }

  function handleWelcomeContinue(choice: OnboardingStartChoice, _config: { projectName: string; region: string }) {
    if (choice === 'playground') {
      setPhase('hub')
      return
    }
    onSetUpProject()
  }

  function handleSandboxConfirm(choice: SandboxDataChoice) {
    setSandboxModalOpen(false)
    if (choice === 'sample') {
      setPhase('loading')
      return
    }
    addToast({
      message: 'Migrate your data will be available in a future release',
      icon: tickIcon,
      duration: 4000,
      position: 'top-right',
    })
  }

  return (
    <PlaygroundShell>
      {phase === 'welcome' ? (
        <OnboardingWelcome onContinue={handleWelcomeContinue} />
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
