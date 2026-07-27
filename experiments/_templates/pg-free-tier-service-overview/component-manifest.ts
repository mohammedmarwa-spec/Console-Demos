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
      usage: 'Free-tier upgrade callout under the page header',
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
        'DOM-capsule facsimile of free-tier overview layout, connection rows, and gated sections',
    },
  ],

  notes: [
    'This experiment uses Aquarium components where possible for the free-tier service overview facsimile.',
    'Connection row actions and free-tier gates are custom prototype layout; StatusChip/Button cover the interactive primitives.',
    'Shared playground helpers (e.g. ServiceStatusChip, NodesCountChip, ConsoleHeader) are used but live outside this experiment folder.',
  ],
}
