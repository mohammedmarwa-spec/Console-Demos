'use client'

import { Box, Drawer, Link, Section, Typography } from '@aivenio/aquarium'
import type { AquariumComponentEntry, ComponentManifest } from '@/lib/experiments/types'
import { resolveAquariumStorybookUrl } from '@/lib/experiments/aquariumStorybookLinks'
import './component-map-drawer.css'

export type ComponentMapDrawerProps = {
  open: boolean
  onClose: () => void
  manifest: ComponentManifest
}

const listStyle = {
  margin: 0,
  paddingInlineStart: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const

function AquariumBullet({ entry }: { entry: AquariumComponentEntry }) {
  const docsUrl = resolveAquariumStorybookUrl(entry.name, entry.storybookUrl)
  const usageSuffix = entry.usage ? ` — ${entry.usage}` : ''

  return (
    <li>
      <Typography.Small>
        {docsUrl ? (
          <>
            <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
              {entry.name}
            </Link>
            {usageSuffix}
          </>
        ) : (
          <>
            <strong>{entry.name}</strong>
            {usageSuffix}
            <span style={{ color: 'var(--aquarium-text-color-muted)' }}> (docs unavailable)</span>
          </>
        )}
      </Typography.Small>
    </li>
  )
}

export function ComponentMapDrawer({ open, onClose, manifest }: ComponentMapDrawerProps) {
  const { aquariumComponents, prototypeComponents, notes = [] } = manifest

  return (
    <Drawer open={open} onClose={onClose} title="Component map" size="md">
      <Box
        className="component-map-drawer"
        style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}
      >
        <Section title="Aquarium components">
          {aquariumComponents.length === 0 ? (
            <Typography.Small color="muted">None listed.</Typography.Small>
          ) : (
            <ul style={listStyle}>
              {aquariumComponents.map((entry) => (
                <AquariumBullet key={entry.name} entry={entry} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Prototype components">
          {prototypeComponents.length === 0 ? (
            <Typography.Small color="muted">None listed.</Typography.Small>
          ) : (
            <ul style={listStyle}>
              {prototypeComponents.map((entry) => (
                <li key={entry.name}>
                  <Typography.Small>
                    <strong>{entry.name}</strong>
                    {entry.reason ? ` — ${entry.reason}` : ''}
                  </Typography.Small>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Notes">
          {notes.length === 0 ? (
            <Typography.Small color="muted">None listed.</Typography.Small>
          ) : (
            <ul style={listStyle}>
              {notes.map((note) => (
                <li key={note}>
                  <Typography.Small>{note}</Typography.Small>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Box>
    </Drawer>
  )
}

ComponentMapDrawer.displayName = 'ComponentMapDrawer'
