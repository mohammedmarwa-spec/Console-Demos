import type { ComponentType } from 'react'
import type { PlaygroundEntry } from './types'

// Experiments register here via explicit imports.
import caioownershiptest from '../experiments/caio/ownership-test/prototype.config'
import { OwnershipTestEnvPage } from '../experiments/caio/ownership-test/experimentView'
// Run: node scripts/create-experiment.mjs --owner <name> --name <slug> --from <scenarioId>

import elenaShorterCreateService from '../experiments/elena/shorter-create-service/prototype.config'

export const EXPERIMENT_ENTRIES: PlaygroundEntry[] = [
  caioownershiptest,
  elenaShorterCreateService,
]

/** Optional full-page overrides for experiments (keeps UI in experiment folders). */
export const EXPERIMENT_VIEWS: Record<string, ComponentType> = {
  [caioownershiptest.id]: OwnershipTestEnvPage,
}
