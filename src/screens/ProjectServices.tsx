import {
  Box,
  Breadcrumbs,
  Button,
  DataTable,
  DropdownMenu,
  InputBase,
  Link,
  PageHeader,
  StatusChip,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { getServiceIconUrl } from '../components/ServiceIcon'
import type { ServiceTypeId } from './ServiceTypeSelectModal'

const PROJECT_NAME = 'ux-tests'

export type ServiceRow = {
  id: string
  serviceName: string
  serviceType: string
  status: string
  nodes: string
  planName: string
  planDetails: string
  cloudRegion: string
  location: string
  created: string
  /** Optional: for table icon (e.g. 'M', 'P') */
  iconLetter?: string
  /** Optional: for opening overview (mysql, postgresql, etc.) */
  serviceTypeId?: ServiceTypeId
  /** Optional: pricing type label shown as a chip (e.g. 'ACU') */
  pricingType?: string
  /** Replication role — undefined means standalone (no replication). */
  replicationRole?: 'primary' | 'read_replica' | 'fork'
  /** For read_replica / fork services: the id of the source service. */
  sourceServiceId?: string
  /** Total number of nodes. Drives the Nodes badge in ServiceOverview. */
  nodeCount?: number
  /** CPUs per VM. */
  cpuCount?: number
  /** Total RAM capacity, e.g. "4 GB". Drives plan usage bars in ServiceOverview. */
  ramCapacity?: string
  /** Total storage capacity, e.g. "80 GB". Drives plan usage bars in ServiceOverview. */
  storageCapacity?: string
}

export const INITIAL_SERVICES: ServiceRow[] = [
  {
    id: 'mysql-204e49c9',
    serviceName: 'mysql-204e49c9',
    serviceType: 'MySQL',
    status: 'Running',
    nodes: 'Nodes 1',
    planName: 'Hobbyist',
    planDetails: '1 CPU / 2 GB RAM / 8 GB storage',
    cloudRegion: 'Google Cloud: asia-east1',
    location: 'Asia, Taiwan',
    created: '16 minutes ago',
    iconLetter: 'M',
    serviceTypeId: 'mysql',
    pricingType: 'ACU',
    nodeCount: 1,
    cpuCount: 1,
    ramCapacity: '2 GB',
    storageCapacity: '8 GB',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ onCreateServiceClick }: { onCreateServiceClick: () => void }) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <Box
        aria-hidden="true"
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #eef1ff 0%, #f5f0ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Box component="span" style={{ fontSize: 36 }}>☁</Box>
      </Box>
      <Typography.LargeHeading>No services yet</Typography.LargeHeading>
      <Box style={{ maxWidth: 360 }}>
        <Box style={{ color: '#4a4b57' }}>
          <Typography.Default>
            Create your first service to get started. Choose from databases, streaming platforms, and more.
          </Typography.Default>
        </Box>
      </Box>
      <Box style={{ marginTop: 8 }}>
        <Button.Primary type="button" onClick={onCreateServiceClick}>
          Create service
        </Button.Primary>
      </Box>
    </Box>
  )
}

EmptyState.displayName = 'EmptyState'

// ─── Main component ───────────────────────────────────────────────────────────

type ProjectServicesProps = {
  services: ServiceRow[]
  onCreateServiceClick: () => void
  onServiceClick?: (serviceId: string) => void
  /** Called when the user chooses "Delete service" from a row's context menu. */
  onDeleteService?: (serviceId: string) => void
  /** Called when the user navigates to Billing (sidebar or header). */
  onBillingClick?: () => void
  /** Called when the user clicks the org root breadcrumb or Home nav. */
  onOrgHomeClick?: () => void
}

function ProjectServices({ services, onCreateServiceClick, onServiceClick, onDeleteService, onBillingClick, onOrgHomeClick }: ProjectServicesProps) {
  const isEmpty = services.length === 0

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader activeNav="projects" onHomeClick={onOrgHomeClick} onBillingClick={onBillingClick} onProjectsClick={onOrgHomeClick} />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ProjectSidebar projectName={PROJECT_NAME} activeItem="services" onBillingClick={onBillingClick} />

        {/* Main content */}
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: '#fff' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title="Services"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="projects">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    Projects
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="project">{PROJECT_NAME}</Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="services">Services</Breadcrumbs.Crumb>,
              ]}
              primaryAction={{ text: 'Create service', onClick: onCreateServiceClick }}
            />
          </Box>

          {isEmpty ? (
            <EmptyState onCreateServiceClick={onCreateServiceClick} />
          ) : (
            <>
              {/* Toolbar */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Box style={{ flex: '1 1 auto', minWidth: 200, maxWidth: 400 }}>
                  <InputBase
                    placeholder="Search services by name, plan, cloud and tags..."
                    aria-label="Search services"
                  />
                </Box>
                <Button.Secondary type="button">Filter list</Button.Secondary>
                <Switch checked={false} onChange={() => {}}>
                  Show only services with alerts
                </Switch>
              </Box>

              {/* Services table */}
              <DataTable
                ariaLabel="Services"
                rows={services}
                columns={[
                  {
                    type: 'item',
                    headerName: 'Service',
                    item: (row) => ({
                      title: (
                        <Link
                          href="#"
                          onClick={(e) => { e.preventDefault(); onServiceClick?.(row.id) }}
                        >
                          {row.serviceName}
                        </Link>
                      ),
                      caption: (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Box style={{ color: '#787885' }}>
                            <Typography.Caption>{row.serviceType}</Typography.Caption>
                          </Box>
                          <StatusChip text={row.status ?? 'Running'} status="success" dense />
                        </Box>
                      ),
                      image: getServiceIconUrl(row.serviceTypeId ?? null),
                      imageSize: 40,
                    }),
                  },
                  {
                    type: 'custom',
                    headerName: 'Nodes',
                    UNSAFE_render: (row) => (
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <StatusChip text="Nodes" status="neutral" dense />
                        <Box
                          aria-label={`${row.nodeCount ?? 1} nodes`}
                          style={{
                            minWidth: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: '#22c55e',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            paddingInline: 4,
                          }}
                        >
                          {row.nodeCount ?? 1}
                        </Box>
                      </Box>
                    ),
                  },
                  {
                    type: 'status',
                    headerName: 'Pricing',
                    headerInvisible: true,
                    status: (row) =>
                      row.pricingType
                        ? { status: row.pricingType === 'ACU' ? ('success' as const) : ('neutral' as const), text: row.pricingType }
                        : undefined,
                  },
                  {
                    type: 'item',
                    headerName: 'Plan',
                    item: (row) => ({
                      title: (
                        <Box component="span" style={{ fontSize: 14, fontWeight: 600 }}>{row.planName}</Box>
                      ),
                      caption: row.planDetails,
                    }),
                  },
                  {
                    type: 'item',
                    headerName: 'Cloud',
                    item: (row) => ({
                      title: row.cloudRegion,
                      caption: row.location,
                    }),
                  },
                  {
                    type: 'text',
                    headerName: 'Created',
                    field: 'created',
                  },
                ]}
                menu={() => (
                  <DropdownMenu.Items>
                    <DropdownMenu.Item id="open">Open service</DropdownMenu.Item>
                    <DropdownMenu.Item id="delete">Delete service</DropdownMenu.Item>
                  </DropdownMenu.Items>
                )}
                menuHeaderName="Actions"
                onAction={(action, row) => {
                  if (action === 'open') onServiceClick?.(row.id)
                  if (action === 'delete') onDeleteService?.(row.id)
                }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

ProjectServices.displayName = 'ProjectServices'

export default ProjectServices
