import { Box, Navigation } from '@aivenio/aquarium'
import homeIcon from '@aivenio/aquarium/icons/home'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import settingsIcon from '@aivenio/aquarium/icons/settings'
import type { IconifyIcon } from '@iconify/react'

const NAV_ITEMS: { label: string; icon: IconifyIcon; id: string }[] = [
  { id: 'overview', label: 'Overview', icon: homeIcon },
  { id: 'projects', label: 'Projects', icon: applicationsIcon },
  { id: 'members', label: 'Members', icon: appUsersIcon },
  { id: 'billing', label: 'Billing', icon: bankAccountIcon },
]

export type OrgSidebarProps = {
  orgName?: string
  activeItem?: string
  onItemClick?: (id: string) => void
}

export function OrgSidebar({
  orgName = 'My Organization',
  activeItem = 'overview',
  onItemClick,
}: OrgSidebarProps) {
  return (
    <Box
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navigation>
        <Navigation.Header>
          <Navigation.Header.Title>ORGANIZATION</Navigation.Header.Title>
          <Navigation.Header.Subtitle>{orgName}</Navigation.Header.Subtitle>
        </Navigation.Header>
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <Navigation.Item
            key={id}
            icon={icon}
            active={id === activeItem}
            href="#"
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
          icon={settingsIcon}
          active={activeItem === 'settings'}
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onItemClick?.('settings')
          }}
        >
          Settings
        </Navigation.Item>
      </Navigation>
    </Box>
  )
}

OrgSidebar.displayName = 'OrgSidebar'
