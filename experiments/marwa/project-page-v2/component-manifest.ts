import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Base shell UI is reused from experiments/_shared/project-page (not edited). This folder is
 * concept 2 of the project Overview — an independent fork of experiments/marwa/project-page.
 * The redesigned Overview (OverviewV2) and a local shell fork (ProjectPageShellV2) live here.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'SegmentedControl / SegmentedControlGroup', usage: 'Overview "Group by" (large volume only) and demo toggles for volume (Empty / Small / Large) and async (Loaded / Loading / Error)' },
    { name: 'Tabs', usage: 'Overview switches between Service type rollup and Needs attention' },
    { name: 'ChoiceChip / ChoiceChipGroup', usage: 'Needs attention severity filters: All / High / Other (radio, dense)' },
    { name: 'Link', usage: 'Needs attention — issue title opens the affected service' },
    { name: 'Badge', usage: 'Overview grouped rollup — service count per group (outlined, dense)' },
    { name: 'ProgressBar', usage: 'Overview grouped rollup — dense storage-usage bar per group (warning >85%)' },
    { name: 'Card / Card.Title / Chip.Inverse', usage: 'Empty Overview "Explore the platform" product tiles (Runtime, AI gateway, Agents, DataHub, Integration endpoints, Inference) with NEW / COMING labels' },
    { name: 'Timeline', usage: 'Overview "Recent project activity" — dated events with status variants (hidden on the empty Overview)' },
    { name: 'Modal', usage: 'Create service type picker opened from the empty "No usage yet" Create service CTA — Console ServiceTypeSelectionModal layout' },
    { name: 'Banner', usage: 'Platform banner on the empty (0 services) Overview — horizontal layout, Explore solutions' },
    { name: 'Skeleton', usage: 'Per-module loading placeholders (metrics cards and list rows) — no spinners' },
    { name: 'Alert', usage: 'Per-module error: "Couldn\'t load {module}" with Retry action, no exception strings' },
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
    { name: 'Section', usage: 'Needs attention, Systems / Service types rollup, and Solutions headers' },
    { name: 'DataTable', usage: 'Needs attention — Issue / Affected resources / Impact / Started, ordered by impact' },
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
      reason: 'Local fork of the shared ProjectPageShell — same chrome + non-Overview tabs, but swaps in OverviewV2 behind the "New Overview" toggle, with volume (Empty/Small/Large) and async (Loaded/Loading/Error) demo controls',
    },
    {
      name: 'OverviewV2',
      reason: 'Volume-gated Overview: empty (banner + activation + module empty states), small (detailed metrics + flat Needs attention), large (group-by, Systems/Service types rollup, grouped Needs attention). Per-module empty / Skeleton / Retry',
    },
    {
      name: 'MetricCard / GroupRollup / NeedsAttention / AttentionRow / ModuleStatus',
      reason: 'Local presentational helpers composing OverviewV2 modules from Aquarium primitives + --aquarium-* tokens, including Skeleton and inline Alert Retry wrappers',
    },
    {
      name: 'overviewV2Data (dataset + selectors)',
      reason: 'Local deterministic mock: large (54), small (8), and empty (0) datasets; pageScale() at 0 / <15 / ≥15; summarize()/groupServices() selectors. Activity rows feed the Overview Timeline',
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
    'Concept 2 of the project Overview. Independent fork of experiments/marwa/project-page — iterate here without changing concept 1. Shared shell is not edited.',
    'Feature flag: the Overview header "New Overview" Switch toggles OverviewV2 vs the shared OverviewContent. Volume (Empty / Small / Large) and async (Loaded / Loading / Error) SegmentedControls preview page and module states. Retry on a module error returns to Loaded.',
    'Recent project activity sits at the top of Overview as an Aquarium Timeline when the project has services. It is hidden on the empty Overview in favour of Explore the platform.',
    'Needs attention is a DataTable of project-level issues ordered by impact (Issue, Affected resources, Impact, Started), with All / High / Other filters. Service type and Needs attention are peer tabs below the metrics, hidden on the empty Overview.',
    'Group by (System / Service type / None, default System) drives both the grouped rollup module (Systems / Service types) and the Needs-attention Accordion grouping.',
    'Summary metric row (responsive grid, minmax(150px,1fr)): Needs attention (danger accent when >0), Month-to-date spend (+ forecast, warning when over budget), Storage used (X/Y TB + count over 85%), Off latest version (+ EOL < 30 days).',
    'Local mock data in overviewV2Data.ts is deterministic and decoupled from the shared ProjectPageMockData; no backend or fabricated live metrics. Non-Overview tabs still use the shared projectPageData.',
    'All colors/spacing use --aquarium-* tokens; primitives verified via the Storybook MCP before use.',
    'Iconography aligned to the real Console (aiven-core-ui-reference/ui/console): ServiceStatusChip state→icon (RUNNING=tickCircle/success, REBUILDING·REBALANCING=loading/info, POWEROFF=power/neutral), AttentionRequiredServiceList severity InlineIcons (error/danger-default, warningSign/warning-default), ServiceNameCell service-type logo, and EOL=outdated. Logic unchanged — visual alignment only.',
  ],
}
