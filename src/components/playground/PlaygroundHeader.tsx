'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getEntryById } from '../../registry'
import { getPrototypeScenarioOrNull } from '../../content/prototype-scenarios'
import { ROUTES } from '../../lib/navigation'
import {
  isExperimentRoute,
  useExperimentRouteMeta,
} from '../../lib/experiments/useExperimentRouteMeta'
import { useExperimentComponentManifest } from '../../lib/experiments/useExperimentComponentManifest'
import { useActiveExperimentPage } from '../../lib/experiments/useActiveExperimentPage'
import { useScenario } from '../../scenarios'
import { AppearanceSwitcher } from '../AppearanceSwitcher'
import { ComponentMapDrawer } from './ComponentMapDrawer'
import { StartInCursorModal } from '../hub/StartInCursorModal'
import { getOwnerDisplayName } from '../../lib/designTeamOwners'
import './playground-header.css'

export function PlaygroundHeader() {
  const pathname = usePathname()
  const experimentMeta = useExperimentRouteMeta()
  const experimentPage = useActiveExperimentPage()
  const componentManifest = useExperimentComponentManifest()
  const onExperimentRoute = isExperimentRoute(pathname)
  const { activeScenarioId } = useScenario()
  const [componentMapOpen, setComponentMapOpen] = useState(false)
  const [cursorModalOpen, setCursorModalOpen] = useState(false)
  const entry = !onExperimentRoute && activeScenarioId ? getEntryById(activeScenarioId) : null
  const prototype =
    !onExperimentRoute && activeScenarioId && !entry
      ? getPrototypeScenarioOrNull(activeScenarioId)
      : null
  const title = experimentMeta?.title ?? experimentPage?.title ?? entry?.title ?? prototype?.title
  const owner =
    experimentMeta?.owner ??
    (experimentPage
      ? experimentPage.kind === 'template'
        ? 'Template'
        : getOwnerDisplayName(experimentPage.ownerSlug ?? '')
      : null) ??
    entry?.owner ??
    prototype?.owner
  const showActionButtons = Boolean(experimentPage || componentManifest)

  function handleStartInCursor() {
    if (!experimentPage) return
    // Always open the modal so templates can pick owner/name (fork) and experiments
    // can review/copy the prompt before launching Cursor.
    setCursorModalOpen(true)
  }

  return (
    <>
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

          <div className="playground-header__actions">
            {showActionButtons && (
              <div className="playground-header__action-group">
                {experimentPage && (
                  <button
                    type="button"
                    className="playground-header__action"
                    onClick={handleStartInCursor}
                  >
                    Start in Cursor
                  </button>
                )}
                {componentManifest && (
                  <button
                    type="button"
                    className="playground-header__action"
                    onClick={() => setComponentMapOpen(true)}
                  >
                    View DS components
                  </button>
                )}
              </div>
            )}
            {showActionButtons && <span className="playground-header__divider" aria-hidden="true" />}
            <AppearanceSwitcher />
          </div>
        </div>
      </header>

      {componentManifest && (
        <ComponentMapDrawer
          open={componentMapOpen}
          onClose={() => setComponentMapOpen(false)}
          manifest={componentManifest}
        />
      )}

      <StartInCursorModal
        entry={experimentPage}
        open={cursorModalOpen}
        onClose={() => setCursorModalOpen(false)}
      />
    </>
  )
}

PlaygroundHeader.displayName = 'PlaygroundHeader'
