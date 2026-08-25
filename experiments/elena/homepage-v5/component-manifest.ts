import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, two-column layout, metric grid, icon tiles, and list cell layout',
    },
    {
      name: 'PageHeader',
      usage: 'Welcome to Aiven Platform title and returning-user subtitle',
    },
    {
      name: 'Card',
      usage: 'Projects, Resources, last invoice, Users tiles, and Reliability overview',
    },
    {
      name: 'Typography',
      usage:
        'Developer tools and Product updates rail headings, CLI snippet, invoice amount, user count, and update dates',
    },
    {
      name: 'Icon',
      usage: 'Invoice and user glyphs, attention severity, reliability checks, copy on CLI snippet, and footer marks',
    },
    {
      name: 'Section',
      usage: 'Recent projects heading, subtitle, and View all; Attention needed heading',
    },
    {
      name: 'DataList',
      usage: 'Headerless recent-project rows and attention items',
    },
    {
      name: 'Chip',
      usage: 'Service type tags beside the Resources column (PostgreSQL, Agent, MCP, App)',
    },
    {
      name: 'StatusChip',
      usage: 'Project health and last invoice Paid',
    },
    {
      name: 'Link',
      usage: 'Project names, View invoice, View details, RSS Feed, View all (N), Documentation, and Ask AI',
    },
    {
      name: 'SearchInput',
      usage: 'Attention needed search over projects and resources',
    },
    {
      name: 'ChoiceChip',
      usage: 'Dense attention category filter: All, Incidents, End of life, Upgrades, Security, Alerts',
    },
    {
      name: 'Button',
      usage: 'Add user on the Users card; attention row Ghost dense actions; copy on the CLI snippet',
    },
    {
      name: 'EmptyState',
      usage: 'No matching attention items for the active search or category',
    },
    {
      name: 'Select',
      usage: 'Service filter for product updates (All, Kafka, ClickHouse, …) — replaces choice chips',
    },
    {
      name: 'Divider',
      usage: 'Vertical split between main content and the MCP/updates column; hairlines between update rows',
    },
    {
      name: 'Banner',
      usage: 'MCP promo and CLI quick start in Developer tools — same outlined Banner; MCP adds illustration',
    },
    {
      name: 'Navigation',
      usage: 'Org sidebar items via shared OrgSidebar',
    },
  ],

  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top bar with Home active and platform status text',
    },
    {
      name: 'HomePageContent',
      reason: 'Org Home layout composed from Aquarium primitives and homepage mock data',
    },
    {
      name: 'IconTile',
      reason: 'Token-colored 40px/32px icon tile for summary cards and attention severity — Card.icons has no tone',
    },
    {
      name: 'ServiceIconStack',
      reason:
        'Overlapping Aiven service logos beside Resources — Card.icons AvatarStack crops logos as avatars',
    },
    {
      name: 'SummaryCard',
      reason: 'Card + IconTile + LargeHeading for Projects, Resources, last invoice, and users — Aquarium has no StatCard',
    },
    {
      name: 'OrgSidebar',
      reason: 'Shared organization sidebar with Tools group, Settings, and Admin',
    },
    {
      name: 'HomeRightColumn',
      reason: 'Sticky right rail: Developer tools (MCP + CLI) and Product updates — reused by homepage-v1–v4',
    },
    {
      name: 'AivenMcpPromo',
      reason: 'Right-column outlined Banner under Developer tools, with MCP illustration and Get started CTA',
    },
    {
      name: 'CliQuickStart',
      reason:
        'Outlined Banner matching MCP — CodeSmall snippet + copy; Aquarium has no CodeBlock',
    },
    {
      name: 'ProductUpdates',
      reason:
        'Right-column changelog preview under MCP: title + RSS, Aquarium Select for service, bordered list — not ChoiceChip and not V2 carousel',
    },
  ],

  notes: [
    'Org-level operational Home based on V2 IA. V1–V4 remain comparison variants.',
    'MCP and CLI quick start both use outlined Banner in Developer tools — Card.primaryAction is Secondary dense.',
    'CLI snippet uses the Console CodeBlock pattern (CodeSmall + copy) inside Banner.',
    'Product updates sit under Developer tools in that rail, previewing 3 items per service. Reliability stays in the main column.',
    'Recent projects and attention lists use DataList hideHeader to match the headerless mock.',
    'Attention filters are ChoiceChip dense (aligned with SearchInput), not Tabs.',
    'Product updates use Select for service-specific changelog, not ChoiceChip filters.',
    'Shared helpers (ConsoleHeader, OrgSidebar, ServiceIcon) live outside this folder. Homepage V1–V4 import HomeRightColumn from this experiment.',
  ],
}
