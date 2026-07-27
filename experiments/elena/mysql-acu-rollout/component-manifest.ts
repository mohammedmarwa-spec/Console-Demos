import type { ComponentManifest } from '@/lib/experiments/types'
import { projectServicesScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...projectServicesScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "mysql-acu-rollout".',
    'Map describes shared ProjectServices (src/screens); opens MysqlAcuRolloutModal on load.',
  ],
}
