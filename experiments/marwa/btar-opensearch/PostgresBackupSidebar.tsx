'use client'

import type { MouseEvent } from 'react'
import { Navigation } from '@aivenio/aquarium'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import consoleIcon from '@aivenio/aquarium/icons/console'
import tableIcon from '@aivenio/aquarium/icons/table'
import puzzlePieceIcon from '@aivenio/aquarium/icons/puzzlePiece'
import databaseIcon from '@aivenio/aquarium/icons/database'
import chartIcon from '@aivenio/aquarium/icons/chart'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import cogIcon from '@aivenio/aquarium/icons/cog'
import { SidebarShell } from '@/components/SidebarShell'
import { PROJECT_LABEL } from './backupsData'

function stay(event: MouseEvent) {
  event.preventDefault()
}

/** PostgreSQL service nav with Backup management selected. Other items stay on this screen. */
export function PostgresBackupSidebar() {
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
          <Navigation.Item icon={consoleIcon} href="#" title="SQL editor" onClick={stay}>
            {collapsed ? null : 'SQL editor'}
          </Navigation.Item>
          <Navigation.Item icon={tableIcon} href="#" title="Tables" onClick={stay}>
            {collapsed ? null : 'Tables'}
          </Navigation.Item>
          <Navigation.Item icon={puzzlePieceIcon} href="#" title="Extensions" onClick={stay}>
            {collapsed ? null : 'Extensions'}
          </Navigation.Item>

          <Navigation.Submenu title="Connect" icon={databaseIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Databases
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Data API
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Integrations
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Users
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Submenu title="Observe" icon={chartIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Metrics
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Logs
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              AI insights
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Query statistics
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Current queries
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Submenu title="Backups" icon={dbBackupIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" active onClick={stay}>
              Backup management
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Disaster recovery
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
