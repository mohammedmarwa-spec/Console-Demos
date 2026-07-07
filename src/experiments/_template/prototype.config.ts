import type { PlaygroundEntry } from '../../registry/types'

const TEMPLATE: PlaygroundEntry = {
  id: 'experiment/OWNER/SLUG',
  title: 'Experiment title',
  description: 'What this experiment tests',
  category: 'onboarding',
  type: 'prototype',
  status: 'rough',
  owner: 'Your name',
  reusable: false,
  tags: ['experiment'],
  route: '?scenario=experiment/OWNER/SLUG',
  runtimeKey: 'SOURCE_SCENARIO_ID',
  sourceScenarioId: 'SOURCE_SCENARIO_ID',
}

export default TEMPLATE
