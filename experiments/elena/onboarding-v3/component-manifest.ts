import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page and summary layout', storybookUrl: aquariumStorybookLinks.Box },
    { name: 'Typography', usage: 'Heading, section titles, and helper copy', storybookUrl: aquariumStorybookLinks.Typography },
    {
      name: 'StatusChip',
      usage: 'Trial credits banner, plan chips, Read-only access on Connect repository',
      storybookUrl: aquariumStorybookLinks.StatusChip,
    },
    { name: 'Input', usage: 'Project name and service name', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'Select', usage: 'Location field', storybookUrl: aquariumStorybookLinks.Select },
    {
      name: 'ChoiceChip',
      usage: 'Data service / Application toggle',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/inputs-choicechip--docs',
    },
    { name: 'Card', usage: 'Service picker cards', storybookUrl: aquariumStorybookLinks.Card },
    { name: 'Section', usage: 'Service summary and Aiven Runtime sidebar price', storybookUrl: aquariumStorybookLinks.Section },
    {
      name: 'Alert',
      usage: 'Repository readiness tip under deploy path cards',
      storybookUrl: aquariumStorybookLinks.Alert,
    },
    {
      name: 'Link',
      usage: 'Clone repo with example apps external link',
      storybookUrl: aquariumStorybookLinks.Link,
    },
    { name: 'Button', usage: 'Connect GitHub, Create service', storybookUrl: aquariumStorybookLinks.Button },
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
      reason: 'Copy of onboarding-v2 with How it works under Application',
    },
    {
      name: 'DeployPathCard',
      reason: 'Connect repository / Start with example app path cards',
    },
    {
      name: 'HowItWorksSection',
      reason: 'How it works stepper rendered in the Application main column',
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
      reason: 'How it works steps under Application path',
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
      reason: 'Service-type icons on picker cards and Connect data services step',
    },
    {
      name: 'CloudProviderIcon',
      reason: 'Google Cloud logo on trial plan preview',
    },
  ],
  notes: [
    'Copy of experiments/elena/onboarding-v2 — layout variant only.',
    'How it works lives under the Application path (main column), not in the Runtime sidebar.',
    'Aiven Runtime sidebar shows monthly price, then Connect GitHub and Copy repo CTAs stacked below.',
    'Connect GitHub navigates to AivenRuntimePage; GitHub modal opens from Runtime Deploy application.',
  ],
}
