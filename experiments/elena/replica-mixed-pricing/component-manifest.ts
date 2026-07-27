import type { ComponentManifest } from '@/lib/experiments/types'
import { projectServicesScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...projectServicesScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "replica-mixed-pricing".',
    'Map describes shared ProjectServices (src/screens); replica mixed-pricing fixture list.',
  ],
}
