'use client'

import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader'
import { PlaygroundStateProvider } from '../../contexts/PlaygroundStateContext'

/**
 * Experiments render outside /console/*, but reuse the same console shell +
 * mock state so pages can call usePlaygroundState()/ExperimentPageShell.
 */
export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundStateProvider>
      <PlaygroundHeader />
      {children}
    </PlaygroundStateProvider>
  )
}
