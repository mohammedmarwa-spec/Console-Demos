'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  DataList,
  Divider,
  EmptyState,
  InlineIcon,
  Link,
  PageHeader,
  Select,
  StatusChip,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import errorSign from '@aivenio/aquarium/icons/error'
import helpIcon from '@aivenio/aquarium/icons/help'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { getServiceIconUrl, ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import { imageSrc } from '@experiments/_shared/lib/image'
import { HomeRightColumn } from '@experiments/_shared/home/HomeRightColumn'
import { OrgSidebar } from '@/components/OrgSidebar'
import { aquariumSelectValue } from '@/lib/aquariumSelect'
import { ROUTES } from '@/lib/navigation'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  ORG_NAME,
  PROJECT_HOME_ID,
  PROJECTS,
  USER_NAME,
  SERVICES_BY_PROJECT,
  getPostureSignals,
  getProjectPreviewServices,
  getScopedServices,
  type HomePostureSignal,
  type HomePostureSignalId,
  type HomeProject,
  type HomeServiceRow,
} from './mockData'
import projectIcon from './assets/home-page-project.svg'
import styles from './HomePageContent.module.css'

type ServiceTableFilterId = 'all-alerts' | 'close-eol' | 'maintenance' | 'degraded'

type HomeAlertRow = {
  id: string
  service: HomeServiceRow
  alert: string
  maintenance: string
}

const SERVICE_TABLE_FILTERS: { id: ServiceTableFilterId; label: string }[] = [
  { id: 'all-alerts', label: 'All alerts' },
  { id: 'close-eol', label: 'Close EOL' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'degraded', label: 'Degraded service' },
]

/** Hidden on this homepage; keep `true` to restore posture cards, or import `PostureSummary` elsewhere. */
export const SHOW_POSTURE_INSIGHT_CARDS = false

function isServiceTableFilterId(value: string): value is ServiceTableFilterId {
  return SERVICE_TABLE_FILTERS.some((filter) => filter.id === value)
}

const SERVICE_ICON_STACK_SIZE = 32
const SERVICE_ICON_STACK_OVERLAP = 10

function getAlertServices(services: HomeServiceRow[]): HomeServiceRow[] {
  return services.filter((service) => service.alerts.length > 0)
}

function serviceMatchesNarrowingFilter(service: HomeServiceRow, filterId: ServiceTableFilterId): boolean {
  if (filterId === 'all-alerts') return true
  if (filterId === 'close-eol') return service.versionEolState !== 'supported'
  if (filterId === 'maintenance') return service.maintenanceWindowState === 'needs_review'
  return service.nodeStatus === 'degraded' || service.nodeStatus === 'down'
}

function filterServicesByTableFilters(
  services: HomeServiceRow[],
  selected: ServiceTableFilterId,
): HomeAlertRow[] {
  const alertServices = getAlertServices(services)
  const narrowed =
    selected === 'all-alerts'
      ? alertServices
      : alertServices.filter((service) => serviceMatchesNarrowingFilter(service, selected))
  return toAlertRows(narrowed)
}

function toAlertRows(services: HomeServiceRow[]): HomeAlertRow[] {
  return services.flatMap((service) =>
    service.alerts.map((alert, index) => ({
      id: `${service.id}:${index}`,
      service,
      alert,
      maintenance: service.maintenance,
    })),
  )
}

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

const PROJECT_INSIGHTS_SCOPE = 'production' as const

