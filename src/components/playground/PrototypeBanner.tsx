import { getEntryById } from '../../registry'
import { useScenario } from '../../scenarios/ScenarioContext'

/** Banner shown when the active entry is a prototype or experiment. */
export function PrototypeBanner() {
  const { activeScenarioId } = useScenario()
  if (!activeScenarioId) return null

  const entry = getEntryById(activeScenarioId)
  if (!entry) return null
  if (entry.type === 'reusable-scenario') return null

  const isExperiment = entry.id.startsWith('experiment/')

  return (
    <div className="prototype-banner" role="status" aria-live="polite">
      <span className="prototype-banner__label">
        {isExperiment ? 'Experiment' : 'Prototype'}
      </span>
      <span className="prototype-banner__title">{entry.title}</span>
      {entry.owner && (
        <span className="prototype-banner__owner">· {entry.owner}</span>
      )}
      {entry.sourceScenarioId && (
        <span className="prototype-banner__source">
          · from {entry.sourceScenarioId}
        </span>
      )}
    </div>
  )
}
