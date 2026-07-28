import { DEEPTRACE_DEMO_PG_ID } from '../mocks/services/deeptrace'
import { INITIAL_SERVICES } from '../mocks/services/initial'
import { MANY_SERVICES_RAW } from '../mocks/services/many-services'
import { MYSQL_ACU_ROLLOUT_SERVICES } from '../mocks/services/mysql-acu-rollout'
import { REPLICA_MIXED_SERVICES } from '../mocks/services/replica-mixed'
import { FREE_DEV_UPGRADE_SERVICES } from '../mocks/services/free-dev-upgrade'
import { TEST_ENV_SERVICES } from '../screens/playground/testEnvServicesCatalog'
import { PLAYGROUND_SAMPLE_SERVICE_ID } from '../utils/pgStudioPlaygroundSample'

/** Placeholder route segment for user-created / unknown service IDs under static export. */
export const SERVICE_OVERVIEW_CATCHALL_ID = '_'

/** Collect known mock service IDs for static export pre-rendering. */
export function getKnownServiceIds(): string[] {
  const ids = new Set<string>([
    SERVICE_OVERVIEW_CATCHALL_ID,
    PLAYGROUND_SAMPLE_SERVICE_ID,
    DEEPTRACE_DEMO_PG_ID,
    ...TEST_ENV_SERVICES.map((s) => s.defaultServiceName),
  ])
  for (const list of [
    INITIAL_SERVICES,
    MANY_SERVICES_RAW,
    MYSQL_ACU_ROLLOUT_SERVICES,
    REPLICA_MIXED_SERVICES,
    FREE_DEV_UPGRADE_SERVICES,
  ]) {
    for (const s of list) ids.add(s.id)
  }
  return [...ids]
}

const KNOWN_SERVICE_IDS = new Set(getKnownServiceIds())

/** True when the ID is pre-rendered via generateStaticParams. */
export function isKnownServiceId(serviceId: string): boolean {
  return KNOWN_SERVICE_IDS.has(serviceId)
}
