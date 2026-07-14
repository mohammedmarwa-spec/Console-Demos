'use client'

import { PlaygroundHeader } from './PlaygroundHeader'
import { PlaygroundStateProvider } from '../../contexts/PlaygroundStateContext'

/** Client-only console/experiment shell (Aquarium overlays need document). */
export default function PlaygroundShell({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundStateProvider>
      <PlaygroundHeader />
      {children}
    </PlaygroundStateProvider>
  )
}
