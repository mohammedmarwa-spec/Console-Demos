import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, shrinking overview grid, column scrollports, and project-insights side panel',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project names, findings, and product-update copy',
    },
    {
      name: 'Link',
      usage: 'Project insights action, project name, issue actions, See all, and Read more',
    },
    {
      name: 'Button',
      usage: 'Button.Icon dense close control on the insights side panel; prev/next stepper for product updates',
    },
    {
      name: 'Chip',
      usage: 'Environment tag on project DataList rows (prod, staging, dev)',
    },
    {
      name: 'Card',
      usage: 'Product-update carousel card',
    },
    {
      name: 'Section',
      usage: 'Project health heading and caption in the insights side panel',
    },
    {
      name: 'EmptyState',
      usage: 'Empty scope, no attention items, and no review rows in the side panel',
    },
    {
      name: 'DataList',
      usage: 'Vertical recent-projects list with Project insights link; services requiring review in the side panel',
    },
    {
      name: 'Divider',
      usage: 'Vertical split between the project list and either product updates or the insights side panel',
    },
    {
      name: 'StatusChip',
      usage: 'Attention row status and review table status column',
    },
    {
      name: 'Navigation',
      usage: 'Org sidebar items via shared OrgSidebar',
    },
    {
      name: 'Banner',
      usage: 'Aiven MCP promo Banner above Product updates (title, Enable CTA, MCP illustration)',
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
      name: 'ProjectsList',
      reason: 'Vertical DataList of recent projects with a Project insights link',
    },
    {
      name: 'ProjectInsightsPanel',
      reason: 'In-flow side panel that replaces the MCP/updates column; opened from the Project insights link',
    },
    {
      name: 'ProjectHealth',
      reason: 'Aquarium Section wrapping the attention-required card and services requiring review',
    },
    {
      name: 'AttentionRequiredCard',
      reason: 'List of services with active alerts or unhealthy nodes under Project health',
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
      name: 'AivenMcpPromo',
      reason: 'Right-column MCP enablement promo above Product updates',
    },
    {
      name: 'ProductUpdates',
      reason: 'Single changelog Card with bottom-left Button.Icon carousel',
    },
  ],

  notes: [
    'Copied from homepage-v2. Protection coverage and Improve your project are removed.',
    'Recent projects are a vertical DataList; Project insights is a Link in the Actions column.',
    'Aquarium Drawer overlays the page, so Project insights is an in-flow side panel (Box + Divider) that replaces the MCP and product-updates column.',
    'Project health and the services list live only in the side panel, scoped to the row that opened it.',
    'Shared helpers (ConsoleHeader, OrgSidebar, ServiceIcon) live outside this folder.',
  ],
}
