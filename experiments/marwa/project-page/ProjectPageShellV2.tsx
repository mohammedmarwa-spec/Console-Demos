'use client'

import { useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  DropdownMenu,
  PageHeader,
  SegmentedControl,
  SegmentedControlGroup,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { EventLogsContent } from '@experiments/elena/organization-event-logs/EventLogsContent'
import {
  AivenStudioContent,
  AppsContent,
  DataHubContent,
  OverviewContent,
  ProjectHomeContent,
  ProjectHomeSidebar,
  ProjectPageDataProvider,
  getProjectNavLabel,
  type ProjectPageMockData,
  type ProjectTab,
} from '@experiments/_shared/project-page'
import {
  CREATE_MENU_AGENT,
  CREATE_MENU_SOLUTION,
} from '@experiments/_shared/project-page/createMenu'
import { OverviewV2 } from './OverviewV2'
import { SIBLING_PROJECTS, type ProjectContext } from './solutionBlueprints'
import {
  overviewDataset,
  overviewDatasetEmpty,
  overviewDatasetSmall,
  type AsyncStatus,
  type PageScale,
} from './overviewV2Data'

const SIDEBAR_VIEW: Partial<Record<string, ProjectTab>> = {
  overview: 'overview',
  resources: 'resources',
  architecture: 'architecture',
}

type OverviewMode = 'v2' | 'legacy'

const VOLUME_DATASETS = {
  empty: overviewDatasetEmpty,
  small: overviewDatasetSmall,
  large: overviewDataset,
} as const

/** Overview page header — mirrors the shared ProjectHomeContent header + demo controls. */
function OverviewHeader({
  project,
  projects,
  onProjectChange,
  projectSubtitle,
  mode,
  onModeChange,
  volume,
  onVolumeChange,
  asyncStatus,
  onAsyncStatusChange,
}: {
  project: ProjectContext
  projects: ProjectContext[]
  onProjectChange: (projectId: string) => void
  projectSubtitle: string
  mode: OverviewMode
  onModeChange: (mode: OverviewMode) => void
  volume: PageScale
  onVolumeChange: (volume: PageScale) => void
  asyncStatus: AsyncStatus
  onAsyncStatusChange: (status: AsyncStatus) => void
}) {
  return (
    <Box
      style={{
        marginBottom: 16,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <Box style={{ flex: 1, minWidth: 0 }}>
        <PageHeader
          title={project.name}
          subtitle={
            <Box.Flex alignItems="center" gap="3" flexWrap="wrap">
              <Chip dense text={project.environmentLabel} />
              <Typography.Default color="muted">{projectSubtitle}</Typography.Default>
            </Box.Flex>
          }
        />
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, paddingTop: 4, flexWrap: 'wrap' }}>
        {/* Demo controls (prototype only) */}
        <Switch checked={mode === 'v2'} onChange={() => onModeChange(mode === 'v2' ? 'legacy' : 'v2')}>
          New Overview
        </Switch>
        {mode === 'v2' ? (
          <>
            <SegmentedControlGroup
              value={volume}
              onChange={(value) => onVolumeChange(value as PageScale)}
              ariaLabel="Preview service volume"
            >
              <SegmentedControl value="empty">Empty</SegmentedControl>
              <SegmentedControl value="small">Small</SegmentedControl>
              <SegmentedControl value="large">Large</SegmentedControl>
            </SegmentedControlGroup>
            {/* Explore-solutions flows read plan tier and naming from the project env. */}
            {volume === 'empty' ? (
              <SegmentedControlGroup
                value={project.id}
                onChange={(value) => onProjectChange(String(value))}
                ariaLabel="Preview project environment"
              >
                {projects
                  .filter((option) => option.environment !== 'staging')
                  .map((option) => (
                    <SegmentedControl key={option.id} value={option.id}>
                      {option.name}
                    </SegmentedControl>
                  ))}
              </SegmentedControlGroup>
            ) : null}
            <SegmentedControlGroup
              value={asyncStatus}
              onChange={(value) => onAsyncStatusChange(value as AsyncStatus)}
              ariaLabel="Preview loading state"
            >
              <SegmentedControl value="loaded">Loaded</SegmentedControl>
              <SegmentedControl value="loading">Loading</SegmentedControl>
              <SegmentedControl value="error">Error</SegmentedControl>
            </SegmentedControlGroup>
          </>
        ) : null}

        <DropdownMenu placement="bottom-right">
          <DropdownMenu.Trigger>
            <Button.Dropdown type="button" kind="primary">
              Create
            </Button.Dropdown>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenu.Section title="Data service">
              <DropdownMenu.Item id="postgresql">PostgreSQL</DropdownMenu.Item>
              <DropdownMenu.Item id="kafka">Kafka</DropdownMenu.Item>
              <DropdownMenu.Item id="clickhouse">ClickHouse</DropdownMenu.Item>
              <DropdownMenu.Item id="opensearch">OpenSearch</DropdownMenu.Item>
            </DropdownMenu.Section>
            <DropdownMenu.Section title="Application">
              <DropdownMenu.Item id="deploy-runtime">Deploy with Aiven Runtime</DropdownMenu.Item>
            </DropdownMenu.Section>
            <DropdownMenu.Item id={CREATE_MENU_AGENT.id}>{CREATE_MENU_AGENT.label}</DropdownMenu.Item>
            <DropdownMenu.Section title={CREATE_MENU_SOLUTION.title}>
              <DropdownMenu.Item id={CREATE_MENU_SOLUTION.items[0].id}>
                {CREATE_MENU_SOLUTION.items[0].label}
              </DropdownMenu.Item>
            </DropdownMenu.Section>
          </DropdownMenu.Items>
        </DropdownMenu>
      </Box>
    </Box>
  )
}

OverviewHeader.displayName = 'OverviewHeader'

export type ProjectPageShellV2Props = {
  data: ProjectPageMockData
}

/**
 * Local fork of the shared ProjectPageShell. Identical chrome and non-Overview tabs,
 * but the Overview view is swapped for the aggregation-first OverviewV2 behind an
 * in-page feature toggle (falls back to the shared OverviewContent).
 */
export function ProjectPageShellV2({ data }: ProjectPageShellV2Props) {
  const [activeItem, setActiveItem] = useState('overview')
  const [mode, setMode] = useState<OverviewMode>('v2')
  const [volume, setVolume] = useState<PageScale>('large')
  const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>('loaded')
  // Projects are stateful so UC3 can switch environment — and create a missing one — in place.
  const [projects, setProjects] = useState<ProjectContext[]>(SIBLING_PROJECTS)
  const [projectId, setProjectId] = useState(SIBLING_PROJECTS[0].id)

  const project = projects.find((p) => p.id === projectId) ?? projects[0]

  const createDevelopmentProject = () => {
    const existing = projects.find((p) => p.environment === 'development')
    if (existing) {
      setProjectId(existing.id)
      return
    }
    const created: ProjectContext = {
      id: 'acme-dev',
      name: 'acme-dev',
      environment: 'development',
      environmentLabel: 'Development',
      nameToken: 'dev',
      regionDefault: project.regionDefault,
      unitId: project.unitId,
    }
    setProjects((prev) => [created, ...prev])
    setProjectId(created.id)
  }

  const activeView = SIDEBAR_VIEW[activeItem]
  const showProjectHome = activeView !== undefined
  const showEventLog = activeItem === 'event-log'
  const showDataHub = activeItem === 'data-hub'
  const showAivenStudio = activeItem === 'aiven-studio'
  const showApps = activeItem === 'apps'
  const isOverview = activeView === 'overview'

  return (
    <ProjectPageDataProvider data={{ ...data, projectName: project.name }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 48px)',
          minHeight: 0,
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        <ConsoleHeader
          activeNav="projects"
          orgName={data.orgName}
          orgSublabel="Organization"
          userInitials="MB"
          activeProjectId={project.name}
          beforeOrganizationSelector={
            <Button.Secondary type="button" dense icon={proPlansIcon}>
              AI editor
            </Button.Secondary>
          }
        />

        <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <ProjectHomeSidebar activeItem={activeItem} onItemClick={setActiveItem} />

          {isOverview ? (
            <Box
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                backgroundColor: 'var(--aquarium-background-color-body)',
              }}
            >
              <OverviewHeader
                project={project}
                projects={projects}
                onProjectChange={setProjectId}
                projectSubtitle={data.projectSubtitle}
                mode={mode}
                onModeChange={setMode}
                volume={volume}
                onVolumeChange={setVolume}
                asyncStatus={asyncStatus}
                onAsyncStatusChange={setAsyncStatus}
              />
              {mode === 'v2' ? (
                <OverviewV2
                  dataset={VOLUME_DATASETS[volume]}
                  status={asyncStatus}
                  onRetry={() => setAsyncStatus('loaded')}
                  project={project}
                  projects={projects}
                  onProjectChange={setProjectId}
                  onCreateDevelopmentProject={createDevelopmentProject}
                />
              ) : (
                <OverviewContent />
              )}
            </Box>
          ) : showEventLog ? (
            <EventLogsContent
              title="Event log"
              subtitle="View the history of actions across this project"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                  {data.orgName}
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="project" href="#" onClick={(e) => e.preventDefault()}>
                  {project.name}
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="event-log">Event log</Breadcrumbs.Crumb>,
              ]}
            />
          ) : showDataHub ? (
            <DataHubContent />
          ) : showAivenStudio ? (
            <AivenStudioContent />
          ) : showApps ? (
            <AppsContent />
          ) : showProjectHome ? (
            <ProjectHomeContent activeView={activeView} />
          ) : (
            <Box style={{ flex: 1, padding: 24, overflow: 'auto' }}>
              <PageHeader
                title={getProjectNavLabel(activeItem)}
                subtitle={
                  <Typography.Default color="muted">
                    Placeholder — this experiment focuses on the Project Overview.
                  </Typography.Default>
                }
              />
            </Box>
          )}
        </Box>
      </Box>
    </ProjectPageDataProvider>
  )
}

ProjectPageShellV2.displayName = 'ProjectPageShellV2'
