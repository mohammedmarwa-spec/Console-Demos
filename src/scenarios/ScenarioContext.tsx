import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'scenario:active'
const URL_PARAM = 'scenario'

function readInitialScenario(): string | null {
  // URL query param takes priority, then localStorage
  const fromUrl = new URLSearchParams(window.location.search).get(URL_PARAM)
  if (fromUrl) return fromUrl
  return localStorage.getItem(STORAGE_KEY)
}

// ─── Public API types ─────────────────────────────────────────────────────────

export type ScenarioContextValue = {
  activeScenarioId: string | null
  isPanelOpen: boolean
  setScenario: (id: string) => void
  resetScenario: () => void
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const ScenarioContext = createContext<ScenarioContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(readInitialScenario)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const setScenario = useCallback((id: string) => {
    setActiveScenarioId(id)
    localStorage.setItem(STORAGE_KEY, id)
    // Sync to URL without adding a history entry
    const url = new URL(window.location.href)
    url.searchParams.set(URL_PARAM, id)
    window.history.replaceState({}, '', url.toString())
  }, [])

  const resetScenario = useCallback(() => {
    setActiveScenarioId(null)
    localStorage.removeItem(STORAGE_KEY)
    const url = new URL(window.location.href)
    url.searchParams.delete(URL_PARAM)
    window.history.replaceState({}, '', url.toString())
  }, [])

  const openPanel = useCallback(() => setIsPanelOpen(true), [])
  const closePanel = useCallback(() => setIsPanelOpen(false), [])
  const togglePanel = useCallback(() => setIsPanelOpen((v) => !v), [])

  // Global keyboard shortcut: Shift+S toggles the panel
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'S' || !e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      setIsPanelOpen((v) => !v)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo<ScenarioContextValue>(
    () => ({ activeScenarioId, isPanelOpen, setScenario, resetScenario, openPanel, closePanel, togglePanel }),
    [activeScenarioId, isPanelOpen, setScenario, resetScenario, openPanel, closePanel, togglePanel],
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within <ScenarioProvider>')
  return ctx
}
