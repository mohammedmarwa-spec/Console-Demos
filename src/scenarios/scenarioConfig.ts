// ─── Scenario Registry (legacy shim) ────────────────────────────────────────
// Canonical data lives in src/registry/. Import from here for backward compatibility.

export {
  SCENARIOS,
  getScenarioById,
  getGroups,
  getScenariosByGroup,
} from '../registry'

export type { Scenario } from '../registry'
