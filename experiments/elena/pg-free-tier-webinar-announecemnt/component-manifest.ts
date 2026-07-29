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
      usage: 'Page and content layout containers',
    },
    {
      name: 'Alert.Banner',
      usage:
        'Full-width information webinar promo under ConsoleHeader (shell-level, Console AppHeader pattern)',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/story/feedback-alert--banner',
    },
    {
      name: 'Navigation',
      usage: 'Service sidebar with submenu groups',
      storybookUrl:
        'https://aquarium-library.aiven.io/?path=/docs/navigation-navigation--docs#navigation-with-submenus',
    },
    {
      name: 'Icon',
      usage: 'Sidebar and overview action / status icons',
    },
    {
      name: 'Typography',
      usage: 'Headings, body copy, and muted helper text',
    },
    {
      name: 'PageHeader',
      usage: 'Service title, chips, and primary actions',
    },
    {
      name: 'Breadcrumbs',
      usage: 'Org / project / service path in the page header',
    },
    {
      name: 'StatusChip',
      usage: 'Version, EOL, and status labels in the header and sections',
    },
    {
      name: 'DropdownMenu',
      usage: 'Service and section overflow / contextual actions',
    },
    {
      name: 'Banner',
      usage: 'Free-tier upgrade callout under the service PageHeader',
    },
    {
      name: 'Section',
      usage: 'Overview content blocks (connections, usage, gates)',
    },
    {
      name: 'Link',
      usage: 'Connection values and “Learn more” links',
    },
    {
      name: 'Button',
      usage: 'Connection-row icons and gated free-tier actions',
    },
    {
      name: 'LineChart',
      usage: 'CPU usage chart in the plan usage section',
    },
  ],

  prototypeComponents: [
    {
      name: 'FreeTierServiceSidebar',
      reason: 'Experiment-specific service nav wiring and free-tier item set',
    },
    {
      name: 'OverviewContent',
      reason:
        'DOM-capsule facsimile of free-tier overview layout, upgrade Banner, connection rows, and gated sections',
    },
  ],

  notes: [
    'Experiment explores an in-product webinar promo on the free-tier PG overview using Aquarium Alert.Banner (information).',
    'Alert.Banner sits under ConsoleHeader at shell level (same placement as Console BannerContainer under HeadingPanel).',
    'Register uses Alert.Banner’s built-in action slot (Ghost / Link.Button.Ghost per Storybook).',
    'Upgrade Banner remains in OverviewContent under PageHeader so plan upsell stays in-page.',
    'Shared playground helpers (e.g. ServiceStatusChip, NodesCountChip, ConsoleHeader) are used but live outside this experiment folder.',
  ],
}
