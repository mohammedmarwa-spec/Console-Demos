'use client'

import { useCallback } from 'react'
import { Section } from '@aivenio/aquarium'
import { QueryResults } from './QueryResults'
import { DEMO_RESOURCES, formatCount, sourceLabel, type SearchMode } from './ragDemo'
import type { VectorDemo } from './useVectorDemo'

/**
 * The running demo, opened with View demo at the end of setup (or from the sidebar
 * and Overview shortcuts). Results explained is a switch beside the results.
 */
export function VectorDemoPage({ demo }: { demo: VectorDemo }) {
  const { source, plan, setQuery, setMode, setView } = demo

  const handleQueryChange = useCallback(
    (query: string, mode: SearchMode) => {
      setQuery(query)
      setMode(mode)
    },
    [setMode, setQuery],
  )

  if (!source || !plan) return null
  const query = demo.query.trim()

  return (
    <Section
      title="RAG demo"
      subtitle={`${sourceLabel(source)} · ${DEMO_RESOURCES.indexName} · ${formatCount(plan.documents)} ${source.kind === 'upload' ? 'files' : 'documents'} · ${formatCount(plan.chunks)} chunks`}
    >
      <QueryResults
        source={source}
        initialQuery={query || undefined}
        initialMode={demo.mode}
        onQueryChange={handleQueryChange}
        explained={demo.view === 'explained'}
        onExplainedChange={(on) => setView(on ? 'explained' : 'query')}
      />
    </Section>
  )
}

VectorDemoPage.displayName = 'VectorDemoPage'
