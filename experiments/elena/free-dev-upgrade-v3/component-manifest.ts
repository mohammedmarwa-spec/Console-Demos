import type { ComponentManifest } from '@/lib/experiments/types'
import { projectServicesScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...projectServicesScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "free-dev-upgrade-v3".',
    'Map describes shared ProjectServices (src/screens); UpgradeServiceModalV2 with Hobbyist and Startup-4 plans.',
  ],
}
