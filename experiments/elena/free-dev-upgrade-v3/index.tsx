import { getPrototypeScenario } from '@/content/prototype-scenarios'
import type { PageMeta } from '@/lib/experiments/types'
import { ExperimentPageShell } from '@/components/experiments/ExperimentPageShell'

const scenario = getPrototypeScenario('free-dev-upgrade-v3')

export const pageMeta: PageMeta = {
  title: scenario.title,
  description: scenario.description,
}

export default function Page() {
  return <ExperimentPageShell scenarioId={scenario.id} />
}
