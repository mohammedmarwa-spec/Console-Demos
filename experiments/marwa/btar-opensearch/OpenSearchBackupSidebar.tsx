'use client'

import type { MouseEvent } from 'react'
import { Navigation } from '@aivenio/aquarium'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import databaseIcon from '@aivenio/aquarium/icons/database'
import chartIcon from '@aivenio/aquarium/icons/chart'
import userIcon from '@aivenio/aquarium/icons/user'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import cogIcon from '@aivenio/aquarium/icons/cog'
import { SidebarShell } from '@/components/SidebarShell'
import { PROJECT_LABEL } from './backupsData'

function stay(event: MouseEvent) {
  event.preventDefault()
}

/** OpenSearch service nav with Backup management selected. Other items stay on this screen. */
export function OpenSearchBackupSidebar() {
  return (
    <SidebarShell
      ariaLabel="Service navigation"
      header={(collapsed) =>
        collapsed ? null : <Navigation.Header.Title>{PROJECT_LABEL}</Navigation.Header.Title>
      }
    >
      {(collapsed) => (
        <>
          <Navigation.Item icon={dashboardIcon} href="#" title="Overview" onClick={stay}>
            {collapsed ? null : 'Overview'}
          </Navigation.Item>

          <Navigation.Submenu title="Data" icon={databaseIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Indexes
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Integrations
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Submenu title="Observe" icon={chartIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Metrics
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Logs
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Item icon={userIcon} href="#" title="Users" onClick={stay}>
            {collapsed ? null : 'Users'}
          </Navigation.Item>

          <Navigation.Submenu title="Backups" icon={dbBackupIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" active onClick={stay}>
              Backup management
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Snapshots
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Divider />

          <Navigation.Item icon={cogIcon} href="#" title="Service settings" onClick={stay}>
            {collapsed ? null : 'Service settings'}
          </Navigation.Item>
        </>
      )}
    </SidebarShell>
  )
}
