'use client'

import type { PageMeta } from '@/lib/experiments/types'
import { useEnsureScenario } from '@/components/experiments/ExperimentPageShell'
import OwnershipTestEnvPage from './components/OwnershipTestEnvPage'

export const pageMeta: PageMeta = {
  title: 'Workspace ownership in test env',
  description: 'Explicit personal vs org workspace choice during test environment onboarding',
}

export default function Page() {
  useEnsureScenario('onboarding-test-env')
  return <OwnershipTestEnvPage />
}
