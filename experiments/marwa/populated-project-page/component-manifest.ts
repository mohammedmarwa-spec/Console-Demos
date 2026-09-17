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
        'Prototype-only Scope toggle lives in the page footer, not in the Overview header.',
    },
    {
      name: 'Card',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/surfaces-card--docs',
      usage:
        'LHF summary (Services · Storage used · Off latest version) and Full design 4-metric row (Needs attention · spend · storage · off latest).',
    },
    {
      name: 'ProgressBar',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-progressbar--docs',
      usage:
        'LHF Storage used card: dense bar of usedTb / totalTb. progresStatus is warning at ≥85% project fill, otherwise info. Labels omitted because dense — heading already shows TB used / total.',
    },
    {
      name: 'Section',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/layout-section--docs',
      usage:
        'Raised modules: Needs attention, Recent activity (LHF); Capacity hotspots, aggregated activity (Full design).',
    },
    {
      name: 'DataTable',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-datatable--docs',
      usage:
        'Needs attention issues in this project (LHF/Full). Issue title is a Link and the Started cell carries a chevronRight, so the row reads as navigable to the issue detail.',
    },
    {
      name: 'Drawer',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/surfaces-drawer--docs',
      usage:
        'Issue detail (md): severity + started, affected service with its status/plan/system/environment, impact, and what to do next. Open service + View logs as footer actions.',
    },
    {
      name: 'DataList',
      storybookUrl: 'https://aquarium-library.aiven.io/?path=/docs/data-display-datalist--docs',
      usage:
        'Recent activity grouped by resource/service (latest 3).',
    },
    {
      name: 'ChoiceChip / ChoiceChipGroup',
      usage: 'Needs attention severity filter (all · critical · warning · info) with issue counts on each chip.',
    },
    {
      name: 'StatusChip / ChipContainer',
      usage:
        'Needs-attention severity (scheduled-for-deletion = info, not warning) and the Services card breakdown (critical / warning / info counts).',
    },
    {
      name: 'Timeline',
      usage: 'LHF Recent activity in this project — error then warning only (not a recency slice). Full design keeps the grouped stream.',
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
        'LHF 3-card summary (Services · Storage used · Off latest version, xs=12 md=4); Full design 4-metric row (xs=12, sm=6, md=3); Capacity hotspot counts (xs=12, sm=4).',
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
      usage:
        'Issue titles in Needs attention (href required; preventDefault in prototype). Full design aggregated activity footer: +41 more changes today.',
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
        'Org-level 52-service mock, then scoped to the Production project for this dashboard. Staging and Development stay as sibling projects, not Overview groups. No API.',
    },
    {
      name: 'ServiceIcon (prototype)',
      reason:
        'Service-type logo in the issue detail drawer header.',
    },
    {
      name: 'IssueDetailDrawer',
      reason:
        'Reads one derived AttentionRow — severity, affected service, impact, next step — so a critical issue in Needs attention opens somewhere instead of dead-ending.',
    },
    {
      name: 'ConsoleHeader + ProjectHomeSidebar',
      reason: 'Reused Console chrome for pitch fidelity. Overview body is local; shared shell is not edited.',
    },
  ],
  notes: [
    'Prompt 2: LHF body is client-derived from the fixture. Solutions and Architecture stay hidden while those arrays are empty/null.',
    'Scheduled for deletion maps to info (gray), not warning.',
    'Prompt 3: Full design foundations — 4-metric row, Needs attention with system: X sublabel. This dashboard is Production only.',
    'Prompt 4: Capacity hotspots, activity grouped by service — latest 3 by default, with +41 more.',
    'Systems in this project is out for now: the Resources view already lists services, so grouping them again on Overview duplicated it.',
  ],
}
