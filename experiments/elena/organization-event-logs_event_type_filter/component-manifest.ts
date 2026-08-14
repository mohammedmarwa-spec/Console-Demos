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
      usage: 'Page shell, sidebar/content split, and filter layout containers',
    },
    {
      name: 'Navigation',
      usage: 'Organization admin sidebar sections and items',
    },
    {
      name: 'PageHeader',
      usage: 'Event logs title, breadcrumbs, and export action',
    },
    {
      name: 'Breadcrumbs',
      usage: 'Admin / Event logs path in the page header',
    },
    {
      name: 'Typography',
      usage: 'Headings, table cells, filter labels, and helper copy',
    },
    {
      name: 'Button',
      usage: 'Export, filter triggers, clear, and drawer actions',
    },
    {
      name: 'Input',
      usage: 'Event log search field',
    },
    {
      name: 'Filter',
      usage: 'Active filter chips above the log table',
    },
    {
      name: 'DateRangePicker',
      usage: 'Date range filter for event logs',
    },
    {
      name: 'MultiSelect',
      usage: 'Standalone Event type filter and all-filters drawer',
    },
    {
      name: 'Divider',
      usage: 'Separators in filter panels and drawer detail',
    },
    {
      name: 'DataList',
      usage: 'Expandable event log table',
    },
    {
      name: 'Drawer',
      usage: 'All-filters panel (md) and event detail panel',
    },
    {
      name: 'Link',
      usage: 'Linked identifiers in event details and resource column',
    },
    {
      name: 'Icon',
      usage: 'Filter, search, export, and actor-type icons',
    },
    {
      name: 'InputBase',
      usage: 'Low-level input chrome used by custom filter triggers',
    },
  ],

  prototypeComponents: [
    {
      name: 'EventLogsSidebar',
      reason: 'Organization admin nav wiring for the Event logs experiment',
    },
    {
      name: 'EventLogsContent',
      reason:
        'Interactive event logs surface: search, standalone Event type filter, ID filters, table, and detail drawer',
    },
    {
      name: 'EventTypeFilter',
      reason: 'Standalone Filter.Trigger + MultiSelect for API event_type values',
    },
  ],

  notes: [
    'Variant of Organization event logs with Quick views removed and a standalone Event type filter.',
    'Filter triggers and cell renderers are custom composition around Aquarium inputs and DataList.',
    'Shared playground helpers (e.g. ConsoleHeader) are used but live outside this experiment folder.',
  ],
}
