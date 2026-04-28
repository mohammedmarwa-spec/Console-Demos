import { useScenario } from './ScenarioContext'
import { getScenarioById } from './scenarioConfig'
import './scenario.css'

function IconSliders() {
  return (
    <svg className="scenario-trigger__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
      <circle cx="6" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Small floating button in the top-right corner that opens the scenario panel. */
export function ScenarioTrigger() {
  const { activeScenarioId, togglePanel } = useScenario()
  const scenario = activeScenarioId ? getScenarioById(activeScenarioId) : null
  const previewLabel = scenario?.label ?? 'Scenarios'
  const ariaLabel = scenario
    ? `Open scenario panel (Shift+S). Active scenario: ${scenario.label}`
    : 'Open scenario panel (Shift+S)'

  return (
    <button
      className="scenario-trigger"
      onClick={togglePanel}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <IconSliders />
      {activeScenarioId && <span className="scenario-trigger__dot" aria-hidden="true" />}
      <span className="scenario-trigger__label">{previewLabel}</span>
      <span className="scenario-trigger__kbd">⇧S</span>
    </button>
  )
}
