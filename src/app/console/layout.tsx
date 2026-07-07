'use client'

import { ScenarioPanel, ScenarioTrigger } from '../../scenarios'
import { PrototypeBanner } from '../../components/playground/PrototypeBanner'
import { PlaygroundStateProvider } from '../../contexts/PlaygroundStateContext'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundStateProvider>
      <ScenarioTrigger />
      <ScenarioPanel />
      <PrototypeBanner />
      {children}
    </PlaygroundStateProvider>
  )
}
