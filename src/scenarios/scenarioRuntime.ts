import { getEntryById } from '../registry'
import { getPrototypeRuntimeKey } from '../content/prototype-scenarios'
import type { ServiceTypeId } from '../screens/ServiceTypeSelectModal'
import type { ServiceRow } from '../screens/ProjectServices'
import { enrichServicesWithRandomCreatedBy } from '../utils/serviceCreatedByDataset'
import {
  DEEPTRACE_DEMO_PG_ID,
  DEEPTRACE_DEMO_SERVICES,
  EMPTY_SERVICES,
  FREE_DEV_UPGRADE_SERVICES,
  INITIAL_SERVICES,
  MANY_SERVICES_RAW,
  MYSQL_ACU_ROLLOUT_SERVICES,
  REPLICA_MIXED_SERVICES,
} from '../mocks/services'
import type { ConsoleContext } from './consoleContext'
import {
  PERSONAL_PLAYGROUND_CONTEXT,
  TEAM_CONSOLE_CONTEXT,
  TEAM_TEST_ENV_CONTEXT,
} from '../mocks/console-context'

export type AppView =
  | 'org-home'
  | 'project-services'
  | 'service-overview'
  | 'billing-invoice'
  | 'playground'
  | 'test-env-onboarding'

export type UpgradePlanVariant =
  | 'startup-business'
  | 'hobbyist-startup-4'
  | 'dual-hobbyist-clouds'

export type ScenarioRuntimeFlags = {
  autoOpenMysqlRolloutModal?: boolean
  upgradePlanVariant?: UpgradePlanVariant
  hideSwitchToNewPricingAlert?: boolean
  initialSidebarItem?: string
}

export type ScenarioRuntime = {
  initialView: AppView
  getInitialServices: () => ServiceRow[]
  initialOverviewServiceId?: string | null
  initialOverviewServiceType?: ServiceTypeId | null
  consoleContext?: ConsoleContext
  flags?: ScenarioRuntimeFlags
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function withRandomCreatedByAvatars(services: ServiceRow[]): ServiceRow[] {
  if (services.length <= 1) return services
  return enrichServicesWithRandomCreatedBy(services)
}

/** Resolve scenario id → runtime key (experiments inherit from source). */
export function resolveRuntimeKey(scenarioId: string | null): string | null {
  if (!scenarioId) return null
  const entry = getEntryById(scenarioId)
  if (entry?.runtimeKey) return entry.runtimeKey
  return getPrototypeRuntimeKey(scenarioId)
}

function buildRuntimeForKey(runtimeKey: string): ScenarioRuntime {
  switch (runtimeKey) {
    case 'empty-state':
    case 'first-time-user':
      return {
        initialView: 'project-services',
        getInitialServices: () => EMPTY_SERVICES,
        consoleContext: TEAM_CONSOLE_CONTEXT,
      }

    case 'onboarding-playground':
      return {
        initialView: 'playground',
        getInitialServices: () => EMPTY_SERVICES,
        consoleContext: PERSONAL_PLAYGROUND_CONTEXT,
      }

    case 'onboarding-test-env':
      return {
        initialView: 'test-env-onboarding',
        getInitialServices: () => EMPTY_SERVICES,
        consoleContext: TEAM_TEST_ENV_CONTEXT,
      }

    case 'existing-customer':
      return {
        initialView: 'project-services',
        getInitialServices: () => [...INITIAL_SERVICES],
        consoleContext: TEAM_CONSOLE_CONTEXT,
      }

    case 'many-services':
      return {
        initialView: 'project-services',
        getInitialServices: () => withRandomCreatedByAvatars(shuffle([...MANY_SERVICES_RAW])),
        consoleContext: TEAM_CONSOLE_CONTEXT,
      }

    case 'mysql-acu-rollout':
      return {
        initialView: 'project-services',
        getInitialServices: () => withRandomCreatedByAvatars([...MYSQL_ACU_ROLLOUT_SERVICES]),
        consoleContext: TEAM_CONSOLE_CONTEXT,
        flags: { autoOpenMysqlRolloutModal: true },
      }

    case 'replica-mixed-pricing':
      return {
        initialView: 'project-services',
        getInitialServices: () => withRandomCreatedByAvatars([...REPLICA_MIXED_SERVICES]),
        consoleContext: TEAM_CONSOLE_CONTEXT,
      }

    case 'free-dev-upgrade-v4':
      return {
        initialView: 'project-services',
        getInitialServices: () => withRandomCreatedByAvatars([...FREE_DEV_UPGRADE_SERVICES]),
        consoleContext: TEAM_CONSOLE_CONTEXT,
        flags: {
          hideSwitchToNewPricingAlert: true,
          upgradePlanVariant: 'dual-hobbyist-clouds',
        },
      }

    case 'deeptrace-demo':
      return {
        initialView: 'service-overview',
        getInitialServices: () => DEEPTRACE_DEMO_SERVICES,
        initialOverviewServiceId: DEEPTRACE_DEMO_PG_ID,
        initialOverviewServiceType: 'postgresql',
        consoleContext: TEAM_CONSOLE_CONTEXT,
        flags: { initialSidebarItem: 'logs' },
      }

    default:
      return {
        initialView: 'project-services',
        getInitialServices: () => INITIAL_SERVICES,
        consoleContext: TEAM_CONSOLE_CONTEXT,
      }
  }
}

export function resolveRuntime(scenarioId: string | null): ScenarioRuntime {
  const runtimeKey = resolveRuntimeKey(scenarioId) ?? 'existing-customer'
  return buildRuntimeForKey(runtimeKey)
}

/** Legacy helpers kept for existing imports. */
export function getInitialServicesForScenario(scenarioId: string | null): ServiceRow[] {
  return resolveRuntime(scenarioId).getInitialServices()
}

export function initialViewForScenario(scenarioId: string | null): AppView {
  return resolveRuntime(scenarioId).initialView
}

export function initialOverviewServiceIdForScenario(scenarioId: string | null): string | null {
  return resolveRuntime(scenarioId).initialOverviewServiceId ?? null
}

export function initialOverviewServiceTypeForScenario(scenarioId: string | null): ServiceTypeId | null {
  return resolveRuntime(scenarioId).initialOverviewServiceType ?? null
}

export function getRuntimeFlags(scenarioId: string | null): ScenarioRuntimeFlags {
  return resolveRuntime(scenarioId).flags ?? {}
}

export function shouldAutoOpenMysqlRolloutModal(scenarioId: string | null): boolean {
  return getRuntimeFlags(scenarioId).autoOpenMysqlRolloutModal ?? false
}
