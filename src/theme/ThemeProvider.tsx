import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'design-police-playground:aquarium-appearance'

export type ThemePreference = 'light' | 'dark' | 'system'

export type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'dark'
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* private mode or blocked storage */
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('dark')
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  const resolved: ResolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    setPreferenceState(readStoredPreference())
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') root.classList.add('aquarium-theme-dark')
    else root.classList.remove('aquarium-theme-dark')
  }, [resolved])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/** Resolved theme; falls back to `html.aquarium-theme-dark` when outside ThemeProvider (e.g. tests). */
export function useResolvedTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext)
  if (ctx) return ctx.resolved
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('aquarium-theme-dark') ? 'dark' : 'light'
}
