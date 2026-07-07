import ServiceOverviewClient from './ServiceOverviewClient'
import { getKnownServiceIds } from '../../../../../lib/serviceIds'

export function generateStaticParams() {
  return getKnownServiceIds().map((serviceId) => ({ serviceId }))
}

export default function ServiceOverviewPage() {
  return <ServiceOverviewClient />
}
