'use client'

import { useRef, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  DropdownMenu,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import moreIcon from '@aivenio/aquarium/icons/more'
import { ServiceIcon } from '@/components/ServiceIcon'
import { NodesCountChip } from '@/components/NodesCountChip'
import type { ServiceRow } from '@/screens/ProjectServices'
import { OpenSearchServiceSidebar, type OpenSearchNavId } from './OpenSearchServiceSidebar'
import { OpenSearchOverview } from './OpenSearchOverview'
import { NodeView } from './NodeView'
import { NodesPopover } from './NodesPopover'

const PROJECT_NAME = 'quick-upgrade-demo'
const SERVICE_VERSION = 'OpenSearch 3.3.2'

const NAV_LABEL: Record<OpenSearchNavId, string> = {
  'cluster-overview': 'Cluster overview',
  overview: 'Overview',
  indexes: 'Indexes',
  'data-integrations': 'Integrations',
  metrics: 'Metrics',
  logs: 'Logs',
  users: 'Users',
  'backup-management': 'Backup management',
  snapshots: 'Snapshots',
  'service-settings': 'Service settings',
}

/** Placeholder body for nav items that aren't built out in this prototype. */
function NavPlaceholder({ label }: { label: string }) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '48px 24px',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: 'var(--aquarium-border-radius-default)',
        border: '1px dashed var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
      }}
    >
      <Typography.LargeStrong color="intense">{label}</Typography.LargeStrong>
      <Typography.Small color="muted">
        This section is a prototype placeholder. The Overview and Cluster overview screens are built out.
      </Typography.Small>
    </Box>
  )
}

export function OpenSearchServiceShell({ service, onBack }: { service: ServiceRow; onBack: () => void }) {
  const [active, setActive] = useState<OpenSearchNavId>('overview')
  const [nodesOpen, setNodesOpen] = useState(false)
  const nodesChipRef = useRef<HTMLDivElement>(null)

  const sidebar = (
    <OpenSearchServiceSidebar
      projectName={PROJECT_NAME}
      serviceName={service.serviceName}
      activeItem={active}
      onNavigate={setActive}
      onBackToProject={onBack}
    />
  )

  // Cluster overview reuses the full-bleed NodeView (it renders its own scroll area).
  if (active === 'cluster-overview') {
    return (
      <Box style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {sidebar}
        <NodeView service={service} onBack={() => setActive('overview')} />
      </Box>
    )
  }

  return (
    <Box style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {sidebar}

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: 24,
          overflow: 'auto',
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        {/* Breadcrumb */}
        <Box style={{ marginBottom: 12 }}>
          <Breadcrumbs>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              My Organization
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb href="#" onClick={(event) => event.preventDefault()}>
              {PROJECT_NAME}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb
              href="#"
              onClick={(event) => {
                event.preventDefault()
                setActive('overview')
              }}
            >
              {service.serviceName}
            </Breadcrumbs.Crumb>
            <Breadcrumbs.Crumb>{NAV_LABEL[active]}</Breadcrumbs.Crumb>
          </Breadcrumbs>
        </Box>

        {/* Service header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <ServiceIcon serviceTypeId={service.serviceTypeId} size={44} alt="" />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Typography.LargeStrong color="intense">{service.serviceName}</Typography.LargeStrong>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <Chip dense text={SERVICE_VERSION} />
              <StatusChip dense status="success" text={service.status ?? 'Running'} />
              <div
                ref={nodesChipRef}
                role="button"
                tabIndex={0}
                aria-label="Open nodes overview"
                aria-haspopup="dialog"
                aria-expanded={nodesOpen}
                style={{ cursor: 'pointer', display: 'inline-flex' }}
                onClick={() => setNodesOpen((v) => !v)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setNodesOpen((v) => !v)
                  }
                }}
              >
                <NodesCountChip count={service.nodeCount ?? 17} serviceStatus={service.status ?? 'Running'} />
              </div>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <Button.Icon type="button" aria-label="Service actions" tooltip="More actions" icon={moreIcon} />
              </DropdownMenu.Trigger>
              <DropdownMenu.Items>
                <DropdownMenu.Item id="power-off">Power off service</DropdownMenu.Item>
                <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>
            <Button.Secondary type="button" onClick={() => undefined}>
              Open support ticket
            </Button.Secondary>
          </Box>
        </Box>

        {/* Content */}
        {active === 'overview' ? (
          <OpenSearchOverview service={service} onChangePlan={() => undefined} onQuickConnect={() => undefined} />
        ) : (
          <NavPlaceholder label={NAV_LABEL[active]} />
        )}
      </Box>

      {/* Nodes popover — opened from the "Nodes N" chip */}
      <NodesPopover
        service={service}
        open={nodesOpen}
        triggerRef={nodesChipRef}
        onClose={() => setNodesOpen(false)}
        onViewAll={() => setActive('cluster-overview')}
      />
    </Box>
  )
}

OpenSearchServiceShell.displayName = 'OpenSearchServiceShell'
