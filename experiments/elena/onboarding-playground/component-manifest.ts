import type { ComponentManifest } from '@/lib/experiments/types'
import { playgroundOnboardingScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...playgroundOnboardingScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "onboarding-playground".',
    'Map describes shared playground onboarding screens (src/screens/playground).',
  ],
}
