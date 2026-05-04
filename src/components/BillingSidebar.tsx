import { Box, Navigation } from '@aivenio/aquarium'
import clipboardCheckIcon from '@aivenio/aquarium/icons/clipboardCheck'
import gridIcon from '@aivenio/aquarium/icons/grid'
import listIcon from '@aivenio/aquarium/icons/list'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import mapMarkerIcon from '@aivenio/aquarium/icons/mapMarker'
import creditCardIcon from '@aivenio/aquarium/icons/creditCard'
import type { IconifyIcon } from '@iconify/react'

const NAV_ITEMS: { label: string; icon: IconifyIcon; id: string }[] = [
  { id: 'get-started', label: 'Get started', icon: clipboardCheckIcon },
  { id: 'overview', label: 'Overview', icon: gridIcon },
  { id: 'invoices', label: 'Invoices', icon: listIcon },
  { id: 'billing-groups', label: 'Billing groups', icon: appUsersIcon },
  { id: 'addresses', label: 'Addresses', icon: mapMarkerIcon },
  { id: 'payment-methods', label: 'Payment methods', icon: creditCardIcon },
]

export type BillingSidebarProps = {
  activeItem?: string
  onItemClick?: (id: string) => void
}

export function BillingSidebar({ activeItem = 'invoices', onItemClick }: BillingSidebarProps) {
  return (
    <Box
      style={{
        width: 280,
        flexShrink: 0,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navigation>
        <Navigation.Header>
          <Navigation.Header.Title>ORGANIZATION</Navigation.Header.Title>
          <Navigation.Header.Subtitle>Billing</Navigation.Header.Subtitle>
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
      </Navigation>
    </Box>
  )
}

BillingSidebar.displayName = 'BillingSidebar'
