'use client'

import { useState, type ReactNode } from 'react'
import { Box, Breadcrumbs, PageHeader, Typography } from '@aivenio/aquarium'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { EventLogsContent } from '@experiments/elena/organization-event-logs/EventLogsContent'
import { ProjectHomeContent } from './ProjectHomeContent'
import { ProjectHomeSidebar, getProjectNavLabel } from './ProjectHomeSidebar'
import { DataHubContent } from './DataHubContent'
import { AivenStudioContent } from './AivenStudioContent'
import { AppsContent } from './AppsContent'
import { ProjectPageDataProvider } from './ProjectPageDataContext'
import type { ProjectPageMockData, ProjectTab } from './types'

const SIDEBAR_VIEW: Partial<Record<string, ProjectTab>> = {
  overview: 'overview',
  resources: 'resources',
  architecture: 'architecture',
}

export type ProjectPageShellProps = {
  data: ProjectPageMockData
  /** Optional override for non–Project Home placeholder copy. */
  placeholderNote?: ReactNode
  /**
   * When true, omit ConsoleHeader and content-area breadcrumbs
   * (parent owns a context Page header trail instead).
   */
  hideHeader?: boolean
}

/** Shared Project page chrome: header, sidebar, and content views. */
export function ProjectPageShell({
  data,
  placeholderNote = 'Placeholder — this experiment focuses on Project Home.',
  hideHeader = false,
}: ProjectPageShellProps) {
  const [activeItem, setActiveItem] = useState('overview')

  const activeView = SIDEBAR_VIEW[activeItem]
  const showProjectHome = activeView !== undefined
  const showEventLog = activeItem === 'event-log'
  const showDataHub = activeItem === 'data-hub'
  const showAivenStudio = activeItem === 'aiven-studio'
  const showApps = activeItem === 'apps'

  return (
    <ProjectPageDataProvider data={data}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...(hideHeader
            ? { flex: 1, minHeight: 0 }
            : { height: 'calc(100vh - 48px)', minHeight: 0 }),
          backgroundColor: 'var(--aquarium-background-color-body)',
        }}
      >
        {hideHeader ? null : (
          <ConsoleHeader
            activeNav="projects"
            orgName={data.orgName}
            orgSublabel="Organization"
            userInitials="EI"
            activeProjectId={data.projectName}
          />
        )}

        <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <ProjectHomeSidebar
            activeItem={activeItem}
            onItemClick={setActiveItem}
            hideProjectSwitcher={hideHeader}
          />

          {showEventLog ? (
            <EventLogsContent
              title="Event log"
              subtitle="View the history of actions across this project"
              breadcrumbs={
                hideHeader
                  ? []
                  : [
                      <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                        {data.orgName}
                      </Breadcrumbs.Crumb>,
                      <Breadcrumbs.Crumb
                        key="project"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        {data.projectName}
                      </Breadcrumbs.Crumb>,
                      <Breadcrumbs.Crumb key="event-log">Event log</Breadcrumbs.Crumb>,
                    ]
              }
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
                  <Typography.Default color="muted">{placeholderNote}</Typography.Default>
                }
              />
            </Box>
          )}
        </Box>
      </Box>
    </ProjectPageDataProvider>
  )
}

ProjectPageShell.displayName = 'ProjectPageShell'
