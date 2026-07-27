import type { ComponentManifest } from '@/lib/experiments/types'
import { onboardingTestEnvScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...onboardingTestEnvScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "onboarding-test-env".',
    'Map describes shared OnboardingTestEnv (src/screens/playground). Canonical onboarding template — expand this manifest when adding custom UI after fork.',
  ],
}
