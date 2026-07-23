import type { PageMeta } from '@/lib/experiments/types'
import { ExperimentPageShell } from '@/components/experiments/ExperimentPageShell'

export const pageMeta: PageMeta = {
  title: 'Onboarding starter',
  description: 'Template based on Create test environment — fork this to start a new experiment',
}

export default function Page() {
  return <ExperimentPageShell scenarioId="onboarding-test-env" />
}
