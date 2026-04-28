// ─── Scenario engine — public API ─────────────────────────────────────────────
// Import from here to use the scenario system anywhere in the prototype.

export { ScenarioProvider, useScenario } from './ScenarioContext'
export type { ScenarioContextValue } from './ScenarioContext'

export { ScenarioPanel } from './ScenarioPanel'
export { ScenarioTrigger } from './ScenarioTrigger'

export { SCENARIOS, getScenarioById, getGroups, getScenariosByGroup } from './scenarioConfig'
export type { Scenario } from './scenarioConfig'
