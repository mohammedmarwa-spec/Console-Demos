'use client'

import { useCallback } from 'react'
import { Box, Section, Tabs } from '@aivenio/aquarium'
import { QueryResults } from './QueryResults'
import { ResultsExplained } from './ResultsExplained'
import { DEMO_RESOURCES, defaultQueryFor, formatCount, sourceLabel, type SearchMode } from './ragDemo'
import type { VectorDemo } from './useVectorDemo'
import styles from './VectorDemoPage.module.css'

/**
 * The running demo, opened with View demo at the end of setup (or from the sidebar
 * and Overview shortcuts). Search and Results explained are peer tabs.
 */
export function VectorDemoPage({ demo, onStop }: { demo: VectorDemo; onStop: () => void }) {
  const { source, plan, setQuery, setMode, setView } = demo

  const handleQueryChange = useCallback(
    (query: string, mode: SearchMode) => {
      setQuery(query)
      setMode(mode)
    },
    [setMode, setQuery],
  )

  if (!source || !plan) return null
  const query = demo.query || defaultQueryFor(source)

  return (
    <Section
      title="Vector search demo"
      subtitle={`${sourceLabel(source)} · ${DEMO_RESOURCES.indexName} · ${formatCount(plan.documents)} ${source.kind === 'upload' ? 'files' : 'documents'} · ${formatCount(plan.chunks)} chunks`}
      actions={{ text: 'Stop demo', onClick: onStop }}
    >
      <Box className={styles.demoTabs}>
        <Tabs value={demo.view} onChange={(value) => setView(value === 'explained' ? 'explained' : 'query')}>
        <Tabs.Tab title="Search your data" value="query">
          <Box paddingTop="6">
            <QueryResults
              source={source}
              initialQuery={query}
              initialMode={demo.mode}
              onQueryChange={handleQueryChange}
              onExplain={(nextQuery, nextMode) => {
                handleQueryChange(nextQuery, nextMode)
                setView('explained')
              }}
            />
          </Box>
        </Tabs.Tab>
        <Tabs.Tab title="Results explained" value="explained">
          <Box paddingTop="6">
            <ResultsExplained source={source} query={query} mode={demo.mode} />
          </Box>
        </Tabs.Tab>
        </Tabs>
      </Box>
    </Section>
  )
}

VectorDemoPage.displayName = 'VectorDemoPage'
