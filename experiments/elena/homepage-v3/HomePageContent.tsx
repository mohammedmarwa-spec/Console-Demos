'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Chip,
  DataList,
  Divider,
  EmptyState,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import crossIcon from '@aivenio/aquarium/icons/cross'
import gridIcon from '@aivenio/aquarium/icons/grid'
import listIcon from '@aivenio/aquarium/icons/list'
import plusIcon from '@aivenio/aquarium/icons/plus'
import tagIcon from '@aivenio/aquarium/icons/tag'
import { getServiceIconUrl, ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import { imageSrc } from '@experiments/_shared/lib/image'
import { HomeRightColumn } from '@experiments/_shared/home/HomeRightColumn'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  FLEET_METRICS,
  LAST_INVOICE,
  ORG_NAME,
  ORG_USERS,
  PROJECT_HOME_ID,
  PROJECTS,
  SERVICES_BY_PROJECT,
  USER_NAME,
  getAttentionServices,
  getProjectHealth,
  getProjectPreviewServices,
  getScopedServices,
  getServicesRequiringReview,
  type HomeAttentionItem,
  type HomeProject,
  type HomeReviewRow,
  type HomeServiceRow,
  type IconTone,
} from './mockData'
import projectIcon from './assets/home-page-project.svg'
import styles from './HomePageContent.module.css'

const PROJECT_HEALTH_SCOPE = 'production' as const
const SERVICE_ICON_STACK_SIZE = 32
const SERVICE_ICON_STACK_OVERLAP = 10

type ProjectListView = 'list' | 'cards'

