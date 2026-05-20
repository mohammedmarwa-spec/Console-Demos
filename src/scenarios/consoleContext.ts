/** Console / project labels shown in headers, breadcrumbs, and modal subtitles. */
export type ConsoleContext = {
  projectName: string
  orgName: string
  orgSublabel: string
  userInitials: string
}

export const DEFAULT_CONSOLE_CONTEXT: ConsoleContext = {
  projectName: 'ux-tests',
  orgName: 'BigCo Ltd.',
  orgSublabel: 'Engineering',
  userInitials: 'LI',
}

/** Post-sign-up: personal org, default playground project, no services yet. */
export const ONBOARDING_PLAYGROUND_CONTEXT: ConsoleContext = {
  projectName: 'playground',
  orgName: 'Elena Ivanova',
  orgSublabel: 'Personal',
  userInitials: 'EI',
}

export const ONBOARDING_PLAYGROUND_SCENARIO_ID = 'onboarding-playground'

export function isOnboardingPlaygroundScenario(scenarioId: string | null): boolean {
  return scenarioId === ONBOARDING_PLAYGROUND_SCENARIO_ID
}

export function getConsoleContext(scenarioId: string | null): ConsoleContext {
  return isOnboardingPlaygroundScenario(scenarioId)
    ? ONBOARDING_PLAYGROUND_CONTEXT
    : DEFAULT_CONSOLE_CONTEXT
}
