import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page and summary layout', storybookUrl: aquariumStorybookLinks.Box },
    { name: 'Typography', usage: 'Heading, section titles, and helper copy', storybookUrl: aquariumStorybookLinks.Typography },
    {
      name: 'StatusChip',
      usage: 'Trial credits banner and plan chips',
      storybookUrl: aquariumStorybookLinks.StatusChip,
    },
    { name: 'Input', usage: 'Project name and service name', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'Select', usage: 'Location field', storybookUrl: aquariumStorybookLinks.Select },
    {
      name: 'ChoiceChip',
      usage: 'Data service / Application toggle',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/inputs-choicechip--docs',
    },
    { name: 'Skeleton', usage: 'Plan and price card placeholders while sections enter' },
    {
      name: 'Link',
      usage: 'Browse example apps external link',
      storybookUrl: aquariumStorybookLinks.Link,
    },
    { name: 'Button', usage: 'Connect GitHub, Go to Aiven Runtime, Create service', storybookUrl: aquariumStorybookLinks.Button },
    { name: 'Divider', usage: 'Plan and cost card separators', storybookUrl: aquariumStorybookLinks.Divider },
    { name: 'Icon', usage: 'Plan detail, section, and deploy path icons', storybookUrl: aquariumStorybookLinks.Icon },
    {
      name: 'Modal',
      usage: 'Deploy from GitHub auth modal (mock)',
      storybookUrl: aquariumStorybookLinks.Modal,
    },
    {
      name: 'EmptyState',
      usage: 'Runtime landing empty state and GitHub connect modal',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-emptystate--docs',
    },
    { name: 'PageHeader', usage: 'Runtime page title and breadcrumbs', storybookUrl: aquariumStorybookLinks.PageHeader },
    { name: 'Breadcrumbs', usage: 'Org / project / Runtime trail', storybookUrl: aquariumStorybookLinks.Breadcrumbs },
  ],
  prototypeComponents: [
    {
      name: 'OnboardingApps',
      reason: 'Single-column onboarding: Basic details first, then build target, then service or Runtime summary',
    },
    {
      name: 'DeployPathCard',
      reason: 'Connect repository / Start with example app path cards',
    },
    {
      name: 'AivenRuntimePage',
      reason: 'Console Runtime empty state with project sidebar after Connect GitHub',
    },
    {
      name: 'ProjectSidebar',
      reason: 'Project-level nav on Runtime (Applications active)',
    },
    {
      name: 'ConnectGitHubModal',
      reason: 'Mock of Console ScanApplicationSourceModal empty VCS flow',
    },
    {
      name: 'RuntimeVerticalStepper',
      reason: 'How it works steps in a box under Application path cards',
    },
    {
      name: 'AnimatedCreationFlowSection',
      reason: 'Local copy of CreationFlowSection with staggered enter and connector grow-from-icon',
    },
    {
      name: 'OnboardingTestEnvShell',
      reason: 'Onboarding chrome: logo, skip, help, avatar (Dev tools footer hidden in this experiment)',
    },
    {
      name: 'ServiceIcon',
      reason: 'Service-type icons on picker cards',
    },
    {
      name: 'CloudProviderIcon',
      reason: 'Google Cloud logo on trial plan preview',
    },
  ],
  notes: [
    'Entrance animation is 2× slower; plan and price show Aquarium Skeleton until the section has entered.',
    'Dev tools footer is hidden. Create service sits at the bottom. Service name is 50% width.',
    'Basic details is the first CreationFlowSection, then build target, then service summary.',
    'Application path uses the last section for Aiven Runtime price.',
    'How it works sits in a bordered box under the Connect repository / Start with example app cards.',
    'Connect GitHub on the Application path navigates to AivenRuntimePage.',
    'GitHub modal opens from Runtime Deploy application (connect → waiting → success).',
  ],
}
