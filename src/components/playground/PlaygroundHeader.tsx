'use client'

import Link from 'next/link'
import { getEntryById } from '../../registry'
import { ROUTES } from '../../lib/navigation'
import { useScenario } from '../../scenarios'
import { AppearanceSwitcher } from '../AppearanceSwitcher'
import './playground-header.css'

export function PlaygroundHeader() {
  const { activeScenarioId } = useScenario()
  const entry = activeScenarioId ? getEntryById(activeScenarioId) : null

  return (
    <header className="playground-header">
      <div className="playground-header__inner">
        <div className="playground-header__start">
          <Link href={ROUTES.hub} className="playground-header__back">
            ← Back
          </Link>
          {entry && (
            <div className="playground-header__meta">
              <span className="playground-header__title">{entry.title}</span>
              {entry.owner && <span className="playground-header__owner">· {entry.owner}</span>}
            </div>
          )}
        </div>

        <AppearanceSwitcher />
      </div>
    </header>
  )
}

PlaygroundHeader.displayName = 'PlaygroundHeader'
