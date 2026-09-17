'use client'

import { Box, Chip, ChipContainer, EmptyState, Typography } from '@aivenio/aquarium'
import { RAG_EMBEDDING_MODEL, RAG_LLM_MODEL } from './ragDemo'

/**
 * Screen 2 — demo landing inside the existing OpenSearch service shell.
 * Models are read-only pills. CTA opens Screen 3 (choose data source).
 */
export function VectorSearchDemoLanding({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography.Heading color="intense">Vector search demo</Typography.Heading>
        <Typography.Default color="muted">
          Pre-configured with {RAG_EMBEDDING_MODEL} and {RAG_LLM_MODEL}.
        </Typography.Default>
        <ChipContainer>
          <Chip dense locked text={RAG_EMBEDDING_MODEL} />
          <Chip dense locked text={RAG_LLM_MODEL} />
        </ChipContainer>
      </Box>

      <EmptyState
        title="See vector search in a few minutes"
        fullHeight={false}
        primaryAction={{
          text: 'Choose a data source',
          onClick: () => onGetStarted?.(),
        }}
      >
        This service includes a guided RAG demo. Embedding and LLM models are already chosen — you
        only pick what to search and what to ask. No OpenSearch internals required.
      </EmptyState>
    </Box>
  )
}

VectorSearchDemoLanding.displayName = 'VectorSearchDemoLanding'
