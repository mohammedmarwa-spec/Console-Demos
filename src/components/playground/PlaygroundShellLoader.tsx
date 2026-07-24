'use client'

import dynamic from 'next/dynamic'
import { PlaygroundShellLoading } from './PlaygroundShellLoading'

const PlaygroundShell = dynamic(() => import('./PlaygroundShell'), {
  ssr: false,
  loading: () => <PlaygroundShellLoading />,
})

export default function PlaygroundShellLoader({ children }: { children: React.ReactNode }) {
  return <PlaygroundShell>{children}</PlaygroundShell>
}
