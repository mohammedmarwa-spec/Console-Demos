import type { ComponentManifest } from '@/lib/experiments/types'

/**
 * Manual component map for this experiment.
 * Aquarium entries are ordered by first appearance on the page (top → bottom).
 * Update when Aquarium or prototype UI usage changes.
 */
export const componentManifest: ComponentManifest = {
  aquariumComponents: [
    {
      name: 'Box',
      usage: 'Page shell, context trail layout, two-column content, and drill-down chips',
    },
    {
      name: 'Button',
      usage: 'Product updates service filter — Button.Ghost dense with chevronDown on the right',
    },
    {
      name: 'DropdownMenu',
      usage: 'Compact org switcher in the context trail; Help and user menus; Product updates service filter',
    },
    {
      name: 'Popover',
      usage: 'Header project selector panel (search, recent projects, view all, create)',
    },
    {
      name: 'SearchInput',
      usage: 'Project search inside the header project selector',
    },
    {
      name: 'Button',
      usage: 'View all projects and Create project actions in the header project selector',
    },
    {
      name: 'Divider',
      usage: 'Split between Ask AI and utility icons; vertical split in homepage content',
    },
    {
      name: 'PageHeader',
      usage: 'Welcome title on Home; project section titles on Project view (no content breadcrumbs)',
    },
    {
      name: 'Typography',
      usage: 'Section titles, project names, and marketplace labels',
    },
    {
      name: 'Link',
      usage: 'Text links for project names, view-all, and posture actions',
    },
    {
      name: 'InlineIcon',
      usage: 'Alert severity icons and org-selector checkmarks',
    },
    {
      name: 'Card',
      usage: 'Recent project compact cards and posture signal cards',
    },
    {
      name: 'Chip',
      usage: 'Environment tag on recent project cards',
    },
    {
      name: 'Select',
      usage: 'Project selector in Project insights',
    },
    {
      name: 'EmptyState',
      usage: 'Empty states when no posture signals or no services are visible',
    },
    {
      name: 'ChoiceChip',
      usage: 'Radio service filters and Dev tools drawer tabs',
    },
    {
      name: 'DataList',
      usage: 'Posture drill-down services table',
    },
    {
      name: 'StatusChip',
      usage: 'Coverage chips and node-status chips; ORGANIZATION chip in org menu',
    },
    {
      name: 'Tooltip',
      usage: 'Info icon next to insight card titles',
    },
    {
      name: 'Banner',
      usage: 'Dev tools promo via shared HomeRightColumn',
    },
    {
      name: 'Drawer',
      usage: 'Dev tools drawer with MCP, CLI, Terraform, and API',
    },
    {
      name: 'Switch',
      usage: 'MCP read-only mode in the Dev tools drawer',
    },
  ],

  prototypeComponents: [
    {
      name: 'ContextPageHeader',
      reason:
        'Slash-separated context trail (Logo · Org [/ Project]) replacing ConsoleHeader + content breadcrumbs',
    },
    {
      name: 'ProjectSelector',
      reason: 'Single-line project segment in the context trail',
    },
    {
      name: 'HomePageContent',
      reason: 'Console Home layout; recent project card opens in-experiment project view',
    },
    {
      name: 'ProjectPageShell',
      reason: 'Shared project chrome with hideHeader — sidebar + content under the context trail (includes Apps)',
    },
    {
      name: 'AppsContent',
      reason: 'Apps sidebar page — nested applications and backing services via ItemList',
    },
    {
      name: 'RecentProjects',
      reason: 'Recent project cards; online-store-prod switches to project view',
    },
    {
      name: 'ProjectHealth',
      reason: 'Project Select and drill-down list (posture cards hidden)',
    },
    {
      name: 'HomeRightColumn',
      reason: 'Shared Dev tools rail and Product updates',
    },
  ],

  notes: [
    'Duplicate of homepage-v1 with a context Page header instead of sidebar + classic ConsoleHeader.',
    'Homepage trail: Org only. Project trail: Org / Project. Logo or Org label returns Home.',
    'extraSegments prop reserved for future service + status + page levels.',
    'Standalone project-page experiment still uses ConsoleHeader (hideHeader defaults false).',
  ],
}
