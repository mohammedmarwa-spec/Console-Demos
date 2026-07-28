import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this template.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell and content layout containers',
    },
    {
      name: 'Navigation',
      usage: 'Project sidebar navigation',
      storybookUrl:
        'https://aquarium-library.aiven.io/?path=/docs/navigation-navigation--docs',
    },
    {
      name: 'PageHeader',
      usage: 'Services title, breadcrumbs, and Create service action',
    },
    {
      name: 'Breadcrumbs',
      usage: 'Org / Projects / project / Services path',
    },
    {
      name: 'InputBase',
      usage: 'Service search field',
    },
    {
      name: 'Filter',
      usage: 'Filter trigger (simplified in v1)',
    },
    {
      name: 'Switch',
      usage: 'Show only services with alerts toggle',
    },
    {
      name: 'DataTable',
      usage: 'Services list table',
    },
    {
      name: 'Link',
      usage: 'Service name links in the Service column',
    },
    {
      name: 'Typography',
      usage: 'Service type captions and plan details',
    },
    {
      name: 'StatusChip',
      usage: 'Service status and nodes chips (via shared helpers)',
    },
    {
      name: 'DropdownMenu',
      usage: 'Row Action menu (Power off / Delete stubs)',
    },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason:
        'Shared shell rebuilt to match production HeadingPanel IA (org nav, Tools/Projects menus, profile cluster)',
    },
    {
      name: 'ProjectSidebar',
      reason:
        'Shared shell rebuilt to match production ProjectNavItems (Services, Agents, Event log, App Builder, Settings)',
    },
    {
      name: 'ServicesListContent',
      reason: 'Template page body: header, toolbar, and services DataTable',
    },
  ],

  notes: [
    'Mirrors Console ServiceList + ServiceListTable column set (Service, Nodes, Plan, Cloud, Created, Action).',
    'ConsoleHeader and ProjectSidebar are shared src/components aligned to aiven-core-ui-reference (visual IA only; no Redux/permissions).',
    'Projects popover and Organization selector use shell mock data (no real links/routes).',
    'Filter panel and empty state are deferred to polish.',
  ],
}
