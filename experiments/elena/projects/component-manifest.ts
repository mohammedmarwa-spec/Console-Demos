import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 * Update when Aquarium or prototype UI usage changes.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, sidebar + content row, and project name row layout',
      storybookUrl: aquariumStorybookLinks.Box,
    },
    {
      name: 'Navigation',
      usage: 'Organization sidebar items via shared OrgSidebar',
      storybookUrl: aquariumStorybookLinks.Navigation,
    },
    {
      name: 'PageHeader',
      usage: 'Projects title, subtitle, and breadcrumbs',
      storybookUrl: aquariumStorybookLinks.PageHeader,
    },
    {
      name: 'Breadcrumbs',
      usage: 'Aiven / Projects path in the page header',
      storybookUrl: aquariumStorybookLinks.Breadcrumbs,
    },
    {
      name: 'SearchInput',
      usage: 'Filter projects by name or tags',
      storybookUrl: aquariumStorybookLinks.Input,
    },
    {
      name: 'DataList',
      usage: 'Organization projects table with collapsible unit groups',
      storybookUrl: aquariumStorybookLinks.DataList,
    },
    {
      name: 'InlineIcon',
      usage: 'Folder and organizational unit icons in the name column',
      storybookUrl: aquariumStorybookLinks.Icon,
    },
    {
      name: 'Typography',
      usage: 'Unit names and empty-group copy',
      storybookUrl: aquariumStorybookLinks.Typography,
    },
    {
      name: 'Link',
      usage: 'Project names in the list',
      storybookUrl: aquariumStorybookLinks.Link,
    },
    {
      name: 'ChipContainer',
      usage: 'Dense tag row in the Tags column',
      storybookUrl: aquariumStorybookLinks.Chip,
    },
    {
      name: 'StatusChip',
      usage: 'key : value project tags with tag icon',
      storybookUrl: aquariumStorybookLinks.StatusChip,
    },
    {
      name: 'EmptyState',
      usage: 'No matching projects after search',
    },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top nav with Projects context',
    },
    {
      name: 'OrgSidebar',
      reason: 'Shared organization sidebar — Projects active; Overview returns to org home',
    },
  ],

  notes: [
    'Custom-UI experiment for the organization Projects list.',
    'Grouped DataList follows Console OrganizationProjectsScreen: top-level projects plus collapsed units.',
    'Homepage versions navigate here from View all projects.',
    'OrgSidebar marks Projects as the active item; Overview routes to homepage-v1.',
  ],
}
