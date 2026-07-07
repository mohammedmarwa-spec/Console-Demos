import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme, type ThemePreference } from '../theme'
import {
  getEntryById,
  getGroups,
  getEntriesByGroupLabel,
  isArchivedEntry,
  type PlaygroundEntry,
} from '../registry'
import { ScenarioBadges } from '../components/playground/ScenarioBadges'
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

type TypeFilter = 'all' | 'reusable' | 'prototype' | 'archived'

function matchesTypeFilter(entry: PlaygroundEntry, filter: TypeFilter): boolean {
  if (filter === 'all') return !isArchivedEntry(entry)
  if (filter === 'reusable') return entry.type === 'reusable-scenario'
  if (filter === 'prototype') return entry.type === 'prototype' || entry.id.startsWith('experiment/')
  if (filter === 'archived') return isArchivedEntry(entry)
  return true
}

function matchesSearch(entry: PlaygroundEntry, q: string): boolean {
  const haystack = [
    entry.title,
    entry.description,
    entry.owner,
    entry.type,
    entry.status,
    ...entry.tags,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function buildExperimentPrompt(entry: PlaygroundEntry): string {
  const sourceId = entry.reusable ? entry.id : entry.sourceScenarioId ?? entry.runtimeKey
  return `Use the existing "${entry.title}" scenario as the base.

Create a new experiment for me under my owner folder.

Goal:
[Describe what you want to test]

Rules:
- Do not edit the original reusable scenario.
- Modify only my new experiment folder under src/experiments/<your-name>/<experiment-name>/.
- Reuse existing mock data from src/mocks/.
- Keep existing price calculation logic.
- Keep the Console-like shell.
- Add or update prototype metadata in prototype.config.ts.
- Add a short notes.md explaining what changed.

Source scenario id: ${sourceId}`
}

// ─── ScenarioItem ─────────────────────────────────────────────────────────────

type ScenarioItemProps = {
  entry: PlaygroundEntry
  isActive: boolean
  onSelect: (id: string) => void
}

function ScenarioItem({ entry, isActive, onSelect }: ScenarioItemProps) {
  return (
    <button
      role="option"
      aria-selected={isActive}
      className={`scenario-item${isActive ? ' scenario-item--active' : ''}`}
      onClick={() => onSelect(entry.id)}
      tabIndex={0}
    >
      <span className="scenario-item__dot" aria-hidden="true" />
      <span className="scenario-item__label">
        <span className="scenario-item__title-row">
          <span className="scenario-item__title">{entry.title}</span>
          <ScenarioBadges entry={entry} />
        </span>
        {entry.description && (
          <span className="scenario-item__description">{entry.description}</span>
        )}
        <span className="scenario-item__owner">{entry.owner}</span>
      </span>
      {isActive && <span className="scenario-item__active-pill">Active</span>}
    </button>
  )
}

// ─── ScenarioGroup ────────────────────────────────────────────────────────────

type ScenarioGroupProps = {
  group: string
  entries: PlaygroundEntry[]
  activeScenarioId: string | null
  onSelect: (id: string) => void
}

function ScenarioGroup({ group, entries, activeScenarioId, onSelect }: ScenarioGroupProps) {
  const hasActive = entries.some((e) => e.id === activeScenarioId)
  const [isOpen, setIsOpen] = useState(true)

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
          {entries.map((e) => (
            <ScenarioItem
              key={e.id}
              entry={e}
              isActive={e.id === activeScenarioId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ScenarioPanel ────────────────────────────────────────────────────────────

function ThemeOption({
  label,
  value,
  current,
  onSelect,
}: {
  label: string
  value: ThemePreference
  current: ThemePreference
  onSelect: (v: ThemePreference) => void
}) {
  const active = current === value
  return (
    <button
      type="button"
      className={`scenario-panel__theme-btn${active ? ' scenario-panel__theme-btn--active' : ''}`}
      onClick={() => onSelect(value)}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reusable', label: 'Reusable' },
  { id: 'prototype', label: 'Prototypes' },
  { id: 'archived', label: 'Archived' },
]

export function ScenarioPanel() {
  const { preference, setPreference } = useTheme()
  const { activeScenarioId, isPanelOpen, setScenario, resetScenario, closePanel } = useScenario()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const groups = useMemo(() => getGroups(), [])
  const activeEntry = activeScenarioId ? getEntryById(activeScenarioId) : undefined

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groups
      .map((g) => ({
        group: g,
        entries: getEntriesByGroupLabel(g).filter((e) => {
          if (!matchesTypeFilter(e, typeFilter)) return false
          if (q && !matchesSearch(e, q)) return false
          return true
        }),
      }))
      .filter((g) => g.entries.length > 0)
  }, [groups, query, typeFilter])

  const hasResults = filteredGroups.length > 0

  useEffect(() => {
    if (isPanelOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [isPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPanelOpen, closePanel])

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
  }

  async function handleCopyExperimentPrompt() {
    if (!activeEntry) return
    const prompt = buildExperimentPrompt(activeEntry)
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch {
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  const headerLabel =
    activeEntry?.type === 'reusable-scenario'
      ? 'Playground'
      : activeEntry
        ? 'Prototype'
        : 'Prototype'

  return (
    <>
      {isPanelOpen && (
        <div className="scenario-overlay" aria-hidden="true" onClick={handleOverlayClick} />
      )}

      <div
        ref={panelRef}
        className={`scenario-panel${isPanelOpen ? ' scenario-panel--open' : ''}`}
        aria-label="Scenario Control Panel"
        data-react-aria-top-layer="true"
      >
        <div className="scenario-panel__header">
          <div className="scenario-panel__title-row">
            <IconSliders className="scenario-panel__icon" />
            <span className="scenario-panel__title">Scenarios</span>
            <span className="scenario-panel__label">{headerLabel}</span>
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
              className="scenario-panel__close"
              onClick={closePanel}
              aria-label="Close scenario panel"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div className="scenario-panel__filters" role="group" aria-label="Filter by type">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`scenario-panel__filter-chip${typeFilter === f.id ? ' scenario-panel__filter-chip--active' : ''}`}
              onClick={() => setTypeFilter(f.id)}
              aria-pressed={typeFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

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

        <div className="scenario-panel__body">
          {hasResults ? (
            filteredGroups.map(({ group, entries }) => (
              <ScenarioGroup
                key={group}
                group={group}
                entries={entries}
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

        {activeEntry && (
          <div className="scenario-panel__active-detail">
            <p className="scenario-panel__active-title">{activeEntry.title}</p>
            <p className="scenario-panel__active-desc">{activeEntry.description}</p>
            <div className="scenario-panel__active-meta">
              <ScenarioBadges entry={activeEntry} />
              <span className="scenario-panel__active-owner">{activeEntry.owner}</span>
            </div>
            {activeEntry.sourceScenarioId && (
              <p className="scenario-panel__active-source">
                Based on: <code>{activeEntry.sourceScenarioId}</code>
              </p>
            )}
            {activeEntry.reusable && (
              <button
                type="button"
                className="scenario-panel__copy-prompt"
                onClick={handleCopyExperimentPrompt}
              >
                {copyFeedback ?? 'Copy experiment prompt'}
              </button>
            )}
          </div>
        )}

        <div className="scenario-panel__theme">
          <span className="scenario-panel__theme-label" id="scenario-panel-theme-label">
            Appearance
          </span>
          <div
            className="scenario-panel__theme-options"
            role="group"
            aria-labelledby="scenario-panel-theme-label"
          >
            <ThemeOption label="System" value="system" current={preference} onSelect={setPreference} />
            <ThemeOption label="Light" value="light" current={preference} onSelect={setPreference} />
            <ThemeOption label="Dark" value="dark" current={preference} onSelect={setPreference} />
          </div>
        </div>

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
