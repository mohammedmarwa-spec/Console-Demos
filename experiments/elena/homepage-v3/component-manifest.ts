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
      name: 'PageHeader',
      usage: 'Welcome to Aiven Platform title and returning-user subtitle',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project names, and findings',
    },
    {
      name: 'Link',
      usage: 'View alerts action, project name, and issue actions',
    },
    {
      name: 'Button',
      usage:
        'Button.Icon dense list/cards switcher and insights close; Button.Ghost dense Add user',
    },
    {
      name: 'Chip',
      usage: 'Project label chips with tag icon in the Labels column and on compact cards (prod, staging, dev)',
    },
    {
      name: 'Card',
      usage:
        'Org summary cards (Projects, Resources, Last invoice, Users) and Card.Compact project cards in the 4-up grid',
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
      usage:
        'Vertical recent-projects list with Labels, service stacks, Health status, and View alerts; services requiring review in the side panel',
    },
    {
      name: 'Divider',
      usage: 'Vertical split between the project list and either the homepage-v5 right column or the insights side panel',
    },
    {
      name: 'StatusChip',
      usage: 'Project Health column (Healthy, Degraded, Issue), last-invoice Paid, and side-panel statuses',
    },
    {
      name: 'Icon',
      usage: 'Toned tiles on the org summary cards',
    },
    {
      name: 'Navigation',
      usage: 'Org sidebar items via shared OrgSidebar',
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
      name: 'MetricRow',
      reason: 'Four org summary cards: Projects, Resources, Last invoice, and Users',
    },
    {
      name: 'ProjectsList',
      reason: 'Recent projects with list/cards view switcher, service icon stacks, Health column, and a View alerts link',
    },
    {
      name: 'ProjectViewSwitcher',
      reason: 'Button.Icon pair that toggles Recent projects between DataList and a 4-up Card.Compact grid',
    },
    {
      name: 'ServiceIconStack',
      reason: 'Overlapping unique service-type logos next to the Services count and on project cards',
    },
    {
      name: 'ProjectLabelChip',
      reason: 'Dense Chip with tag icon for prod/staging/dev in the Labels column',
    },
    {
      name: 'ProjectHealthCell',
      reason: 'Healthy/Degraded/Issue StatusChip in the project list Health column',
    },
    {
      name: 'ViewAlertsLink',
      reason: 'Actions-column Link that opens the project insights side panel',
    },
    {
      name: 'ProjectInsightsPanel',
      reason: 'In-flow side panel that replaces the homepage-v5 right column; opened from the View alerts link',
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
      name: 'HomeRightColumn',
      reason:
        'Shared Dev tools rail (promo Banner) and Product updates; Get started opens DevToolsDrawer'
    },
  ],

  notes: [
    'Copied from homepage-v2. Protection coverage and Improve your project are removed.',
    'Four org summary cards sit above Recent projects. Project and resource counts come from PROJECTS; invoice and users match the existing homepage mock.',
    'Recent projects default to a vertical DataList; a list/cards switcher reveals a 4-up Card.Compact grid.',
    'Every project name is a Link. Health is derived from production service node status, severity, and alerts.',
    'Project labels (prod, staging, dev) live in a Labels column as dense Chips with the tag icon.',
    'View alerts is a Link in the Actions column and on each compact card; it opens the insights side panel.',
    'Services column and cards show overlapping unique service-type icons from getProjectPreviewServices.',
    'Aquarium Drawer overlays the page, so Project insights is an in-flow side panel (Box + Divider) that replaces the homepage-v5 right column.',
    'Right column is shared HomeRightColumn until Project insights opens.',
    'Project health and the services list live only in the side panel, scoped to the row that opened it.',
    'Shared helpers (ConsoleHeader, OrgSidebar, ServiceIcon) live outside this folder.',
  ],
}
