'use client'

import type { MouseEvent } from 'react'
import { Box, Navigation } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import databaseIcon from '@aivenio/aquarium/icons/database'
import chartIcon from '@aivenio/aquarium/icons/chart'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import cogIcon from '@aivenio/aquarium/icons/cog'
import { PROJECT_NAME, SERVICE } from './overviewData'

type NavLeaf = { id: string; label: string; icon?: IconifyIcon }

const TOP_ITEMS: NavLeaf[] = [
  { id: 'overview', label: 'Overview', icon: dashboardIcon },
  { id: 'pg-studio', label: 'PG Studio', icon: queriesEditorIcon },
]

const CONNECT_ITEMS: NavLeaf[] = [
  { id: 'databases', label: 'Databases' },
  { id: 'connection-pools', label: 'Connection pools' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'users', label: 'Users' },
]

const OBSERVE_ITEMS: NavLeaf[] = [
  { id: 'metrics', label: 'Metrics' },
  { id: 'logs', label: 'Logs' },
  { id: 'ai-insights', label: 'AI insights' },
  { id: 'query-statistics', label: 'Query statistics' },
  { id: 'current-queries', label: 'Current queries' },
]

export type FreeTierServiceSidebarProps = {
  activeItem: string
  onNavigate: (id: string) => void
}

function handleNavClick(e: MouseEvent, id: string, onNavigate: (id: string) => void) {
  e.preventDefault()
  onNavigate(id)
}

/**
 * Service sidebar using Aquarium Navigation with submenus
 * @see https://aquarium-library.aiven.io/?path=/docs/navigation-navigation--docs#navigation-with-submenus
 */
export function FreeTierServiceSidebar({ activeItem, onNavigate }: FreeTierServiceSidebarProps) {
  return (
    <Box
      component="aside"
      aria-label="Service navigation"
      style={{
        width: 244,
        flexShrink: 0,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Navigation aria-label="Service">
        <Navigation.Header>
          <Navigation.Header.Title>{PROJECT_NAME}</Navigation.Header.Title>
          <Navigation.Header.Subtitle>{SERVICE.name}</Navigation.Header.Subtitle>
        </Navigation.Header>

        {TOP_ITEMS.map(({ id, label, icon }) => (
          <Navigation.Item
            key={id}
            icon={icon}
            active={id === activeItem}
            href="#"
            onClick={(e: MouseEvent) => handleNavClick(e, id, onNavigate)}
          >
            {label}
          </Navigation.Item>
        ))}

        <Navigation.Submenu title="Connect" icon={databaseIcon} defaultOpen>
          {CONNECT_ITEMS.map(({ id, label }) => (
            <Navigation.Submenu.Item
              key={id}
              active={id === activeItem}
              href="#"
              onClick={(e: MouseEvent) => handleNavClick(e, id, onNavigate)}
            >
              {label}
            </Navigation.Submenu.Item>
          ))}
        </Navigation.Submenu>

        <Navigation.Submenu title="Observe" icon={chartIcon} defaultOpen>
          {OBSERVE_ITEMS.map(({ id, label }) => (
            <Navigation.Submenu.Item
              key={id}
              active={id === activeItem}
              href="#"
              onClick={(e: MouseEvent) => handleNavClick(e, id, onNavigate)}
            >
              {label}
            </Navigation.Submenu.Item>
          ))}
        </Navigation.Submenu>

        <Navigation.Item
          icon={dbBackupIcon}
          active={activeItem === 'backups'}
          href="#"
          onClick={(e: MouseEvent) => handleNavClick(e, 'backups', onNavigate)}
        >
          Backups
        </Navigation.Item>

        <Navigation.Divider />

        <Navigation.Item
          icon={cogIcon}
          active={activeItem === 'service-settings'}
          href="#"
          onClick={(e: MouseEvent) => handleNavClick(e, 'service-settings', onNavigate)}
        >
          Service settings
        </Navigation.Item>
      </Navigation>
    </Box>
  )
}

FreeTierServiceSidebar.displayName = 'FreeTierServiceSidebar'
