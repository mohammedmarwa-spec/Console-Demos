import type { PageMeta } from '@/lib/experiments/types'
import { ExperimentPageShell } from '@/components/experiments/ExperimentPageShell'

export const pageMeta: PageMeta = {
  title: 'Onboarding starter',
  description:
    'Elena’s onboarding exploration based on Create test environment — customize the flow inside this experiment folder',
}

export default function Page() {
  return <ExperimentPageShell scenarioId="onboarding-test-env" />
}
