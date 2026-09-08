import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page and summary layout', storybookUrl: aquariumStorybookLinks.Box },
    { name: 'Typography', usage: 'Heading, section titles, and helper copy', storybookUrl: aquariumStorybookLinks.Typography },
    {
      name: 'StatusChip',
      usage: 'Trial credits banner, Free / Startup-4, GitHub Connected',
      storybookUrl: aquariumStorybookLinks.StatusChip,
    },
    { name: 'Input', usage: 'Project name and service name', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'Select', usage: 'Location field', storybookUrl: aquariumStorybookLinks.Select },
    {
      name: 'ChoiceChip',
      usage: 'Create a data service / Deploy an application toggle',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/inputs-choicechip--docs',
    },
    { name: 'Card', usage: 'Service picker cards', storybookUrl: aquariumStorybookLinks.Card },
    { name: 'Section', usage: 'Service summary and Aiven Runtime sidebar', storybookUrl: aquariumStorybookLinks.Section },
    { name: 'Button', usage: 'Skip, GitHub connect, create service', storybookUrl: aquariumStorybookLinks.Button },
    { name: 'Divider', usage: 'Plan and cost card separators', storybookUrl: aquariumStorybookLinks.Divider },
    { name: 'Icon', usage: 'Plan detail and GitHub / Aiven connection graphic', storybookUrl: aquariumStorybookLinks.Icon },
    {
      name: 'Modal',
      usage: 'Deploy from GitHub auth modal (mock)',
      storybookUrl: aquariumStorybookLinks.Modal,
    },
    {
      name: 'EmptyState',
      usage: 'Connect your GitHub account empty state inside modal',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-emptystate--docs',
    },
  ],
  prototypeComponents: [
    {
      name: 'OnboardingApps',
      reason: 'Experiment screen matching Figma onboarding + apps layout',
    },
    {
      name: 'ConnectGitHubModal',
      reason: 'Mock of Console ScanApplicationSourceModal empty VCS flow',
    },
    {
      name: 'RuntimeVerticalStepper',
      reason: 'Vertical non-dense Aquarium Stepper states (numbered / completed tick)',
    },
    {
      name: 'CreationFlowSection',
      reason: 'Reused Service creation section divider (icon + vertical connector)',
    },
    {
      name: 'OnboardingTestEnvShell',
      reason: 'Onboarding chrome: logo, skip, help, avatar, footer',
    },
    {
      name: 'ServiceIcon',
      reason: 'Service-type icons on picker cards and Runtime example stacks',
    },
    {
      name: 'CloudProviderIcon',
      reason: 'Google Cloud logo on trial plan preview',
    },
  ],
  notes: [
    'Custom UI in experiments/elena/onboarding-v2 — not the shared OnboardingTestEnv launcher.',
    'Summary CTAs (Create service / Connect GitHub) sit under the sidebar Section, not inside it.',
    'GitHub modal mirrors Console SelectSourceEmptyState (connect → waiting → success).',
  ],
}
