'use client'

import dynamic from 'next/dynamic'

const PlaygroundShell = dynamic(() => import('./PlaygroundShell'), { ssr: false })

export default function PlaygroundShellLoader({ children }: { children: React.ReactNode }) {
  return <PlaygroundShell>{children}</PlaygroundShell>
}
