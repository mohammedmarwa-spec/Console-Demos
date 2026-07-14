/** Console / project labels shown in headers, breadcrumbs, and modal subtitles. */
export type ConsoleContext = {
  projectName: string
  orgName: string
  orgSublabel: string
  userInitials: string
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
