import type { PlaygroundEntry } from '../../../registry/types'

const config: PlaygroundEntry = {
  id: 'experiment/caio/ownership-test',
  title: 'Workspace ownership in test env',
  description: 'Explicit personal vs org workspace choice during test environment onboarding',
  category: 'onboarding',
  type: 'prototype',
  status: 'rough',
  owner: 'Caio',
  reusable: false,
  tags: ['onboarding', 'ownership', 'experiment'],
  route: '/experiments/caio/ownership-test',
  runtimeKey: 'onboarding-test-env',
  sourceScenarioId: 'onboarding-test-env',
}

export default config