export function HomePageContent() {
  const router = useRouter()
  const [currentProjectId, setCurrentProjectId] = useState(PROJECTS[0]!.id)
  const [activeSignalId, setActiveSignalId] = useState<HomePostureSignalId | null>(null)
  const currentProject = PROJECTS.find((project) => project.id === currentProjectId) ?? PROJECTS[0]!
  const projectServices = SERVICES_BY_PROJECT[currentProject.id] ?? []

  const scopedServices = useMemo(
    () => getScopedServices(projectServices, PROJECT_INSIGHTS_SCOPE),
    [projectServices],
  )
  const postureSignals = useMemo(
    () => getPostureSignals(projectServices, PROJECT_INSIGHTS_SCOPE),
    [projectServices],
  )
  const activeSignal = activeSignalId ? postureSignals.find((signal) => signal.id === activeSignalId) ?? null : null
  const drilldownServices = useMemo(() => {
    if (!activeSignal) return scopedServices
    const affected = new Set(activeSignal.affectedServiceIds)
    return scopedServices.filter((service) => affected.has(service.id))
  }, [activeSignal, scopedServices])

  useEffect(() => {
    setActiveSignalId(null)
  }, [currentProjectId])

  useEffect(() => {
    if (!activeSignalId) return
    if (!postureSignals.some((signal) => signal.id === activeSignalId)) {
      setActiveSignalId(null)
    }
  }, [activeSignalId, postureSignals])

  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <OrgSidebar
        orgName={ORG_NAME}
        activeItem="overview"
        onItemClick={(id) => {
          if (id === 'projects') router.push(ROUTES.projectsPage)
          if (id === 'data-flow') router.push(ROUTES.dataFlow)
        }}
      />

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) auto minmax(280px, 1fr)',
          alignItems: 'start',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            padding: 24,
            minWidth: 0,
          }}
        >
          <PageHeader
            title={`Welcome to Aiven Platform, ${USER_NAME}`}
            subtitle="Here's what's happening across your organization."
          />
          <RecentProjects />
          <ProjectHealth
            project={currentProject}
            projects={PROJECTS}
            postureSignals={postureSignals}
            activeSignal={activeSignal}
            services={drilldownServices}
            onProjectChange={setCurrentProjectId}
            onSelectSignal={setActiveSignalId}
            onClearActiveSignal={() => setActiveSignalId(null)}
          />
        </Box>

        <Divider direction="vertical" />

        <HomeRightColumn />
      </Box>
    </Box>
  )
}

HomePageContent.displayName = 'HomePageContent'

function RecentProjects() {
  const router = useRouter()

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Typography.LargeStrong>Recent projects</Typography.LargeStrong>
        <Typography.Default>
          <Link href={ROUTES.projectsPage} icon={arrowRight} iconPlacement="right">
            View all projects ({PROJECTS.length})
          </Link>
        </Typography.Default>
      </Box>
      <Box className={styles.recentProjectsGrid}>
        {PROJECTS.map((project) => {
          const previewServices = getProjectPreviewServices(project.id)
          return (
            <Card.Compact
              key={project.id}
              fullWidth
              title={
                <Card.Title>
                  <Box className={styles.projectPreviewTitle}>
                    {previewServices.length > 0 ? (
                      <ServiceIconStack services={previewServices} />
                    ) : (
                      <Box className={styles.serviceIconStackItem} aria-hidden>
                        <img
                          src={imageSrc(projectIcon)}
                          width={18}
                          height={18}
                          alt=""
                          style={{ display: 'block', objectFit: 'contain' }}
                        />
                      </Box>
                    )}
                    <Typography.DefaultStrong className={styles.projectPreviewName}>
                      {project.name}
                    </Typography.DefaultStrong>
                  </Box>
                </Card.Title>
              }
              onClick={() => {
                if (project.id === PROJECT_HOME_ID) {
                  router.push(ROUTES.projectPage)
                }
              }}
            >
              <Box className={styles.projectPreviewMeta}>
                {project.serviceCount} services
                <Chip text={project.tag} dense />
              </Box>
            </Card.Compact>
          )
        })}
      </Box>
    </Box>
  )
}

RecentProjects.displayName = 'RecentProjects'

