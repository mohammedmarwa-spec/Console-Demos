'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { onlineStoreProd, type OnlineStoreProdFixture } from './fixtures/onlineStoreProd'

export type Scope = 'low-hanging' | 'full-design'

export type GroupBy = 'system' | 'service-type' | 'none'

type ScopeContextValue = {
  scope: Scope
  setScope: (scope: Scope) => void
  groupBy: GroupBy
  setGroupBy: (groupBy: GroupBy) => void
  fixture: OnlineStoreProdFixture
}

const ScopeContext = createContext<ScopeContextValue | null>(null)

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<Scope>('low-hanging')
  const [groupBy, setGroupBy] = useState<GroupBy>('system')
  const value = useMemo(
    () => ({ scope, setScope, groupBy, setGroupBy, fixture: onlineStoreProd }),
    [scope, groupBy],
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
