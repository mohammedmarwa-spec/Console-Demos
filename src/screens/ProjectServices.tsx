import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  DataTable,
  Divider,
  DropdownMenu,
  Filter,
  InlineIcon,
  InputBase,
  Link,
  PageHeader,
  StatusChip,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import filterIcon from '@aivenio/aquarium/icons/filter'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
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

// ─── Filter options ────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Apache Kafka', label: 'Apache Kafka' },
  { value: 'OpenSearch', label: 'OpenSearch' },
  { value: 'ClickHouse', label: 'ClickHouse' },
  { value: 'Valkey', label: 'Valkey' },
  { value: 'Dragonfly', label: 'Dragonfly' },
  { value: 'Thanos Metrics', label: 'Thanos Metrics' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'Grafana', label: 'Grafana' },
  { value: 'Apache Flink', label: 'Apache Flink' },
  { value: 'Apache Kafka Connect', label: 'Apache Kafka Connect' },
  { value: 'Apache Kafka MirrorMaker', label: 'Apache Kafka MirrorMaker' },
]

const STATUS_OPTIONS = [
  { value: 'Running', label: 'Running' },
  { value: 'Powered off', label: 'Powered off' },
  { value: 'Rebuilding', label: 'Rebuilding' },
  { value: 'Rebalancing', label: 'Rebalancing' },
]

const PROVIDER_OPTIONS = [
  { value: 'Amazon Web Services', label: 'Amazon Web Services' },
  { value: 'Google Cloud', label: 'Google Cloud' },
  { value: 'Microsoft Azure', label: 'Microsoft Azure' },
  { value: 'DigitalOcean', label: 'DigitalOcean' },
  { value: 'UpCloud', label: 'UpCloud' },
]

const PRICING_OPTIONS = [
  { value: 'ACU', label: 'ACU' },
  { value: 'Fixed plan', label: 'Fixed plan' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusChipStatus(status: string): 'success' | 'neutral' | 'warning' | 'info' {
  switch (status) {
    case 'Running': return 'success'
    case 'Powered off': return 'neutral'
    case 'Rebuilding': return 'warning'
    case 'Rebalancing': return 'info'
    default: return 'neutral'
  }
}

function extractProvider(cloudRegion: string): string {
  return cloudRegion.split(':')[0].trim()
}

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
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedPricingModes, setSelectedPricingModes] = useState<string[]>([])
  const filterWrapperRef = useRef<HTMLDivElement>(null)

  // Close filter panel when clicking outside the wrapper
  useEffect(() => {
    if (!filterOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [filterOpen])

  const filteredServices = useMemo(() => {
    return services.filter((row) => {
      const matchesService = selectedServices.length === 0 || selectedServices.includes(row.serviceType)
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(row.status)
      const provider = extractProvider(row.cloudRegion)
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(provider)
      const matchesPricing =
        selectedPricingModes.length === 0 ||
        selectedPricingModes.some((mode) => {
          if (mode === 'ACU') return row.pricingType === 'ACU'
          if (mode === 'Fixed plan') return row.pricingType !== 'ACU'
          return false
        })
      return matchesService && matchesStatus && matchesProvider && matchesPricing
    })
  }, [services, selectedServices, selectedStatuses, selectedProviders, selectedPricingModes])

  const activeFilterCount =
    selectedServices.length + selectedStatuses.length + selectedProviders.length + selectedPricingModes.length

  const filterValueText = useMemo(() => {
    if (activeFilterCount === 0) return undefined
    const all = [...selectedServices, ...selectedStatuses, ...selectedProviders, ...selectedPricingModes]
    const MAX = 3
    const shown = all.slice(0, MAX)
    const overflow = all.length - shown.length
    return overflow > 0 ? `${shown.join(', ')} +${overflow} more` : shown.join(', ')
  }, [activeFilterCount, selectedServices, selectedStatuses, selectedProviders, selectedPricingModes])

  function handleClearFilters() {
    setSelectedServices([])
    setSelectedStatuses([])
    setSelectedProviders([])
    setSelectedPricingModes([])
  }

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

                {/* Filter trigger + dropdown panel */}
                <div ref={filterWrapperRef} style={{ position: 'relative' }}>
                  <Filter.Trigger
                    labelText="Filter"
                    icon={filterIcon}
                    value={filterValueText}
                    onClear={activeFilterCount > 0 ? handleClearFilters : undefined}
                    onClick={() => setFilterOpen((prev) => !prev)}
                  />

                  {filterOpen && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        zIndex: 200,
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e8',
                        borderRadius: 8,
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                        padding: 24,
                        minWidth: 720,
                      }}
                    >
                      {/* Filter sections — horizontal layout matching the screenshot */}
                      <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 20 }}>
                        <CheckboxGroup
                          labelText="Services"
                          cols="2"
                          value={selectedServices}
                          onChange={(val) => setSelectedServices(val ?? [])}
                        >
                          {SERVICE_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Status"
                          value={selectedStatuses}
                          onChange={(val) => setSelectedStatuses(val ?? [])}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Providers"
                          value={selectedProviders}
                          onChange={(val) => setSelectedProviders(val ?? [])}
                        >
                          {PROVIDER_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>

                        <CheckboxGroup
                          labelText="Pricing mode"
                          value={selectedPricingModes}
                          onChange={(val) => setSelectedPricingModes(val ?? [])}
                        >
                          {PRICING_OPTIONS.map((opt) => (
                            <Checkbox key={opt.value} value={opt.value}>
                              {opt.label}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                      </Box>

                      <Divider />

                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <InlineIcon icon={infoSignIcon} />
                        <Typography.SmallStrong>
                          Need more filter options?{' '}
                          <Link href="#">Learn more</Link>
                        </Typography.SmallStrong>
                      </Box>
                    </Box>
                  )}
                </div>

                <Switch checked={false} onChange={() => {}}>
                  Show only services with alerts
                </Switch>
              </Box>

              {/* Services table */}
              <DataTable
                ariaLabel="Services"
                rows={filteredServices}
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
                          <StatusChip
                            text={row.status ?? 'Running'}
                            status={getStatusChipStatus(row.status ?? 'Running')}
                            dense
                          />
                        </Box>
                      ),
                      image: getServiceIconUrl(row.serviceTypeId ?? null),
                      imageSize: 40,
                    }),
                  },
                  {
                    type: 'custom',
                    headerName: 'Nodes',
                    UNSAFE_render: (row) => {
                      const isPoweredOff = row.status === 'Powered off'
                      return (
                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <StatusChip text="Nodes" status="neutral" dense />
                          <Box
                            aria-label={`${row.nodeCount ?? 1} nodes`}
                            style={{
                              minWidth: 18,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: isPoweredOff ? '#787885' : '#22c55e',
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
                      )
                    },
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
