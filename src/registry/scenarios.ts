import type { PlaygroundEntry } from './types'

// ─── Reusable scenarios (stable team starting points) ───────────────────────

const REUSABLE: PlaygroundEntry[] = [
  {
    id: 'onboarding-test-env',
    title: 'Create test environment',
    description: 'Full-page onboarding — project setup, service picker, summary sidebar',
    category: 'onboarding',
    type: 'reusable-scenario',
    status: 'active',
    owner: 'Elena',
    reusable: true,
    tags: ['onboarding', 'service-create', 'new-user'],
    route: '/console/onboarding/test-env?scenario=onboarding-test-env',
    runtimeKey: 'onboarding-test-env',
  },
  {
    id: 'empty-state',
    title: 'Empty project',
    description: 'No services exist yet — ideal for empty states and first-time flows',
    category: 'service-creation',
    type: 'reusable-scenario',
    status: 'active',
    owner: 'Elena',
    reusable: true,
    tags: ['empty-state', 'first-time-user', 'service-create'],
    route: '/console/project/services?scenario=empty-state',
    runtimeKey: 'empty-state',
  },
  {
    id: 'existing-customer',
    title: 'Existing customer',
    description: 'Project with one MySQL service — lightweight starting point for service overview',
    category: 'existing-customers',
    type: 'reusable-scenario',
    status: 'active',
    owner: 'Elena',
    reusable: true,
    tags: ['existing-customer', 'services', 'mysql'],
    route: '/console/project/services?scenario=existing-customer',
    runtimeKey: 'existing-customer',
  },
  {
    id: 'many-services',
    title: 'Project services: mixed pricing',
    description: 'Pre-populated with 50+ services across types and pricing models',
    category: 'existing-customers',
    type: 'reusable-scenario',
    status: 'active',
    owner: 'Elena',
    reusable: true,
    tags: ['existing-customer', 'dense-fixture', 'mixed-pricing'],
    route: '/console/project/services?scenario=many-services',
    runtimeKey: 'many-services',
  },
]

export const REUSABLE_SCENARIOS = REUSABLE
