import type { ProjectPageMockData } from '@experiments/_shared/project-page'

/** Fresh-user state — empty project with no services or activity. */
export const projectPageData: ProjectPageMockData = {
  orgName: 'Aiven org.',
  projectName: 'online-store-prod',
  projectSubtitle: 'Build and operate your application, data and agents in one project.',
  services: [],
  metrics: [
    {
      id: 'resources',
      label: 'Project resources',
      value: 0,
      detail: '0 services · 0 apps · 0 agents',
      tone: 'primary',
    },
    {
      id: 'healthy',
      label: 'Healthy',
      value: 0,
      detail: 'Nothing deployed yet',
      tone: 'success',
    },
    {
      id: 'attention',
      label: 'Needs attention',
      value: 0,
      detail: 'No open issues',
      tone: 'warning',
    },
  ],
  attentionIssues: [],
  architecture: {
    connectedSystems: 0,
    connections: 0,
    unconnected: 0,
    description: 'No systems detected yet. Create a service to start mapping your architecture.',
  },
  architectureEdges: [],
  solutions: [],
  recentActivity: [],
  ctaBanner: {
    title: 'Build more with Aiven Platform',
    description: 'Connect your data, apps and agents to unlock powerful workflows.',
    actions: [
      { id: 'deploy-app', label: 'Deploy an application' },
      { id: 'streaming', label: 'Add streaming' },
      { id: 'ai-agent', label: 'Create an AI agent' },
    ],
  },
  dataHubItems: [],
  appsItems: [],
}
