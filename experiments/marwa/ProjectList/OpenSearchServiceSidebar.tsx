'use client'

import type { MouseEvent } from 'react'
import { Navigation } from '@aivenio/aquarium'
import arrowLeftIcon from '@aivenio/aquarium/icons/arrowLeft'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import databaseIcon from '@aivenio/aquarium/icons/database'
import chartIcon from '@aivenio/aquarium/icons/chart'
import userIcon from '@aivenio/aquarium/icons/user'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import cogIcon from '@aivenio/aquarium/icons/cog'
import { SidebarShell } from '@/components/SidebarShell'

/**
 * OpenSearch service-level navigation, mirroring the real Aiven Console
 * (aiven-core `ServiceNavigation` opensearch layout):
 *   Overview · Data (Indexes, Integrations) · Observe (Metrics, Logs) ·
 *   Users · Backups (Backup management, Snapshots) · Service settings
 *
 * "Overview" is an expandable group with an "Overview" page and a prototype
 * "Cluster overview" sub-item that opens the node topology view.
 */

export type OpenSearchNavId =
  | 'cluster-overview'
  | 'overview'
  | 'indexes'
  | 'data-integrations'
  | 'metrics'
  | 'logs'
  | 'users'
  | 'backup-management'
  | 'snapshots'
  | 'service-settings'

export function OpenSearchServiceSidebar({
  projectName,
  serviceName,
  activeItem = 'overview',
  onNavigate,
  onBackToProject,
}: {
  projectName: string
  serviceName: string
  activeItem?: OpenSearchNavId
  onNavigate?: (id: OpenSearchNavId) => void
  onBackToProject?: () => void
}) {
  const go = (id: OpenSearchNavId) => (event: MouseEvent) => {
    event.preventDefault()
    onNavigate?.(id)
  }

  return (
    <SidebarShell
      ariaLabel="Service navigation"
      header={(collapsed) =>
        collapsed ? null : (
          <>
            <Navigation.Header.Title>{projectName}</Navigation.Header.Title>
            <Navigation.Header.Subtitle>{serviceName}</Navigation.Header.Subtitle>
          </>
        )
      }
    >
      {(collapsed) => (
        <>
          {onBackToProject && (
            <Navigation.Item
              icon={arrowLeftIcon}
              href="#"
              title="Back to project"
              aria-label="Back to project"
              onClick={(event: MouseEvent) => {
                event.preventDefault()
                onBackToProject()
              }}
            >
              {collapsed ? null : 'Back to project'}
            </Navigation.Item>
          )}

          <Navigation.Item
            icon={dashboardIcon}
            href="#"
            active={activeItem === 'overview'}
            title="Overview"
            aria-label="Overview"
            onClick={go('overview')}
          >
            {collapsed ? null : 'Overview'}
          </Navigation.Item>
          {!collapsed && (
            <Navigation.Submenu.Item href="#" active={activeItem === 'cluster-overview'} onClick={go('cluster-overview')}>
              Cluster overview
            </Navigation.Submenu.Item>
          )}

          <Navigation.Submenu title="Data" icon={databaseIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" active={activeItem === 'indexes'} onClick={go('indexes')}>
              Indexes
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item
              href="#"
              active={activeItem === 'data-integrations'}
              onClick={go('data-integrations')}
            >
              Integrations
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Submenu title="Observe" icon={chartIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" active={activeItem === 'metrics'} onClick={go('metrics')}>
              Metrics
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" active={activeItem === 'logs'} onClick={go('logs')}>
              Logs
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Item
            icon={userIcon}
            href="#"
            active={activeItem === 'users'}
            title="Users"
            aria-label="Users"
            onClick={go('users')}
          >
            {collapsed ? null : 'Users'}
          </Navigation.Item>

          <Navigation.Submenu title="Backups" icon={dbBackupIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" active={activeItem === 'backup-management'} onClick={go('backup-management')}>
              Backup management
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" active={activeItem === 'snapshots'} onClick={go('snapshots')}>
              Snapshots
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Divider />

          <Navigation.Item
            icon={cogIcon}
            href="#"
            active={activeItem === 'service-settings'}
            title="Service settings"
            aria-label="Service settings"
            onClick={go('service-settings')}
          >
            {collapsed ? null : 'Service settings'}
          </Navigation.Item>
        </>
      )}
    </SidebarShell>
  )
}

OpenSearchServiceSidebar.displayName = 'OpenSearchServiceSidebar'
