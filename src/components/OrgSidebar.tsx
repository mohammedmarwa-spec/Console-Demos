'use client'

import { Navigation } from '@aivenio/aquarium'
import homeIcon from '@aivenio/aquarium/icons/home'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import propertyIcon from '@aivenio/aquarium/icons/property'
import dataflow01Icon from '@aivenio/aquarium/icons/dataflow01'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import consoleIcon from '@aivenio/aquarium/icons/console'
import type { IconifyIcon } from '@iconify/react'
import { SidebarShell } from './SidebarShell'

export { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from './SidebarShell'

type NavEntry = { label: string; icon: IconifyIcon; id: string }

const NAV_ITEMS: NavEntry[] = [
  { id: 'overview', label: 'Overview', icon: homeIcon },
  { id: 'projects', label: 'Projects', icon: applicationsIcon },
  { id: 'members', label: 'Members', icon: appUsersIcon },
  { id: 'billing', label: 'Billing', icon: bankAccountIcon },
]

const TOOL_ITEMS: NavEntry[] = [
  { id: 'kafka-governance', label: 'Apache Kafka governance', icon: propertyIcon },
  { id: 'data-flow', label: 'Data flow', icon: dataflow01Icon },
  { id: 'sql-optimizer', label: 'SQL query optimizer', icon: queriesEditorIcon },
  { id: 'manage-external-kafka', label: 'Manage External Kafka', icon: cloudIcon },
  { id: 'mcp-use-cases', label: 'Aiven MCP use cases', icon: proPlansIcon },
]

const FOOTER_ITEMS: NavEntry[] = [
  { id: 'settings', label: 'Settings', icon: settingsIcon },
  { id: 'admin', label: 'Admin', icon: consoleIcon },
]

export type OrgSidebarProps = {
  orgName?: string
  activeItem?: string
  onItemClick?: (id: string) => void
}

function renderNavItem(
  item: NavEntry,
  activeItem: string,
  onItemClick?: (id: string) => void,
) {
  return (
    <Navigation.Item
      key={item.id}
      icon={item.icon}
      active={item.id === activeItem}
      href="#"
      aria-label={item.label}
      title={item.label}
      onClick={(e) => {
        e.preventDefault()
        onItemClick?.(item.id)
      }}
    >
      {item.label}
    </Navigation.Item>
  )
}

export function OrgSidebar({
  orgName = 'My Organization',
  activeItem = 'overview',
  onItemClick,
}: OrgSidebarProps) {
  return (
    <SidebarShell
      ariaLabel="Organization navigation"
      header={(collapsed) =>
        collapsed ? null : (
          <>
            <Navigation.Header.Title>ORGANIZATION</Navigation.Header.Title>
            <Navigation.Header.Subtitle>{orgName}</Navigation.Header.Subtitle>
          </>
        )
      }
    >
      {(collapsed) => (
        <>
          {NAV_ITEMS.map((item) => renderNavItem(item, activeItem, onItemClick))}
          <Navigation.Section title={collapsed ? undefined : 'TOOLS'}>
            {TOOL_ITEMS.map((item) => renderNavItem(item, activeItem, onItemClick))}
          </Navigation.Section>
          <Navigation.Divider />
          {FOOTER_ITEMS.map((item) => renderNavItem(item, activeItem, onItemClick))}
        </>
      )}
    </SidebarShell>
  )
}

OrgSidebar.displayName = 'OrgSidebar'
