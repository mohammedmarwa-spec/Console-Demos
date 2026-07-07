import type { PlaygroundEntry } from '../../../registry/types'

const config: PlaygroundEntry = {
  id: 'experiment/elena/shorter-create-service',
  title: 'Shorter create service flow',
  description: 'Advanced settings hidden by default — experiment from Create test environment',
  category: 'onboarding',
  type: 'prototype',
  status: 'rough',
  owner: 'Elena',
  reusable: false,
  tags: ['onboarding', 'service-create', 'experiment'],
  route: '/experiments/elena/shorter-create-service',
  runtimeKey: 'onboarding-test-env',
  sourceScenarioId: 'onboarding-test-env',
}

export default config
