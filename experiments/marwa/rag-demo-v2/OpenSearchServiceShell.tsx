'use client'

import { useState } from 'react'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  DropdownMenu,
  Grid,
  Typography,
} from '@aivenio/aquarium'
import moreIcon from '@aivenio/aquarium/icons/more'
import chatIcon from '@aivenio/aquarium/icons/chat'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import type { ServiceRow } from '@/screens/ProjectServices'
import { OpenSearchServiceSidebar, type OpenSearchNavId } from './OpenSearchServiceSidebar'
import { OpenSearchOverview } from './OpenSearchOverview'
import { NodeView } from './NodeView'
import { NodesChipTrigger } from './NodesPopover'
import { VectorSearchDemoWizard } from './VectorSearchDemoWizard'
import { StopDemoModal } from './StopDemoModal'
import { VectorDemoSetupCard, VectorDemoStatusCard } from './VectorDemoCards'
import { useVectorDemo } from './useVectorDemo'
import { VectorDemoPage } from './VectorDemoPage'
import type { DemoView } from './ragDemo'

const PROJECT_NAME = 'quick-upgrade-demo'
const SERVICE_VERSION = 'OpenSearch 3.3.2'

const NAV_LABEL: Record<OpenSearchNavId, string> = {
  'cluster-overview': 'Cluster overview',
  overview: 'Overview',
  'vector-search-demo': 'Vector search demo',
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

export function OpenSearchServiceShell({
  service,
  onBack,
  initialNav = 'overview',
  hasVectorDemo = false,
}: {
  service: ServiceRow
  onBack: () => void
  initialNav?: OpenSearchNavId
  hasVectorDemo?: boolean
}) {
  const [active, setActive] = useState<OpenSearchNavId>(initialNav)
  const [demoOpen, setDemoOpen] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const [stopNotice, setStopNotice] = useState(false)
  const demo = useVectorDemo()
  const isRunning = (service.status ?? 'Running') === 'Running'
  const demoAvailable = hasVectorDemo && isRunning
  const demoActive = demoAvailable && demo.active

  function openDemo() {
    setStopNotice(false)
    setDemoOpen(true)
  }

  function showDemoPage(view: DemoView) {
    demo.setView(view)
    setDemoOpen(false)
    setActive('vector-search-demo')
  }

  function requestStop() {
    setDemoOpen(false)
    setStopOpen(true)
  }

  const demoCardProps = {
    demo,
    onOpen: openDemo,
    onSearch: () => showDemoPage('query'),
    onStop: requestStop,
  }

  const sidebar = (
    <OpenSearchServiceSidebar
      projectName={PROJECT_NAME}
      serviceName={service.serviceName}
      activeItem={active}
      onNavigate={setActive}
      onBackToProject={onBack}
      showVectorDemo={demoActive}
      vectorDemoNotification={demo.status === 'preparing' || demo.status === 'failed'}
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
    <Box style={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'flex-start' }}>
      <Box style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100vh - 48px)' }}>
        {sidebar}
      </Box>

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: 24,
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        {/* Breadcrumb + Give feedback (matches Console service details) */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
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
          <Button.Secondary dense type="button" icon={chatIcon} onClick={() => undefined}>
            Give feedback
          </Button.Secondary>
        </Box>

        {/* Service header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <ServiceIcon serviceTypeId={service.serviceTypeId} size={44} alt="" />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Typography.LargeStrong color="intense">{service.serviceName}</Typography.LargeStrong>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <Chip dense text={SERVICE_VERSION} />
              <ServiceStatusChip status={service.status ?? 'Running'} />
              <NodesChipTrigger service={service} onViewAll={() => setActive('cluster-overview')} />
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
        {stopNotice ? (
          <Box style={{ marginBottom: 16 }}>
            <Alert type="success" onDismiss={() => setStopNotice(false)}>
              Vector search demo stopped. Its index and pipeline are still on the service. Thanks for the feedback.
            </Alert>
          </Box>
        ) : null}

        {active === 'overview' ? (
          <>
            {demoAvailable ? (
              <Box style={{ marginBottom: 24 }}>
                <Grid gap="6">
                  {demoActive ? (
                    <Grid.Item xs={12} md={6}>
                      <VectorDemoStatusCard {...demoCardProps} />
                    </Grid.Item>
                  ) : (
                    <Grid.Item xs={12} sm={6} md={4}>
                      <VectorDemoSetupCard stopped={demo.status === 'stopped'} onGenerate={() => openDemo()} />
                    </Grid.Item>
                  )}
                </Grid>
              </Box>
            ) : hasVectorDemo ? (
              <Box style={{ marginBottom: 24 }}>
                <Card
                  fullWidth
                  title="Vector search demo"
                  chips={[{ text: 'Available once running', status: 'neutral' }]}
                >
                  <Typography.Small color="muted">
                    This service includes a guided vector search demo. You can start it here as soon
                    as the service is running.
                  </Typography.Small>
                </Card>
              </Box>
            ) : null}
            <OpenSearchOverview service={service} onChangePlan={() => undefined} onQuickConnect={() => undefined} />
          </>
        ) : active === 'vector-search-demo' && demoActive ? (
          demo.status === 'ready' ? (
            <VectorDemoPage demo={demo} onStop={requestStop} />
          ) : (
            <VectorDemoStatusCard detailed {...demoCardProps} />
          )
        ) : (
          <NavPlaceholder label={NAV_LABEL[active]} />
        )}
      </Box>

      {demoAvailable ? (
        <>
          <VectorSearchDemoWizard
            open={demoOpen}
            onClose={() => setDemoOpen(false)}
            demo={demo}
            onViewDemo={() => showDemoPage('query')}
          />
          <StopDemoModal
            open={stopOpen}
            source={demo.source}
            plan={demo.plan}
            onCancel={() => setStopOpen(false)}
            onConfirm={(feedback) => {
              demo.stop(feedback)
              setStopOpen(false)
              setStopNotice(true)
              if (active === 'vector-search-demo') setActive('overview')
            }}
          />
        </>
      ) : null}
    </Box>
  )
}

OpenSearchServiceShell.displayName = 'OpenSearchServiceShell'