function ProjectHealth({
  project,
  projects,
  postureSignals,
  activeSignal,
  services,
  onProjectChange,
  onSelectSignal,
  onClearActiveSignal,
}: {
  project: HomeProject
  projects: HomeProject[]
  postureSignals: HomePostureSignal[]
  activeSignal: HomePostureSignal | null
  services: HomeServiceRow[]
  onProjectChange: (id: string) => void
  onSelectSignal: (id: HomePostureSignalId | null) => void
  onClearActiveSignal: () => void
}) {
  const projectOptions = projects.map((item) => ({ label: item.name, value: item.id }))
  const showInsightCards = SHOW_POSTURE_INSIGHT_CARDS && postureSignals.length > 0
  const showEmptyPosture = SHOW_POSTURE_INSIGHT_CARDS && postureSignals.length === 0

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Typography.LargeStrong>Project insights</Typography.LargeStrong>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Box className={styles.projectSelect}>
          <Select
            labelText="Project"
            options={projectOptions}
            value={project.id}
            onChange={(selected) => onProjectChange(aquariumSelectValue(selected, project.id))}
            reserveSpaceForError={false}
          />
        </Box>

        {showEmptyPosture ? (
          <EmptyState title="No posture statements available">
            No services match the selected project and environment scope.
          </EmptyState>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showInsightCards ? (
              <PostureSummary
                signals={postureSignals}
                activeSignalId={activeSignal?.id ?? null}
                onSelectSignal={onSelectSignal}
              />
            ) : null}
            <PostureServicesPanel
              key={project.id}
              activeSignal={activeSignal}
              services={services}
              onClearActiveSignal={onClearActiveSignal}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

ProjectHealth.displayName = 'ProjectHealth'

function ServiceIconStack({ services }: { services: HomeServiceRow[] }) {
  const theme = useResolvedTheme()
  const logoSize = Math.round(SERVICE_ICON_STACK_SIZE * 0.56)
  const uniqueServices = services.filter(
    (service, index, list) => list.findIndex((candidate) => candidate.id === service.id) === index,
  )

  if (uniqueServices.length === 0) return null

  return (
    <Box
      className={styles.serviceIconStack}
      aria-label={`${uniqueServices.length} ${uniqueServices.length === 1 ? 'service' : 'services'}`}
    >
      {uniqueServices.map((service, index) => (
        <Box
          key={service.id}
          title={service.serviceName}
          className={styles.serviceIconStackItem}
          style={{
            marginLeft: index === 0 ? 0 : -SERVICE_ICON_STACK_OVERLAP,
            zIndex: uniqueServices.length - index,
          }}
        >
          <img
            src={getServiceIconUrl(service.serviceTypeId, theme)}
            width={logoSize}
            height={logoSize}
            alt=""
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </Box>
      ))}
    </Box>
  )
}

ServiceIconStack.displayName = 'ServiceIconStack'

function postureToneToStatus(tone: HomePostureSignal['tone']): 'success' | 'warning' | 'danger' {
  if (tone === 'danger') return 'danger'
  if (tone === 'warning') return 'warning'
  return 'success'
}

export function PostureSummary({
  signals,
  activeSignalId,
  onSelectSignal,
}: {
  signals: HomePostureSignal[]
  activeSignalId: HomePostureSignalId | null
  onSelectSignal: (id: HomePostureSignalId | null) => void
}) {
  return (
    <Box className={styles.row}>
      {signals.map((signal) => (
        <PostureCard
          key={signal.id}
          signal={signal}
          isActive={activeSignalId === signal.id}
          onSelect={() => onSelectSignal(activeSignalId === signal.id ? null : signal.id)}
        />
      ))}
    </Box>
  )
}

PostureSummary.displayName = 'PostureSummary'

export function PostureCard({
  signal,
  isActive,
  onSelect,
}: {
  signal: HomePostureSignal
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <Box
      className={styles.item}
      style={{
        outline: isActive ? '2px solid var(--aquarium-border-color-primary-default)' : undefined,
        outlineOffset: 2,
        borderRadius: 'var(--aquarium-border-radius-default)',
      }}
    >
      <Card
        fullWidth
        onClick={onSelect}
        chips={[{ text: signal.coverage, status: postureToneToStatus(signal.tone) }]}
        title={
          <Card.Title style={{ alignItems: 'center', gap: 8 }}>
            {signal.title}
            <Box
              component="span"
              onClick={(event) => {
                event.stopPropagation()
              }}
              style={{ display: 'inline-flex', flexShrink: 0 }}
            >
              <Tooltip content={signal.whyMatters}>
                <Box
                  component="span"
                  aria-label="Why this matters"
                  style={{ display: 'inline-flex', color: 'var(--aquarium-text-color-muted)' }}
                >
                  <InlineIcon icon={helpIcon} />
                </Box>
              </Tooltip>
            </Box>
          </Card.Title>
        }
      >
        <Typography.Small color="muted">{signal.summary}</Typography.Small>
      </Card>
    </Box>
  )
}

PostureCard.displayName = 'PostureCard'

function nodeStatusToChip(nodeStatus: HomeServiceRow['nodeStatus']): { text: string; status: 'success' | 'warning' | 'danger' } {
  if (nodeStatus === 'down') return { text: 'Down', status: 'danger' }
  if (nodeStatus === 'degraded') return { text: 'Degraded', status: 'warning' }
  return { text: 'Healthy', status: 'success' }
}

function PostureServicesPanel({
  activeSignal,
  services,
  onClearActiveSignal,
}: {
  activeSignal: HomePostureSignal | null
  services: HomeServiceRow[]
  onClearActiveSignal: () => void
}) {
  const [selectedFilter, setSelectedFilter] = useState<ServiceTableFilterId>('all-alerts')
  const filteredServices = useMemo(
    () => filterServicesByTableFilters(services, selectedFilter),
    [services, selectedFilter],
  )

  if (services.length === 0) {
    return (
      <EmptyState title="No services in this scope">
        No services match the selected project and environment scope.
      </EmptyState>
    )
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <ServiceTableFilters services={services} selected={selectedFilter} onChange={setSelectedFilter} />
        {activeSignal ? (
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--aquarium-border-color-primary-default)',
              backgroundColor: 'var(--aquarium-background-color-primary-muted)',
              borderRadius: 999,
              padding: '6px 10px',
              alignSelf: 'flex-start',
            }}
          >
            <Typography.SmallStrong>{activeSignal.title}</Typography.SmallStrong>
            <Typography.Small color="muted">{activeSignal.fixLabel}</Typography.Small>
            <Link
              href="#"
              onClick={(event) => {
                noopClick(event)
                onClearActiveSignal()
              }}
            >
              Clear
            </Link>
          </Box>
        ) : null}
      </Box>
      {filteredServices.length === 0 ? (
        <EmptyState title="No matching alerts">
          No alerts match the selected filter.
        </EmptyState>
      ) : (
        <PostureServiceList rows={filteredServices} fixLabel={activeSignal?.fixLabel ?? 'Review service'} />
      )}
    </Box>
  )
}

