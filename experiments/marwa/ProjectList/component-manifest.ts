import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Custom-UI experiment: a self-contained Project Services list with an in-folder
 * Quick Upgrade flow. Aquarium entries are ordered by first appearance (top → bottom).
 * Verified against the Aquarium Storybook MCP before use. Update when usage changes.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, sidebar/content split, banners, table cell layout',
    },
    {
      name: 'ConsoleHeader',
      usage: 'Shared Console top bar (rendered from index.tsx) — Projects nav active',
    },
    {
      name: 'PageHeader',
      usage: 'Services title with breadcrumb trail and Create service primary action',
    },
    {
      name: 'Breadcrumbs',
      usage: 'Organization → Projects → project → Services trail inside PageHeader',
    },
    {
      name: 'Typography',
      usage: 'Plan names, service names, banner copy, and muted captions',
    },
    {
      name: 'Link',
      usage: 'Service name links in the services table (prototype no-op navigation)',
    },
    {
      name: 'Button',
      usage: 'Review upgrades CTA (primary) and per-row Upgrade/Change + Dismiss (ghost); OpenSearch details "Give feedback" (Button.Secondary dense + chat icon, beside breadcrumbs)',
    },
    {
      name: 'StatusChip',
      usage: 'Plan tier chips, upgrade-eligibility count chip, and nodes/status chips',
    },
    {
      name: 'DataTable',
      usage: 'Services list — custom Service/Nodes/Plan columns, item Cloud column, text Created column',
    },
    {
      name: 'Modal',
      usage: 'Quick Upgrade dialog via the reused UpgradeServiceModalV2 (dual-hobbyist-clouds variant)',
    },
    {
      name: 'Card',
      usage: 'Plan option cards and CTAs inside the reused Quick Upgrade modal',
    },
    {
      name: 'Alert',
      usage: 'Trial-credits notice inside the reused Quick Upgrade modal',
    },
    {
      name: 'Icon',
      usage: 'Nodes badge and modal CTA icons (via shared components and the reused modal)',
    },
    {
      name: 'Chip',
      usage: 'Cluster nodes view — node role chips (Manager/Data/Ingest/Coordinating) and header version/node-count chips',
    },
    {
      name: 'ChoiceChipGroup / ChoiceChip',
      usage: 'Cluster nodes view — interactive "Node status" rollup filter (radio: All + per-status counts)',
    },
    {
      name: 'ProgressBar',
      usage: 'Cluster nodes view — dense disk/sync bars in the table and CPU/Mem/Heap/Disk bars in the node drawer (progresStatus info/warning, completedStatus success)',
    },
    {
      name: 'Drawer',
      usage: 'Cluster nodes view — md node-detail drawer (roles, resource utilisation, placement, streaming) with View logs / Restart node footer actions',
    },
    {
      name: 'Switch',
      usage: 'Cluster nodes drawer — real-time metric stream toggle',
    },
    {
      name: 'Tooltip',
      usage: 'Cluster nodes table — elected-lead-manager explanation on the "lead" chip',
    },
    {
      name: 'Divider',
      usage: 'Cluster nodes drawer — separates detail sections',
    },
    {
      name: 'Navigation (+ Header/Item/Submenu/Divider)',
      usage: 'OpenSearch service sidebar — grouped nav (Overview, Data, Observe, Backups) mirroring aiven-core ServiceNavigation',
    },
    {
      name: 'Section',
      usage: 'Service Overview cards (Connection information, Service plan usage, Backups and forking, Maintenance, Cloud and network, Cross cluster replication, Integrations) — title/subtitle/collapsible/actions/menu',
    },
    {
      name: 'Tabs',
      usage: 'Connection information — OpenSearch / OpenSearch Dashboards tabs',
    },
    {
      name: 'DropdownMenu',
      usage: 'Service header "..." actions menu and per-Section contextual menus',
    },
    {
      name: 'Alert',
      usage: 'Maintenance card — mandatory-updates notice (error tone)',
    },
    {
      name: 'Icon / Button.Icon',
      usage: 'Copy (duplicate), reset, info, and overflow (more) affordances on the Overview page',
    },
  ],

  prototypeComponents: [
    {
      name: 'ProjectListContent',
      reason: 'Self-contained Project Services screen composed from Aquarium primitives + reused mock data',
    },
    {
      name: 'UpgradeEligibilityBanner',
      reason: 'Design change: surfaces how many Free/Developer services can be quick-upgraded, with a Review CTA',
    },
    {
      name: 'UpgradeSuccessBanner',
      reason: 'Local success feedback shown after an upgrade applies the new plan to a row',
    },
    {
      name: 'ServicesTable',
      reason: 'DataTable of services with an always-visible per-row Upgrade/Change action',
    },
    {
      name: 'PlanCell',
      reason: 'Plan column: plan name, tier chip, plan details, and the Upgrade/Change button',
    },
    {
      name: 'ConsoleHeader',
      reason: 'Reused shared Console top nav (from @/components) to keep the Console-like shell',
    },
    {
      name: 'ServiceIcon',
      reason: 'Reused shared service-type icon (from @/components) in the Service column',
    },
    {
      name: 'ServiceStatusChip',
      reason: 'Reused shared status chip (from @/components) mapping service status to tone',
    },
    {
      name: 'NodesCountChip',
      reason: 'Reused shared nodes-count badge (from @/components) in the Nodes column',
    },
    {
      name: 'UpgradeServiceModalV2',
      reason: 'Reused shared Quick Upgrade modal (from @/screens) with the dual-hobbyist-clouds plan variant',
    },
    {
      name: 'NodeView',
      reason: 'OpenSearch "Cluster nodes" topology screen — opens when the os-maxim-muzafarov-1c149c43 service name is clicked; rebuilt entirely from Aquarium primitives',
    },
    {
      name: 'RoleChips',
      reason: 'Decodes a node role string into Aquarium Chip role tags + a tier StatusChip (Hot/Warm)',
    },
    {
      name: 'NodeStatusChip / StatusDot',
      reason: 'Maps node status to an Aquarium StatusChip tone; StatusDot renders the matching legend dot from tone tokens',
    },
    {
      name: 'SyncCell',
      reason: 'Disk / Sync table cell: dense ProgressBar + transfer/recovery caption, or disk usage for settled nodes',
    },
    {
      name: 'NodeDetail',
      reason: 'Body of the node-detail Drawer (roles + raw string, resource utilisation, placement, streaming toggle)',
    },
    {
      name: 'OpenSearchServiceShell',
      reason: 'Service-level shell shown when the OpenSearch service is opened: service sidebar + breadcrumb + header (chips, "..." menu, Open support ticket) + content switch',
    },
    {
      name: 'OpenSearchServiceSidebar',
      reason: 'Grouped OpenSearch service nav (aiven-core reference): Overview (with Overview + Cluster overview), Data, Observe, Users, Backups, Service settings',
    },
    {
      name: 'OpenSearchOverview',
      reason: 'The Service Overview page rebuilt from the real Console (Connection info, Service plan usage, Backups, Maintenance, Cloud/network, Cross cluster replication, Integrations)',
    },
    {
      name: 'CpuMiniChart / PlanUsageBar / ConnRow / InfoStat',
      reason: 'Local presentational helpers for the Overview cards (CPU sparkline, usage bars, copyable connection rows, stat cells)',
    },
    {
      name: 'NavPlaceholder',
      reason: 'Prototype placeholder body for service nav items that are not built out (Indexes, Metrics, Logs, Users, etc.)',
    },
    {
      name: 'NodesPopover',
      reason: 'Anchored "Nodes" popover opened from the "Nodes N" chip on the OpenSearch service header and the ProjectList Nodes column — status filter chips + compact NAME/ROLE/STATUS/SYNC PROGRESS list + "View all nodes" link',
    },
    {
      name: 'NodesChipTrigger',
      reason: 'Clickable NodesCountChip wrapper that opens NodesPopover; shared by the service header and the OpenSearch row in the services table',
    },
    {
      name: 'RoleCode / TierPill / FilterChip / NodeRow (NodesPopover)',
      reason: 'Local presentational helpers for the Nodes popover: monospace role-string chip, solid Hot/Warm tier pill, count filter chip, and a compact grid row with copy + elected-manager star',
    },
  ],

  notes: [
    'Custom-UI experiment under experiments/marwa/ProjectList/ — continues the "Free & Dev: Quick Upgrade V4" scenario as a self-contained screen (no ExperimentPageShell redirect).',
    'Demo starting state: local DEMO_SERVICES dataset (experiments/marwa/ProjectList/demoServices.ts), typed with the shared ServiceRow from src/screens/ProjectServices. os-maxim-muzafarov-1c149c43 starts at 17 nodes.',
    'Keeps the existing price/plan calculation logic: upgrades apply UPGRADE_PLAN_SERVICE_DATA (plan name, details, nodes, CPU, RAM, storage) to the selected row.',
    'Design change: adds an Upgrade eligibility banner and an always-visible per-row Upgrade action to improve discoverability of the quick-upgrade flow.',
    'Service shell: clicking the os-maxim-muzafarov-1c149c43 OpenSearch service opens OpenSearchServiceShell — a service-level page (sidebar + Overview) modeled on the real Aiven Console (aiven-core ui/console). The service nav mirrors the opensearch layout from aiven-core ServiceNavigation.',
    'Nav structure: "Overview" is an expandable group containing "Overview" (the default landing Service Overview page) and "Cluster overview" (the node topology view / NodeView).',
    'Nodes popover: clicking the "Nodes N" chip on the OpenSearch service header OR the OpenSearch row in the ProjectList table opens NodesPopover — an anchored dropdown that recreates the Claude Design "Nodes" reference (status filter chips + compact node list with role code, Hot/Warm tier pill, status dot, and sync progress). Its "View all nodes" link navigates to the full Cluster overview (NodeView).',
    'Cluster overview view (NodeView): an in-experiment topology screen — service header, interactive Node status rollup, a nodes DataTable (Node / Roles / Node type / Status / Disk-Sync), and a per-node detail Drawer.',
    'Node data is generated locally in clusterNodes.ts (TS port of the OS-NodeView Discovery reference): a deterministic 17-node cluster (3 cluster managers + 7 hot-tier + 7 warm-tier data nodes) with a compact role-string decoder. No new npm deps.',
    'Rebuilt with Aquarium only — the reference HTML/CSS/tokens were not copied; all colors/spacing use --aquarium-* tokens.',
    'Storybook links intentionally left unset — resolve via Storybook MCP rather than inventing URLs.',
  ],
}
