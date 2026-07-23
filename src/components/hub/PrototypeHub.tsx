'use client'

import { useMemo, useState } from 'react'
import { Box, Input, Select, Tabs, Typography } from '@aivenio/aquarium'
import type { DiscoveredPage } from '@/lib/experiments/types'
import { HubHeader } from './HubHeader'
import { DesignerAvatar } from './DesignerAvatar'
import { PrototypeCard } from './PrototypeCard'
import { aquariumSelectValue } from '../../lib/aquariumSelect'
import { getOwnerDisplayName, listOwnerSlugs } from '../../lib/designTeamOwners'

type TabId = 'experiments' | 'templates'

const TABS: { id: TabId; label: string }[] = [
  { id: 'experiments', label: 'Experiments' },
  { id: 'templates', label: 'Templates' },
]

const ALL_OWNERS_VALUE = 'all'

function matchesSearch(entry: DiscoveredPage, q: string): boolean {
  const haystack = [entry.title, entry.description].join(' ').toLowerCase()
  return haystack.includes(q)
}

export type PrototypeHubProps = {
  experiments: DiscoveredPage[]
  templates: DiscoveredPage[]
}

export function PrototypeHub({ experiments, templates }: PrototypeHubProps) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabId>('experiments')
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS_VALUE)

  const query = search.trim().toLowerCase()

  const ownerOptions = useMemo(() => {
    return [
      { label: 'All owners', value: ALL_OWNERS_VALUE },
      ...listOwnerSlugs().map((slug) => ({ label: getOwnerDisplayName(slug), value: slug })),
    ]
  }, [])

  const filteredExperimentGroups = useMemo(() => {
    const byOwner = new Map<string, DiscoveredPage[]>()

    for (const entry of experiments) {
      if (query && !matchesSearch(entry, query)) continue
      if (ownerFilter !== ALL_OWNERS_VALUE && entry.ownerSlug !== ownerFilter) continue

      const entries = byOwner.get(entry.ownerSlug ?? '') ?? []
      entries.push(entry)
      byOwner.set(entry.ownerSlug ?? '', entries)
    }

    return [...byOwner.entries()]
      .sort(([a], [b]) => getOwnerDisplayName(a).localeCompare(getOwnerDisplayName(b)))
      .map(([ownerSlug, entries]) => ({
        ownerSlug,
        entries: [...entries].sort((a, b) => {
          const aTime = a.updatedAt ? Date.parse(a.updatedAt) : NaN
          const bTime = b.updatedAt ? Date.parse(b.updatedAt) : NaN
          const aValid = Number.isFinite(aTime)
          const bValid = Number.isFinite(bTime)
          if (aValid && bValid && aTime !== bTime) return bTime - aTime
          if (aValid !== bValid) return aValid ? -1 : 1
          return a.slug.localeCompare(b.slug)
        }),
      }))
  }, [experiments, query, ownerFilter])

  const filteredTemplates = useMemo(() => {
    return templates.filter((entry) => !query || matchesSearch(entry, query))
  }, [templates, query])

  const totalVisible =
    tab === 'experiments'
      ? filteredExperimentGroups.reduce((sum, group) => sum + group.entries.length, 0)
      : filteredTemplates.length

  return (
    <Box style={{ minHeight: '100vh' }}>
      <HubHeader>
        <Box style={{ maxWidth: 560 }}>
          <Typography.Default color="muted">
            Shared design playground for Aiven product designers. Pick an experiment or template to launch the
            Console-like shell with mock data.
          </Typography.Default>
        </Box>
      </HubHeader>

      <Box
        style={{
          padding: '32px 24px 48px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Box style={{ marginBottom: 24 }}>
          <Tabs value={tab} onChange={(value) => setTab(value as TabId)}>
            {TABS.map((t) => (
              <Tabs.Tab key={t.id} title={t.label} value={t.id} />
            ))}
          </Tabs>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns:
              tab === 'experiments' ? 'repeat(auto-fit, minmax(240px, 1fr))' : 'minmax(240px, 1fr)',
            gap: 16,
            marginBottom: 32,
            alignItems: 'end',
          }}
        >
          <Input
            labelText="Search"
            placeholder={tab === 'experiments' ? 'Search experiments…' : 'Search templates…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
          />
          {tab === 'experiments' && (
            <Select
              labelText="Owner"
              options={ownerOptions}
              value={ownerFilter}
              onChange={(selected) => setOwnerFilter(aquariumSelectValue(selected, ALL_OWNERS_VALUE))}
            />
          )}
        </Box>

        {tab === 'experiments' &&
          filteredExperimentGroups.map(({ ownerSlug, entries }) => (
            <Box key={ownerSlug} style={{ marginBottom: 40 }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <DesignerAvatar ownerSlug={ownerSlug} size={48} />
                <Typography.Subheading color="intense">
                  {getOwnerDisplayName(ownerSlug)}
                </Typography.Subheading>
              </Box>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 24,
                }}
              >
                {entries.map((entry) => (
                  <PrototypeCard key={entry.id} entry={entry} />
                ))}
              </Box>
            </Box>
          ))}

        {tab === 'templates' && (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {filteredTemplates.map((entry) => (
              <PrototypeCard key={entry.id} entry={entry} />
            ))}
          </Box>
        )}

        {totalVisible === 0 && (
          <Box style={{ padding: 48, textAlign: 'center' }}>
            <Typography.Default color="muted">No {tab} match your search.</Typography.Default>
          </Box>
        )}
      </Box>
    </Box>
  )
}

PrototypeHub.displayName = 'PrototypeHub'
