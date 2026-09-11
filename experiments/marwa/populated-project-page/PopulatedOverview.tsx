'use client'

import {
  Box,
  PageHeader,
  SegmentedControl,
  SegmentedControlGroup,
  Typography,
} from '@aivenio/aquarium'
import { FullDesignBody } from './FullDesignBody'
import { LhfBody } from './LhfBody'
import { useScope, type Scope } from './ScopeContext'

export function ScopeToggle() {
  const { scope, setScope } = useScope()
  return (
    <Box.Flex alignItems="center" gap="3" shrink={0}>
      <Typography.Small color="muted">Scope</Typography.Small>
      <SegmentedControlGroup
        value={scope}
        onChange={(value) => setScope(value as Scope)}
        ariaLabel="Prototype scope"
      >
        <SegmentedControl value="low-hanging">Low-hanging fruit</SegmentedControl>
        <SegmentedControl value="full-design">Full design</SegmentedControl>
      </SegmentedControlGroup>
    </Box.Flex>
  )
}

/** Shared header across both scopes — only the body below changes. */
export function PopulatedOverview() {
  const { fixture, scope } = useScope()

  return (
    <Box.Flex flexDirection="column" gap="6">
      <PageHeader
        title={fixture.project.name}
        subtitle={
          <Typography.Default color="muted">{fixture.project.description}</Typography.Default>
        }
        primaryAction={{ text: 'Create', onClick: () => undefined }}
        secondaryAction={{ text: 'Connect AI editor', onClick: () => undefined }}
      />
      {scope === 'low-hanging' ? <LhfBody fixture={fixture} /> : <FullDesignBody fixture={fixture} />}
    </Box.Flex>
  )
}

PopulatedOverview.displayName = 'PopulatedOverview'
ScopeToggle.displayName = 'ScopeToggle'
