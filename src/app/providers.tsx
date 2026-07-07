'use client'

import { Suspense } from 'react'
import { Context } from '@aivenio/aquarium'
import { ScenarioProvider } from '../scenarios/ScenarioContext'
import { ThemeProvider } from '../theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Context>
      <Suspense fallback={null}>
        <ScenarioProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ScenarioProvider>
      </Suspense>
    </Context>
  )
}
