'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const STORAGE_KEY = 'scenario:active'
const URL_PARAM = 'scenario'

function readStoredScenario(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function readScenarioFromUrl(searchParams: URLSearchParams): string | null {
  return searchParams.get(URL_PARAM)
}

function readInitialScenario(searchParams: URLSearchParams): string | null {
  return readScenarioFromUrl(searchParams) ?? readStoredScenario()
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(() =>
    readInitialScenario(searchParams),
  )
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Keep in sync when URL search params change (e.g. back/forward)
  useEffect(() => {
    const fromUrl = readScenarioFromUrl(searchParams)
    if (fromUrl !== null) {
      setActiveScenarioId(fromUrl)
    }
  }, [searchParams])

  const syncScenarioToUrl = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) {
        params.set(URL_PARAM, id)
      } else {
        params.delete(URL_PARAM)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams],
  )

  const setScenario = useCallback(
    (id: string) => {
      setActiveScenarioId(id)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, id)
      }
      syncScenarioToUrl(id)
    },
    [syncScenarioToUrl],
  )

  const resetScenario = useCallback(() => {
    setActiveScenarioId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    syncScenarioToUrl(null)
  }, [syncScenarioToUrl])

  const openPanel = useCallback(() => setIsPanelOpen(true), [])
  const closePanel = useCallback(() => setIsPanelOpen(false), [])
  const togglePanel = useCallback(() => setIsPanelOpen((v) => !v), [])

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
    () => ({
      activeScenarioId,
      isPanelOpen,
      setScenario,
      resetScenario,
      openPanel,
      closePanel,
      togglePanel,
    }),
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
