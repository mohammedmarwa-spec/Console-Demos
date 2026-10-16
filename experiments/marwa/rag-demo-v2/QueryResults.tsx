'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Accordion,
  Box,
  Button,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  Link,
  SearchInput,
  StatusChip,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import { imageSrc } from '@/lib/image'
import searchMarkImg from './assets/search-mark.png'
import { ResultsExplained } from './ResultsExplained'
import {
  RAG_LLM_MODEL,
  SEARCH_MODES,
  examplesFor,
  formatScore,
  relevanceStatus,
  runMockQuery,
  sourceLabel,
  type DemoDataSource,
  type QueryBundle,
  type QuerySource,
  type SearchMode,
} from './ragDemo'

const PANEL = {
  borderRadius: 'var(--aquarium-border-radius-default)',
  border: '1px dashed var(--aquarium-border-color-default)',
} as const

/** Min height that stretches the element from where it starts down to the bottom of the viewport. */
function useFillViewportHeight<T extends HTMLElement>(active: boolean, floor: number) {
  const ref = useRef<T>(null)
  const [minHeight, setMinHeight] = useState(floor)

  useLayoutEffect(() => {
    if (!active) return undefined
    function measure() {
      const el = ref.current
      if (!el) return
      // Outermost ancestor still sized by this element; taller ancestors are stretched by siblings (e.g. the side nav).
      let column: HTMLElement = el
      while (column.parentElement && column.parentElement !== document.body) {
        const parent = column.parentElement
        const style = getComputedStyle(parent)
        const contentBottom =
          parent.getBoundingClientRect().bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth)
        const childBottom = column.getBoundingClientRect().bottom + parseFloat(getComputedStyle(column).marginBottom)
        if (contentBottom > childBottom + 1) break
        column = parent
      }
      const rect = el.getBoundingClientRect()
      const gap = window.innerHeight - column.getBoundingClientRect().bottom - window.scrollY
      setMinHeight(Math.max(floor, rect.height + gap))
    }
    measure()
    let frame = 0
    function onResize() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [active, floor])

  return { ref, minHeight }
}

function SearchSpark({ size = 64 }: { size?: number }) {
  return (
    <img
      src={imageSrc(searchMarkImg)}
      alt=""
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
    />
  )
}

function ExampleQueries({ examples, onPick }: { examples: string[]; onPick: (query: string) => void }) {
  return (
    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {examples.map((example) => (
        <Button.Secondary key={example} dense type="button" onClick={() => onPick(example)}>
          {example}
        </Button.Secondary>
      ))}
    </Box>
  )
}

/** Renders `{sourceId}` markers as numbered citations that open the matching source. */
function CitedAnswer({
  text,
  sources,
  onCite,
}: {
  text: string
  sources: QuerySource[]
  onCite: (id: string) => void
}) {
  return (
    <Typography.Default>
      {text.split(/(\{[^}]+\})/).map((part, index) => {
        const id = part.match(/^\{(.+)\}$/)?.[1]
        if (!id) return part
        const cited = sources.find((item) => item.id === id)
        if (!cited) return null
        return (
          <Link
            key={`${id}-${index}`}
            href={`#rag-source-${id}`}
            aria-label={`Source ${cited.rank}: ${cited.title}`}
            onClick={(event) => {
              event.preventDefault()
              onCite(id)
            }}
          >
            [{cited.rank}]
          </Link>
        )
      })}
    </Typography.Default>
  )
}

/**
 * Demo page search. Opens on a pre-search prompt, then a loading state, then results.
 * Mode change re-runs the latest query. The Results explained switch swaps the source list for the explanation.
 */
