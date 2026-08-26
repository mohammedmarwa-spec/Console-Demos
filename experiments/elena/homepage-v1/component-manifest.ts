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
      name: 'PageHeader',
      usage: 'Welcome to Aiven Platform title and returning-user subtitle',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project names, and marketplace labels',
    },
    {
      name: 'Link',
      usage: 'Text links at Typography.Default size for project names, view-all, and posture actions',
    },
    {
      name: 'InlineIcon',
      usage: 'Alert severity icons in the services table (and help icons on hidden posture cards)',
    },
    {
      name: 'Card',
      usage: 'Recent project compact cards with service icon stacks, and posture signal cards with Card.Title and StatusChip chips',
    },
    {
      name: 'Chip',
      usage: 'Environment tag on recent project cards, placed below the service count (prod, staging, dev)',
    },
    {
      name: 'Select',
      usage: 'Project selector in Project insights; service filter on the reused homepage-v5 product updates list',
    },
    {
      name: 'EmptyState',
      usage: 'Empty states when no posture signals or no services are visible in selected scope',
    },
    {
      name: 'ChoiceChip',
      usage:
        'Radio service filters (All alerts, Close EOL, Maintenance, Degraded) and Dev tools drawer tabs (MCP, CLI, Terraform, API)',
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
      usage: 'Vertical split between main content and the homepage-v5 right column',
    },
    {
      name: 'Banner',
      usage: 'Dev tools promo (Get started opens drawer) via shared HomeRightColumn'
    },
    {
      name: 'Drawer',
      usage: 'Non-blocking Dev tools drawer with MCP configurator, CLI, Terraform, and API',
    },
    {
      name: 'Switch',
      usage: 'MCP read-only mode in the Dev tools drawer',
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
      reason: 'Recent project cards with service icon stacks, service counts, and environment tags',
    },
    {
      name: 'ProjectHealth',
      reason: 'Project Select and drill-down list (posture cards hidden)',
    },
    {
      name: 'OrgSidebar',
      reason: 'Shared organization sidebar — Overview, Projects, Members, Billing, Tools group, Settings, and Admin',
    },
    {
      name: 'PostureSummary',
      reason:
        'Posture insight cards kept in code and exported for reuse; hidden on this page via SHOW_POSTURE_INSIGHT_CARDS',
    },
    {
      name: 'ServiceTableFilters',
      reason:
        'ChoiceChip radio group: All alerts {count} by default; other chips narrow the alerts list',
    },
    {
      name: 'PostureServiceList',
      reason: 'DataList of alert rows: service, node status, maintenance, alert, and fix action',
    },
    {
      name: 'HomeRightColumn',
      reason:
        'Shared Dev tools rail (promo Banner) and Product updates; Get started opens DevToolsDrawer'
    },
  ],

  notes: [
    'Custom Console Home experiment based on production HomePageScreen (/account/:accountId/home).',
    'Uses ConsoleHeader with org controls and shared OrgSidebar for left navigation.',
    'Right column is shared HomeRightColumn — Dev tools plus Product updates.',
    'Shared helpers (ConsoleHeader and ServiceIcon) live outside this folder.',
    'Posture insight cards stay in HomePageContent (PostureSummary, PostureCard) for reuse; flip SHOW_POSTURE_INSIGHT_CARDS to show them here.',
  ],
}
