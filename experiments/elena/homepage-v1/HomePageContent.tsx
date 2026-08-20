'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  DataList,
  Divider,
  DropdownMenu,
  EmptyState,
  Filter,
  InlineIcon,
  Link,
  StatusChip,
  Switch,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import chevronDown from '@aivenio/aquarium/icons/chevronDown'
import chevronLeft from '@aivenio/aquarium/icons/chevronLeft'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import chevronUp from '@aivenio/aquarium/icons/chevronUp'
import errorSign from '@aivenio/aquarium/icons/error'
import filterIcon from '@aivenio/aquarium/icons/filter'
import helpIcon from '@aivenio/aquarium/icons/help'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import { imageSrc } from '@experiments/_shared/lib/image'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import {
  ORG_NAME,
  PROJECT_HOME_ID,
  PROJECTS,
  RELEASE_NOTES,
  SERVICES_BY_PROJECT,
  getPostureSignals,
  getScopedServices,
  type HomePostureSignal,
  type HomePostureSignalId,
  type HomeProject,
  type HomeServiceRow,
  type HomeScope,
} from './mockData'
import projectIcon from './assets/home-page-project.svg'
import styles from './HomePageContent.module.css'

const CHANGELOG_URL = 'https://aiven.io/changelog'
const CHANGELOG_RSS_URL = 'https://aiven.io/changelog/feed.xml'

type ServiceTableFilterId = 'close-eol' | 'maintenance' | 'degraded'

const SERVICE_TABLE_FILTERS: { id: ServiceTableFilterId; label: string }[] = [
  { id: 'close-eol', label: 'Close EOL' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'degraded', label: 'Degraded service' },
]

function isServiceTableFilterId(value: string): value is ServiceTableFilterId {
  return SERVICE_TABLE_FILTERS.some((filter) => filter.id === value)
}

function parseSelectedTableFilters(keys: Iterable<unknown> | 'all'): Set<ServiceTableFilterId> {
  if (keys === 'all') return new Set(SERVICE_TABLE_FILTERS.map((filter) => filter.id))
  const selected = new Set<ServiceTableFilterId>()
  for (const key of keys) {
    const id = String(key)
    if (isServiceTableFilterId(id)) selected.add(id)
  }
  return selected
}

function serviceMatchesTableFilter(service: HomeServiceRow, filterId: ServiceTableFilterId): boolean {
  if (filterId === 'close-eol') return service.versionEolState !== 'supported'
  if (filterId === 'maintenance') return service.maintenanceWindowState === 'needs_review'
  return service.nodeStatus === 'degraded' || service.nodeStatus === 'down'
}

function filterServicesByTableFilters(
  services: HomeServiceRow[],
  selected: Set<ServiceTableFilterId>,
): HomeServiceRow[] {
  if (selected.size === 0) return services
  return services.filter((service) =>
    SERVICE_TABLE_FILTERS.some((filter) => selected.has(filter.id) && serviceMatchesTableFilter(service, filter.id)),
  )
}

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function HomePageContent() {
  const [currentProjectId, setCurrentProjectId] = useState(PROJECTS[0]!.id)
  const [includeDevelopment, setIncludeDevelopment] = useState(false)
  const [activeSignalId, setActiveSignalId] = useState<HomePostureSignalId | null>(null)
  const currentProject = PROJECTS.find((project) => project.id === currentProjectId) ?? PROJECTS[0]!
  const projectServices = SERVICES_BY_PROJECT[currentProject.id] ?? []
  const scope: HomeScope = includeDevelopment ? 'all' : 'production'

  const scopedServices = useMemo(() => getScopedServices(projectServices, scope), [projectServices, scope])
  const postureSignals = useMemo(() => getPostureSignals(projectServices, scope), [projectServices, scope])
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
      <OrgSidebar orgName={ORG_NAME} activeItem="overview" />

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
          <RecentProjects />
          <ProjectHealth
            project={currentProject}
            projects={PROJECTS}
            includeDevelopment={includeDevelopment}
            postureSignals={postureSignals}
            activeSignal={activeSignal}
            services={drilldownServices}
            onProjectChange={setCurrentProjectId}
            onToggleIncludeDevelopment={setIncludeDevelopment}
            onSelectSignal={setActiveSignalId}
            onClearActiveSignal={() => setActiveSignalId(null)}
          />
        </Box>

        <Divider direction="vertical" />

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            padding: 24,
            minWidth: 0,
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
          }}
        >
          <ProductUpdates />
        </Box>
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
          <Link href="#" icon={arrowRight} iconPlacement="right" onClick={noopClick}>
            View all projects ({PROJECTS.length})
          </Link>
        </Typography.Default>
      </Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {PROJECTS.map((project) => (
          <Card.Compact
            key={project.id}
            fullWidth
            icon={imageSrc(projectIcon)}
            title={project.name}
            clampTitle={1}
            onClick={() => {
              if (project.id === PROJECT_HOME_ID) {
                router.push(ROUTES.projectPage)
              }
            }}
          >
            {project.serviceCount} services
          </Card.Compact>
        ))}
      </Box>
    </Box>
  )
}

