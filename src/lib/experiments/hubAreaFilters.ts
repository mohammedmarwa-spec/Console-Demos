import type { DiscoveredPage } from './types'

export type HubAreaFilterId =
  | 'all'
  | 'homepage'
  | 'project-page'
  | 'service-overview'
  | 'onboarding'
  | 'free-tier'

export const HUB_AREA_FILTERS: { id: HubAreaFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'project-page', label: 'Project page' },
  { id: 'service-overview', label: 'Service overview' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'free-tier', label: 'Free Tier' },
]

export function isHubAreaFilterId(value: string): value is HubAreaFilterId {
  return HUB_AREA_FILTERS.some((filter) => filter.id === value)
}

/**
 * Infer console area from discovery slug/title — no per-experiment tags.
 * Naming convention: homepage-*, project-page*, *service-overview*,
 * *onboarding* / first-time*, *free-tier* / free-*
 */
export function matchesHubAreaFilter(entry: DiscoveredPage, filterId: HubAreaFilterId): boolean {
  if (filterId === 'all') return true

  const slug = entry.slug.toLowerCase()
  const title = entry.title.toLowerCase()

  switch (filterId) {
    case 'homepage':
      return slug.startsWith('homepage') || title.includes('homepage')
    case 'project-page':
      return slug.startsWith('project-page') || title.includes('project page')
    case 'service-overview':
      return slug.includes('service-overview') || title.includes('service overview')
    case 'onboarding':
      return (
        slug.includes('onboarding') ||
        title.includes('onboarding') ||
        slug.startsWith('first-time')
      )
    case 'free-tier':
      return (
        slug.includes('free-tier') ||
        slug.startsWith('free-') ||
        title.includes('free tier')
      )
    default:
      return true
  }
}
