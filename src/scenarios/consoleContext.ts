/** Console / project labels shown in headers, breadcrumbs, and modal subtitles. */
export type ConsoleContext = {
  projectName: string
  orgName: string
  orgSublabel: string
  userInitials: string
}

export const DEFAULT_CONSOLE_CONTEXT: ConsoleContext = {
  projectName: 'design-sandbox',
  orgName: 'Acme Corp',
  orgSublabel: 'Engineering',
  userInitials: 'DS',
}

/** Post-sign-up: personal org, default playground project, no services yet. */
export const ONBOARDING_PLAYGROUND_CONTEXT: ConsoleContext = {
  projectName: 'elena-project',
  orgName: 'Elena Ivanova',
  orgSublabel: 'Personal',
  userInitials: 'EI',
}

export const ONBOARDING_PLAYGROUND_SCENARIO_ID = 'onboarding-playground'

export const ONBOARDING_TEST_ENV_SCENARIO_ID = 'onboarding-test-env'

/** Post-sign-up test environment flow — default project name from Figma. */
export const ONBOARDING_TEST_ENV_CONTEXT: ConsoleContext = {
  projectName: 'test-env',
  orgName: 'Acme Corp',
  orgSublabel: 'Personal',
  userInitials: 'DS',
}

export function isOnboardingPlaygroundScenario(scenarioId: string | null): boolean {
  return scenarioId === ONBOARDING_PLAYGROUND_SCENARIO_ID
}

export function isOnboardingTestEnvScenario(scenarioId: string | null): boolean {
  return scenarioId === ONBOARDING_TEST_ENV_SCENARIO_ID
}

import { resolveRuntime } from './scenarioRuntime'

export function getConsoleContext(scenarioId: string | null): ConsoleContext {
  const runtime = resolveRuntime(scenarioId)
  if (runtime.consoleContext) return runtime.consoleContext
  if (isOnboardingPlaygroundScenario(scenarioId)) return ONBOARDING_PLAYGROUND_CONTEXT
  if (isOnboardingTestEnvScenario(scenarioId)) return ONBOARDING_TEST_ENV_CONTEXT
  return DEFAULT_CONSOLE_CONTEXT
}
