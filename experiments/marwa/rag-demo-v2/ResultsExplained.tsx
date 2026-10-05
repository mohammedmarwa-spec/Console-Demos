'use client'

import { Accordion, Box, StatusChip, Typography } from '@aivenio/aquarium'
import {
  formatScore,
  relevanceStatus,
  runMockQuery,
  type DemoDataSource,
  type SearchMode,
} from './ragDemo'

const MODE_WHY: Record<SearchMode, string> = {
  keyword:
    'Keyword mode matches the words you typed. It ranks documents that contain those terms, even when the surrounding meaning is different.',
  semantic:
    'Semantic mode embeds the query and each chunk, then ranks by meaning. “System bottlenecks” can retrieve connection-pool exhaustion even if those words never appear together.',
  hybrid:
    'Hybrid mode blends both. Exact terms keep lexical hits near the top, while the embedding still promotes conceptually related incidents.',
}

const SCORE_WHY: Record<SearchMode, string> = {
  keyword:
    'The score is the BM25 keyword score, normalized to 0–1 across the results. Higher means the query terms appear more often and in shorter passages.',
  semantic:
    'The score is the vector similarity between the query embedding and each chunk embedding, from 0 to 1. Above 0.80 is a strong match in meaning; below 0.60 is an adjacent topic.',
  hybrid:
    'The score combines the normalized keyword and vector scores, from 0 to 1. A chunk ranks high when it matches both the words and the meaning.',
}

/**
 * Demo page, Results explained tab — for the latest search on the Search tab.
 */
export function ResultsExplained({
  source,
  query,
  mode,
}: {
  source: DemoDataSource
  query: string
  mode: SearchMode
}) {
  const bundle = runMockQuery(source, mode, query)
  const modeLabel = mode === 'keyword' ? 'Keyword' : mode === 'hybrid' ? 'Hybrid' : 'Semantic'

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Typography.Small color="muted">
        Why {modeLabel.toLowerCase()} search matched “{query}”, which text mattered, and how each score was calculated.
      </Typography.Small>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          borderRadius: 'var(--aquarium-border-radius-default)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          border: '1px solid var(--aquarium-border-color-muted)',
        }}
      >
        <Typography.DefaultStrong color="intense">Why this mode matched</Typography.DefaultStrong>
        <Typography.Default>{MODE_WHY[mode]}</Typography.Default>
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          borderRadius: 'var(--aquarium-border-radius-default)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
          border: '1px solid var(--aquarium-border-color-muted)',
        }}
      >
        <Typography.DefaultStrong color="intense">How the score was calculated</Typography.DefaultStrong>
        <Typography.Default>{SCORE_WHY[mode]}</Typography.Default>
      </Box>

      <Typography.SmallStrong color="intense">Which text mattered</Typography.SmallStrong>

      <Box
        style={{
          border: '1px solid var(--aquarium-border-color-muted)',
          borderRadius: 'var(--aquarium-border-radius-default)',
        }}
      >
        {bundle.sources.map((item, index) => (
          <Accordion key={item.id} openPanelId={index === 0 ? item.id : undefined}>
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
                  <Typography.SmallStrong color="intense">Matched text</Typography.SmallStrong>
                  <Typography.Default>{item.matchedText}</Typography.Default>
                  <Typography.SmallStrong color="intense">Chunk</Typography.SmallStrong>
                  <Typography.Default>{item.chunk}</Typography.Default>
                </Box>
              </Accordion.Panel>
            </Accordion.Container>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}

ResultsExplained.displayName = 'ResultsExplained'
