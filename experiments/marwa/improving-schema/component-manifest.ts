import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Service shell and schema toolbar', storybookUrl: aquariumStorybookLinks.Box },
    { name: 'PageHeader', usage: 'Schemas list and subject detail titles, breadcrumbs, and actions', storybookUrl: aquariumStorybookLinks.PageHeader },
    { name: 'Breadcrumbs', usage: 'Aiven / dev-sandbox / mirjam-dev-tier / Schemas / subject', storybookUrl: aquariumStorybookLinks.Breadcrumbs },
    { name: 'Typography', usage: 'Compatibility labels and empty search copy', storybookUrl: aquariumStorybookLinks.Typography },
    { name: 'Chip', usage: 'Apache Kafka version', storybookUrl: aquariumStorybookLinks.Chip },
    { name: 'StatusChip', usage: 'Running status, compatibility level, and soft deleted', storybookUrl: aquariumStorybookLinks.StatusChip },
    { name: 'Button', usage: 'Create subject and Add version are the page primaries. Compare schemas, Edit, and action menus are secondary or icon buttons.', storybookUrl: aquariumStorybookLinks.Button },
    { name: 'SearchInput', usage: 'Search subjects', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'DataTable', usage: 'Subject list and version list', storybookUrl: aquariumStorybookLinks.DataTable },
    { name: 'Link', usage: 'Subject name and version number', storybookUrl: aquariumStorybookLinks.Link },
    { name: 'DropdownMenu', usage: 'Subject, version, and service action menus', storybookUrl: aquariumStorybookLinks.DropdownMenu },
    { name: 'Dialog', usage: 'Delete subject and delete version confirmations' },
    { name: 'Modal', usage: 'Create subject, add version, compare, and compatibility', storybookUrl: aquariumStorybookLinks.Modal },
    { name: 'EmptyState', usage: 'No subjects yet' },
    { name: 'Input', usage: 'New subject name', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'Select', usage: 'Compatibility level and versions to compare', storybookUrl: aquariumStorybookLinks.Select },
    { name: 'Navigation', usage: 'Kafka service sidebar', storybookUrl: aquariumStorybookLinks.Navigation },
    { name: 'Icon', usage: 'Sidebar back mark', storybookUrl: aquariumStorybookLinks.Icon },
  ],
  prototypeComponents: [
    {
      name: 'KafkaSchemasSidebar',
      reason: 'Console Kafka service nav composed from Navigation. Schemas is the active item.',
    },
    {
      name: 'SchemasScreen',
      reason: 'Subject list and subject detail for this experiment. Navigation stays inside the experiment page.',
    },
  ],
  notes: [
    'Flat subject table plus a subject detail view for mirjam-dev-tier.',
    'Seed data has 32 subjects so the list paginates. metrics_data_gen-value has one version. orders-value has three, including one soft-deleted version.',
    'Dialog and EmptyState are Aquarium components. This manifest map has no Storybook URL for them.',
  ],
}
