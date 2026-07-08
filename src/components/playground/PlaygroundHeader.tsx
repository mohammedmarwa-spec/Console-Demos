'use client'

import Link from 'next/link'
import { getEntryById } from '../../registry'
import { ROUTES } from '../../lib/navigation'
import { useScenario } from '../../scenarios'
import './playground-header.css'

export function PlaygroundHeader() {
  const { activeScenarioId } = useScenario()
  const entry = activeScenarioId ? getEntryById(activeScenarioId) : null
  const isPrototype = entry != null && entry.type !== 'reusable-scenario'

  return (
    <header className="playground-header">
      <div className="playground-header__inner">
        <Link href={ROUTES.hub} className="playground-header__back">
          ← Back
        </Link>
        {entry && (
          <div className="playground-header__meta">
            {isPrototype && (
              <span className="playground-header__label">
                {entry.id.startsWith('experiment/') ? 'Experiment' : 'Prototype'}
              </span>
            )}
            <span className="playground-header__title">{entry.title}</span>
            {entry.owner && <span className="playground-header__owner">· {entry.owner}</span>}
          </div>
        )}
      </div>
    </header>
  )
}

PlaygroundHeader.displayName = 'PlaygroundHeader'
