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
      usage: 'Shell-level trial-ended banner under ConsoleHeader (information + Upgrade)',
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
      name: 'OneLineBanner',
      usage:
        'Webinar promo above the Upgrade Banner (title, Register action, dismiss) — Aquarium one-line banner with dismissable action',
      storybookUrl:
        'https://aquarium-library.aiven.io/?path=/docs/data-display-banner--docs#one-line-banner-with-dismissable-action',
    },
    {
      name: 'Banner',
      usage: 'Free-tier upgrade callout under the webinar OneLineBanner',
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
    'Explores OneLineBanner for an in-product webinar promo on the free-tier PG overview.',
    'Trial-ended Alert.Banner (information) stays at shell level under ConsoleHeader.',
    'Webinar OneLineBanner sits in OverviewContent above the Upgrade Banner (Register + onDismiss).',
    'Upgrade Banner remains under PageHeader so plan upsell stays in-page.',
    'Shared playground helpers (e.g. ServiceStatusChip, NodesCountChip, ConsoleHeader) are used but live outside this experiment folder.',
  ],
}
