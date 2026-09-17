'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { onlineStoreProd, type OnlineStoreProdFixture } from './fixtures/onlineStoreProd'

export type Scope = 'low-hanging' | 'full-design'

type ScopeContextValue = {
  scope: Scope
  setScope: (scope: Scope) => void
  fixture: OnlineStoreProdFixture
}

const ScopeContext = createContext<ScopeContextValue | null>(null)

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<Scope>('low-hanging')
  const value = useMemo(
    () => ({ scope, setScope, fixture: onlineStoreProd }),
    [scope],
  )
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
}

export function useScope(): ScopeContextValue {
  const ctx = useContext(ScopeContext)
  if (!ctx) {
    throw new Error('useScope must be used within ScopeProvider')
  }
  return ctx
}

ScopeProvider.displayName = 'ScopeProvider'
