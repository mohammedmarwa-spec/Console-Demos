import type { ComponentManifest } from '@/lib/experiments/types'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'PageHeader',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/layout-pageheader--docs',
      usage:
        'Identical header across scopes: project name, description, Create (primaryAction), Connect AI editor (secondaryAction). Aquarium allows one primary action — Create is primary.',
    },
    {
      name: 'SegmentedControl / SegmentedControlGroup',
      usage:
        'Prototype-only Scope toggle lives in the page footer, not in the Overview header. Full design Group by (System | Service type | None, default System) lives in ScopeContext.',
    },
    {
      name: 'Card',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/surfaces-card--docs',
      usage: 'LHF summary (Services / Apps / Agents) and Full design 4-metric row (Needs attention · spend · storage · off latest).',
    },
    {
      name: 'Section',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/layout-section--docs',
      usage:
        'Raised modules: Needs attention, Services, Recent activity (LHF); Systems (Explore action), By service type, Capacity hotspots, aggregated activity (Full design).',
    },
    {
      name: 'DataTable',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-datatable--docs',
      usage: 'Needs-attention top 5, per-type service rows (LHF), and By service type composition roll-up (Full design).',
    },
    {
      name: 'DataList',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-datalist--docs',
      usage:
        'Full design Systems clusters (headerless: health dot · name · count) and Recent activity grouped by resource/service.',
    },
    {
      name: 'Accordion',
      usage: 'Services list grouped by type; independently collapsible sections with a count badge.',
    },
    {
      name: 'SearchInput / SelectBase',
      usage: 'Client-side text search and service-type filter above the services list.',
    },
    {
      name: 'ChoiceChip / ChoiceChipGroup',
      usage: 'Needs attention severity filter (all · critical · warning · info) with issue counts on each chip.',
    },
    {
      name: 'StatusChip / ChipContainer',
      usage:
        'Needs-attention severity (scheduled-for-deletion = info, not warning), service status badges, and the Services card breakdown (critical / warning / info counts).',
    },
    {
      name: 'Timeline',
      usage: 'LHF Recent activity — error then warning only (not a recency slice). Full design keeps the grouped stream.',
    },
    {
      name: 'EmptyState',
      usage: 'Headline + one line + verb CTA when a visible module has no rows (including no search matches).',
    },
    {
      name: 'InlineIcon',
      usage: 'Leading icons on Full design metric cards (warningSign, currencyDollar, database, outdated).',
    },
    {
      name: 'Grid',
      usage:
        'LHF 3-card summary; Full design 4-metric row (xs=12, sm=6, md=3); Capacity hotspot counts (xs=12, sm=4). Systems + By service type use Box grid auto-fit minmax(280px, 1fr) so the pair wraps on the content width, not the viewport (sidebar would otherwise squeeze columns under 280px).',
    },
    {
      name: 'Box / Box.Flex',
      usage: 'Page chrome, header row, and placeholder surfaces (muted vs primary-muted).',
    },
    {
      name: 'Typography',
      usage: 'Header subtitle, placeholder titles, and fixture summary line.',
    },
    {
      name: 'Link',
      usage: 'Full design aggregated activity footer: +41 more changes today (href required, preventDefault in prototype).',
    },
    {
      name: 'Button (via PageHeader actions)',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/inputs-button--docs',
      usage: 'Create and Connect AI editor in the page header.',
    },
  ],
  prototypeComponents: [
    {
      name: 'ScopeProvider / useScope',
      reason: 'Top-level context so the scope toggle re-renders every child. Holds the fixture as the sole data source.',
    },
    {
      name: 'onlineStoreProd fixture',
      reason:
        'Deterministic 52-service mock (type + system quotas, planted issues, spend/storage). No API.',
    },
    {
      name: 'ConsoleHeader + ProjectHomeSidebar',
      reason: 'Reused Console chrome for pitch fidelity. Overview body is local; shared shell is not edited.',
    },
  ],
  notes: [
    'Prompt 2: LHF body is client-derived from the fixture. Solutions and Architecture stay hidden while those arrays are empty/null.',
    'Scheduled for deletion maps to info (gray), not warning.',
    'Prompt 3: Full design foundations — Group by (default System), 4-metric row, Needs attention with system: X sublabel.',
    'Prompt 4: Systems (52→5 including Unassigned) + By service type two-column row, Capacity hotspots, activity grouped by service with +41 more. Group-by swaps the two-column order when set to Service type.',
    'Empty-state companion remains at /experiments/marwa/project-page-v2.',
  ],
}
