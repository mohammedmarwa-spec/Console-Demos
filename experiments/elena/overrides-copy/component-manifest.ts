import type { ComponentManifest } from '@/lib/experiments/types'
import { onboardingTestEnvScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...onboardingTestEnvScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "onboarding-test-env".',
    'Map describes shared OnboardingTestEnv (src/screens/playground), not this folder.',
  ],
}
