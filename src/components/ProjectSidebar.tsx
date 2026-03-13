import { Box, Navigation } from '@aivenio/aquarium'
import clipboardCheckIcon from '@aivenio/aquarium/icons/clipboardCheck'
import databaseIcon from '@aivenio/aquarium/icons/database'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import integrationsIcon from '@aivenio/aquarium/icons/integrations'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import listIcon from '@aivenio/aquarium/icons/list'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import pulseIcon from '@aivenio/aquarium/icons/pulse'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import type { IconifyIcon } from '@iconify/react'

const NAV_ITEMS: { label: string; icon: IconifyIcon; id: string }[] = [
  { id: 'get-started', label: 'Get started', icon: clipboardCheckIcon },
  { id: 'services', label: 'Services', icon: databaseIcon },
  { id: 'applications', label: 'Applications', icon: applicationsIcon },
  { id: 'integration-endpoints', label: 'Integration endpoints', icon: integrationsIcon },
  { id: 'vpcs', label: 'VPCs', icon: cloudIcon },
  { id: 'event-log', label: 'Event log', icon: listIcon },
  { id: 'permissions', label: 'Permissions', icon: appUsersIcon },
  { id: 'billing', label: 'Billing', icon: bankAccountIcon },
  { id: 'project-ai-insights', label: 'Project AI insights', icon: pulseIcon },
]

export type ProjectSidebarProps = {
  projectName: string
  activeItem?: string
  onBillingClick?: () => void
}

export function ProjectSidebar({ projectName, activeItem = 'services', onBillingClick }: ProjectSidebarProps) {
  return (
    <Box
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid #ededf0',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navigation>
        <Navigation.Header>
          <Navigation.Header.Title>PROJECT</Navigation.Header.Title>
          <Navigation.Header.Subtitle>{projectName}</Navigation.Header.Subtitle>
        </Navigation.Header>
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <Navigation.Item
            key={id}
            icon={icon}
            active={id === activeItem}
            href="#"
            onClick={(e) => {
              if (id === 'billing') {
                e.preventDefault()
                onBillingClick?.()
              }
            }}
          >
            {label}
          </Navigation.Item>
        ))}
        <Navigation.Divider />
        <Navigation.Item icon={settingsIcon} active={activeItem === 'settings'} href="#">
          Settings
        </Navigation.Item>
      </Navigation>
    </Box>
  )
}

ProjectSidebar.displayName = 'ProjectSidebar'
