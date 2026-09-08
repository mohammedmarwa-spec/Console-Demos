'use client'

import { useState } from 'react'
import { Box, Breadcrumbs, EmptyState, PageHeader } from '@aivenio/aquarium'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { ProjectSidebar } from '@/components/ProjectSidebar'
import { ConnectGitHubModal } from './ConnectGitHubModal'
import runtimeEmptyImage from './assets/runtime-empty-state.svg'

export type AivenRuntimePageProps = {
  orgName: string
  projectName: string
  userInitials: string
}

/** Project Runtime empty state — matches Console “Build and deploy” landing. */
export function AivenRuntimePage({ orgName, projectName, userInitials }: AivenRuntimePageProps) {
  const [githubModalOpen, setGithubModalOpen] = useState(false)

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - 48px)',
        minHeight: 0,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ConsoleHeader
        activeNav="projects"
        orgName={orgName}
        orgSublabel="Organization"
        userInitials={userInitials}
        activeProjectId={projectName}
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ProjectSidebar projectName={projectName} activeItem="applications" />

        <Box
          style={{
            flex: 1,
            minHeight: 0,
            padding: 24,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <PageHeader
            title="Runtime"
            breadcrumbs={[
              <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => e.preventDefault()}>
                {orgName}
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="project" href="#" onClick={(e) => e.preventDefault()}>
                {projectName}
              </Breadcrumbs.Crumb>,
              <Breadcrumbs.Crumb key="runtime">Runtime</Breadcrumbs.Crumb>,
            ]}
          />

          <Box style={{ flex: 1, minHeight: 280, display: 'flex' }}>
            <EmptyState
              title="Build and deploy your applications on the Aiven Platform"
              image={runtimeEmptyImage}
              imageAlt=""
              imageWidth={120}
              fullHeight
              borderStyle="dashed"
              primaryAction={{
                text: 'Deploy application',
                onClick: () => setGithubModalOpen(true),
              }}
              secondaryAction={{
                text: 'Learn more',
                href: 'https://aiven.io/docs/products/apps/deploy-apps',
                target: '_blank',
              }}
            >
              Run containerized applications alongside your Aiven services. Aiven handles the networking and
              orchestration for you.
            </EmptyState>
          </Box>
        </Box>
      </Box>

      <ConnectGitHubModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onConnected={() => setGithubModalOpen(false)}
      />
    </Box>
  )
}

AivenRuntimePage.displayName = 'AivenRuntimePage'
