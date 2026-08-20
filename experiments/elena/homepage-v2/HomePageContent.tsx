'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Banner,
  Button,
  Card,
  Chip,
  DataList,
  Divider,
  DropdownMenu,
  EmptyState,
  Filter,
  Icon,
  InlineIcon,
  Link,
  StatusChip,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import chevronLeft from '@aivenio/aquarium/icons/chevronLeft'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import filterIcon from '@aivenio/aquarium/icons/filter'
import helpIcon from '@aivenio/aquarium/icons/help'
import lockIcon from '@aivenio/aquarium/icons/lock'
import notificationsIcon from '@aivenio/aquarium/icons/notifications'
import shieldIcon from '@aivenio/aquarium/icons/shield'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { getServiceIconUrl, ServiceIcon } from '@experiments/_shared/components/ServiceIcon'
import { imageSrc } from '@experiments/_shared/lib/image'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  ORG_NAME,
  PROJECT_HOME_ID,
  PROJECTS,
  RELEASE_NOTES,
  SERVICES_BY_PROJECT,
  getAttentionServices,
  getImprovementRecommendations,
  getProtectionMetrics,
  getProjectPreviewServices,
  getScopedServices,
  getServicesRequiringReview,
  type HomeAttentionItem,
  type HomeImprovementRecommendation,
  type HomeProject,
  type HomeProtectionMetric,
  type HomeReviewRow,
  type HomeServiceRow,
} from './mockData'
import projectIcon from './assets/home-page-project.svg'
import mcpBanner from './assets/home-page-mcp-banner.svg'
import styles from './HomePageContent.module.css'

const CHANGELOG_URL = 'https://aiven.io/changelog'
const CHANGELOG_RSS_URL = 'https://aiven.io/changelog/feed.xml'
const MCP_ENABLE_URL = 'https://aiven.io/docs/tools/mcp'
const PROJECT_HEALTH_SCOPE = 'production' as const

const PROTECTION_ICONS: Record<HomeProtectionMetric['id'], IconifyIcon> = {
  failover: shieldIcon,
  backups: cloudIcon,
  alerting: notificationsIcon,
  network: lockIcon,
}

const IMPROVE_WHY_COPY =
  'Recommendations are based on configuration gaps in the selected project scope. They highlight preventable risks before they become incidents.'

const SERVICE_ICON_STACK_SIZE = 32
const SERVICE_ICON_STACK_OVERLAP = 10

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function HomePageContent() {
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
  const protectionMetrics = useMemo(
    () => getProtectionMetrics(projectServices, PROJECT_HEALTH_SCOPE),
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
            scopedServices={scopedServices}
            attentionItems={attentionItems}
            improvements={improvements}
            protectionMetrics={protectionMetrics}
            reviewRows={reviewRows}
            onProjectChange={setCurrentProjectId}
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
          <AivenMcpPromo />
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
      <Typography.LargeStrong>Recent projects</Typography.LargeStrong>
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
  protectionMetrics,
  reviewRows,
  onProjectChange,
}: {
  project: HomeProject
  projects: HomeProject[]
  scopedServices: ReturnType<typeof getScopedServices>
  attentionItems: HomeAttentionItem[]
  improvements: HomeImprovementRecommendation[]
  protectionMetrics: HomeProtectionMetric[]
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
          <ProtectionCoverageSection metrics={protectionMetrics} />
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

function ProtectionCoverageSection({ metrics }: { metrics: HomeProtectionMetric[] }) {
  return (
    <Card
      fullWidth
      title={
        <Card.Title style={{ alignItems: 'center', gap: 8 }}>
          Protection coverage
          <Tooltip content="Summarizes preventive controls configured across services in the selected scope.">
            <Box component="span" aria-label="About protection coverage" style={{ display: 'inline-flex' }}>
              <InlineIcon icon={helpIcon} color="muted" />
            </Box>
          </Tooltip>
        </Card.Title>
      }
    >
      <Box className={styles.coverageGrid}>
        {metrics.map((metric) => {
          const icon = PROTECTION_ICONS[metric.id]
          const statusColor =
            metric.tone === 'success'
              ? 'var(--aquarium-text-color-success-intense)'
              : 'var(--aquarium-text-color-warning-intense)'
          return (
            <Box key={metric.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Box
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'var(--aquarium-background-color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon={icon} style={{ width: 20, height: 20, color: 'var(--aquarium-text-color-muted)' }} />
              </Box>
              <Typography.SmallStrong>{metric.label}</Typography.SmallStrong>
              <Box style={{ color: statusColor }}>
                <Typography.Small>{metric.statusText}</Typography.Small>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Card>
  )
}

ProtectionCoverageSection.displayName = 'ProtectionCoverageSection'

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

function AivenMcpPromo() {
  return (
    <Banner
      variant="outlined"
      title="Aiven MCP"
      image={imageSrc(mcpBanner)}
      action={{
        href: MCP_ENABLE_URL,
        target: '_blank',
        text: 'Enable',
        icon: arrowRight,
        iconPlacement: 'right',
      }}
    >
      Explore, monitor, and manage Kafka, PostgreSQL, and more using natural language in Cursor or Claude Code.
    </Banner>
  )
}

AivenMcpPromo.displayName = 'AivenMcpPromo'

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
