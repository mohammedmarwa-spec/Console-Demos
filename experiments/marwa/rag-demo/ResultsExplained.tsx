'use client'

import { Accordion, Box, Button, Chip, ChipContainer, StatusChip, Stepper, Typography } from '@aivenio/aquarium'
import {
  RAG_EMBEDDING_MODEL,
  RAG_LLM_MODEL,
  relevanceLabel,
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

const RELEVANCE_WHY =
  'High means strong overlap with the query concept. Medium means a related subsystem or the same incident family. Low means a weak or adjacent match — still retrieved, but not the reason for the answer.'

/**
 * Screen 6 — separate explained view (not an inline toggle).
 */
export function ResultsExplained({
  source,
  query,
  mode,
  onBack,
  onGoToService,
}: {
  source: DemoDataSource
  query: string
  mode: SearchMode
  onBack: () => void
  onGoToService: () => void
}) {
  const bundle = runMockQuery(source, mode, query)
  const modeLabel = mode === 'keyword' ? 'Keyword' : mode === 'hybrid' ? 'Hybrid' : 'Semantic'

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Stepper activeIndex={2}>
        <Stepper.Step>Choose data</Stepper.Step>
        <Stepper.Step>Prepare</Stepper.Step>
        <Stepper.Step>Search</Stepper.Step>
      </Stepper>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography.Heading color="intense">Results explained</Typography.Heading>
        <Typography.Default color="muted">
          Why {modeLabel.toLowerCase()} matched “{query}”, which text mattered, and how High /
          Medium / Low was set.
        </Typography.Default>
        <ChipContainer>
          <Chip dense locked text={RAG_EMBEDDING_MODEL} />
          <Chip dense locked text={RAG_LLM_MODEL} />
        </ChipContainer>
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
        <Typography.DefaultStrong color="intense">How High / Medium / Low was set</Typography.DefaultStrong>
        <Typography.Default>{RELEVANCE_WHY}</Typography.Default>
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
        <Typography.DefaultStrong color="intense">End of the demo</Typography.DefaultStrong>
        <Typography.Small color="muted">
          Go back to the OpenSearch service you created at the start to see Overview, connection
          information, and plan details.
        </Typography.Small>
        <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <Button.Ghost type="button" onClick={onBack}>
            Back to results
          </Button.Ghost>
          <Button type="button" onClick={onGoToService}>
            Back to service details
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

ResultsExplained.displayName = 'ResultsExplained'
