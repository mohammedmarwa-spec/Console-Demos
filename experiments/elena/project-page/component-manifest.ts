import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Shell UI lives in experiments/_shared/project-page; this folder only supplies mock data.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page shell, sidebar/content split, KPI cards, Architecture node shells' },
    { name: 'Navigation', usage: 'Project sidebar sections and primary items' },
    { name: 'DropdownMenu', usage: 'Sidebar project selector and grouped Create CTA menu' },
    { name: 'Badge', usage: 'Solutions NEW label in the sidebar' },
    { name: 'ItemList', usage: 'Data Hub and Apps nested trees (parent + child rows)' },
    { name: 'EmptyState', usage: 'Data Hub and Apps empty states for fresh-user experiment' },
    { name: 'PageHeader', usage: 'Project title / subtitle and Data Hub / Apps page headers' },
    { name: 'StatusChip', usage: 'Service status chips, Apps Running badges, and Nodes count chips' },
    { name: 'Tabs', usage: 'Overview / Resources / Architecture / Solutions' },
    { name: 'Typography', usage: 'Headings, KPI numbers, muted copy, table cells' },
    { name: 'Icon', usage: 'KPI tiles, architecture, CTA, and row chevrons' },
    { name: 'Section', usage: 'Needs attention, Solutions, and Recent activity headers' },
    { name: 'DataTable', usage: 'Needs attention, recent activity, and Resources services tables' },
    { name: 'Card', usage: 'Architecture summary and Solutions cards on Overview' },
    { name: 'Link', usage: 'Open solution link and service names in Resources table' },
    {
      name: 'Button',
      usage: 'Button.Dropdown Create / Connect; Explore architecture; bottom CTAs; Architecture icons',
    },
    { name: 'ChoiceChip', usage: 'Dense Architecture view segments: All, Integrated, Standalone' },
    { name: 'InputBase', usage: 'Resources services search field' },
    { name: 'Filter', usage: 'Resources filter trigger (simplified stub)' },
    { name: 'Switch', usage: 'Show only services with alerts on Resources' },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared shell chrome — not edited in this experiment',
    },
    {
      name: 'ProjectPageShell',
      reason: 'Shared Project page shell from experiments/_shared/project-page',
    },
    {
      name: 'DataHubContent',
      reason: 'Data Hub sidebar page — Aquarium ItemList with nested composition rows',
    },
    {
      name: 'AppsContent',
      reason: 'Apps sidebar page — Aquarium ItemList with application + backing services',
    },
    {
      name: 'EventLogsContent',
      reason: 'Reused from organization-event-logs for sidebar Event log',
    },
    {
      name: 'ReactFlow',
      reason: '@xyflow/react canvas — Aquarium has no Flow/Graph component',
    },
  ],

  notes: [
    'Existing-user mock data (populated services, issues, architecture edges).',
    'UI shell shared with project-page_for-builder via experiments/_shared/project-page.',
    'Create CTA uses grouped DropdownMenu.Section (Data service / Application / Agent / Solution).',
  ],
}
