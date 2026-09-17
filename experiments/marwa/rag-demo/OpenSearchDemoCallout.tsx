'use client'

import { Alert, Box, Card, Typography } from '@aivenio/aquarium'
import { SEARCH_DEMO_OPTIONS, type SearchDemoOption } from './ragDemo'

/**
 * Screen 1 — Search demo on the OpenSearch create form.
 * Renders after Service tier, before Cloud.
 */
export function OpenSearchDemoCallout({
  value,
  onChange,
}: {
  value: SearchDemoOption
  onChange: (value: SearchDemoOption) => void
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="information" title="Includes vector search demo">
        See the power of OpenSearch in 3 minutes. Free and Developer services can include a
        pre-configured vector search demo — models are already chosen.
      </Alert>

      <Box>
        <Typography.DefaultStrong color="intense">Search demo</Typography.DefaultStrong>
        <Box style={{ marginTop: 8 }}>
          <Typography.Small color="muted">
            You can choose a pre-configured search environment to quickly test your POC.
          </Typography.Small>
        </Box>
      </Box>

      <Card.Group
        name="opensearch-search-demo"
        checked={value}
        onCheckedChange={({ value: next }) => onChange((next as SearchDemoOption) ?? 'vector')}
      >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
            alignItems: 'stretch',
          }}
        >
          {SEARCH_DEMO_OPTIONS.map((option) => (
            <Box key={option.id} style={{ display: 'flex', minWidth: 0 }}>
              <Card
                fullWidth
                checkable
                value={option.id}
                checked={value === option.id}
                title={option.title}
                chips={option.chips}
              >
                <Typography.Small color="muted">{option.description}</Typography.Small>
              </Card>
            </Box>
          ))}
        </Box>
      </Card.Group>
    </Box>
  )
}

OpenSearchDemoCallout.displayName = 'OpenSearchDemoCallout'
