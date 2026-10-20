import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

/**
 * Manual component map for this experiment.
 * Custom-UI experiment: Project Services list with the Console Create service
 * modal shell plus the inherited Quick Upgrade flow. Aquarium entries are
 * ordered by first appearance (top → bottom).
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
      usage: 'Services title with breadcrumb trail and Create service primary action (opens the Console create shell)',
      storybookUrl: aquariumStorybookLinks.PageHeader,
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
      usage: 'Service name links in the services table (prototype no-op navigation); numbered source citations inside the demo answer',
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
      usage:
        'Create service shell — full-size "Select service type" then full-size "Create {type} service" wrapping CreateService; also the reused Quick Upgrade dialog',
      storybookUrl: aquariumStorybookLinks.Modal,
    },
    {
      name: 'Card / Card.Group',
      usage:
        'Screen 1 Search demo radio cards; Screen 3 data-source templates and upload card; also plan option cards in the reused Quick Upgrade modal',
      storybookUrl: aquariumStorybookLinks.Card,
    },
    {
      name: 'Alert / Alert.Banner',
      usage:
        'Screen 1 OpenSearch create callout; Screen 2 skip-path banner on the services list and Overview; also trial-credits / maintenance notices in reused screens',
      storybookUrl: aquariumStorybookLinks.Alert,
    },
    {
      name: 'Icon',
      usage: 'Nodes badge and modal CTA icons (via shared components and the reused modal)',
    },
    {
      name: 'Chip / ChipContainer',
      usage:
        'Read-only embedding and LLM model pills in the How it works card and the Answer header (plain Chips, no lock icon); cluster nodes role chips and header version/node-count chips',
      storybookUrl: aquariumStorybookLinks.Chip,
    },
    {
      name: 'ChoiceChipGroup / ChoiceChip',
      usage:
        'Cluster nodes view — interactive "Node status" rollup filter; Screen 5 Keyword / Semantic / Hybrid mode toggle, shown after the first search on the row above the results',
    },
    {
      name: 'ProgressBar',
      usage:
        'Cluster nodes disk/sync bars; Screen 4 preparing-data wait (progresStatus info/warning, completedStatus success/error)',
      storybookUrl: aquariumStorybookLinks.ProgressBar,
    },
    {
      name: 'Drawer',
      usage: 'Cluster nodes view — md node-detail drawer (roles, resource utilisation, placement, streaming) with View logs / Restart node footer actions',
    },
    {
      name: 'Switch',
      usage: 'Cluster nodes drawer — real-time metric stream toggle; demo page "Results explained" switch (label left) on the right of the results summary line',
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
      usage:
        'OpenSearch service sidebar — grouped nav (no RAG demo item; the demo page opens from the Overview card)',
      storybookUrl: aquariumStorybookLinks.Navigation,
    },
    {
      name: 'Accordion',
      usage: 'Screens 5–6 ranked source rows — Summary title/description + Panel chunk (Figma Code Connect composition)',
    },
    {
      name: 'SearchInput',
      usage: 'Screen 5 query field with example chips; clear/search icon from Aquarium',
      storybookUrl: aquariumStorybookLinks.Input,
    },
    {
      name: 'EmptyState',
      usage: 'Prepare step preparing-data wait',
    },
    {
      name: 'Alert',
      usage: 'Skipped-file warning on upload, demo-ready confirmation, and the OpenSearch create callout',
    },
    {
      name: 'Modal',
      usage: 'Generate RAG demo. Footer is Cancel, Back, and the step’s primary action, each with a per-step actionKey.',
      storybookUrl: aquariumStorybookLinks.Modal,
    },
    {
      name: 'Stepper (dense)',
      usage: 'Top of the Modal body. Flow A: Choose data → Review → Generate. Flow B: Choose data → Indexing → Review → Generate.',
      storybookUrl: aquariumStorybookLinks.Stepper,
    },
    {
      name: 'Grid / Grid.Item',
      usage: 'Review step: summary Sections on the left (7/12), How the RAG demo works card on the right (5/12)',
    },
    {
      name: 'FileInput',
      usage:
        'Choose data step, shown inline under the cards once Upload your own data is selected — TXT only, multi-file (up to 50), with per-file type/size/empty validation, duplicate detection, and a limit guard',
      storybookUrl: aquariumStorybookLinks.Input,
    },
    {
      name: 'Section',
      usage: 'Review step Data / Chunking / Models summaries (no Edit actions; Back returns to earlier steps); Service Overview cards (Connection information, Service plan usage, Backups and forking, Maintenance, Cloud and network, Cross cluster replication, Integrations) — title/subtitle/collapsible/actions/menu',
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
      name: 'UpgradeSuccessBanner',
      reason: 'Local success feedback shown after an upgrade applies the new plan to a row',
    },
    {
      name: 'CreateServiceShell',
      reason:
        'Wires Create service to the Console two-step modal shell: ServiceTypeSelectModal then Modal + embedded CreateService. For OpenSearch, the Free and Developer tier cards get three extra tick points (via the CreateService extraTierFeatures prop): Includes RAG demo, Embedding and LLM models already chosen, Demo appears on the service Overview once running. The demo is auto-included (no user choice)',
    },
    {
      name: 'StepWrapper',
      reason: 'Description and body under Modal.Stepper. The step title is the modal heading, so this does not repeat it.',
    },
    {
      name: 'VectorSearchDemoWizard',
      reason: '"Generate RAG demo" flow on Aquarium Modal + dense Stepper, opened from the Overview card',
    },
    {
      name: 'ChooseDataStep / IndexingStep / ReviewStep',
      reason: 'Step bodies — dataset cards with the file picker inline for uploads; IndexingStep (flow B only) is a chunk size Card.Group; Review shows data, models and chunking, and the How it works card. Created on your service (index / vector field / ingest pipeline / estimated storage) and the OpenSearch docs sit behind an Advanced text button; the Section header Switch (Section switch prop, label left) "Show in code" swaps the rows for read-only Index mapping / Ingest pipeline JSON Tabs in the same Section, collapsed so Generate demo stays in view',
    },
    {
      name: 'PipelineIllustration',
      reason: 'Review step — right-hand "How the RAG demo works" card (HowItWorksCard in DemoSetup.tsx) (--aquarium-background-color-muted background, same as the Answer panel) with four stages stacked top to bottom (Your documents, Embedded, Indexed in OpenSearch, Answer with sources): Aquarium icons in chart-color circles joined by vertical dashed connectors, white labels beside each circle, model Chips (no lock icon) beside Embedded and Answer. No Aquarium equivalent; colors use Aquarium color tokens, not hex.',
    },
    {
      name: 'ModelRequest',
      reason: 'Step 1 — inline "Request a different model" form (ChoiceChipGroup + Textarea); inline so it does not stack a second Modal on the stepper',
    },
    {
      name: 'PreparingData / PrepStageList',
      reason: 'Step 4 — named stages with counts (upload, chunking, embeddings, indexing), port of Console Kafka ResourceStatusList. The close-window note is a Typography.Subheading. Retry resumes the failed stage. "Continue in background" closes the modal; setup keeps running',
    },
    {
      name: 'useVectorDemo',
      reason: 'Demo state and the mock setup timer on the service shell, so progress survives closing the modal and drives the Overview card',
    },
    {
      name: 'VectorDemoSetupCard / VectorDemoStatusCard',
      reason: 'Overview — setup card is a port of Console KafkaStartStreamCardWrapper: a 280px card left of Connection information (Console Kafka overview layout, same height, wraps below on narrow screens) with assets/vector-demo-card.svg on top at 168px on a primary-active area that grows to fill the card height, then title, description, and Generate demo directly below. While Setting up (including after Continue in background), the Overview shows the same 280px illustrated card with the image dimmed (40% opacity, grayscale), an info StatusChip "Setting up" (no percentage) in the top-left of the image area, then "Setting up the RAG demo", the current stage summary, a ProgressBar and a ghost View progress → action (no Delete demo). The ready and error cards keep the same 280px width and are ports of KafkaDataGeneratorCardWrapper. Ready uses the same illustrated card at full colour: success StatusChip "Ready" in the top-left of the image, then "RAG demo", a default-colour (not muted) "<dataset> is indexed…" description, stats in two columns (index, documents, chunks, storage) and Search data, so there is no empty space (Delete demo lives in the demo page header). Error shows View progress and Delete demo. The demo page (opened from the Overview card, no sidebar item) keeps the detailed status card with every stage listed',
    },
    {
      name: 'StopDemoModal',
      reason: 'Delete confirmation listing what stays on the service (index, pipeline, files), that the service keeps running, and a rating + optional comment. Removes the demo without deleting the index',
    },
    {
      name: 'VectorDemoPage',
      reason: 'Demo page opened with View demo after setup — a Section holding the search (no tabs); Results explained is a Switch beside the results. Delete demo is the header action (Button.Secondary), replacing the service menu and Open support ticket',
    },
    {
      name: 'QueryResults',
      reason: 'Demo page search — pre-search prompt, then a loading state, then Keyword/Semantic/Hybrid results. The pre-search and loading mark is the user-supplied assets/search-mark.png (not in Aquarium or Storybook). The pre-search and loading panels stretch to the bottom of the viewport (loading keeps a 280px minimum). Example queries appear only in the pre-search panel. After a search, a row under the search box holds the Keyword/Semantic/Hybrid ChoiceChips on the left and the "Results explained" Switch on the right, followed by the results summary. The answer answers the question and cites sources inline as numbered Aquarium Links ([1], [2]…, numbered by the source rank in the current mode); clicking one opens that source accordion (controlled via openPanelId) and scrolls to it, turning Results explained off if it was on. turning it on keeps the answer and replaces the source list with ResultsExplained. There is no See explanation button. The answer container is a Box with the background-color-muted token (same grey as the Console "How billing works" panel), no border',
    },
    {
      name: 'ResultsExplained',
      reason: 'Demo page, shown under the answer when the Results explained switch is on — mode, matched text, and High/Medium/Low for the latest search',
    },
    {
      name: 'ragDemo.ts',
      reason: 'Mock models, Search demo options, data templates, and upload constraints (no Bedrock)',
    },
    {
      name: 'ServiceTypeSelectModal',
      reason: 'Reused shared Console type picker (from @/screens) — first step of Create service',
    },
    {
      name: 'CreateService',
      reason:
        'Reused shared Console create form (from @/screens) embedded in a full Modal — keeps existing price/plan calculation',
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
      reason: 'Service-level shell shown when the OpenSearch service is opened: service sidebar + breadcrumb + header (chips, "..." menu, Open support ticket; on the running demo page those become a Delete demo Button.Secondary) + content switch',
    },
    {
      name: 'OpenSearchServiceSidebar',
      reason: 'Grouped OpenSearch service nav (aiven-core reference): Overview (with Overview + Cluster overview), Data, Observe, Users, Backups, Service settings',
    },
    {
      name: 'OpenSearchOverview',
      reason: 'The Service Overview page rebuilt from the real Console (Connection info, Service plan usage, Backups, Maintenance, Cloud/network, Cross cluster replication, Integrations). An optional `leading` slot puts the demo card left of Connection information, as on the Console Kafka overview.',
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
    'Custom-UI experiment under experiments/marwa/rag-demo-v2/ — copied from marwa/ProjectList ("Free & Dev: Quick Upgrade V4"), self-contained (no ExperimentPageShell redirect).',
    'Design change: Create service opens the Console create-service modal shell (select type → create form), matching PlaygroundStateContext.',
    'Screen 1: OpenSearch create shows an Includes RAG demo information Alert after Service tier — no user choice; the demo is auto-included on Free/Dev. No post-create dialog: the new service starts Rebuilding and the demo is offered only once it is Running.',
    'Overview: while the service is Rebuilding, the same "Try the RAG demo" card sits left of Connection information with a blue info StatusChip "Pending till service created" in the top-left corner of the image area and Generate demo disabled. Once Running, the chip goes away and Generate demo is enabled (no model chips — models are only shown once data is picked).',
    'Demo wizard: Aquarium Modal titled "Generate RAG demo". A prototype-only SegmentedControlGroup ("Prototype flow") above the Stepper switches between flow A (Predefined chunking: Choose data, Review, Generate) and flow B (Choose chunk size: Choose data, Indexing, Review, Generate). Switching resets to Choose data and chunk size to Medium; the switch is hidden on Generate. Footer is Cancel, Back, and that step primary action. Closing and reopening resumes where the user left off.',
    'Step 1 Choose data: full width. "Choose sample data or upload your own" with two labelled groups in one Card.Group, separated by spacing only (no divider) — "Sample datasets" (E-commerce, DevOps runbook, Support FAQ) and "Your own data" (Upload your own data). Cards sit in an Aquarium Template (columns={3}, columnGap="l2") with fullWidth, matching the Kafka data generator StepSelectDatatype. E-commerce catalog is preselected (INITIAL_DEMO_DRAFT). Each sample card body is one line: description plus "<count> documents."; the upload card says "Up to 50 .txt files, 10 MB each." Selecting the upload card shows the FileInput, file list and skipped-files Alert inline below the cards, so files are added where the choice is made. Primary: Continue to review (flow A) or Next (flow B), disabled until a dataset is chosen or at least one file is added.',
    'Step 2 Indexing (flow B only): "Choose a chunk size" Card.Group with Small, Medium (Recommended StatusChip, preselected) and Large in a three-column Template, each card stating tokens and overlap plus when to use it. A muted line says chunking is fixed-size with overlap and the models are predefined. Primary: Continue to review. Flow A has no step 2; chunk size is Medium (DEMO_CHUNK_SIZE_ID).',
    'Step 3 Review: summary Sections on the left (7/12) and the How the RAG demo works card on the right (5/12). Flow A shows Data, then one "Models and chunking" Section (Predefined for this demo: embedding model, LLM, chunking method, chunk size, estimated chunks). Flow B shows Data, Chunking (the chosen size), then Models (Predefined for this demo). No Edit actions; Back returns to the previous step. Created on your service (index, vector field, ingest pipeline, estimated storage) and the OpenSearch docs are behind a collapsed Advanced text button. A "Show in code" Switch on the right of that Section header replaces the rows with read-only Index mapping / Ingest pipeline JSON Tabs in place. Footer primary: Generate demo.',
    'Step 4 Generate (Stepper label; formerly Prepare): stage list with counts. Footer primary is View demo, disabled until ready. While preparing, Back is Continue in background. A filename containing "fail" fails once; Retry resumes that stage. The modal waits on "Your demo is ready".',
    'Step 5 Search and explore: opens on a pre-search prompt for the chosen data, then a loading state, then Keyword/Semantic/Hybrid results. A "Results explained" switch sits on the right of the results summary line, with no separate See explanation button.',
    'Step 5 (continued): with the switch on, the answer stays and the source list is replaced by why the mode matched, how the score was calculated, and which text mattered.',
    'Demo starting state: local DEMO_SERVICES dataset (experiments/marwa/rag-demo-v2/demoServices.ts), typed with the shared ServiceRow from src/screens/ProjectServices. os-maxim-muzafarov-1c149c43 starts at 17 nodes.',
    'Keeps the existing price/plan calculation logic: upgrades apply UPGRADE_PLAN_SERVICE_DATA (plan name, details, nodes, CPU, RAM, storage) to the selected row.',
    'Per-row Upgrade stays on Free and Developer services. The project Quick upgrade banner is not shown.',
    'Service shell: clicking the os-maxim-muzafarov-1c149c43 OpenSearch service opens OpenSearchServiceShell — a service-level page (sidebar + Overview) modeled on the real Aiven Console (aiven-core ui/console). The service nav mirrors the opensearch layout from aiven-core ServiceNavigation.',
    'Nav structure: "Overview" is an expandable group containing "Overview" (the default landing Service Overview page) and "Cluster overview" (the node topology view / NodeView).',
    'Nodes popover: clicking the "Nodes N" chip on the OpenSearch service header OR the OpenSearch row in the ProjectList table opens NodesPopover — an anchored dropdown that recreates the Claude Design "Nodes" reference (status filter chips + compact node list with role code, Hot/Warm tier pill, status dot, and sync progress). Its "View all nodes" link navigates to the full Cluster overview (NodeView).',
    'Cluster overview view (NodeView): an in-experiment topology screen — service header, interactive Node status rollup, a nodes DataTable (Node / Roles / Node type / Status / Disk-Sync), and a per-node detail Drawer.',
    'Node data is generated locally in clusterNodes.ts (TS port of the OS-NodeView Discovery reference): a deterministic 17-node cluster (3 cluster managers + 7 hot-tier + 7 warm-tier data nodes) with a compact role-string decoder. No new npm deps.',
    'Rebuilt with Aquarium only — the reference HTML/CSS/tokens were not copied; all colors/spacing use --aquarium-* tokens.',
    'Storybook links intentionally left unset — resolve via Storybook MCP rather than inventing URLs.',
  ],
}
