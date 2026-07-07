import { DEEPTRACE_DEMO_PG_ID } from '../mocks/services/deeptrace'
import { INITIAL_SERVICES } from '../mocks/services/initial'
import { MANY_SERVICES_RAW } from '../mocks/services/many-services'
import { MYSQL_ACU_ROLLOUT_SERVICES } from '../mocks/services/mysql-acu-rollout'
import { REPLICA_MIXED_SERVICES } from '../mocks/services/replica-mixed'
import { FREE_DEV_UPGRADE_SERVICES } from '../mocks/services/free-dev-upgrade'
import { PLAYGROUND_SAMPLE_SERVICE_ID } from '../utils/pgStudioPlaygroundSample'

/** Collect known mock service IDs for static export pre-rendering. */
export function getKnownServiceIds(): string[] {
  const ids = new Set<string>(['_', PLAYGROUND_SAMPLE_SERVICE_ID, DEEPTRACE_DEMO_PG_ID])
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
