import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for the org Data flow Tools page.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page shell, filter row, canvas layout, service node layout' },
    { name: 'PageHeader', usage: 'Data flow title, subtitle, breadcrumbs' },
    { name: 'Breadcrumbs', usage: 'Org → Data flow trail' },
    { name: 'Alert', usage: 'Early availability announcement (Alert type=announcement)' },
    { name: 'Link', usage: 'Early availability docs link in the banner' },
    { name: 'Button', usage: 'Give feedback Button.Text; node details Button.Icon' },
    { name: 'Typography', usage: 'Service name on canvas nodes' },
    { name: 'StatusChip', usage: 'Running status + Nodes count chips on canvas nodes' },
    {
      name: 'Filter',
      usage: 'Filter.Trigger for Projects, Services, and Filter list',
    },
    {
      name: 'DropdownMenu',
      usage: 'Multi-select menus behind Projects and Services Filter.Triggers',
    },
    { name: 'Switch', usage: 'Show alerts + Show only connected services' },
    { name: 'Icon', usage: 'Warning icon on alert service nodes when Show alerts is on' },
    { name: 'Navigation', usage: 'OrgSidebar TOOLS → Data flow active item' },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared org chrome',
    },
    {
      name: 'OrgSidebar',
      reason: 'TOOLS → Data flow entry point',
    },
    {
      name: 'ArchitectureContent',
      reason: 'Reused node-UI canvas from Project Architecture (_shared/project-page)',
    },
    {
      name: 'ArchitectureServiceNode',
      reason:
        'Canvas card: service icon, name, NodesCountChip, Running StatusChip, details Button.Icon (Console Data flow layout)',
    },
    {
      name: 'NodesCountChip',
      reason: 'Nodes aggregate chip on service nodes',
    },
    {
      name: 'ReactFlow',
      reason: '@xyflow/react canvas — Aquarium has no Flow/Graph component',
    },
  ],

  notes: [
    'Org-level Data flow page opened from OrgSidebar Tools → Data flow.',
    'Reuses ArchitectureContent (showViewFilter=false) with Project Architecture mock graph.',
    'Service nodes match Console Data flow: icon + name; Nodes chip, status chip, info icon.',
    'Show only connected services maps to Architecture integrated view.',
    'Show alerts highlights hasAlerts nodes (kafka-events, opensearch-logs) with warning border + warningSign icon.',
  ],
}
