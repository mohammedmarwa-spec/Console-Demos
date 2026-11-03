import type { ComponentManifest } from '@/lib/experiments/types'
import { aquariumStorybookLinks } from '@/lib/experiments/aquariumStorybookLinks'

export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    { name: 'Box', usage: 'Page shell, service header, backup stats row', storybookUrl: aquariumStorybookLinks.Box },
    { name: 'Breadcrumbs', usage: 'Aiven / dev-sandbox / os-50f7b82 / Backups', storybookUrl: aquariumStorybookLinks.Breadcrumbs },
    { name: 'Typography', usage: 'Service name, backup description, stat labels and values', storybookUrl: aquariumStorybookLinks.Typography },
    { name: 'Chip', usage: 'OpenSearch version chip', storybookUrl: aquariumStorybookLinks.Chip },
    { name: 'StatusChip', usage: 'Running status, primary backup location in the table, and Same continent / Different continent chips on the OpenSearch cost estimate and Create follower', storybookUrl: aquariumStorybookLinks.StatusChip },
    { name: 'Button', usage: 'Fork service primary action', storybookUrl: aquariumStorybookLinks.Button },
    { name: 'Section', usage: 'Backup configuration, and the collapsed “How the estimate works” disclosure in the add-secondary modal', storybookUrl: aquariumStorybookLinks.Section },
    { name: 'DropdownMenu', usage: 'Backup settings menu beside the Add backup location action', storybookUrl: aquariumStorybookLinks.DropdownMenu },
    { name: 'DataTable', usage: 'Five-row sample of service backups', storybookUrl: aquariumStorybookLinks.DataTable },
    { name: 'Link', usage: 'Add backup under Not set', storybookUrl: aquariumStorybookLinks.Link },
    { name: 'Modal', usage: 'Add secondary backup location', storybookUrl: aquariumStorybookLinks.Modal },
    { name: 'Divider', usage: 'Separates the PostgreSQL extra-cost total from the storage and transfer rows', storybookUrl: aquariumStorybookLinks.Divider },
    { name: 'Alert', usage: 'Backup-copy callout inside the add-secondary modal', storybookUrl: aquariumStorybookLinks.Alert },
    { name: 'Select', usage: 'Secondary Google region', storybookUrl: aquariumStorybookLinks.Select },
    { name: 'Navigation', usage: 'OpenSearch service sidebar', storybookUrl: aquariumStorybookLinks.Navigation },
    { name: 'Tabs', usage: 'Switch between Backup management, CCR - OpenSearch, and BTAR for PostgreSQL', storybookUrl: aquariumStorybookLinks.Tabs },
    { name: 'RadioButtonGroup', usage: 'Existing service or New service inside Create follower' },
    { name: 'RadioButton', usage: 'Existing service or New service inside Create follower' },
    { name: 'Input', usage: 'Replication volume in the Create follower estimate', storybookUrl: aquariumStorybookLinks.Input },
    { name: 'Combobox', usage: 'Project and Service fields inside Create follower. Service rows show the icon, region, power state, and version.' },
    { name: 'Icon', usage: 'Powered on and powered off marks in the Create follower service list', storybookUrl: aquariumStorybookLinks.Icon },
  ],
  prototypeComponents: [
    {
      name: 'OpenSearchBackupSidebar',
      reason: 'Console service nav composed from Navigation inside the shared SidebarShell. Backup management is the active item.',
    },
    {
      name: 'Service identity row',
      reason: 'PageHeader chips are plain strings, so the version chip, Running StatusChip, and Nodes badge are composed beside the service name.',
    },
  ],
  notes: [
    'OpenSearch managed backups, starting from the current console Backup management screen.',
    'Table is a five-row sample. Configuration stats stay as on the console screenshot.',
    'Save closes the modal. The enabled backup state is not built yet. Numbers are illustrative placeholders.',
    'CCR - OpenSearch is a second tab that shows only the console popup.',
    'BTAR(PostgreSQL · Managed) is the compact add-secondary window for orders-pg. Copy does not mention a tertiary backup.',
  ],
}
