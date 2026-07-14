'use client'

import { Box, Navigation } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import homeIcon from '@aivenio/aquarium/icons/home'
import orgUnitIcon from '@aivenio/aquarium/icons/orgUnit'
import projectsIcon from '@aivenio/aquarium/icons/projects'
import orgAdminIcon from '@aivenio/aquarium/icons/orgAdmin'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import networkPrivateLinkIcon from '@aivenio/aquarium/icons/networkPrivateLink'
import co2EmissionsIcon from '@aivenio/aquarium/icons/co2Emissions'
import governanceIcon from '@aivenio/aquarium/icons/governance'
import historyIcon from '@aivenio/aquarium/icons/history'
import peopleIcon from '@aivenio/aquarium/icons/people'
import managedUsersIcon from '@aivenio/aquarium/icons/managedUsers'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import shieldIcon from '@aivenio/aquarium/icons/shield'
import keyIcon from '@aivenio/aquarium/icons/key'
import globeIcon from '@aivenio/aquarium/icons/globe'

type NavEntry = { id: string; label: string; icon: IconifyIcon }
type NavSection = { title: string; items: NavEntry[] }

const SECTIONS: NavSection[] = [
  {
    title: 'Organization',
    items: [{ id: 'overview', label: 'Overview', icon: homeIcon }],
  },
  {
    title: 'Platform management',
    items: [
      { id: 'org-units', label: 'Organization and units', icon: orgUnitIcon },
      { id: 'projects', label: 'Projects', icon: projectsIcon },
      { id: 'authentication', label: 'Authentication', icon: orgAdminIcon },
      { id: 'byoc', label: 'Bring your own cloud', icon: cloudIcon },
      { id: 'vpcs', label: 'VPCs', icon: networkPrivateLinkIcon },
      { id: 'carbon', label: 'Carbon footprint', icon: co2EmissionsIcon },
      { id: 'kafka-governance', label: 'Apache Kafka governance', icon: governanceIcon },
      { id: 'event-logs', label: 'Event logs', icon: historyIcon },
    ],
  },
  {
    title: 'User management',
    items: [
      { id: 'users', label: 'Users', icon: peopleIcon },
      { id: 'groups', label: 'Groups', icon: managedUsersIcon },
      { id: 'app-users', label: 'Application users', icon: appUsersIcon },
      { id: 'permissions', label: 'Permissions', icon: shieldIcon },
    ],
  },
  {
    title: 'Security',
    items: [
      { id: 'identity-providers', label: 'Identity providers', icon: keyIcon },
      { id: 'domains', label: 'Domains', icon: globeIcon },
    ],
  },
]

export type EventLogsSidebarProps = {
  activeItem: string
  onItemClick: (id: string) => void
}

/**
 * Organization Administration sidebar, assembled from the Aquarium
 * `Navigation` DS component. Items expose the DS active/hover/focus states.
 */
export function EventLogsSidebar({ activeItem, onItemClick }: EventLogsSidebarProps) {
  return (
    <Box
      component="aside"
      aria-label="Administration navigation"
      style={{
        width: 240,
        flexShrink: 0,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        borderRight: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Navigation>
        <Navigation.Header>
          <Navigation.Header.Title>ORGANIZATION</Navigation.Header.Title>
          <Navigation.Header.Subtitle>Administration</Navigation.Header.Subtitle>
        </Navigation.Header>

        {SECTIONS.map((section) => (
          <Navigation.Section key={section.title} title={section.title}>
            {section.items.map(({ id, label, icon }) => (
              <Navigation.Item
                key={id}
                icon={icon}
                active={id === activeItem}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onItemClick(id)
                }}
              >
                {label}
              </Navigation.Item>
            ))}
          </Navigation.Section>
        ))}
      </Navigation>
    </Box>
  )
}

EventLogsSidebar.displayName = 'EventLogsSidebar'
