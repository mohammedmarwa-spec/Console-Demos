'use client'

import type { MouseEvent } from 'react'
import { Box, Icon, Navigation } from '@aivenio/aquarium'
import arrowLeftIcon from '@aivenio/aquarium/icons/arrowLeft'
import chartIcon from '@aivenio/aquarium/icons/chart'
import cogIcon from '@aivenio/aquarium/icons/cog'
import dashboardIcon from '@aivenio/aquarium/icons/dashboard'
import dataflow01Icon from '@aivenio/aquarium/icons/dataflow01'
import dbBackupIcon from '@aivenio/aquarium/icons/dbBackup'
import peopleIcon from '@aivenio/aquarium/icons/people'
import { SidebarShell } from '@/components/SidebarShell'
import { PROJECT_LABEL } from './schemaData'

function stay(event: MouseEvent) {
  event.preventDefault()
}

/** Kafka service nav with Schemas selected. Other items stay on this screen. */
export function KafkaSchemasSidebar() {
  return (
    <SidebarShell
      ariaLabel="Service navigation"
      header={(collapsed) =>
        collapsed ? (
          <Navigation.Header.Title aria-label={PROJECT_LABEL}>{PROJECT_LABEL}</Navigation.Header.Title>
        ) : (
          <Box.Flex alignItems="center" gap="2">
            <Icon icon={arrowLeftIcon} />
            <Navigation.Header.Title>{PROJECT_LABEL}</Navigation.Header.Title>
          </Box.Flex>
        )
      }
    >
      {(collapsed) => (
        <>
          <Navigation.Item icon={dashboardIcon} href="#" title="Overview" onClick={stay}>
            {collapsed ? null : 'Overview'}
          </Navigation.Item>

          <Navigation.Submenu title="Manage stream" icon={dataflow01Icon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Topics
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" active onClick={stay}>
              Schemas
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Connectors
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
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Tiered storage
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Submenu title="Access & Control" icon={peopleIcon} defaultOpen>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Users
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              ACL
            </Navigation.Submenu.Item>
            <Navigation.Submenu.Item href="#" onClick={stay}>
              Quotas
            </Navigation.Submenu.Item>
          </Navigation.Submenu>

          <Navigation.Item icon={dbBackupIcon} href="#" title="Backups" onClick={stay}>
            {collapsed ? null : 'Backups'}
          </Navigation.Item>

          <Navigation.Divider />

          <Navigation.Item icon={cogIcon} href="#" title="Service settings" onClick={stay}>
            {collapsed ? null : 'Service settings'}
          </Navigation.Item>
        </>
      )}
    </SidebarShell>
  )
}
