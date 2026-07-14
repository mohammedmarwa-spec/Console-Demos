import { PERSONAL_PLAYGROUND_CONTEXT, TEAM_TEST_ENV_CONTEXT } from '@experiments/_shared/data/console-context'

export type WorkspaceOwnershipId = 'personal' | 'organization'

export type WorkspaceOwnershipOption = {
  id: WorkspaceOwnershipId
  title: string
  description: string
  ownerLabel: string
  orgName: string
  orgSublabel: string
  projectDescription: string
  billingNote: string
}

/** Mock workspace choices — reuses centralized console context labels. */
export const WORKSPACE_OWNERSHIP_OPTIONS: WorkspaceOwnershipOption[] = [
  {
    id: 'personal',
    title: 'Personal workspace',
    description: 'You manage billing and access. Trial credits apply to your account.',
    ownerLabel: 'You',
    orgName: PERSONAL_PLAYGROUND_CONTEXT.orgName,
    orgSublabel: 'Personal',
    projectDescription: 'Private project — only you can manage services',
    billingNote: 'Trial credits on your account',
  },
  {
    id: 'organization',
    title: TEAM_TEST_ENV_CONTEXT.orgName,
    description: 'Org admins share access. Usage may roll up to organization billing.',
    ownerLabel: `${TEAM_TEST_ENV_CONTEXT.orgName} admins`,
    orgName: TEAM_TEST_ENV_CONTEXT.orgName,
    orgSublabel: 'Organization',
    projectDescription: 'Shared project — org admins can manage access',
    billingNote: 'May bill to org payment method',
  },
]

export const DEFAULT_WORKSPACE_OWNERSHIP_ID: WorkspaceOwnershipId = 'personal'
