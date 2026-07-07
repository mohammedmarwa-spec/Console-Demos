import {
  initialOverviewServiceIdForScenario,
  initialViewForScenario,
  resolveRuntime,
  type AppView,
} from '../scenarios/scenarioRuntime'

export const ROUTES = {
  hub: '/',
  consoleOrg: '/console/org',
  consoleServices: '/console/project/services',
  consoleBilling: '/console/billing',
  consoleTestEnv: '/console/onboarding/test-env',
  consolePlayground: '/console/onboarding/playground',
} as const

export function serviceOverviewPath(serviceId: string): string {
  return `/console/project/services/${encodeURIComponent(serviceId)}`
}

export function experimentPath(owner: string, slug: string): string {
  return `/experiments/${owner}/${slug}`
}

export function parseExperimentId(id: string): { owner: string; slug: string } | null {
  if (!id.startsWith('experiment/')) return null
  const rest = id.slice('experiment/'.length)
  const slash = rest.indexOf('/')
  if (slash === -1) return null
  return { owner: rest.slice(0, slash), slug: rest.slice(slash + 1) }
}

export function viewToPath(view: AppView, opts?: { serviceId?: string | null }): string {
  switch (view) {
    case 'org-home':
      return ROUTES.consoleOrg
    case 'project-services':
      return ROUTES.consoleServices
    case 'service-overview':
      return serviceOverviewPath(opts?.serviceId ?? '_')
    case 'billing-invoice':
      return ROUTES.consoleBilling
    case 'test-env-onboarding':
      return ROUTES.consoleTestEnv
    case 'playground':
      return ROUTES.consolePlayground
    default:
      return ROUTES.consoleServices
  }
}

/** Build a launch URL for a scenario or experiment registry entry. */
export function getLaunchUrlForScenario(scenarioId: string): string {
  const experiment = parseExperimentId(scenarioId)
  if (experiment) {
    return experimentPath(experiment.owner, experiment.slug)
  }

  const runtime = resolveRuntime(scenarioId)
  const path = viewToPath(runtime.initialView, {
    serviceId: runtime.initialOverviewServiceId ?? initialOverviewServiceIdForScenario(scenarioId),
  })
  return `${path}?scenario=${encodeURIComponent(scenarioId)}`
}

/** Build route field for registry entries. */
export function buildEntryRoute(scenarioId: string): string {
  return getLaunchUrlForScenario(scenarioId)
}

export function getInitialPathForScenario(scenarioId: string | null): string {
  if (!scenarioId) return ROUTES.consoleServices
  const experiment = parseExperimentId(scenarioId)
  if (experiment) return experimentPath(experiment.owner, experiment.slug)
  const view = initialViewForScenario(scenarioId)
  const serviceId = initialOverviewServiceIdForScenario(scenarioId)
  return viewToPath(view, { serviceId })
}
