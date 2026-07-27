/**
 * Known Aquarium component → Storybook docs URLs.
 * Only include entries verified via Storybook MCP / aquarium-library paths.
 * Prefer undefined over inventing URLs.
 */

const DOCS_BASE = 'https://aquarium-library.aiven.io/?path=/docs'

function docsPath(storyIdPrefix: string): string {
  return `${DOCS_BASE}/${storyIdPrefix}--docs`
}

/**
 * Keys are display names used in component manifests (often matching the
 * Aquarium export, e.g. StatusChip → Chip docs).
 */
export const aquariumStorybookLinks: Record<string, string | undefined> = {
  Alert: docsPath('feedback-alert'),
  Axis: docsPath('charts-axis'),
  Banner: docsPath('data-display-banner'),
  Box: docsPath('layout-box'),
  Breadcrumbs: docsPath('navigation-breadcrumbs'),
  Button: docsPath('inputs-button'),
  Card: docsPath('surfaces-card'),
  Checkbox: docsPath('inputs-checkbox'),
  CheckboxGroup: docsPath('inputs-checkboxgroup'),
  Chip: docsPath('data-display-chip'),
  DataList: docsPath('data-display-datalist'),
  DataTable: docsPath('data-display-datatable'),
  DateRangePicker: docsPath('inputs-daterangepicker'),
  DateTimeRangePicker: docsPath('inputs-datetimerangepicker'),
  Divider: docsPath('layout-divider'),
  Drawer: docsPath('utils-drawer'),
  DropdownMenu: docsPath('navigation-dropdownmenu'),
  Filter: docsPath('data-display-filter'),
  Icon: docsPath('data-display-icons'),
  Input: docsPath('inputs-input'),
  Link: docsPath('navigation-link'),
  LineChart: docsPath('charts-linechart'),
  Modal: docsPath('utils-modal'),
  Navigation: docsPath('navigation-navigation'),
  PageHeader: docsPath('layout-pageheader'),
  Pagination: docsPath('navigation-pagination'),
  Popover: docsPath('utils-popover'),
  ProgressBar: docsPath('feedback-progressbar'),
  Section: docsPath('layout-section'),
  Select: docsPath('inputs-select'),
  StatusChip: docsPath('data-display-chip'),
  Stepper: docsPath('navigation-stepper'),
  Switch: docsPath('inputs-switch'),
  Table: docsPath('deprecated-table'),
  Tabs: docsPath('navigation-tabs'),
  Textarea: docsPath('inputs-textarea'),
  Tooltip: docsPath('utils-tooltip'),
  Typography: docsPath('data-display-typography'),
}

/** Resolve Storybook docs URL from an explicit entry URL or the known map. */
export function resolveAquariumStorybookUrl(
  name: string,
  explicitUrl?: string,
): string | undefined {
  if (explicitUrl) return explicitUrl
  return aquariumStorybookLinks[name]
}