const ICON_TONE: Record<IconTone, { iconColor: string; iconBg: string }> = {
  primary: {
    iconColor: 'var(--aquarium-text-color-primary-graphic)',
    iconBg: 'var(--aquarium-background-color-primary-muted)',
  },
  info: {
    iconColor: 'var(--aquarium-text-color-info-intense)',
    iconBg: 'var(--aquarium-background-color-info-muted)',
  },
  warning: {
    iconColor: 'var(--aquarium-text-color-warning-intense)',
    iconBg: 'var(--aquarium-background-color-warning-muted)',
  },
  danger: {
    iconColor: 'var(--aquarium-text-color-danger-intense)',
    iconBg: 'var(--aquarium-background-color-danger-muted)',
  },
}

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function HomePageContent() {
  const [insightsProjectId, setInsightsProjectId] = useState<string | null>(null)
  const insightsProject = PROJECTS.find((project) => project.id === insightsProjectId) ?? null
  const projectServices = insightsProject ? (SERVICES_BY_PROJECT[insightsProject.id] ?? []) : []

  const scopedServices = useMemo(
    () => getScopedServices(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const attentionItems = useMemo(
    () => getAttentionServices(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const reviewRows = useMemo(
    () => getServicesRequiringReview(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const panelOpen = insightsProject !== null

  useEffect(() => {
    if (!panelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInsightsProjectId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panelOpen])

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

      <Box className={styles.overviewGrid} data-panel-open={panelOpen ? 'true' : 'false'}>
        <Box className={styles.column}>
          <PageHeader
            title={`Welcome to Aiven Platform, ${USER_NAME}`}
            subtitle="Here's what's happening across your organization."
          />
          <MetricRow />
          <ProjectsList activeProjectId={insightsProjectId} onOpenInsights={setInsightsProjectId} />
        </Box>

        <Divider direction="vertical" />

        {insightsProject ? (
          <ProjectInsightsPanel
            project={insightsProject}
            scopedServices={scopedServices}
            attentionItems={attentionItems}
            reviewRows={reviewRows}
            onClose={() => setInsightsProjectId(null)}
          />
        ) : (
          <Box className={styles.rightRail}>
            <HomeRightColumn />
          </Box>
        )}
      </Box>
    </Box>
  )
}

HomePageContent.displayName = 'HomePageContent'

function IconTile({ icon, tone, size = 40 }: { icon: IconifyIcon; tone: IconTone; size?: number }) {
  const { iconColor, iconBg } = ICON_TONE[tone]
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon icon={icon} style={{ width: 20, height: 20, color: iconColor }} />
    </Box>
  )
}

IconTile.displayName = 'IconTile'

function SummaryCard({
  label,
  icon,
  tone,
  children,
}: {
  label: string
  icon: IconifyIcon
  tone: IconTone
  children: ReactNode
}) {
  return (
    <Box className={styles.metricCard}>
      <Card
        fullWidth
        title={
          <Card.Title>
            <Box className={styles.metricTitle}>
              <Typography.Small color="muted">{label}</Typography.Small>
              <IconTile icon={icon} tone={tone} />
            </Box>
          </Card.Title>
        }
      >
        {children}
      </Card>
    </Box>
  )
}

SummaryCard.displayName = 'SummaryCard'

function LastInvoiceCard() {
  return (
    <SummaryCard label="Last invoice" icon={bankAccountIcon} tone="info">
      <Box className={styles.summaryBody}>
        <Box>
          <Typography.LargeHeading>{LAST_INVOICE.amount}</Typography.LargeHeading>
          <Typography.Small color="muted">
            {LAST_INVOICE.currency} · {LAST_INVOICE.period}
          </Typography.Small>
        </Box>
        <Box className={styles.summaryFooter}>
          <StatusChip dense text={LAST_INVOICE.statusText} status={LAST_INVOICE.status} />
          <Typography.Default>
            <Link href="#" onClick={noopClick}>
              View invoice
            </Link>
          </Typography.Default>
        </Box>
      </Box>
    </SummaryCard>
  )
}

LastInvoiceCard.displayName = 'LastInvoiceCard'

function UsersCard() {
  return (
    <SummaryCard label="Users" icon={appUsersIcon} tone="primary">
      <Box className={styles.summaryBody}>
        <Typography.LargeHeading>{ORG_USERS.count}</Typography.LargeHeading>
        <Box className={styles.summaryFooter} style={{ justifyContent: 'flex-end' }}>
          <Button.Ghost type="button" dense icon={plusIcon} onClick={() => undefined}>
            Add user
          </Button.Ghost>
        </Box>
      </Box>
    </SummaryCard>
  )
}

UsersCard.displayName = 'UsersCard'

function MetricRow() {
  return (
    <Box className={styles.metricGrid}>
      {FLEET_METRICS.map((metric) => (
        <SummaryCard key={metric.id} label={metric.label} icon={metric.icon} tone={metric.tone}>
          <Typography.LargeHeading>{metric.value}</Typography.LargeHeading>
        </SummaryCard>
      ))}
      <LastInvoiceCard />
      <UsersCard />
    </Box>
  )
}

MetricRow.displayName = 'MetricRow'

function ProjectHeading({ project }: { project: HomeProject }) {
  const router = useRouter()

  return (
    <Typography.DefaultStrong className={styles.projectName}>
      <Link
        href="#"
        onClick={(event) => {
          event.preventDefault()
          if (project.id === PROJECT_HOME_ID) {
            router.push(ROUTES.projectPage)
          }
        }}
      >
        {project.name}
      </Link>
    </Typography.DefaultStrong>
  )
}

ProjectHeading.displayName = 'ProjectHeading'

function ProjectLabelChip({ project }: { project: HomeProject }) {
  return <Chip text={project.tag} icon={tagIcon} dense />
}

ProjectLabelChip.displayName = 'ProjectLabelChip'

function ViewAlertsLink({
  projectId,
  onOpenInsights,
}: {
  projectId: string
  onOpenInsights: (projectId: string) => void
}) {
  return (
    <Typography.Default>
      <Link
        href="#"
        onClick={(event) => {
          event.preventDefault()
          onOpenInsights(projectId)
        }}
      >
        View alerts
      </Link>
    </Typography.Default>
  )
}

ViewAlertsLink.displayName = 'ViewAlertsLink'

function ProjectHealthCell({ project }: { project: HomeProject }) {
  const health = getProjectHealth(project.id)

  return <StatusChip dense text={health.statusText} status={health.status} />
}

ProjectHealthCell.displayName = 'ProjectHealthCell'

function ProjectViewSwitcher({
  view,
  onViewChange,
}: {
  view: ProjectListView
  onViewChange: (view: ProjectListView) => void
}) {
  return (
    <Box className={styles.viewSwitcher} role="group" aria-label="Project view">
      <Button.Icon
        type="button"
        dense
        icon={listIcon}
        tooltip="List view"
        aria-pressed={view === 'list'}
        UNSAFE_className={view === 'list' ? styles.viewSwitcherActive : undefined}
        onClick={() => onViewChange('list')}
      />
      <Button.Icon
        type="button"
        dense
        icon={gridIcon}
        tooltip="Cards view"
        aria-pressed={view === 'cards'}
        UNSAFE_className={view === 'cards' ? styles.viewSwitcherActive : undefined}
        onClick={() => onViewChange('cards')}
      />
    </Box>
  )
}

ProjectViewSwitcher.displayName = 'ProjectViewSwitcher'

function ServiceIconStack({ services }: { services: HomeServiceRow[] }) {
  const theme = useResolvedTheme()
  const logoSize = Math.round(SERVICE_ICON_STACK_SIZE * 0.56)

  if (services.length === 0) {
    return (
      <Box className={styles.serviceIconStackItem} aria-hidden>
        <img
          src={imageSrc(projectIcon)}
          width={18}
          height={18}
          alt=""
          style={{ display: 'block', objectFit: 'contain' }}
        />
      </Box>
    )
  }

  return (
    <Box
      className={styles.serviceIconStack}
      aria-label={`${services.length} ${services.length === 1 ? 'service type' : 'service types'}`}
    >
      {services.map((service, index) => (
        <Box
          key={service.id}
          title={service.serviceName}
          className={styles.serviceIconStackItem}
          style={{
            marginLeft: index === 0 ? 0 : -SERVICE_ICON_STACK_OVERLAP,
            zIndex: services.length - index,
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

function ProjectsList({
  activeProjectId,
  onOpenInsights,
}: {
  activeProjectId: string | null
  onOpenInsights: (projectId: string) => void
}) {
  const [view, setView] = useState<ProjectListView>('list')

  const columns: DataListColumn<HomeProject>[] = [
    {
      headerName: 'Project',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (project) => <ProjectHeading project={project} />,
    },
    {
      headerName: 'Labels',
      type: 'custom',
      width: 140,
      UNSAFE_render: (project) => <ProjectLabelChip project={project} />,
    },
    {
      headerName: 'Services',
      type: 'custom',
      width: 220,
      UNSAFE_render: (project) => (
        <Box className={styles.servicesCell}>
          <ServiceIconStack services={getProjectPreviewServices(project.id)} />
          <Typography.Default>{project.serviceCount}</Typography.Default>
        </Box>
      ),
    },
    {
      headerName: 'Health',
      type: 'custom',
      width: 140,
      UNSAFE_render: (project) => <ProjectHealthCell project={project} />,
    },
    {
      headerName: 'Actions',
      type: 'custom',
      width: 140,
      UNSAFE_render: (project) => (
        <ViewAlertsLink projectId={project.id} onOpenInsights={onOpenInsights} />
      ),
    },
  ]

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Typography.LargeStrong>Recent projects</Typography.LargeStrong>
        <Box className={styles.projectsToolbar}>
          <Typography.Default>
            <Link href="#" icon={arrowRight} iconPlacement="right" onClick={noopClick}>
              View all projects ({PROJECTS.length})
            </Link>
          </Typography.Default>
          <ProjectViewSwitcher view={view} onViewChange={setView} />
        </Box>
      </Box>
      {view === 'list' ? (
        <DataList
          columns={columns}
          rows={PROJECTS}
          sticky={false}
          rowClassName={(project) => (project.id === activeProjectId ? styles.selectedRow : undefined)}
        />
      ) : (
        <Box className={styles.recentProjectsGrid}>
          {PROJECTS.map((project) => (
            <Box
              key={project.id}
              className={`${styles.projectCard}${project.id === activeProjectId ? ` ${styles.selectedCard}` : ''}`}
            >
              <Card.Compact
                fullWidth
                title={
                  <Card.Title>
                    <Box className={styles.projectPreviewTitle}>
                      <ServiceIconStack services={getProjectPreviewServices(project.id)} />
                      <ProjectHeading project={project} />
                      <ProjectLabelChip project={project} />
                    </Box>
                  </Card.Title>
                }
              >
                <Box className={styles.projectPreviewMeta}>
                  <Typography.Small color="muted">
                    {project.serviceCount} {project.serviceCount === 1 ? 'service' : 'services'}
                  </Typography.Small>
                  <ProjectHealthCell project={project} />
                  <ViewAlertsLink projectId={project.id} onOpenInsights={onOpenInsights} />
                </Box>
              </Card.Compact>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

ProjectsList.displayName = 'ProjectsList'

function ProjectInsightsPanel({
  project,
  scopedServices,
  attentionItems,
  reviewRows,
  onClose,
}: {
  project: HomeProject
  scopedServices: ReturnType<typeof getScopedServices>
  attentionItems: HomeAttentionItem[]
  reviewRows: HomeReviewRow[]
  onClose: () => void
}) {
  return (
    <Box className={styles.insightsPanel} component="aside" aria-label={`Project insights for ${project.name}`}>
      <Box className={styles.insightsHeader}>
        <Typography.LargeStrong>{project.name}</Typography.LargeStrong>
        <Button.Icon type="button" dense aria-label="Close project insights" icon={crossIcon} onClick={onClose} />
      </Box>
      <Box className={styles.insightsBody}>
        <ProjectHealth
          scopedServices={scopedServices}
          attentionItems={attentionItems}
          reviewRows={reviewRows}
        />
      </Box>
    </Box>
  )
}

ProjectInsightsPanel.displayName = 'ProjectInsightsPanel'

function ProjectHealth({
  scopedServices,
  attentionItems,
  reviewRows,
}: {
  scopedServices: ReturnType<typeof getScopedServices>
  attentionItems: HomeAttentionItem[]
  reviewRows: HomeReviewRow[]
}) {
  const attentionCaption =
    attentionItems.length === 0
      ? 'No services need attention'
      : `${attentionItems.length} ${attentionItems.length === 1 ? 'service needs' : 'services need'} attention`

  return (
    <Section title="Project health" subtitle={scopedServices.length === 0 ? undefined : attentionCaption}>
      {scopedServices.length === 0 ? (
        <EmptyState title="No services in this project">
          No production services are configured for the selected project.
        </EmptyState>
      ) : (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <AttentionRequiredCard items={attentionItems} />
          <ServicesRequiringReviewList rows={reviewRows} />
        </Box>
      )}
    </Section>
  )
}

ProjectHealth.displayName = 'ProjectHealth'

function AttentionRequiredCard({ items }: { items: HomeAttentionItem[] }) {
  if (items.length === 0) {
    return <Typography.Small color="muted">All services are healthy in this scope.</Typography.Small>
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((item) => (
        <Box
          key={item.service.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <ServiceIcon serviceTypeId={item.service.serviceTypeId} size={28} />
            <Box style={{ minWidth: 0 }}>
              <Typography.DefaultStrong>{item.service.serviceName}</Typography.DefaultStrong>
              <Typography.Small color="muted">{item.finding}</Typography.Small>
            </Box>
          </Box>
          <StatusChip dense text={item.statusText} status={item.status} />
          <Typography.Default>
            <Link href="#" onClick={noopClick}>
              {item.actionLabel}
            </Link>
          </Typography.Default>
        </Box>
      ))}
    </Box>
  )
}

AttentionRequiredCard.displayName = 'AttentionRequiredCard'

function ServicesRequiringReviewList({ rows }: { rows: HomeReviewRow[] }) {
  const columns: DataListColumn<HomeReviewRow>[] = [
    {
      headerName: 'Service',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (row) => (
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <ServiceIcon serviceTypeId={row.service.serviceTypeId} size={32} />
          <Typography.Default>
            <Link href="#" onClick={noopClick}>
              {row.service.serviceName}
            </Link>
          </Typography.Default>
        </Box>
      ),
    },
    {
      headerName: 'Status',
      type: 'custom',
      width: 120,
      UNSAFE_render: (row) => <StatusChip dense text={row.statusText} status={row.status} />,
    },
    {
      field: 'finding',
      headerName: 'Finding',
      type: 'text',
    },
    {
      headerName: 'Recommended action',
      type: 'custom',
      UNSAFE_render: (row) =>
        row.actionLabel ? (
          <Typography.Default>
            <Link href="#" onClick={noopClick}>
              {row.actionLabel}
            </Link>
          </Typography.Default>
        ) : (
          <Typography.Small color="muted">—</Typography.Small>
        ),
    },
  ]

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Typography.LargeStrong>Services requiring review</Typography.LargeStrong>
      {rows.length === 0 ? (
        <EmptyState title="No services to review">All services look good in this scope.</EmptyState>
      ) : (
        <DataList columns={columns} rows={rows} sticky={false} />
      )}
    </Box>
  )
}

ServicesRequiringReviewList.displayName = 'ServicesRequiringReviewList'

