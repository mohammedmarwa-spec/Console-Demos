'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  Box,
  Button,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  SearchInput,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import {
  RAG_LLM_MODEL,
  SEARCH_MODES,
  defaultQueryFor,
  examplesFor,
  formatScore,
  relevanceStatus,
  runMockQuery,
  type DemoDataSource,
  type QueryBundle,
  type SearchMode,
} from './ragDemo'

/**
 * Demo page, Search tab — query + results. Mode change re-runs the mock query.
 * `onQueryChange` keeps the Results explained tab on the latest search.
 */
export function QueryResults({
  source,
  initialQuery,
  initialMode,
  onExplain,
  onQueryChange,
}: {
  source: DemoDataSource
  initialQuery?: string
  initialMode?: SearchMode
  onExplain: (query: string, mode: SearchMode) => void
  onQueryChange?: (query: string, mode: SearchMode) => void
}) {
  const examples = examplesFor(source)
  const [mode, setMode] = useState<SearchMode>(initialMode ?? 'semantic')
  const [draft, setDraft] = useState(() => initialQuery?.trim() || defaultQueryFor(source))
  const [submitted, setSubmitted] = useState(() => initialQuery?.trim() || defaultQueryFor(source))
  const [searching, setSearching] = useState(true)
  const [bundle, setBundle] = useState<QueryBundle | null>(null)

  const runKey = useMemo(() => `${mode}::${submitted}`, [mode, submitted])

  useEffect(() => {
    setSearching(true)
    const timer = window.setTimeout(() => {
      setBundle(runMockQuery(source, mode, submitted))
      setSearching(false)
      onQueryChange?.(submitted, mode)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [mode, onQueryChange, runKey, source, submitted])

  function submit(nextQuery: string) {
    const trimmed = nextQuery.trim()
    if (!trimmed) return
    setDraft(trimmed)
    setSubmitted(trimmed)
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Typography.Small color="muted">
        Ask in plain language, then compare Keyword, Semantic, and Hybrid results.
      </Typography.Small>
      <Box>
        <ChoiceChipGroup
          name="rag-search-mode"
          selectionMode="radio"
          dense
          value={mode}
          onChange={(value) => setMode(value as SearchMode)}
        >
          {SEARCH_MODES.map((item) => (
            <ChoiceChip key={item.id} value={item.id} dense>
              {item.label}
            </ChoiceChip>
          ))}
        </ChoiceChipGroup>
      </Box>

      <Box
        style={{
          padding: 16,
          borderRadius: 'var(--aquarium-border-radius-default)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
        }}
      >
        <SearchInput
          aria-label="Search"
          placeholder="Search by meaning or keywords"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit(draft)
            }
          }}
        />
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {examples.map((example) => (
            <Button.Secondary
              key={example}
              dense
              type="button"
              onClick={() => submit(example)}
            >
              {example}
            </Button.Secondary>
          ))}
        </Box>
      </Box>

      {searching || !bundle ? (
        <Box
          style={{
            padding: 40,
            borderRadius: 'var(--aquarium-border-radius-default)',
            border: '1px dashed var(--aquarium-border-color-default)',
            textAlign: 'center',
          }}
        >
          <Typography.Default color="muted">Searching…</Typography.Default>
        </Box>
      ) : (
        <>
          <Box
            style={{
              padding: 16,
              borderRadius: 'var(--aquarium-border-radius-default)',
              backgroundColor: 'var(--aquarium-background-color-primary-muted)',
              border: '1px solid var(--aquarium-border-color-primary-muted)',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <Typography.DefaultStrong color="intense">Answer</Typography.DefaultStrong>
              <Chip dense locked text={RAG_LLM_MODEL} />
            </Box>
            <Typography.Default>{bundle.answer}</Typography.Default>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Typography.SmallStrong color="intense">{bundle.modeSummary}</Typography.SmallStrong>
            <Button.Secondary dense type="button" onClick={() => onExplain(submitted, mode)}>
              See explanation
            </Button.Secondary>
          </Box>

          <Box
            style={{
              border: '1px solid var(--aquarium-border-color-muted)',
              borderRadius: 'var(--aquarium-border-radius-default)',
            }}
          >
            {bundle.sources.map((item) => (
              <Accordion key={item.id}>
                <Accordion.Container panelId={item.id}>
                  <Accordion.Summary
                    title={item.title}
                    description={`#${item.rank} · Score ${formatScore(item.score)}`}
                    toggle={<Accordion.Toggle />}
                  />
                  <Accordion.Panel>
                    <Box paddingX="4" paddingBottom="4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Box style={{ alignSelf: 'flex-start' }}>
                        <StatusChip dense status={relevanceStatus(item.relevance)} text={`Score ${formatScore(item.score)}`} />
                      </Box>
                      <Typography.Small color="muted">{item.snippet}</Typography.Small>
                      <Typography.Default>{item.chunk}</Typography.Default>
                    </Box>
                  </Accordion.Panel>
                </Accordion.Container>
              </Accordion>
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

QueryResults.displayName = 'QueryResults'
