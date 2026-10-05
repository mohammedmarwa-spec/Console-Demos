'use client'

import { Alert, Box } from '@aivenio/aquarium'

/**
 * Screen 1 — OpenSearch create form callout.
 * Announces the pre-configured vector search demo. Non-interactive: the demo
 * is auto-included for Free/Developer OpenSearch and is launched later from
 * the Overview card once the service is running.
 * Renders after Service tier, before Cloud.
 */
export function OpenSearchDemoCallout() {
  return (
    <Box>
      <Alert type="information" title="Includes vector search demo">
        Free and Developer OpenSearch services come with a pre-configured vector search demo —
        embedding and LLM models are already chosen. The demo appears on the service Overview as
        soon as the service is running.
      </Alert>
    </Box>
  )
}

OpenSearchDemoCallout.displayName = 'OpenSearchDemoCallout'
