export type IllustrationKey = 'developer' | 'hobbyist' | 'startup'

const PLAN_ILLUSTRATION_KEY: Record<string, IllustrationKey> = {
  'developer-plan': 'developer',
  hobbyist: 'hobbyist',
  'hobbyist-aws': 'hobbyist',
  'hobbyist-gcp': 'hobbyist',
  startup: 'startup',
  'startup-4': 'startup',
  business: 'startup',
}

export function resolvePlanIllustrationKey(planId: string): IllustrationKey {
  return PLAN_ILLUSTRATION_KEY[planId] ?? 'developer'
}
