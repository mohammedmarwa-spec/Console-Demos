import type { PlaygroundEntry } from './types'

// Experiments register here via explicit imports.
// Run: node scripts/create-experiment.mjs --owner <name> --name <slug> --from <scenarioId>

import elenaShorterCreateService from '../experiments/elena/shorter-create-service/prototype.config'

export const EXPERIMENT_ENTRIES: PlaygroundEntry[] = [
  elenaShorterCreateService,
]
