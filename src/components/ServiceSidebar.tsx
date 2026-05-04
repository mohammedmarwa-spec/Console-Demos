import type { MouseEvent } from 'react'
import { Box, Navigation } from '@aivenio/aquarium'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import integrationsIcon from '@aivenio/aquarium/icons/integrations'
import chartIcon from '@aivenio/aquarium/icons/chart'
import pulseIcon from '@aivenio/aquarium/icons/pulse'
import listIcon from '@aivenio/aquarium/icons/list'
import queriesStatisticsIcon from '@aivenio/aquarium/icons/queriesStatistics'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import userIcon from '@aivenio/aquarium/icons/user'
import databaseIcon from '@aivenio/aquarium/icons/database'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import cogIcon from '@aivenio/aquarium/icons/cog'
import type { IconifyIcon } from '@iconify/react'

const NAV_ITEMS: { label: string; icon: IconifyIcon; id: string }[] = [
  { id: 'overview', label: 'Overview', icon: dashboardIcon },
  { id: 'integrations', label: 'Integrations', icon: integrationsIcon },
  { id: 'metrics', label: 'Metrics', icon: chartIcon },
  { id: 'ai-insights', label: 'AI insights', icon: pulseIcon },
  { id: 'logs', label: 'Logs', icon: listIcon },
  { id: 'query-statistics', label: 'Query statistics', icon: queriesStatisticsIcon },
  { id: 'current-queries', label: 'Current queries', icon: queriesEditorIcon },
  { id: 'users', label: 'Users', icon: userIcon },
  { id: 'databases', label: 'Databases', icon: databaseIcon },
  { id: 'backups', label: 'Backups', icon: dbBackupIcon },
  { id: 'service-settings', label: 'Service settings', icon: cogIcon },
]

export type ServiceSidebarProps = {
  projectName: string
  serviceName: string
  activeItem?: string
  onBackToProject?: () => void
  /** Called when the user selects a service sub-page (Overview, Logs, etc). */
  onNavigate?: (id: string) => void
}

export function ServiceSidebar({
  projectName,
  serviceName,
  activeItem = 'overview',
  onBackToProject,
  onNavigate,
}: ServiceSidebarProps) {
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
          <Navigation.Header.Title>{projectName}</Navigation.Header.Title>
          <Navigation.Header.Subtitle>{serviceName}</Navigation.Header.Subtitle>
        </Navigation.Header>
        {onBackToProject && (
          <Navigation.Item
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              onBackToProject()
            }}
          >
            ← Back to project
          </Navigation.Item>
        )}
        <Navigation.Divider />
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <Navigation.Item
            key={id}
            icon={icon}
            active={id === activeItem}
            href="#"
            onClick={(e: MouseEvent) => {
              e.preventDefault()
              onNavigate?.(id)
            }}
          >
            {label}
          </Navigation.Item>
        ))}
      </Navigation>
    </Box>
  )
}

ServiceSidebar.displayName = 'ServiceSidebar'
