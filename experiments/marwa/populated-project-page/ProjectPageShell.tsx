'use client'

import { Box, Breadcrumbs, PageHeader, Typography } from '@aivenio/aquarium'
import { useState } from 'react'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import {
  AivenStudioContent,
  AppsContent,
  DataHubContent,
  ProjectHomeContent,
  ProjectHomeSidebar,
  ProjectPageDataProvider,
  getProjectNavLabel,
  type ProjectTab,
} from '@experiments/_shared/project-page'
import { EventLogsContent } from '@experiments/elena/organization-event-logs/EventLogsContent'
import { projectPageData } from '../project-page-v2/mockData'
import { PopulatedOverview, ScopeToggle } from './PopulatedOverview'
import { ScopeProvider, useScope } from './ScopeContext'
import { onlineStoreProd } from './fixtures/onlineStoreProd'

const chromeData = {
  ...projectPageData,
  orgName: onlineStoreProd.project.orgName,
  projectName: onlineStoreProd.project.name,
  projectSubtitle: onlineStoreProd.project.description,
}

const SIDEBAR_VIEW: Partial<Record<string, ProjectTab>> = {
  overview: 'overview',
  resources: 'resources',
  architecture: 'architecture',
}

function OverviewPane() {
  const { fixture } = useScope()
  return (
    <Box
      padding="6"
      grow={1}
      minWidth="0"
      minHeight="0"
      style={{ overflow: 'auto', backgroundColor: 'var(--aquarium-surface-body)' }}
    >
      <PopulatedOverview />
      <Box.Flex marginTop="4" alignItems="center" justifyContent="space-between" gap="4" flexWrap="wrap">
        <Typography.Small color="muted">
          Pitch prototype — mocked data only. Org {fixture.project.orgName}.
        </Typography.Small>
        <ScopeToggle />
      </Box.Flex>
    </Box>
  )
}

export function ProjectPageShell() {
  const [activeItem, setActiveItem] = useState('overview')
  const data = chromeData
  const activeView = SIDEBAR_VIEW[activeItem]
  const isOverview = activeView === 'overview'

  return (
    <ScopeProvider>
      <ProjectPageDataProvider data={data}>
        <Box.Flex
          flexDirection="column"
          style={{
            height: 'calc(100vh - 48px)',
            minHeight: 0,
            backgroundColor: 'var(--aquarium-surface-body)',
          }}
        >
          <ConsoleHeader
            activeNav="projects"
            orgName={data.orgName}
            orgSublabel="Organization"
            userInitials="MB"
            activeProjectId={data.projectName}
          />
          <Box.Flex grow={1} minHeight="0">
            <ProjectHomeSidebar activeItem={activeItem} onItemClick={setActiveItem} />
            {isOverview ? (
              <OverviewPane />
            ) : activeItem === 'event-log' ? (
              <EventLogsContent
                title="Event log"
                subtitle="View the history of actions across this project"
                breadcrumbs={[
                  <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                    {data.orgName}
                  </Breadcrumbs.Crumb>,
                  <Breadcrumbs.Crumb key="project" href="#" onClick={(e) => e.preventDefault()}>
                    {data.projectName}
                  </Breadcrumbs.Crumb>,
                  <Breadcrumbs.Crumb key="event-log">Event log</Breadcrumbs.Crumb>,
                ]}
              />
            ) : activeItem === 'data-hub' ? (
              <DataHubContent />
            ) : activeItem === 'aiven-studio' ? (
              <AivenStudioContent />
            ) : activeItem === 'apps' ? (
              <AppsContent />
            ) : activeView ? (
              <ProjectHomeContent activeView={activeView} />
            ) : (
              <Box padding="6" grow={1} style={{ overflow: 'auto' }}>
                <PageHeader
                  title={getProjectNavLabel(activeItem)}
                  subtitle={
                    <Typography.Default color="muted">
                      Placeholder — this experiment focuses on the populated Overview pitch.
                    </Typography.Default>
                  }
                />
              </Box>
            )}
          </Box.Flex>
        </Box.Flex>
      </ProjectPageDataProvider>
    </ScopeProvider>
  )
}

ProjectPageShell.displayName = 'ProjectPageShell'
OverviewPane.displayName = 'OverviewPane'
