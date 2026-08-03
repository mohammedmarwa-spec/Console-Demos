import type { ComponentManifest } from '@/lib/experiments/types'
import { onboardingTestEnvScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...onboardingTestEnvScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "onboarding-test-env".',
    'Forked from onboarding-starter template — map describes shared OnboardingTestEnv (src/screens/playground).',
    'Expand this manifest when adding custom Aquarium or prototype UI in this folder.',
  ],
}