export function QueryResults({
  source,
  initialQuery,
  initialMode,
  onQueryChange,
  explained = false,
  onExplainedChange,
}: {
  source: DemoDataSource
  initialQuery?: string
  initialMode?: SearchMode
  onQueryChange?: (query: string, mode: SearchMode) => void
  explained?: boolean
  onExplainedChange?: (explained: boolean) => void
}) {
  const examples = examplesFor(source)
  const label = sourceLabel(source)
  const [mode, setMode] = useState<SearchMode>(initialMode ?? 'semantic')
  const [draft, setDraft] = useState(() => initialQuery?.trim() ?? '')
  const [submitted, setSubmitted] = useState(() => initialQuery?.trim() ?? '')
  const [searching, setSearching] = useState(() => Boolean(initialQuery?.trim()))
  const [bundle, setBundle] = useState<QueryBundle | null>(null)
  const [openSourceId, setOpenSourceId] = useState<string | null>(null)

  const runKey = useMemo(() => `${mode}::${submitted}`, [mode, submitted])
  const showFillPanel = !submitted || searching || !bundle
  const fillPanel = useFillViewportHeight<HTMLDivElement>(showFillPanel, submitted ? 280 : 0)

  useEffect(() => {
    if (!submitted) return undefined
    setSearching(true)
    const timer = window.setTimeout(() => {
      setBundle(runMockQuery(source, mode, submitted))
      setOpenSourceId(null)
      setSearching(false)
      onQueryChange?.(submitted, mode)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [mode, onQueryChange, runKey, source, submitted])

  function openSource(id: string) {
    if (explained) onExplainedChange?.(false)
    setOpenSourceId(id)
    window.requestAnimationFrame(() => {
      document.getElementById(`rag-source-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

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

      <Box
        style={{
          padding: 16,
          borderRadius: 'var(--aquarium-border-radius-default)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
        }}
      >
        <SearchInput
          aria-label="Search"
          placeholder={`Search ${label} by meaning or keywords`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit(draft)
            }
          }}
        />
      </Box>

      {submitted ? (
        <Box.Flex alignItems="center" justifyContent="space-between" gap="4" flexWrap="wrap">
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
          {bundle && !searching ? (
            <Switch
              id="rag-results-explained"
              labelPlacement="left"
              checked={explained}
              onChange={(event) => onExplainedChange?.(event.target.checked)}
            >
              Results explained
            </Switch>
          ) : null}
        </Box.Flex>
      ) : null}

      {!submitted ? (
        <div ref={fillPanel.ref}>
          <Box
            style={{
              ...PANEL,
              minHeight: fillPanel.minHeight,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: 28,
              flexWrap: 'wrap',
            }}
          >
            <SearchSpark />
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 220,
                flex: 1,
              }}
            >
              <Typography.DefaultStrong color="intense">Try searching {label} by meaning</Typography.DefaultStrong>
              <Typography.Small color="muted">
                This demo is loaded with {label}. Ask a question, then compare keyword, semantic, and hybrid results.
              </Typography.Small>
              <ExampleQueries examples={examples} onPick={submit} />
            </Box>
          </Box>
        </div>
      ) : searching || !bundle ? (
        <div ref={fillPanel.ref}>
          <Box
            style={{
              ...PANEL,
              minHeight: fillPanel.minHeight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <SearchSpark size={40} />
            <Typography.Default color="muted">Searching…</Typography.Default>
          </Box>
        </div>
      ) : (
        <>
          <Typography.SmallStrong color="intense">{bundle.modeSummary}</Typography.SmallStrong>

          <Box
            style={{
              padding: 16,
              borderRadius: 'var(--aquarium-border-radius-default)',
              backgroundColor: 'var(--aquarium-background-color-muted)',
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              <Typography.DefaultStrong color="intense">Answer</Typography.DefaultStrong>
              <Chip dense text={RAG_LLM_MODEL} />
            </Box>
            <CitedAnswer text={bundle.answer} sources={bundle.sources} onCite={openSource} />
          </Box>

          {explained ? (
            <ResultsExplained source={source} query={submitted} mode={mode} />
          ) : (
            <Box
              style={{
                border: '1px solid var(--aquarium-border-color-muted)',
                borderRadius: 'var(--aquarium-border-radius-default)',
              }}
            >
              {bundle.sources.map((item) => (
                <div key={item.id} id={`rag-source-${item.id}`}>
                  <Accordion openPanelId={openSourceId === item.id ? item.id : null}>
                    <Accordion.Container panelId={item.id}>
                      <Accordion.Summary
                        title={item.title}
                        description={`#${item.rank} · Score ${formatScore(item.score)}`}
                        toggle={
                          <Accordion.Toggle onChange={(id, isOpen) => setOpenSourceId(isOpen ? null : String(id))} />
                        }
                      />
                      <Accordion.Panel>
                        <Box
                          paddingX="4"
                          paddingBottom="4"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <Box style={{ alignSelf: 'flex-start' }}>
                            <StatusChip
                              dense
                              status={relevanceStatus(item.relevance)}
                              text={`Score ${formatScore(item.score)}`}
                            />
                          </Box>
                          <Typography.Small color="muted">{item.snippet}</Typography.Small>
                          <Typography.Default>{item.chunk}</Typography.Default>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Container>
                  </Accordion>
                </div>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

QueryResults.displayName = 'QueryResults'
