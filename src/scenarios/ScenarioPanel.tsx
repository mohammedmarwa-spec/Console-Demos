import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getGroups, getScenariosByGroup, type Scenario } from './scenarioConfig'
import { useScenario } from './ScenarioContext'
import './scenario.css'

// ─── Icons (inline SVG to avoid any icon-lib dependency) ─────────────────────

function IconSliders({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
      <circle cx="6" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="2" y1="2" x2="12" y2="12" />
      <line x1="12" y1="2" x2="2" y2="12" />
    </svg>
  )
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3,2 7,5 3,8" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className="scenario-panel__search-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="4" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" />
    </svg>
  )
}

function IconCollapse() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9,3 5,7 9,11" />
      <polyline points="12,3 8,7 12,11" />
    </svg>
  )
}

// ─── ScenarioItem ─────────────────────────────────────────────────────────────

type ScenarioItemProps = {
  scenario: Scenario
  isActive: boolean
  onSelect: (id: string) => void
}

function ScenarioItem({ scenario, isActive, onSelect }: ScenarioItemProps) {
  return (
    <button
      role="option"
      aria-selected={isActive}
      className={`scenario-item${isActive ? ' scenario-item--active' : ''}`}
      onClick={() => onSelect(scenario.id)}
      tabIndex={0}
    >
      <span className="scenario-item__dot" aria-hidden="true" />
      <span className="scenario-item__label">
        {scenario.label}
        {scenario.description && (
          <span className="scenario-item__description">{scenario.description}</span>
        )}
      </span>
      {isActive && <span className="scenario-item__active-pill">Active</span>}
    </button>
  )
}

// ─── ScenarioGroup ────────────────────────────────────────────────────────────

type ScenarioGroupProps = {
  group: string
  scenarios: Scenario[]
  activeScenarioId: string | null
  onSelect: (id: string) => void
}

function ScenarioGroup({ group, scenarios, activeScenarioId, onSelect }: ScenarioGroupProps) {
  const hasActive = scenarios.some((s) => s.id === activeScenarioId)
  const [isOpen, setIsOpen] = useState(true)

  // Auto-expand the group that contains the active scenario
  useEffect(() => {
    if (hasActive) setIsOpen(true)
  }, [hasActive])

  return (
    <div className="scenario-group">
      <button
        className="scenario-group__toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <IconChevron className={`scenario-group__chevron${isOpen ? ' scenario-group__chevron--open' : ''}`} />
        {group}
      </button>

      {isOpen && (
        <div className="scenario-group__items" role="listbox" aria-label={group}>
          {scenarios.map((s) => (
            <ScenarioItem
              key={s.id}
              scenario={s}
              isActive={s.id === activeScenarioId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ScenarioPanel ────────────────────────────────────────────────────────────

export function ScenarioPanel() {
  const { activeScenarioId, isPanelOpen, setScenario, resetScenario, closePanel } = useScenario()
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const groups = useMemo(() => getGroups(), [])

  // Filter scenarios by search query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups.map((g) => ({ group: g, scenarios: getScenariosByGroup(g) }))
    const q = query.toLowerCase()
    return groups
      .map((g) => ({
        group: g,
        scenarios: getScenariosByGroup(g).filter(
          (s) => s.label.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.scenarios.length > 0)
  }, [groups, query])

  const hasResults = filteredGroups.length > 0

  // Focus the search input when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [isPanelOpen])

  // Escape closes the panel
  useEffect(() => {
    if (!isPanelOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closePanel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPanelOpen, closePanel])

  // Click-outside closes the panel (badge serves as the collapsed state)
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    },
    [closePanel],
  )

  function handleSelect(id: string) {
    setScenario(id)
    // Keep panel open so user can switch; easy to change here if preferred
  }

  return (
    <>
      {/* Transparent overlay to capture click-outside */}
      {isPanelOpen && (
        <div
          className="scenario-overlay"
          aria-hidden="true"
          onClick={handleOverlayClick}
        />
      )}

      <div
        ref={panelRef}
        className={`scenario-panel${isPanelOpen ? ' scenario-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Scenario Control Panel"
      >
        {/* ── Header ── */}
        <div className="scenario-panel__header">
          <div className="scenario-panel__title-row">
            <IconSliders className="scenario-panel__icon" />
            <span className="scenario-panel__title">Scenarios</span>
            <span className="scenario-panel__label">Prototype</span>
          </div>
          <div className="scenario-panel__header-actions">
            <button
              className="scenario-panel__collapse-btn"
              onClick={closePanel}
              aria-label="Collapse scenario panel"
            >
              <IconCollapse />
            </button>
            <button
              ref={closeButtonRef}
              className="scenario-panel__close"
              onClick={closePanel}
              aria-label="Close scenario panel"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="scenario-panel__search-wrap">
          <IconSearch />
          <input
            ref={searchRef}
            className="scenario-panel__search"
            type="search"
            placeholder="Filter scenarios…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                closePanel()
              }
            }}
            aria-label="Filter scenarios"
          />
        </div>

        {/* ── Body ── */}
        <div className="scenario-panel__body">
          {hasResults ? (
            filteredGroups.map(({ group, scenarios }) => (
              <ScenarioGroup
                key={group}
                group={group}
                scenarios={scenarios}
                activeScenarioId={activeScenarioId}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <p className="scenario-panel__empty">
              No scenarios match <em>"{query}"</em>
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="scenario-panel__footer">
          <button
            className={`scenario-panel__reset${activeScenarioId ? ' scenario-panel__reset--has-active' : ''}`}
            onClick={resetScenario}
            disabled={!activeScenarioId}
            aria-label="Reset active scenario to default state"
          >
            Reset scenario
          </button>
          <span className="scenario-panel__kbd-hint">
            <kbd className="scenario-panel__kbd">Esc</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </>
  )
}
