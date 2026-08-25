import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, icon tiles, getting-started step markers, and layout grids',
    },
    {
      name: 'PageHeader',
      usage: 'Welcome to Aiven Platform title and first-project subtitle',
    },
    {
      name: 'Card',
      usage:
        'Create-first-resource group, three first-action tiles, empty project row, Get started with Aiven Platform, and What happens next',
    },
    {
      name: 'Typography',
      usage: 'Card titles, muted descriptions, step labels, and Current / Next captions',
    },
    {
      name: 'Icon',
      usage: 'Code, MCP, and folder glyphs on token-colored tiles',
    },
    {
      name: 'Section',
      usage: 'Your project heading; collapsible Learn about Aiven footer',
    },
    {
      name: 'StatusChip',
      usage: 'Ready to set up on the empty project row',
    },
    {
      name: 'Button',
      usage: 'Create service Primary, Deploy app / Open project Secondary; Set up MCP is Link.Button.Secondary',
    },
    {
      name: 'Link',
      usage: 'Getting started guide, documentation, Ask AI, and Learn about Aiven',
    },
    {
      name: 'Divider',
      usage: 'Vertical split between first-project content and the homepage-v5 right column',
    },
    {
      name: 'Banner',
      usage: 'MCP promo and CLI quick start via shared homepage-v5 HomeRightColumn',
    },
    {
      name: 'Select',
      usage: 'Service filter on the reused homepage-v5 product updates list',
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
      reason: 'First-project Home layout composed from Aquarium primitives',
    },
    {
      name: 'IconTile',
      reason:
        'Token-colored 40px icon tile for Deploy app and Connect AI tools — Card.icons has no tone',
    },
    {
      name: 'ServiceIconStack',
      reason:
        'Overlapping unique Aiven service logos from shared assets on Create a service — Card.icons AvatarStack crops logos as avatars',
    },
    {
      name: 'ResourceActionCard',
      reason:
        'Card + IconTile or ServiceIconStack + Button.Primary/Secondary — Card.primaryAction renders Secondary dense, Card.secondaryAction renders Ghost',
    },
    {
      name: 'GettingStartedSteps',
      reason:
        'Vertical current/next list — Aquarium Stepper is a horizontal wizard and cannot match this layout',
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
    'First-project empty Home. V1–V3 remain the operational / posture-led variants.',
    'Create service is Button.Primary in the card body. Aquarium Card.primaryAction is Secondary dense; Card.secondaryAction is Ghost.',
    'Create a service stacks every unique branded logo from experiments/_shared/assets/service-icons (aliases like Redis/Flink omitted).',
    'The empty project is a Card row, not DataList — the mock has no column headers or multi-row table behavior.',
    'Stepper is documented in the DS map as the closest getting-started primitive, but it is horizontal-only in Aquarium 6.',
    'Right column is homepage-v5 HomeRightColumn, shared with V1–V3 and V5.',
  ],
}
