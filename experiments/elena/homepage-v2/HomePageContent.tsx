'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Chip,
  DataList,
  Divider,
  DropdownMenu,
  EmptyState,
  Filter,
  InlineIcon,
  Link,
  PageHeader,
  StatusChip,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import filterIcon from '@aivenio/aquarium/icons/filter'
import helpIcon from '@aivenio/aquarium/icons/help'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { getServiceIconUrl, ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import { imageSrc } from '@experiments/_shared/lib/image'
import { HomeRightColumn } from '@experiments/_shared/home/HomeRightColumn'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  ORG_NAME,
  PROJECT_HOME_ID,
  PROJECTS,
  USER_NAME,
  SERVICES_BY_PROJECT,
  getAttentionServices,
  getImprovementRecommendations,
  getProjectPreviewServices,
  getScopedServices,
  getServicesRequiringReview,
  type HomeAttentionItem,
  type HomeImprovementRecommendation,
  type HomeProject,
  type HomeReviewRow,
  type HomeServiceRow,
} from './mockData'
import projectIcon from './assets/home-page-project.svg'
import styles from './HomePageContent.module.css'

const PROJECT_HEALTH_SCOPE = 'production' as const

const IMPROVE_WHY_COPY =
  'Recommendations are based on configuration gaps in the selected project scope. They highlight preventable risks before they become incidents.'

const SERVICE_ICON_STACK_SIZE = 32
const SERVICE_ICON_STACK_OVERLAP = 10

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function HomePageContent() {
  const router = useRouter()
  const [currentProjectId, setCurrentProjectId] = useState(PROJECT_HOME_ID)
  const currentProject = PROJECTS.find((project) => project.id === currentProjectId) ?? PROJECTS[0]!
  const projectServices = SERVICES_BY_PROJECT[currentProject.id] ?? []

  const scopedServices = useMemo(
    () => getScopedServices(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const attentionItems = useMemo(
    () => getAttentionServices(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const improvements = useMemo(
    () => getImprovementRecommendations(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )
  const reviewRows = useMemo(
    () => getServicesRequiringReview(projectServices, PROJECT_HEALTH_SCOPE),
    [projectServices],
  )

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
            scopedServices={scopedServices}
            attentionItems={attentionItems}
            improvements={improvements}
            reviewRows={reviewRows}
            onProjectChange={setCurrentProjectId}
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
                    <Box className={styles.projectPreviewHeading}>
                      <Typography.DefaultStrong className={styles.projectPreviewName}>
                        {project.name}
                      </Typography.DefaultStrong>
                      <Chip text={project.tag} dense />
                    </Box>
                  </Box>
                </Card.Title>
              }
              onClick={() => {
                if (project.id === PROJECT_HOME_ID) {
                  router.push(ROUTES.projectPage)
                }
              }}
            >
              {project.serviceCount} services
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
  scopedServices,
  attentionItems,
  improvements,
  reviewRows,
  onProjectChange,
}: {
  project: HomeProject
  projects: HomeProject[]
  scopedServices: ReturnType<typeof getScopedServices>
  attentionItems: HomeAttentionItem[]
  improvements: HomeImprovementRecommendation[]
  reviewRows: HomeReviewRow[]
  onProjectChange: (id: string) => void
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Typography.LargeStrong>Project health</Typography.LargeStrong>

      <Box style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <DropdownMenu
          placement="bottom-left"
          searchable
          emptyState="No results found"
          onAction={(action) => onProjectChange(String(action))}
          selectionMode="single"
          selection={new Set([project.id])}
        >
          <DropdownMenu.Trigger>
            <Filter.Trigger labelText="Project" icon={filterIcon} value={project.name} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            {projects.map((item) => (
              <DropdownMenu.Item key={item.id} id={item.id}>
                {item.name}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      </Box>

      {scopedServices.length === 0 ? (
        <EmptyState title="No services in this project">
          No production services are configured for the selected project.
        </EmptyState>
      ) : (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Box className={styles.insightGrid}>
            <AttentionRequiredCard items={attentionItems} />
            <ImproveProjectCard recommendations={improvements} />
          </Box>
          <ServicesRequiringReviewList rows={reviewRows} />
        </Box>
      )}
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

function AttentionRequiredCard({ items }: { items: HomeAttentionItem[] }) {
  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-danger-muted)',
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: 'var(--aquarium-background-color-danger-muted)',
        padding: 16,
        minWidth: 0,
      }}
    >
      <Card
        fullWidth
        title={
          <Card.Title style={{ alignItems: 'flex-start', gap: 12 }}>
            <Box
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--aquarium-border-radius-default)',
                backgroundColor: 'var(--aquarium-background-color-layer)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <InlineIcon icon={warningSign} color="danger-default" />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Typography.DefaultStrong>Attention required</Typography.DefaultStrong>
              <Typography.Small color="muted">
                {items.length === 0
                  ? 'No services need attention'
                  : `${items.length} ${items.length === 1 ? 'service needs' : 'services need'} attention`}
              </Typography.Small>
            </Box>
          </Card.Title>
        }
      >
        {items.length === 0 ? (
          <Typography.Small color="muted">All services are healthy in this scope.</Typography.Small>
        ) : (
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
            <Typography.Default>
              <Link href="#" icon={arrowRight} iconPlacement="right" onClick={noopClick}>
                View all issues
              </Link>
            </Typography.Default>
          </Box>
        )}
      </Card>
    </Box>
  )
}

AttentionRequiredCard.displayName = 'AttentionRequiredCard'

function ImproveProjectCard({ recommendations }: { recommendations: HomeImprovementRecommendation[] }) {
  const preview = recommendations.slice(0, 2)

  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-primary-muted)',
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: 'var(--aquarium-background-color-primary-muted)',
        padding: 16,
        minWidth: 0,
      }}
    >
      <Card
        fullWidth
        title={
          <Card.Title style={{ alignItems: 'flex-start', gap: 12 }}>
            <Box
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--aquarium-border-radius-default)',
                backgroundColor: 'var(--aquarium-background-color-layer)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <InlineIcon icon={helpIcon} color="primary-default" />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Typography.DefaultStrong>Improve your project</Typography.DefaultStrong>
              <Typography.Small color="muted">
                {recommendations.length === 0
                  ? 'No recommended improvements'
                  : `${recommendations.length} recommended ${recommendations.length === 1 ? 'improvement' : 'improvements'}`}
              </Typography.Small>
            </Box>
          </Card.Title>
        }
      >
        {preview.length === 0 ? (
          <Typography.Small color="muted">Configuration looks good for this scope.</Typography.Small>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {preview.map((item) => (
              <Box key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography.Small>{item.summary}</Typography.Small>
                <Typography.Small color="muted">Affected service: {item.affectedServiceName}</Typography.Small>
                <Typography.Default>
                  <Link href="#" icon={arrowRight} iconPlacement="right" onClick={noopClick}>
                    {item.actionLabel}
                  </Link>
                </Typography.Default>
              </Box>
            ))}
            <Tooltip content={IMPROVE_WHY_COPY}>
              <Typography.Default>
                <Link href="#" onClick={noopClick}>
                  Why am I seeing this?
                </Link>
              </Typography.Default>
            </Tooltip>
          </Box>
        )}
      </Card>
    </Box>
  )
}

ImproveProjectCard.displayName = 'ImproveProjectCard'

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

