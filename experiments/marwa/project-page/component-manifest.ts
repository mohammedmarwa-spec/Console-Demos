import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Base shell UI is reused from experiments/_shared/project-page (not edited). The redesigned
 * aggregation-first Overview (OverviewV2) and a local shell fork (ProjectPageShellV2) live in
 * this folder; the shared OverviewContent is kept reachable behind the "New Overview" toggle.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'SegmentedControl / SegmentedControlGroup', usage: 'Overview "Group by" (large volume only) and demo toggles for volume (Empty / Small / Large) and async (Loaded / Loading / Error)' },
    { name: 'Tabs', usage: 'Overview switches between Service type rollup and Needs attention' },
    { name: 'ChoiceChip / ChoiceChipGroup', usage: 'Needs attention severity filters: All / High / Other (radio, dense)' },
    { name: 'Link', usage: 'Needs attention — issue title opens the affected service' },
    { name: 'Badge', usage: 'Overview grouped rollup — service count per group (outlined, dense)' },
    { name: 'ProgressBar', usage: 'Overview grouped rollup — dense storage-usage bar per group (warning >85%)' },
    { name: 'Timeline', usage: 'Overview "Recent project activity" — dated events with status variants' },
    { name: 'EmptyState', usage: 'Empty Overview: No services yet (Create your first service + Explore solutions) and No usage yet. Per-module empties remain for Needs attention / activity when those modules are shown.' },
    { name: 'Modal', usage: 'Empty-state create flow: 1 choose topology → 2 pick first service in this project → 3 review and create. By environment is recommended; this experiment is the Production project.' },
    { name: 'Card / Card.Group', usage: 'Selectable topology templates inside the create-service modal (radio selection, Recommended vs Alternative status chips), and Card.Compact for the first-service picker with service-type icons + type chips. Step 2 also offers every other service type below a Divider, so the group is remounted by key to clear its radio when an explore-more tile holds the selection' },
    { name: 'Banner', usage: 'Platform banner on the empty (0 services) Overview — horizontal layout, Explore solutions opens the outcome picker' },
    { name: 'Chip', usage: 'Environment chip ("Development") under the project name — gray/idle, the by-environment context the create and Explore flows read from' },
    { name: 'Card', usage: 'Explore the platform tiles on the empty Overview (Runtime, AI gateway, Agents, DataHub, Integration endpoints, Inference): clickable fullWidth cards, Card.Title node with an InlineIcon, and availability via the chips prop (Available / New / Coming soon) so every tile shares the same chip-title-body rhythm' },
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
    { name: 'Section', usage: 'Capacity hotspots, Needs attention, Systems / Service types rollup, and Solutions headers' },
    { name: 'Grid', usage: 'Capacity hotspots — three responsive cells (storage / CPU / idle)' },
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
      reason: 'Volume-gated Overview: empty (banner + No services yet + Explore the platform + No usage yet), small (detailed metrics + flat Needs attention), large (group-by, Systems/Service types rollup, grouped Needs attention). Capacity hotspots (storage / CPU / idle). Per-module empty / Skeleton / Retry',
    },
    {
      name: 'CreateServiceTopologyModal',
      reason: 'Empty-state create flow in acme-dev (By environment). Steps: topology templates → first service for that topology → review. Template previews are dimmed, dashed and labelled "Example layout" so nothing reads as already created.',
    },
    {
      name: 'ExploreSolutions',
      reason: 'Explore-solutions entry point: an inline panel (not a modal) that replaces the empty state with "What do you want to build?" and six outcome cards — Stream events, Store app data, Search & logs, Real-time analytics, Cache & sessions, Run an app next to data. No Aiven service names on this screen; Back returns to the empty state with nothing created.',
    },
    {
      name: 'SolutionBlueprint',
      reason: 'Blueprint screen for a chosen outcome: monospace tree of what gets created in this project (<type>-<env> names, plan and price per node, optional nodes as toggles that start off) beside the three "You\'ll be able to" statements, a region selector prefilled from the project default, and the total. In a Production project it adds the amber HA-plan line with an inline sibling-project switcher.',
    },
    {
      name: 'BlueprintGateSheet',
      reason: 'Drawer gate before anything is created: one checkbox row per billable item with plan and price, a running total, and a confirm button that spells out the commitment ("Create 2 services · €319/mo"). Gated Runtime items are listed without a price so the count stays honest.',
    },
    {
      name: 'BlueprintDeployment (BlueprintDeploymentView)',
      reason: 'Post-confirm project page: blueprint progress card ("2 of 3 creating") with the integration that appears once both parents exist, a resume card for items left out at the gate (Add / Dismiss), and a services DataTable of Building rows plus any gated Runtime row with Request access.',
    },
    {
      name: 'solutionBlueprints (project context + blueprint fixtures)',
      reason: 'Local model for the flow: sibling projects with environment, naming token and region default; plan tier by environment (Startup for dev/staging, Business for production); per-node plans and euro prices; the six outcome blueprints, their integration, and the APPS_ENABLED flag that models an org without Aiven Apps.',
    },
    {
      name: 'MetricCard / CapacityHotspots / GroupRollup / NeedsAttention / AttentionRow / ModuleStatus',
      reason: 'Local presentational helpers composing OverviewV2 modules from Aquarium primitives + --aquarium-* tokens, including Skeleton and inline Alert Retry wrappers',
    },
    {
      name: 'overviewV2Data (dataset + selectors)',
      reason: 'Local deterministic mock: large (54), small (8), and empty (0) datasets; pageScale() at 0 / <15 / ≥15; summarize()/deriveCapacityHotspots()/groupServices() selectors. Activity rows feed the Overview Timeline',
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
    'Feature flag: the Overview header "New Overview" Switch toggles OverviewV2 vs the shared OverviewContent. Volume (Empty / Small / Large) and async (Loaded / Loading / Error) SegmentedControls preview page and module states. Retry on a module error returns to Loaded.',
    'Recent project activity sits at the top of Overview as an Aquarium Timeline (title = change, caption = resource · actor · when, status variants). At large scale it is ranked worst-first (error, then warning, then the rest by recency) and capped at the top 3, with the subtitle pointing at the event log for the full feed.',
    'Needs attention is a DataTable of project-level issues ordered by impact (Issue, Affected resources, Impact, Started), with quick filters for severity (All / High / Other) plus the alert kinds from the Console alerts table (Close EOL / Maintenance / Degraded service), each showing its count and disabled at zero. Service type and Needs attention are peer tabs below the metrics.',
    'Group by (System / Service type / None, default System) drives both the grouped rollup module (Systems / Service types) and the Needs-attention Accordion grouping.',
    'Summary metric row (responsive grid, minmax(150px,1fr)): Needs attention (danger accent when >0), Month-to-date spend (+ forecast, warning when over budget), Storage used (X/Y TB + count over 85%), Off latest version (+ EOL < 30 days).',
    'Local mock data in overviewV2Data.ts is deterministic and decoupled from the shared ProjectPageMockData; no backend or fabricated live metrics. Non-Overview tabs still use the shared projectPageData.',
    'All colors/spacing use --aquarium-* tokens; primitives verified via the Storybook MCP before use.',
    'Iconography aligned to the real Console (aiven-core-ui-reference/ui/console): ServiceStatusChip state→icon (RUNNING=tickCircle/success, REBUILDING·REBALANCING=loading/info, POWEROFF=power/neutral), AttentionRequiredServiceList severity InlineIcons (error/danger-default, warningSign/warning-default), ServiceNameCell service-type logo, and EOL=outdated. Logic unchanged — visual alignment only.',
    'Explore-solutions brief: the project is acme-dev with a Development environment chip, so plan tier, naming convention (<type>-<env>) and region can be read from project context. The empty state now has two live paths — Create your first service (knows the service type) and Explore solutions (knows the outcome). Both end in a service in this project, or back at the empty state with nothing created.',
    'Outcome picker is deliberately product-name-free: service names only appear once a blueprint proposes what to create.',
    'Explore → outcome → Create blueprint → Confirm is four clicks from empty state to first service building. Every step is reversible: Back and Change outcome leave the project exactly as found, and the gate is the only place anything is committed.',
    'Colour rule across the flow: teal for live/primary, amber for pending or gated (Building rows, HA-plan warning, Runtime access required), gray for idle. Every amber item carries its own next action.',
    'Demo controls for this flow (Empty volume only): the acme-dev / acme-prod segmented control shows the same selection re-priced by environment. Aiven Apps is modelled as not enabled (APPS_ENABLED = false in solutionBlueprints.ts) so the Run-an-app blueprint always shows the degraded Runtime path.',
    'States covered: full blueprint (2 of 2 creating + integration link), partial confirm (1 of 2 with a resume card naming what is left), and gated app (2 of 3 with an amber Runtime row). No half-built or orphaned state in any of them.',
  ],
}
