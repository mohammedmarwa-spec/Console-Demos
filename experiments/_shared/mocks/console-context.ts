import type { ConsoleContext } from '../data/console-context'

/** Neutral team defaults for reusable scenarios. */
export const TEAM_CONSOLE_CONTEXT: ConsoleContext = {
  projectName: 'design-sandbox',
  orgName: 'Acme Corp',
  orgSublabel: 'Engineering',
  userInitials: 'DS',
}

/** Personal context — only for onboarding-playground prototype. */
export const PERSONAL_PLAYGROUND_CONTEXT: ConsoleContext = {
  projectName: 'elena-project',
  orgName: 'Elena Ivanova',
  orgSublabel: 'Personal',
  userInitials: 'EI',
}

/** Test environment onboarding — neutral team version for reusable scenario. */
export const TEAM_TEST_ENV_CONTEXT: ConsoleContext = {
  projectName: 'test-env',
  orgName: 'Acme Corp',
  orgSublabel: 'Personal',
  userInitials: 'DS',
}
