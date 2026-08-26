'use client'

import { useState } from 'react'
import { Box } from '@aivenio/aquarium'
import type { PageMeta } from '@/lib/experiments/types'
import { ProjectPageShell } from '@experiments/_shared/project-page/ProjectPageShell'
import { projectPageData } from '@experiments/elena/project-page/mockData'
import { ContextPageHeader } from './ContextPageHeader'
import { HomePageContent } from './HomePageContent'
import { ORG_NAME, PROJECT_HOME_ID, PROJECTS, USER_INITIALS } from './mockData'

export const pageMeta: PageMeta = {
  title: 'Homepage V6',
  description:
    'V1 Console Home with a slash-separated context Page header — org on Home, org / project on Project page.',
}

type View = 'home' | 'project'

export default function Page() {
  const [view, setView] = useState<View>('home')
  const currentProject = PROJECTS.find((p) => p.id === PROJECT_HOME_ID) ?? PROJECTS[0]!

  const goHome = () => setView('home')
  const openProject = (projectId: string) => {
    if (projectId === PROJECT_HOME_ID) setView('project')
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        minHeight: 0,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ContextPageHeader
        orgName={ORG_NAME}
        projectName={view === 'project' ? currentProject.name : undefined}
        activeProjectId={view === 'project' ? currentProject.id : undefined}
        userInitials={USER_INITIALS}
        onLogoClick={goHome}
        onOrgHomeClick={goHome}
      />
      {view === 'home' ? (
        <HomePageContent onOpenProject={openProject} />
      ) : (
        <ProjectPageShell data={projectPageData} hideHeader />
      )}
    </Box>
  )
}
