'use client'

import { useMemo, useState } from 'react'
import { Box, ChoiceChip, ChoiceChipGroup, Input, Tabs, Typography } from '@aivenio/aquarium'
import type { DiscoveredPage } from '@/lib/experiments/types'
import {
  HUB_AREA_FILTERS,
  isHubAreaFilterId,
  matchesHubAreaFilter,
  type HubAreaFilterId,
} from '@/lib/experiments/hubAreaFilters'
import { HubHeader } from './HubHeader'
import { DesignerAvatar } from './DesignerAvatar'
import { ALL_DESIGNERS_VALUE, DesignerFilter } from './DesignerFilter'
import { PrototypeCard } from './PrototypeCard'
import { getOwnerDisplayName } from '../../lib/designTeamOwners'
import styles from './PrototypeHub.module.css'

type TabId = 'experiments' | 'templates'

const DEFAULT_AREA_FILTER: HubAreaFilterId = 'all'

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
  const [ownerFilter, setOwnerFilter] = useState(ALL_DESIGNERS_VALUE)
  const [areaFilter, setAreaFilter] = useState<HubAreaFilterId>(DEFAULT_AREA_FILTER)

  const query = search.trim().toLowerCase()

  const filteredExperimentGroups = useMemo(() => {
    const byOwner = new Map<string, DiscoveredPage[]>()

    for (const entry of experiments) {
      if (query && !matchesSearch(entry, query)) continue
      if (ownerFilter !== ALL_DESIGNERS_VALUE && entry.ownerSlug !== ownerFilter) continue
      if (!matchesHubAreaFilter(entry, areaFilter)) continue

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
  }, [experiments, query, ownerFilter, areaFilter])

  const filteredTemplates = useMemo(() => {
    return templates.filter((entry) => !query || matchesSearch(entry, query))
  }, [templates, query])

  const totalExperiments = filteredExperimentGroups.reduce((sum, group) => sum + group.entries.length, 0)

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
        {/* Content lives in Tabs.Tab so Aquarium's TabContainer py-6 (24px) is the tabs→content gap. */}
        <Tabs value={tab} onChange={(value) => setTab(value as TabId)}>
          <Tabs.Tab title="Experiments" value="experiments" badge={totalExperiments}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Box className={styles.filterRow}>
                <Input
                  labelText="Search"
                  placeholder="Search experiments…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search"
                  reserveSpaceForError={false}
                />
                <DesignerFilter value={ownerFilter} onChange={setOwnerFilter} />
              </Box>

              <ChoiceChipGroup
                name="hub-area-filters"
                selectionMode="radio"
                dense
                value={areaFilter}
                onChange={(value) => {
                  const id = String(value || DEFAULT_AREA_FILTER)
                  setAreaFilter(isHubAreaFilterId(id) ? id : DEFAULT_AREA_FILTER)
                }}
                aria-label="Filter by console area"
              >
                {HUB_AREA_FILTERS.map((filter) => (
                  <ChoiceChip key={filter.id} value={filter.id} dense>
                    {filter.label}
                  </ChoiceChip>
                ))}
              </ChoiceChipGroup>
            </Box>

            <Box style={{ marginTop: 40 }}>
              {filteredExperimentGroups.map(({ ownerSlug, entries }) => (
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

              {totalExperiments === 0 && (
                <Box style={{ padding: 48, textAlign: 'center' }}>
                  <Typography.Default color="muted">No experiments match your search.</Typography.Default>
                </Box>
              )}
            </Box>
          </Tabs.Tab>

          <Tabs.Tab title="Templates" value="templates" badge={filteredTemplates.length}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Input
                labelText="Search"
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search"
                reserveSpaceForError={false}
              />

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

              {filteredTemplates.length === 0 && (
                <Box style={{ padding: 48, textAlign: 'center' }}>
                  <Typography.Default color="muted">No templates match your search.</Typography.Default>
                </Box>
              )}
            </Box>
          </Tabs.Tab>
        </Tabs>
      </Box>
    </Box>
  )
}

PrototypeHub.displayName = 'PrototypeHub'
