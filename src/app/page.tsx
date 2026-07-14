import { PrototypeHub } from '../components/hub/PrototypeHub'
import { discoverExperiments, discoverTemplates } from '@/lib/experiments/discover.server'

export default function HomePage() {
  return <PrototypeHub experiments={discoverExperiments()} templates={discoverTemplates()} />
}