PostureServicesPanel.displayName = 'PostureServicesPanel'

function ServiceTableFilters({
  services,
  selected,
  onChange,
}: {
  services: HomeServiceRow[]
  selected: ServiceTableFilterId
  onChange: (next: ServiceTableFilterId) => void
}) {
  const alertServices = getAlertServices(services)
  const alertCount = alertServices.reduce((sum, service) => sum + service.alerts.length, 0)

  return (
    <ChoiceChipGroup
      name="service-table-filters"
      selectionMode="radio"
      dense
      value={selected}
      onChange={(value) => {
        const id = String(value || 'all-alerts')
        onChange(isServiceTableFilterId(id) ? id : 'all-alerts')
      }}
      aria-label="Service filters"
    >
      {SERVICE_TABLE_FILTERS.map((filter) => (
        <ChoiceChip key={filter.id} value={filter.id} dense>
          {filter.id === 'all-alerts' ? `${filter.label} ${alertCount}` : filter.label}
        </ChoiceChip>
      ))}
    </ChoiceChipGroup>
  )
}

ServiceTableFilters.displayName = 'ServiceTableFilters'

function PostureServiceList({ rows, fixLabel }: { rows: HomeAlertRow[]; fixLabel: string }) {
  const columns: DataListColumn<HomeAlertRow>[] = [
    {
      headerName: 'Service',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (row) => (
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <ServiceIcon serviceTypeId={row.service.serviceTypeId} size={32} />
          <Box>
            <Typography.Default>
              <Link href="#" onClick={noopClick}>
                {row.service.serviceName}
              </Link>
            </Typography.Default>
            <Typography.Small color="muted">{row.service.environment}</Typography.Small>
          </Box>
        </Box>
      ),
    },
    {
      headerName: 'Node status',
      type: 'custom',
      width: 120,
      UNSAFE_render: (row) => {
        const node = nodeStatusToChip(row.service.nodeStatus)
        return <StatusChip dense text={node.text} status={node.status} />
      },
    },
    {
      field: 'maintenance',
      headerName: 'Maintenance schedule',
      type: 'text',
    },
    {
      headerName: 'Alerts/Notifications',
      type: 'custom',
      UNSAFE_render: (row) => <ServiceAlertsCell row={row} />,
    },
    {
      headerName: 'Fix',
      type: 'custom',
      UNSAFE_render: () => (
        <Typography.Default>
          <Link href="#" onClick={noopClick}>
            {fixLabel}
          </Link>
        </Typography.Default>
      ),
    },
  ]

  return <DataList columns={columns} rows={rows} sticky={false} />
}

PostureServiceList.displayName = 'PostureServiceList'

function ServiceAlertsCell({ row }: { row: HomeAlertRow }) {
  const icon = row.service.severity === 'danger' ? errorSign : warningSign
  const iconColor = row.service.severity === 'danger' ? 'danger-default' : 'warning-default'

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <InlineIcon icon={icon} color={iconColor} style={{ width: 16, height: 16 }} />
      <span>{row.alert}</span>
    </Box>
  )
}

ServiceAlertsCell.displayName = 'ServiceAlertsCell'
