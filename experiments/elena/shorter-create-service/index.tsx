import type { PageMeta } from '@/lib/experiments/types'
import { ExperimentPageShell } from '@/components/experiments/ExperimentPageShell'

export const pageMeta: PageMeta = {
  title: 'Shorter create service flow',
  description: 'Advanced settings hidden by default — experiment from Create test environment',
}

export default function Page() {
  return <ExperimentPageShell scenarioId="onboarding-test-env" />
}
