import ExperimentLauncher from './ExperimentLauncher'
import { EXPERIMENT_ENTRIES } from '../../../../registry/experiments'

export function generateStaticParams() {
  return EXPERIMENT_ENTRIES.map((entry) => {
    const parts = entry.id.replace('experiment/', '').split('/')
    return { owner: parts[0], slug: parts[1] }
  })
}

export default function ExperimentPage() {
  return <ExperimentLauncher />
}
