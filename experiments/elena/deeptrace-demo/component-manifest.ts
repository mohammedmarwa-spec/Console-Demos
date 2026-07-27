import type { ComponentManifest } from '@/lib/experiments/types'
import { serviceOverviewScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...serviceOverviewScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "deeptrace-demo".',
    'Map describes shared ServiceOverview (src/screens); initial sidebar item is Logs.',
  ],
}
