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
      name: 'Card',
      usage: 'Build-target cards (Data service / Application) and service picker cards',
      storybookUrl: aquariumStorybookLinks.Card,
    },
    { name: 'Section', usage: 'Service summary and Aiven Runtime sidebar', storybookUrl: aquariumStorybookLinks.Section },
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
      reason: 'Onboarding with three left sections: Basic details, build target, then service or repository',
    },
    {
      name: 'BuildTargetCard',
      reason: 'Checkable Data service / Application cards modeled on CreateService TierCard',
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
      name: 'CreationFlowSection',
      reason: 'Reused Service creation section divider (icon + vertical connector)',
    },
    {
      name: 'OnboardingTestEnvShell',
      reason: 'Onboarding chrome: logo, skip, help, avatar, footer',
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
    'Copy of experiments/elena/onboarding-v2 — layout variant only.',
    'Choice chips replaced with checkable Card.Group cards, matching service-creation Tier cards.',
    'Left column order: Basic details → What would you like to build? → Select service or Connect repository.',
    'Connect GitHub on the Application path navigates to AivenRuntimePage.',
  ],
}
