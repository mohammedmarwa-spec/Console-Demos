'use client'

import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader'
import { PlaygroundStateProvider } from '../../contexts/PlaygroundStateContext'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundStateProvider>
      <PlaygroundHeader />
      {children}
    </PlaygroundStateProvider>
  )
}
