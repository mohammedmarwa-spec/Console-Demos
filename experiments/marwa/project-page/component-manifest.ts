import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Base shell UI is reused from experiments/_shared/project-page (not edited). The redesigned
 * aggregation-first Overview (OverviewV2) and a local shell fork (ProjectPageShellV2) live in
 * this folder; the shared OverviewContent is kept reachable behind the "New Overview" toggle.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'SegmentedControl / SegmentedControlGroup', usage: 'Overview "Group by" control (System / Service type / None) and the Populated/Empty demo toggle' },
    { name: 'Accordion', usage: 'Overview "Needs attention" — collapsible groups per System / Service type (Summary + Panel + Toggle)' },
    { name: 'Badge', usage: 'Overview grouped rollup — service count per group (outlined, dense)' },
    { name: 'ProgressBar', usage: 'Overview grouped rollup — dense storage-usage bar per group (warning >85%)' },
    { name: 'Card / Card.Compact', usage: 'Overview "Recent project activity" — compact cards in a horizontal scrolling strip at the top of Overview' },
    { name: 'EmptyState', usage: 'Overview zero-state hero, empty "Needs attention", and horizontal empty "Recent activity"' },
    { name: 'Switch', usage: 'Overview header "New Overview" V2/legacy feature toggle' },
    { name: 'StatusChip (with icon)', usage: 'Health / severity chips carry icons like aiven-core ServiceStatusChip — tickCircle (Healthy), warningSign (Warning/Critical/need attention)' },
    { name: 'InlineIcon', usage: 'Severity markers in Needs-attention rows (error/danger-default, warningSign/warning-default, 16px) and leading icons on the summary metric cards (currencyDollar / database / outdated / warningSign)' },
    { name: 'ServiceIcon (prototype)', usage: 'Service-type logo beside each service name in the Needs-attention list, mirroring aiven-core ServiceNameCell/IconField' },
    { name: 'Box', usage: 'Page shell, sidebar/content split, KPI cards, Architecture node shells' },
    { name: 'Navigation', usage: 'Project sidebar sections and primary items' },
    { name: 'DropdownMenu', usage: 'Sidebar project selector and grouped Create CTA menu' },
    { name: 'Badge', usage: 'Solutions NEW label in the sidebar' },
    { name: 'ItemList', usage: 'Data Hub and Apps nested trees (parent + child rows)' },
    { name: 'EmptyState', usage: 'Data Hub and Apps empty states for fresh-user experiment' },
    { name: 'PageHeader', usage: 'Project title / subtitle and Data Hub / Apps page headers' },
    { name: 'StatusChip', usage: 'Service status chips, Apps Running badges, and Nodes count chips' },
    { name: 'Tabs', usage: 'Overview / Resources / Architecture / Solutions' },
    { name: 'Typography', usage: 'Headings, KPI numbers, muted copy, table cells' },
    { name: 'Icon', usage: 'KPI tiles, architecture, CTA, and row chevrons' },
    { name: 'Section', usage: 'Needs attention, Solutions, and Recent activity headers' },
    { name: 'DataTable', usage: 'Needs attention, recent activity, and Resources services tables' },
    { name: 'Card', usage: 'Architecture summary and Solutions cards on Overview' },
    { name: 'Link', usage: 'Open solution link and service names in Resources table' },
    {
      name: 'Button',
      usage: 'Button.Dropdown Create / Connect; Explore architecture; bottom CTAs; Architecture icons',
    },
    { name: 'ChoiceChip', usage: 'Dense Architecture view segments: All, Integrated, Standalone' },
    { name: 'InputBase', usage: 'Resources services search field' },
    { name: 'Filter', usage: 'Resources filter trigger (simplified stub)' },
    { name: 'Switch', usage: 'Show only services with alerts on Resources' },
  ],

  prototypeComponents: [
    {
      name: 'ProjectPageShellV2',
      reason: 'Local fork of the shared ProjectPageShell — same chrome + non-Overview tabs, but swaps in OverviewV2 behind the "New Overview" toggle (and a Populated/Empty demo control)',
    },
    {
      name: 'OverviewV2',
      reason: 'Redesigned aggregation-first, exception-first Overview: horizontal Recent activity strip at the top, Group-by control, 4 summary metric cards, grouped rollup (Systems / Service types), and grouped Needs-attention list',
    },
    {
      name: 'MetricCard / GroupRollup / NeedsAttention / AttentionRow / RecentActivity',
      reason: 'Local presentational helpers composing the OverviewV2 modules from Aquarium primitives + --aquarium-* tokens',
    },
    {
      name: 'overviewV2Data (dataset + selectors)',
      reason: 'Local deterministic mock: 54 services across 6 systems / 7 types with spend, storage headroom, version/EOL, and attention; summarize()/groupServices() selectors; plus a zero-state dataset. No backend.',
    },
    {
      name: 'ConsoleHeader',
      reason: 'Shared shell chrome — reused, not edited',
    },
    {
      name: 'ProjectPageShell (base)',
      reason: 'Shared Project page shell — kept as the reference the local V2 shell forks from; ProjectHomeContent/ServicesListContent/ArchitectureContent reused for non-Overview tabs',
    },
    {
      name: 'DataHubContent',
      reason: 'Data Hub sidebar page — Aquarium ItemList with nested composition rows',
    },
    {
      name: 'AppsContent',
      reason: 'Apps sidebar page — Aquarium ItemList with application + backing services',
    },
    {
      name: 'EventLogsContent',
      reason: 'Reused from organization-event-logs for sidebar Event log',
    },
    {
      name: 'ReactFlow',
      reason: '@xyflow/react canvas — Aquarium has no Flow/Graph component',
    },
  ],

  notes: [
    'Redesign brief: aggregation-first, exception-first Project Overview that stays legible at 50+ services / 8+ apps / 4+ agents. Built only inside experiments/marwa/project-page/ — the shared shell is not edited.',
    'Feature flag: the Overview header "New Overview" Switch toggles OverviewV2 vs the shared OverviewContent for side-by-side review. A Populated/Empty SegmentedControl previews the zero-state.',
    'Recent project activity sits at the top of Overview as a horizontal scrolling strip of Card.Compact tiles (status chip = when, title = change, caption = resource · actor). Aquarium Timeline is vertical-only, so it is not used here.',
    'Group by (System / Service type / None, default System) drives both the grouped rollup module (Systems / Service types) and the Needs-attention Accordion grouping.',
    'Summary metric row (responsive grid, minmax(150px,1fr)): Needs attention (danger accent when >0), Month-to-date spend (+ forecast, warning when over budget), Storage used (X/Y TB + count over 85%), Off latest version (+ EOL < 30 days).',
    'Local mock data in overviewV2Data.ts is deterministic and decoupled from the shared ProjectPageMockData; no backend or fabricated live metrics. Non-Overview tabs still use the shared projectPageData.',
    'All colors/spacing use --aquarium-* tokens; primitives verified via the Storybook MCP before use.',
    'Iconography aligned to the real Console (aiven-core-ui-reference/ui/console): ServiceStatusChip state→icon (RUNNING=tickCircle/success, REBUILDING·REBALANCING=loading/info, POWEROFF=power/neutral), AttentionRequiredServiceList severity InlineIcons (error/danger-default, warningSign/warning-default), ServiceNameCell service-type logo, and EOL=outdated. Logic unchanged — visual alignment only.',
  ],
}
