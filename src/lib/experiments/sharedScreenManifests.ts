import type { ComponentManifest } from './types'

/**
 * Reusable component maps for shared console screens launched by thin
 * ExperimentPageShell experiments. Spread into experiment manifests and add
 * launcher-specific notes.
 */

export const projectServicesScreenManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page shell and filter / table layout containers' },
    { name: 'PageHeader', usage: 'Services list title and primary actions' },
    { name: 'Breadcrumbs', usage: 'Org / project path in the page header' },
    { name: 'Typography', usage: 'Headings, table cells, and helper copy' },
    { name: 'Button', usage: 'Create service, filter, and row actions' },
    { name: 'Filter', usage: 'Active filter chips above the services table' },
    { name: 'Checkbox', usage: 'Row selection and filter options' },
    { name: 'CheckboxGroup', usage: 'Grouped filter option sets' },
    { name: 'DateTimeRangePicker', usage: 'Time-range filters where used' },
    { name: 'DataTable', usage: 'Primary services list table' },
    { name: 'Table', usage: 'Legacy / nested table layouts in the list' },
    { name: 'Pagination', usage: 'Services list paging' },
    { name: 'DropdownMenu', usage: 'Row and header overflow actions' },
    { name: 'StatusChip', usage: 'Service status labels in the list' },
    { name: 'Switch', usage: 'Toggle filters and list options' },
    { name: 'Divider', usage: 'Separators in filter panels' },
    { name: 'Link', usage: 'Service name and related links' },
    { name: 'Tooltip', usage: 'Truncated cell and icon explanations' },
    { name: 'InlineIcon', usage: 'Inline status and affordance icons' },
    { name: 'InputBase', usage: 'Low-level input chrome for custom filter triggers' },
  ],
  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top nav chrome',
    },
    {
      name: 'ProjectSidebar',
      reason: 'Project-level left navigation',
    },
    {
      name: 'ServiceStatusChip',
      reason: 'Console-specific service state chip wrapper',
    },
    {
      name: 'NodesCountChip',
      reason: 'Node-count chip used in service rows',
    },
    {
      name: 'ServiceIcon',
      reason: 'Service-type icon in list rows',
    },
    {
      name: 'UpgradeServiceModalV2',
      reason: 'Upgrade-plan overlay used by free-dev-upgrade scenarios',
    },
    {
      name: 'MysqlAcuRolloutModal',
      reason: 'ACU pricing intro modal for mysql-acu-rollout',
    },
  ],
  notes: [
    'Map describes shared ProjectServices (src/screens/ProjectServices.tsx) and common list overlays.',
  ],
}

export const billingInvoiceScreenManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Invoice page and charge breakdown layout' },
    { name: 'PageHeader', usage: 'Invoice title and header actions' },
    { name: 'Breadcrumbs', usage: 'Billing path in the page header' },
    { name: 'Typography', usage: 'Line items, totals, and helper copy' },
    { name: 'Section', usage: 'Summary and charge-group sections' },
    { name: 'StatusChip', usage: 'Invoice / line-item status labels' },
    { name: 'Icon', usage: 'Cloud, service, and expand affordances' },
  ],
  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top nav chrome',
    },
    {
      name: 'BillingSidebar',
      reason: 'Billing admin left navigation',
    },
  ],
  notes: [
    'Map describes shared BillingInvoiceDetail (src/screens/BillingInvoiceDetail.tsx).',
  ],
}

