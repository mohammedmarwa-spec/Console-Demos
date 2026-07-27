/** Shared helpers for preserving experiment identity across console redirects. */

const EXPERIMENT_ROUTE = /^\/experiments\/([^/]+)\/([^/]+)/

/** Query param kept on /console redirects so Component map stays available. */
export const FROM_EXPERIMENT_PARAM = 'fromExperiment'

/** `owner/slug` for the current experiment path, or null. */
export function fromExperimentQuery(pathname: string): string | null {
  const match = pathname.match(EXPERIMENT_ROUTE)
  if (!match) return null
  return `${match[1]}/${match[2]}`
}
