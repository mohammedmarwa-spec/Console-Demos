'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ProjectPageMockData } from './types'

const ProjectPageDataContext = createContext<ProjectPageMockData | null>(null)

export function ProjectPageDataProvider({
  data,
  children,
}: {
  data: ProjectPageMockData
  children: ReactNode
}) {
  return (
    <ProjectPageDataContext.Provider value={data}>{children}</ProjectPageDataContext.Provider>
  )
}

ProjectPageDataProvider.displayName = 'ProjectPageDataProvider'

export function useProjectPageData(): ProjectPageMockData {
  const data = useContext(ProjectPageDataContext)
  if (!data) {
    throw new Error('useProjectPageData must be used within ProjectPageDataProvider')
  }
  return data
}