export const serviceOverviewScreenManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Overview / logs layout containers' },
    { name: 'PageHeader', usage: 'Service title, chips, and actions' },
    { name: 'Breadcrumbs', usage: 'Org / project / service path' },
    { name: 'Typography', usage: 'Headings, log rows, and helper copy' },
    { name: 'Section', usage: 'Overview content blocks' },
    { name: 'Tabs', usage: 'Connection and related tab sets' },
    { name: 'Button', usage: 'Primary and secondary service actions' },
    { name: 'Alert', usage: 'Service notices and warnings' },
    { name: 'StatusChip', usage: 'Version, status, and log severity chips' },
    { name: 'Chip', usage: 'Non-status labels in header and filters' },
    { name: 'DropdownMenu', usage: 'Service and section overflow menus' },
    { name: 'Filter', usage: 'Log and metrics filter chips' },
    { name: 'Checkbox', usage: 'Filter options' },
    { name: 'CheckboxGroup', usage: 'Grouped log filter options' },
    { name: 'DateTimeRangePicker', usage: 'Logs / metrics time range' },
    { name: 'DataList', usage: 'Expandable logs and detail lists' },
    { name: 'Drawer', usage: 'Log / detail side panels' },
    { name: 'Switch', usage: 'Section and feature toggles' },
    { name: 'Link', usage: 'Connection values and learn-more links' },
    { name: 'Icon', usage: 'Action and status icons' },
    { name: 'Tooltip', usage: 'Icon and truncated text explanations' },
    { name: 'InputBase', usage: 'Custom filter trigger chrome' },
  ],
  prototypeComponents: [
    {
      name: 'ConsoleHeader',
      reason: 'Shared playground top nav chrome',
    },
    {
      name: 'ServiceSidebar',
      reason: 'Service-level left navigation',
    },
    {
      name: 'CompactServiceHeader',
      reason: 'Dense service header used in some overview states',
    },
    {
      name: 'AuditLogsHistogram',
      reason: 'Custom logs histogram visualization',
    },
    {
      name: 'ServiceMetricsBody',
      reason: 'Metrics body for the Observe area',
    },
    {
      name: 'ServiceStatusChip',
      reason: 'Console-specific service state chip wrapper',
    },
    {
      name: 'NodesCountChip',
      reason: 'Node-count chip in the service header',
    },
  ],
  notes: [
    'Map describes shared ServiceOverview (src/screens/ServiceOverview.tsx).',
  ],
}

export const playgroundOnboardingScreenManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Phase layout containers across welcome / hub / browse' },
    { name: 'Typography', usage: 'Headings and body copy in onboarding phases' },
    { name: 'Button', usage: 'Continue, skip, and CTA actions' },
    { name: 'Card', usage: 'Service and option cards' },
    { name: 'Chip', usage: 'Service / plan labels on cards' },
    { name: 'Divider', usage: 'Section separators in welcome and hub' },
    { name: 'Input', usage: 'Name and profile fields on welcome' },
    { name: 'Select', usage: 'Org / preference selects on welcome' },
    { name: 'Textarea', usage: 'Browse / feedback text areas (TextareaBase)' },
    { name: 'Modal', usage: 'Sandbox and PG Studio welcome modals' },
    { name: 'ProgressBar', usage: 'Playground loading progress' },
    { name: 'Stepper', usage: 'Onboarding step indicator' },
    { name: 'Icon', usage: 'Footer and shared tile icons' },
    { name: 'Link', usage: 'Footer and helper links' },
  ],
  prototypeComponents: [
    {
      name: 'PlaygroundOnboarding',
      reason: 'Phase orchestrator for playground signup flow',
    },
    {
      name: 'OnboardingWelcome',
      reason: 'Welcome / profile phase UI',
    },
    {
      name: 'PlaygroundHub',
      reason: 'Hub phase after welcome',
    },
    {
      name: 'BrowseServices',
      reason: 'Browse services phase',
    },
    {
      name: 'PlaygroundLoading',
      reason: 'Loading phase with progress',
    },
    {
      name: 'PlaygroundSandboxModal',
      reason: 'Sandbox confirmation modal',
    },
    {
      name: 'OnboardingStepIndicator',
      reason: 'Stepper wrapper for onboarding phases',
    },
    {
      name: 'ServiceIcon',
      reason: 'Service-type icons on cards',
    },
  ],
  notes: [
    'Map describes shared playground onboarding screens under src/screens/playground/.',
  ],
}

export const onboardingTestEnvScreenManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Create-test-env form layout' },
    { name: 'Typography', usage: 'Headings, labels, and helper copy' },
    { name: 'Card', usage: 'Service picker and checkable option cards' },
    { name: 'StatusChip', usage: 'Service / plan labels on cards' },
    { name: 'InlineIcon', usage: 'Info icons beside helper text' },
    { name: 'Tooltip', usage: 'Plan and cloud setting explanations' },
    { name: 'Input', usage: 'Service name and project name fields' },
    { name: 'Select', usage: 'Location / region selection' },
    { name: 'Section', usage: 'Advanced plan and cloud settings' },
    { name: 'Button', usage: 'Skip, create, and customize-plan actions' },
    { name: 'Divider', usage: 'Separators in the test-env shell' },
  ],
  prototypeComponents: [
    {
      name: 'OnboardingTestEnv',
      reason: 'Shared create-test-environment screen',
    },
    {
      name: 'OnboardingTestEnvShell',
      reason: 'Shell chrome around the create-test-env form',
    },
    {
      name: 'ServiceIcon',
      reason: 'Service-type icons on picker cards',
    },
    {
      name: 'CloudProviderIcon',
      reason: 'Cloud provider icons in location options',
    },
  ],
  notes: [
    'Map describes shared OnboardingTestEnv (src/screens/playground/OnboardingTestEnv.tsx).',
  ],
}
