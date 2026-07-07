'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Box, Button, Typography } from '@aivenio/aquarium'
import {
  getGroups,
  getEntriesByGroupLabel,
  isArchivedEntry,
  PLAYGROUND_ENTRIES,
  type PlaygroundEntry,
} from '../../registry'
import { PrototypeCard } from './PrototypeCard'
import { ROUTES } from '../../lib/navigation'

type TypeFilter = 'all' | 'reusable' | 'prototype' | 'archived'

function matchesTypeFilter(entry: PlaygroundEntry, filter: TypeFilter): boolean {
  if (filter === 'all') return !isArchivedEntry(entry)
  if (filter === 'reusable') return entry.type === 'reusable-scenario'
  if (filter === 'prototype') return entry.type === 'prototype' || entry.id.startsWith('experiment/')
  if (filter === 'archived') return isArchivedEntry(entry)
  return true
}

function matchesSearch(entry: PlaygroundEntry, q: string): boolean {
  const haystack = [entry.title, entry.description, entry.owner, entry.type, entry.status, ...entry.tags]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

const FILTER_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reusable', label: 'Reusable' },
  { id: 'prototype', label: 'Prototypes' },
  { id: 'archived', label: 'Archived' },
]

export function PrototypeHub() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const groups = useMemo(() => getGroups(), [])
  const query = search.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => {
        const entries = getEntriesByGroupLabel(group).filter(
          (entry) => matchesTypeFilter(entry, typeFilter) && (!query || matchesSearch(entry, query)),
        )
        return { group, entries }
      })
      .filter((g) => g.entries.length > 0)
  }, [groups, typeFilter, query])

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.entries.length, 0)

  return (
    <Box
      style={{
        minHeight: '100vh',
        padding: '32px 24px 48px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <Box>
          <Typography.Heading color="intense">Console Prototype Lab</Typography.Heading>
          <Box style={{ marginTop: 8, maxWidth: 560 }}>
            <Typography.Default color="muted">
              Shared design playground for Aiven product designers. Pick a scenario or experiment to launch the
              Console-like shell with mock data.
            </Typography.Default>
          </Box>
        </Box>
        <Link href={`${ROUTES.consoleServices}?scenario=existing-customer`} style={{ textDecoration: 'none' }}>
          <Button kind="secondary">Open console directly</Button>
        </Link>
      </Box>

      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search prototypes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="scenario-panel__search-input"
          style={{ flex: '1 1 240px', maxWidth: 400 }}
          aria-label="Search prototypes"
        />
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`scenario-panel__filter-chip${typeFilter === opt.id ? ' scenario-panel__filter-chip--active' : ''}`}
              onClick={() => setTypeFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </Box>
      </Box>

      <Box style={{ marginBottom: 24 }}>
        <Typography.Small color="muted">
          {totalVisible} of {PLAYGROUND_ENTRIES.length} entries
        </Typography.Small>
      </Box>

      {filteredGroups.map(({ group, entries }) => (
        <Box key={group} style={{ marginBottom: 40 }}>
          <Box style={{ marginBottom: 16 }}>
            <Typography.Subheading color="intense">{group}</Typography.Subheading>
          </Box>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {entries.map((entry) => (
              <PrototypeCard key={entry.id} entry={entry} />
            ))}
          </Box>
        </Box>
      ))}

      {totalVisible === 0 && (
        <Box style={{ padding: 48, textAlign: 'center' }}>
          <Typography.Default color="muted">No prototypes match your search.</Typography.Default>
        </Box>
      )}
    </Box>
  )
}

PrototypeHub.displayName = 'PrototypeHub'
