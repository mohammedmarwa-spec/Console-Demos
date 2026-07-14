/**
 * Playground two-layer contract — the only stable seam between shell and content.
 *
 * Layer A (app shell): hub, /console/* routes, /experiments/*, providers, deploy.
 * Layer B (content): scenario catalog, runtime, mocks, domain screens.
 *
 * Shell imports content only through the exports below. Content must never import
 * from src/app/, src/components/hub/, or PlaygroundStateContext.
 */

// ─── Content layer (shell → content) ─────────────────────────────────────────

export type { AppView, ScenarioRuntime, ScenarioRuntimeFlags } from '@/scenarios/scenarioRuntime'
export {
  resolveRuntime,
  resolveRuntimeKey,
  getInitialServicesForScenario,
  initialViewForScenario,
  getRuntimeFlags,
} from '@/scenarios/scenarioRuntime'

export type {
  PlaygroundEntry,
  PlaygroundEntryType,
  Scenario,
  ScenarioCategory,
  ScenarioStatus,
} from '@/registry'
export {
  PLAYGROUND_ENTRIES,
  getEntryById,
  getScenarioById,
  getGroups,
  getEntriesByCategory,
} from '@/registry'

export {
  ROUTES,
  viewToPath,
  getInitialPathForScenario,
  getLaunchUrlForScenario,
  serviceOverviewPath,
  experimentPath,
} from '@/lib/navigation'

// ─── Shell layer (experiments → app) ─────────────────────────────────────────

export { PlaygroundStateProvider, usePlaygroundState } from '@/contexts/PlaygroundStateContext'
export { ThemeProvider, useTheme, useResolvedTheme } from '@/theme'
export { ExperimentPageShell, useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
export type { ExperimentPageShellProps } from '@/components/experiments/ExperimentPageShell'
export type { PageMeta, DiscoveredPage } from '@/lib/experiments/types'
