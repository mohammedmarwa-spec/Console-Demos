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
  setScenario: (id: string) => void
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

  const value = useMemo<ScenarioContextValue>(
    () => ({
      activeScenarioId,
      setScenario,
    }),
    [activeScenarioId, setScenario],
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within <ScenarioProvider>')
  return ctx
}