RecentProjects.displayName = 'RecentProjects'

function ProjectHealth({
  project,
  projects,
  includeDevelopment,
  postureSignals,
  activeSignal,
  services,
  onProjectChange,
  onToggleIncludeDevelopment,
  onSelectSignal,
  onClearActiveSignal,
}: {
  project: HomeProject
  projects: HomeProject[]
  includeDevelopment: boolean
  postureSignals: HomePostureSignal[]
  activeSignal: HomePostureSignal | null
  services: HomeServiceRow[]
  onProjectChange: (id: string) => void
  onToggleIncludeDevelopment: (includeDevelopment: boolean) => void
  onSelectSignal: (id: HomePostureSignalId | null) => void
  onClearActiveSignal: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Typography.LargeStrong>Project insights</Typography.LargeStrong>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <DropdownMenu
            placement="bottom-left"
            searchable
            emptyState="No results found"
            onOpenChange={setMenuOpen}
            onAction={(action) => onProjectChange(String(action))}
            selectionMode="single"
            selection={new Set([project.id])}
          >
            <DropdownMenu.Trigger>
              <Box
                role="button"
                aria-pressed={menuOpen}
                aria-label="Select project"
                tabIndex={0}
                style={{
                  alignSelf: 'start',
                  padding: '12px 16px',
                  borderRadius: 'var(--aquarium-border-radius-default)',
                  backgroundColor: 'var(--aquarium-background-color-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 28,
                }}
              >
                <Box>
                  <Typography.Default>{project.name}</Typography.Default>
                  <Typography.Small color="muted">Select project</Typography.Small>
                </Box>
                <InlineIcon icon={menuOpen ? chevronUp : chevronDown} />
              </Box>
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              {projects.map((item) => (
                <DropdownMenu.Item key={item.id} id={item.id}>
                  {item.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Items>
          </DropdownMenu>
          <Switch checked={includeDevelopment} onChange={(event) => onToggleIncludeDevelopment(event.target.checked)}>
            Include development services
          </Switch>
        </Box>

        {postureSignals.length === 0 ? (
          <EmptyState title="No posture statements available">
            No services match the selected project and environment scope.
          </EmptyState>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PostureSummary
              signals={postureSignals}
              activeSignalId={activeSignal?.id ?? null}
              onSelectSignal={onSelectSignal}
            />
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

function postureToneToStatus(tone: HomePostureSignal['tone']): 'success' | 'warning' | 'danger' {
  if (tone === 'danger') return 'danger'
  if (tone === 'warning') return 'warning'
  return 'success'
}

function PostureSummary({
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

function PostureCard({
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
  const [selectedFilters, setSelectedFilters] = useState<Set<ServiceTableFilterId>>(new Set())
  const filteredServices = useMemo(
    () => filterServicesByTableFilters(services, selectedFilters),
    [services, selectedFilters],
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
        <ServiceTableFilters selected={selectedFilters} onChange={setSelectedFilters} />
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
        <EmptyState title="No matching services">
          No services match the selected filters.
        </EmptyState>
      ) : (
        <PostureServiceList services={filteredServices} fixLabel={activeSignal?.fixLabel ?? 'Review service'} />
      )}
    </Box>
  )
}

PostureServicesPanel.displayName = 'PostureServicesPanel'

function ServiceTableFilters({
  selected,
  onChange,
}: {
  selected: Set<ServiceTableFilterId>
  onChange: (next: Set<ServiceTableFilterId>) => void
}) {
  const selectedIds = SERVICE_TABLE_FILTERS.filter((filter) => selected.has(filter.id))
  let valueText: string | undefined
  if (selectedIds.length === 1) {
    valueText = selectedIds[0]!.label
  } else if (selectedIds.length > 1) {
    valueText = `${selectedIds.length} selected`
  }

  return (
    <DropdownMenu
      placement="bottom-left"
      selectionMode="multiple"
      selection={selected}
      onSelectionChange={(keys) => onChange(parseSelectedTableFilters(keys))}
    >
      <DropdownMenu.Trigger>
        <Filter.Trigger
          labelText="Filters"
          icon={filterIcon}
          value={valueText}
          onClear={selected.size > 0 ? () => onChange(new Set()) : undefined}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {SERVICE_TABLE_FILTERS.map((filter) => (
          <DropdownMenu.Item key={filter.id} id={filter.id} closeOnSelect={false}>
            {filter.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  )
}

ServiceTableFilters.displayName = 'ServiceTableFilters'

function PostureServiceList({ services, fixLabel }: { services: HomeServiceRow[]; fixLabel: string }) {
  const columns: DataListColumn<HomeServiceRow>[] = [
    {
      headerName: 'Service',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (row) => (
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <ServiceIcon serviceTypeId={row.serviceTypeId} size={32} />
          <Box>
            <Typography.Default>
              <Link href="#" onClick={noopClick}>
                {row.serviceName}
              </Link>
            </Typography.Default>
            <Typography.Small color="muted">{row.environment}</Typography.Small>
          </Box>
        </Box>
      ),
    },
    {
      headerName: 'Node status',
      type: 'custom',
      width: 120,
      UNSAFE_render: (row) => {
        const node = nodeStatusToChip(row.nodeStatus)
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

  return <DataList columns={columns} rows={services} sticky={false} />
}

PostureServiceList.displayName = 'PostureServiceList'

function ServiceAlertsCell({ row }: { row: HomeServiceRow }) {
  if (row.alerts.length === 0) {
    return (
      <Typography.Small color="muted">
        No active alerts
      </Typography.Small>
    )
  }

  const icon = row.severity === 'danger' ? errorSign : warningSign
  const iconColor = row.severity === 'danger' ? 'danger-default' : 'warning-default'

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <InlineIcon icon={icon} color={iconColor} style={{ width: 16, height: 16 }} />
      <span>{row.alerts[0]}</span>
      {row.alerts.length > 1 && (
        <Tooltip
          content={
            <Box>
              Multiple alerts:
              <ul>
                {row.alerts.map((alert) => (
                  <li key={alert} style={{ marginLeft: 20, listStyleType: 'disc' }}>
                    {alert}
                  </li>
                ))}
              </ul>
            </Box>
          }
        >
          <Box component="span" style={{ cursor: 'pointer' }}>
            <Typography.Small htmlTag="span" color="muted">
              +{row.alerts.length - 1} more
            </Typography.Small>
          </Box>
        </Tooltip>
      )}
    </Box>
  )
}

ServiceAlertsCell.displayName = 'ServiceAlertsCell'

function ProductUpdates() {
  const [index, setIndex] = useState(0)
  const total = RELEASE_NOTES.length
  const note = RELEASE_NOTES[index]
  if (!note) return null

  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Typography.LargeStrong>Product updates</Typography.LargeStrong>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Typography.Default>
            <Link href={CHANGELOG_URL} target="_blank">
              See all
            </Link>
          </Typography.Default>
          <Link.Button.Secondary dense href={CHANGELOG_RSS_URL} target="_blank">
            RSS Feed
          </Link.Button.Secondary>
        </Box>
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Card
        fullWidth
        title={
          <Card.Title>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography.Small color="muted">
                {note.date} // {note.tag}
              </Typography.Small>
              {note.title}
            </Box>
          </Card.Title>
        }
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Box
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'var(--aquarium-text-color-muted)',
            }}
          >
            <Typography.Small>{note.description}</Typography.Small>
          </Box>
          <Typography.Default>
            <Link href={note.href} target="_blank" aria-label={`Read more about ${note.title}`}>
              Read more
            </Link>
          </Typography.Default>
        </Box>
      </Card>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
        <Button.Icon
          type="button"
          dense
          aria-label="Previous update"
          icon={chevronLeft}
          disabled={isFirst}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        />
        <Typography.Small>
          {index + 1}/{total}
        </Typography.Small>
        <Button.Icon
          type="button"
          dense
          aria-label="Next update"
          icon={chevronRight}
          disabled={isLast}
          onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}
        />
      </Box>
      </Box>
    </Box>
  )
}

ProductUpdates.displayName = 'ProductUpdates'
