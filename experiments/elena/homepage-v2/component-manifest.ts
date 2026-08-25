import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, two-column layout, header status dot, insight card wrappers, and coverage grid',
    },
    {
      name: 'PageHeader',
      usage: 'Welcome to Aiven Platform title and returning-user subtitle',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project/scope labels, and findings',
    },
    {
      name: 'Link',
      usage: 'View-all links, issue actions, and improvement actions',
    },
    {
      name: 'InlineIcon',
      usage: 'Dropdown chevrons, card header icons, and protection coverage tooltip',
    },
    {
      name: 'Icon',
      usage: 'Protection coverage metric icons (shield, cloud, notifications, lock)',
    },
    {
      name: 'Chip',
      usage: 'Environment tag on recent project cards (prod, staging)',
    },
    {
      name: 'Card',
      usage: 'Card.Compact for recent projects; Card + Card.Title for insight cards and protection coverage',
    },
    {
      name: 'Filter',
      usage: 'Project filter trigger in Project health (Project: online-store-prod)',
    },
    {
      name: 'DropdownMenu',
      usage: 'Project filter menu in Project health',
    },
    {
      name: 'EmptyState',
      usage: 'Empty scope, no attention items, and no review rows',
    },
    {
      name: 'DataList',
      usage: 'Services requiring review table (Service, Status, Finding, Recommended action)',
    },
    {
      name: 'StatusChip',
      usage: 'Attention row status and review table status column',
    },
    {
      name: 'Tooltip',
      usage: 'Protection coverage info icon and Why am I seeing this on Improve card',
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
      usage: 'MCP promo and CLI quick start via shared homepage-v5 HomeRightColumn',
    },
    {
      name: 'Select',
      usage: 'Service filter on the reused homepage-v5 product updates list',
    },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top bar with Home active and platform status text',
    },
    {
      name: 'HomePageContent',
      reason: 'Console Home layout composed from Aquarium primitives and homepage mock data',
    },
    {
      name: 'RecentProjects',
      reason: 'Recent project Card.Compact grid with overlapping service icon stacks and service counts',
    },
    {
      name: 'ProjectHealth',
      reason: 'Project health — dual insight cards, protection coverage, and review table',
    },
    {
      name: 'ServiceIconStack',
      reason: 'Overlapping circular service icons on recent project preview cards',
    },
    {
      name: 'AttentionRequiredCard',
      reason: 'Danger-tinted card listing services with active alerts or unhealthy nodes',
    },
    {
      name: 'ImproveProjectCard',
      reason: 'Info-tinted card with posture-based improvement recommendations',
    },
    {
      name: 'ProtectionCoverageSection',
      reason: 'Four-metric coverage strip inside Card with Card.Title',
    },
    {
      name: 'ServicesRequiringReviewList',
      reason: 'DataList of services with findings and recommended actions',
    },
    {
      name: 'OrgSidebar',
      reason: 'Shared organization sidebar with Tools group, Settings, and Admin',
    },
    {
      name: 'HomeRightColumn',
      reason:
        'Reuses homepage-v5 rail: Developer tools (MCP Banner + CLI quick start) and Product updates with service Select',
    },
  ],

  notes: [
    'Layout matches clipped Project health design — not the horizontal posture-card row in homepage-v1.',
    'Project health uses a Filter.Trigger project control; production scope is fixed in mock data.',
    'Insight card tints use Aquarium border/background tokens on Box wrappers around Card.',
    'Platform status is plain text with a token-colored dot in ConsoleHeader.',
    'Right column is homepage-v5 HomeRightColumn — not the previous MCP + carousel.',
    'Shared helpers (ConsoleHeader, OrgSidebar, ServiceIcon) live outside this folder.',
  ],
}
