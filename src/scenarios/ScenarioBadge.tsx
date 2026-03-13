import { getScenarioById } from './scenarioConfig'
import { useScenario } from './ScenarioContext'
import './scenario.css'

/**
 * Persistent pill anchored bottom-right showing the currently active scenario.
 * Clicking it opens the scenario panel.
 * Only rendered when a scenario is active.
 */
export function ScenarioBadge() {
  const { activeScenarioId, openPanel } = useScenario()

  if (!activeScenarioId) return null

  const scenario = getScenarioById(activeScenarioId)
  const label = scenario?.label ?? activeScenarioId

  return (
    <button
      className="scenario-badge"
      onClick={openPanel}
      aria-label={`Active scenario: ${label}. Click to open scenario panel.`}
      title="Click to open scenario panel"
    >
      <span className="scenario-badge__dot" aria-hidden="true" />
      <span className="scenario-badge__text">
        Scenario: <strong>{label}</strong>
      </span>
    </button>
  )
}
