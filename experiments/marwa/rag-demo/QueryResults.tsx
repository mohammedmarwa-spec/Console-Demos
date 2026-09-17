'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  Box,
  Button,
  Chip,
  ChipContainer,
  ChoiceChip,
  ChoiceChipGroup,
  SearchInput,
  StatusChip,
  Stepper,
  Typography,
} from '@aivenio/aquarium'
import {
  RAG_EMBEDDING_MODEL,
  RAG_LLM_MODEL,
  SEARCH_MODES,
  defaultQueryFor,
  examplesFor,
  relevanceLabel,
  relevanceStatus,
  runMockQuery,
  type DemoDataSource,
  type QueryBundle,
  type SearchMode,
} from './ragDemo'

/**
 * Screen 5 — query + results inside the OpenSearch service shell.
 * Mode change re-runs the mock query. Explanation is a separate screen.
 */
export function QueryResults({
  source,
  initialQuery,
  initialMode,
  onExplain,
  onBack,
  onGoToService,
}: {
  source: DemoDataSource
  initialQuery?: string
  initialMode?: SearchMode
  onExplain: (query: string, mode: SearchMode) => void
  onBack: () => void
  onGoToService: () => void
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
    }, 600)
    return () => window.clearTimeout(timer)
  }, [mode, runKey, source, submitted])

  function submit(nextQuery: string) {
    const trimmed = nextQuery.trim()
    if (!trimmed) return
    setDraft(trimmed)
    setSubmitted(trimmed)
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Stepper activeIndex={2}>
        <Stepper.Step>Choose data</Stepper.Step>
        <Stepper.Step>Prepare</Stepper.Step>
        <Stepper.Step>Search</Stepper.Step>
      </Stepper>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Typography.Heading color="intense">Vector search</Typography.Heading>
        <ChipContainer>
          <Chip dense locked text={RAG_EMBEDDING_MODEL} />
          <Chip dense locked text={RAG_LLM_MODEL} />
        </ChipContainer>
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
                    description={`${item.rank} · ${relevanceLabel(item.relevance)} relevance`}
                    toggle={<Accordion.Toggle />}
                  />
                  <Accordion.Panel>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <StatusChip
                        dense
                        status={relevanceStatus(item.relevance)}
                        text={relevanceLabel(item.relevance)}
                      />
                      <Typography.Small color="muted">{item.snippet}</Typography.Small>
                      <Typography.Default>{item.chunk}</Typography.Default>
                    </Box>
                  </Accordion.Panel>
                </Accordion.Container>
              </Accordion>
            ))}
          </Box>

          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 16,
              borderRadius: 'var(--aquarium-border-radius-default)',
              backgroundColor: 'var(--aquarium-background-color-layer)',
              border: '1px solid var(--aquarium-border-color-muted)',
            }}
          >
            <Typography.DefaultStrong color="intense">Done with the demo?</Typography.DefaultStrong>
            <Typography.Small color="muted">
              Return to the OpenSearch service you created — Overview, connection info, and plan
              stay as they were.
            </Typography.Small>
            <Box>
              <Button type="button" onClick={onGoToService}>
                Back to service details
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button.Ghost type="button" onClick={onBack}>
          Choose a different source
        </Button.Ghost>
      </Box>
    </Box>
  )
}

QueryResults.displayName = 'QueryResults'
