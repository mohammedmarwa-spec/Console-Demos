'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Box, Button, Input, Select, Tabs, Typography } from '@aivenio/aquarium'
import {
  isArchivedEntry,
  PLAYGROUND_ENTRIES,
  type PlaygroundEntry,
} from '../../registry'
import { PrototypeCard } from './PrototypeCard'
import { ROUTES } from '../../lib/navigation'
import { ForceResolvedTheme } from '../../theme'
import { aquariumSelectValue } from '../../lib/aquariumSelect'

type TypeFilter = 'all' | 'templates' | 'archived'

function matchesTypeFilter(entry: PlaygroundEntry, filter: TypeFilter): boolean {
  if (filter === 'all') return !isArchivedEntry(entry)
  if (filter === 'templates') return entry.type === 'prototype' || entry.id.startsWith('experiment/')
  if (filter === 'archived') return isArchivedEntry(entry)
  return true
}

function matchesSearch(entry: PlaygroundEntry, q: string): boolean {
  const haystack = [entry.title, entry.description, entry.owner, entry.type, entry.status, ...entry.tags]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'templates', label: 'Templates' },
  { id: 'archived', label: 'Archived' },
]

const ALL_OWNERS_VALUE = 'all'

export function PrototypeHub() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS_VALUE)

  const query = search.trim().toLowerCase()

  const ownerOptions = useMemo(() => {
    const owners = [...new Set(PLAYGROUND_ENTRIES.map((entry) => entry.owner))].sort((a, b) =>
      a.localeCompare(b),
    )
    return [
      { label: 'All owners', value: ALL_OWNERS_VALUE },
      ...owners.map((owner) => ({ label: owner, value: owner })),
    ]
  }, [])

  const filteredOwnerGroups = useMemo(() => {
    const byOwner = new Map<string, PlaygroundEntry[]>()

    for (const entry of PLAYGROUND_ENTRIES) {
      if (!matchesTypeFilter(entry, typeFilter)) continue
      if (query && !matchesSearch(entry, query)) continue
      if (ownerFilter !== ALL_OWNERS_VALUE && entry.owner !== ownerFilter) continue

      const entries = byOwner.get(entry.owner) ?? []
      entries.push(entry)
      byOwner.set(entry.owner, entries)
    }

    return [...byOwner.entries()]
      .sort(([ownerA], [ownerB]) => ownerA.localeCompare(ownerB))
      .map(([owner, entries]) => ({ owner, entries }))
  }, [typeFilter, query, ownerFilter])

  const totalVisible = filteredOwnerGroups.reduce((sum, group) => sum + group.entries.length, 0)

  return (
    <ForceResolvedTheme theme="light">
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

      <Box style={{ marginBottom: 24 }}>
        <Tabs value={typeFilter} onChange={(value) => setTypeFilter(value as TypeFilter)}>
          {TYPE_TABS.map((tab) => (
            <Tabs.Tab key={tab.id} title={tab.label} value={tab.id} />
          ))}
        </Tabs>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 32,
          alignItems: 'end',
        }}
      >
        <Input
          labelText="Search"
          placeholder="Search prototypes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search prototypes"
        />
        <Select
          labelText="Owner"
          options={ownerOptions}
          value={ownerFilter}
          onChange={(selected) =>
            setOwnerFilter(aquariumSelectValue(selected, ALL_OWNERS_VALUE))
          }
        />
      </Box>

      {filteredOwnerGroups.map(({ owner, entries }) => (
        <Box key={owner} style={{ marginBottom: 40 }}>
          <Box style={{ marginBottom: 16 }}>
            <Typography.Subheading color="intense">{owner}</Typography.Subheading>
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
    </ForceResolvedTheme>
  )
}

PrototypeHub.displayName = 'PrototypeHub'
