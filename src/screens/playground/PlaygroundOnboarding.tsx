import { useState } from 'react'
import { useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'
import { OnboardingWelcome } from './OnboardingWelcome'
import { PlaygroundHub } from './PlaygroundHub'
import { PlaygroundLoading } from './PlaygroundLoading'
import { PlaygroundSandboxModal, type SandboxDataChoice } from './PlaygroundSandboxModal'
import { PlaygroundShell } from './PlaygroundShell'
import type { PlaygroundDemo } from './playgroundShared'

export type PlaygroundOnboardingProps = {
  onBackToSetup: () => void
  onSetUpProject: () => void
  /** After loading completes — e.g. open demo or project services. */
  onPlaygroundReady: () => void
}

type Phase = 'welcome' | 'hub' | 'loading'

export function PlaygroundOnboarding({ onSetUpProject, onPlaygroundReady }: PlaygroundOnboardingProps) {
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

  function handleSandboxConfirm(choice: SandboxDataChoice) {
    setSandboxModalOpen(false)
    if (choice === 'sample') {
      setPhase('loading')
      return
    }
    addToast({
      message: 'Load your data will be available in a future release',
      icon: tickIcon,
      duration: 4000,
      position: 'top-right',
    })
  }

  return (
    <PlaygroundShell>
      {phase === 'welcome' ? (
        <OnboardingWelcome
          onOpenPlayground={() => setPhase('hub')}
          onBrowseServices={onSetUpProject}
        />
      ) : phase === 'loading' ? (
        <PlaygroundLoading onComplete={onPlaygroundReady} />
      ) : (
        <PlaygroundHub
          onBackToSetup={() => setPhase('welcome')}
          onSetUpProject={onSetUpProject}
          onDemoClick={handleDemoClick}
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
