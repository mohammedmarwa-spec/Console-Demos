'use client'

import { Navigation } from '@aivenio/aquarium'
import endorsedIcon from '@aivenio/aquarium/icons/endorsed'
import databaseIcon from '@aivenio/aquarium/icons/database'
import consoleIcon from '@aivenio/aquarium/icons/console'
import pulseIcon from '@aivenio/aquarium/icons/pulse'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import propertyIcon from '@aivenio/aquarium/icons/property'
import peopleIcon from '@aivenio/aquarium/icons/people'
import performanceIcon from '@aivenio/aquarium/icons/performance'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import cogIcon from '@aivenio/aquarium/icons/cog'
import type { IconifyIcon } from '@iconify/react'
import { SidebarShell } from './SidebarShell'

/**
 * Production ProjectNavItems order/labels
 * (ui/console/src/ui/screens/partials/ProjectNavigation.tsx).
 */
const PRIMARY_NAV_ITEMS: { label: string; icon: IconifyIcon; id: string }[] = [
  { id: 'get-started', label: 'Get started', icon: endorsedIcon },
  { id: 'services', label: 'Services', icon: databaseIcon },
  { id: 'applications', label: 'Applications', icon: consoleIcon },
  { id: 'agents', label: 'Agents', icon: pulseIcon },
  { id: 'integration-endpoints', label: 'Integration endpoints', icon: codeBlockIcon },
  { id: 'vpcs', label: 'VPCs', icon: cloudIcon },
  { id: 'event-log', label: 'Event log', icon: propertyIcon },
  { id: 'permissions', label: 'Permissions', icon: peopleIcon },
  { id: 'project-ai-insights', label: 'Project AI insights', icon: performanceIcon },
  { id: 'app-builder', label: 'App Builder', icon: proPlansIcon },
]

export type ProjectSidebarProps = {
  projectName: string
  activeItem?: string
  /** @deprecated Billing lives in the org header; kept for caller compatibility. */
  onBillingClick?: () => void
  onItemClick?: (itemId: string) => void
}

export function ProjectSidebar({
  projectName,
  activeItem = 'services',
  onItemClick,
}: ProjectSidebarProps) {
  return (
    <SidebarShell
      ariaLabel="Project navigation"
      header={(collapsed) =>
        collapsed ? null : (
          <>
            <Navigation.Header.Title>Project</Navigation.Header.Title>
            <Navigation.Header.Subtitle>{projectName}</Navigation.Header.Subtitle>
          </>
        )
      }
    >
      {() => (
        <>
          {PRIMARY_NAV_ITEMS.map(({ id, label, icon }) => (
            <Navigation.Item
              key={id}
              icon={icon}
              active={id === activeItem}
              href="#"
              aria-label={label}
              title={label}
              onClick={(e) => {
                e.preventDefault()
                onItemClick?.(id)
              }}
            >
              {label}
            </Navigation.Item>
          ))}
          <Navigation.Divider />
          <Navigation.Item
            icon={cogIcon}
            active={activeItem === 'settings'}
            href="#"
            aria-label="Settings"
            title="Settings"
            onClick={(e) => {
              e.preventDefault()
              onItemClick?.('settings')
            }}
          >
            Settings
          </Navigation.Item>
        </>
      )}
    </SidebarShell>
  )
}

ProjectSidebar.displayName = 'ProjectSidebar'
