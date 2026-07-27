import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 * Update when Aquarium or prototype UI usage changes.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Onboarding layout containers and form rows',
    },
    {
      name: 'Typography',
      usage: 'Headings, labels, and helper copy',
    },
    {
      name: 'Card',
      usage: 'Service picker and checkable option cards',
    },
    {
      name: 'StatusChip',
      usage: 'Service / plan status labels on option cards',
    },
    {
      name: 'InlineIcon',
      usage: 'Inline info icons beside helper text',
    },
    {
      name: 'Tooltip',
      usage: 'Plan and cloud setting explanations',
    },
    {
      name: 'Input',
      usage: 'Service name and project name fields',
    },
    {
      name: 'Select',
      usage: 'Location / region selection',
    },
    {
      name: 'Section',
      usage: 'Collapsed advanced plan and cloud settings',
    },
    {
      name: 'Button',
      usage: 'Skip, create, and customize-plan actions',
    },
  ],

  prototypeComponents: [
    {
      name: 'ShortOnboarding',
      reason:
        'Experiment-specific create-test-env flow with advanced settings collapsed by default',
    },
  ],

  notes: [
    'Custom onboarding UI in this folder; scenario context still comes from onboarding-test-env via useEnsureScenario.',
    'Wraps experiments/_shared OnboardingTestEnvShell, ServiceIcon, and CloudProviderIcon — not listed as Aquarium.',
    'Shared playground helpers used by the shell live outside this experiment folder.',
  ],
}
