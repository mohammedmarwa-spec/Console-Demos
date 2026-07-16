'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getEntryById } from '../../registry'
import { getPrototypeScenarioOrNull } from '../../content/prototype-scenarios'
import { ROUTES } from '../../lib/navigation'
import {
  isExperimentRoute,
  useExperimentRouteMeta,
} from '../../lib/experiments/useExperimentRouteMeta'
import { useScenario } from '../../scenarios'
import { AppearanceSwitcher } from '../AppearanceSwitcher'
import './playground-header.css'

export function PlaygroundHeader() {
  const pathname = usePathname()
  const experimentMeta = useExperimentRouteMeta()
  const onExperimentRoute = isExperimentRoute(pathname)
  const { activeScenarioId } = useScenario()
  const entry = !onExperimentRoute && activeScenarioId ? getEntryById(activeScenarioId) : null
  const prototype =
    !onExperimentRoute && activeScenarioId && !entry
      ? getPrototypeScenarioOrNull(activeScenarioId)
      : null
  const title = experimentMeta?.title ?? entry?.title ?? prototype?.title
  const owner = experimentMeta?.owner ?? entry?.owner ?? prototype?.owner

  return (
    <header className="playground-header">
      <div className="playground-header__inner">
        <div className="playground-header__start">
          <Link href={ROUTES.hub} className="playground-header__back">
            ← Back
          </Link>
          {title && (
            <div className="playground-header__meta">
              <span className="playground-header__title">{title}</span>
              {owner && <span className="playground-header__owner">· {owner}</span>}
            </div>
          )}
        </div>

        <AppearanceSwitcher />
      </div>
    </header>
  )
}

PlaygroundHeader.displayName = 'PlaygroundHeader'
