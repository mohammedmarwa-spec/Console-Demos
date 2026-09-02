import type { ProjectPageMockData } from '@experiments/_shared/project-page'
import { projectPageData } from '../project-page/mockData'

export const ORG_NAME = 'Aiven'
export const ORG_HEADER_NAME = 'Aiven org.'
export const USER_INITIALS = 'EI'

/** Projects selectable in the Data flow filter (org-level). */
export const PROJECT_OPTIONS = [
  'dev-sandbox',
  'online-store-prod',
  'ux-tests',
  'demo-kafka-pipeline',
] as const

export type ProjectOption = (typeof PROJECT_OPTIONS)[number]

/** Reuse Project Architecture services + edges for the org Data flow canvas. */
export const dataFlowPageData: ProjectPageMockData = {
  ...projectPageData,
  architectureEdges: projectPageData.architectureEdges.map((edge) => ({
    ...edge,
    // Match Console Data flow edge labels in the reference screenshot.
    label: 'ACTIVE',
    animated: true,
  })),
}
