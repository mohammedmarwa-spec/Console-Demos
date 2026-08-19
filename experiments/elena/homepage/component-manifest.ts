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
      usage: 'Page shell, two-column content layout, and drill-down chips',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project names, marketplace labels, and product-update copy',
    },
    {
      name: 'Link',
      usage: 'Text links at Typography.Default size; Link.Button.Secondary dense for Subscribe and RSS Feed',
    },
    {
      name: 'Button',
      usage: 'Link.Button.Secondary dense actions for Platform status and Product updates',
    },
    {
      name: 'InlineIcon',
      usage: 'Project selector chevron and alert severity icons',
    },
    {
      name: 'Card',
      usage: 'Recent project compact cards and posture signal cards with Card.Title and StatusChip chips',
    },
    {
      name: 'DropdownMenu',
      usage: 'Searchable project selector in the posture section',
    },
    {
      name: 'Switch',
      usage: 'Project posture scope toggle for including development services',
    },
    {
      name: 'EmptyState',
      usage: 'Empty states when no posture signals or no services are visible in selected scope',
    },
    {
      name: 'DataList',
      usage: 'Posture drill-down services table',
    },
    {
      name: 'StatusChip',
      usage: 'Coverage chips on posture Cards and node-status chips in the drill-down table',
    },
    {
      name: 'Tooltip',
      usage: 'Info icon next to insight card titles, and alerts overflow on service rows',
    },
    {
      name: 'Navigation',
      usage: 'Org sidebar items via shared OrgSidebar',
    },
    {
      name: 'Divider',
      usage: 'Vertical split between main content and the updates column',
    },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top nav with Home active',
    },
    {
      name: 'HomePageContent',
      reason: 'Console Home layout composed from Aquarium primitives and homepage mock data',
    },
    {
      name: 'RecentProjects',
      reason: 'Recent project cards with service counts',
    },
    {
      name: 'ProjectHealth',
      reason: 'Project selector, environment scope toggle, posture signal cards, and drill-down list',
    },
    {
      name: 'OrgSidebar',
      reason: 'Shared organization sidebar — Overview, Projects, Members, Billing, Tools group, Settings, and Admin',
    },
    {
      name: 'PostureSummary',
      reason: 'Horizontal row of Aquarium Cards with StatusChip coverage, click-to-filter, and info tooltip',
    },
    {
      name: 'PostureServiceList',
      reason: 'DataList columns for service, node status, maintenance, alerts, and fix action',
    },
    {
      name: 'ProductUpdates',
      reason: 'Single changelog card with a bottom-left carousel — Aquarium Timeline is not in this DS version',
    },
  ],

  notes: [
    'Custom Console Home experiment based on production HomePageScreen (/account/:accountId/home).',
    'Uses ConsoleHeader with org controls and shared OrgSidebar for left navigation.',
    'Product updates are a token-styled list because Timeline is not exported from Aquarium 6.',
    'Shared helpers (ConsoleHeader and ServiceIcon) live outside this folder.',
  ],
}
