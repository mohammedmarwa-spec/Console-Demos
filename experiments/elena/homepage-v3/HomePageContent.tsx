'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Banner,
  Button,
  Card,
  Chip,
  DataList,
  Divider,
  EmptyState,
  Link,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import chevronLeft from '@aivenio/aquarium/icons/chevronLeft'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import crossIcon from '@aivenio/aquarium/icons/cross'
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
  getAttentionServices,
  getScopedServices,
  getServicesRequiringReview,
  type HomeAttentionItem,
  type HomeProject,
  type HomeReviewRow,
} from './mockData'
import mcpBanner from './assets/home-page-mcp-banner.svg'
import styles from './HomePageContent.module.css'

const CHANGELOG_URL = 'https://aiven.io/changelog'
const CHANGELOG_RSS_URL = 'https://aiven.io/changelog/feed.xml'
const MCP_ENABLE_URL = 'https://aiven.io/docs/tools/mcp'
const PROJECT_HEALTH_SCOPE = 'production' as const

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
          <Box className={`${styles.column} ${styles.updatesColumn}`}>
            <AivenMcpPromo />
            <ProductUpdates />
          </Box>
        )}
      </Box>
    </Box>
  )
}

HomePageContent.displayName = 'HomePageContent'

function ProjectsList({
  activeProjectId,
  onOpenInsights,
}: {
  activeProjectId: string | null
  onOpenInsights: (projectId: string) => void
}) {
  const router = useRouter()

  const columns: DataListColumn<HomeProject>[] = [
    {
      headerName: 'Project',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (project) => (
        <Box className={styles.projectHeading}>
          <Typography.DefaultStrong className={styles.projectName}>
            {project.id === PROJECT_HOME_ID ? (
              <Link
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  router.push(ROUTES.projectPage)
                }}
              >
                {project.name}
              </Link>
            ) : (
              project.name
            )}
          </Typography.DefaultStrong>
          <Chip text={project.tag} dense />
        </Box>
      ),
    },
    {
      field: 'serviceCount',
      headerName: 'Services',
      type: 'number',
      width: 120,
    },
    {
      headerName: 'Actions',
      type: 'custom',
      width: 160,
      UNSAFE_render: (project) => (
        <Typography.Default>
          <Link
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onOpenInsights(project.id)
            }}
          >
            Project insights
          </Link>
        </Typography.Default>
      ),
    },
  ]

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
      <DataList
        columns={columns}
        rows={PROJECTS}
        sticky={false}
        rowClassName={(project) => (project.id === activeProjectId ? styles.selectedRow : undefined)}
      />
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
