'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Breadcrumbs,
  ChipContainer,
  DataList,
  EmptyState,
  InlineIcon,
  Link,
  PageHeader,
  SearchInput,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn, DataListGroupedRows } from '@aivenio/aquarium'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import officeIcon from '@aivenio/aquarium/icons/office'
import orgUnitIcon from '@aivenio/aquarium/icons/orgUnit'
import tagIcon from '@aivenio/aquarium/icons/tag'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import {
  ORG_HEADER_NAME,
  ORG_NAME,
  ORG_UNITS,
  PROJECTS,
  USER_INITIALS,
  type ProjectRow,
} from './mockData'

export const pageMeta: PageMeta = {
  title: 'Projects',
  description: 'Organization projects list — search by name or tags, grouped by organizational unit.',
}

const TAG_TRUNCATE = 33

type TableRow = ProjectRow & {
  isUnit: boolean
}

function formatTagLabel(tag: ProjectRow['tags'][number]): string {
  return `${tag.key} : ${tag.value}`
}

function truncateTagLabel(label: string): string {
  if (label.length <= TAG_TRUNCATE) return label
  return `${label.slice(0, TAG_TRUNCATE - 1)}…`
}

function matchesQuery(project: ProjectRow, query: string): boolean {
  const haystack = [
    project.name,
    ...project.tags.map((tag) => `${tag.key} ${tag.value} ${tag.key}:${tag.value}`),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export default function Page() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [expandedUnitIds, setExpandedUnitIds] = useState<string[]>([])

  const normalizedQuery = query.trim().toLowerCase()

  const { groupedRows, visibleUnitIds } = useMemo(() => {
    const filteredProjects = PROJECTS.filter((project) =>
      normalizedQuery ? matchesQuery(project, normalizedQuery) : true,
    )

    const topLevel = filteredProjects.filter((project) => !project.unitId)
    const visibleUnits = ORG_UNITS.filter((unit) => {
      const unitNameMatches = normalizedQuery ? unit.name.toLowerCase().includes(normalizedQuery) : true
      const hasProjects = filteredProjects.some((project) => project.unitId === unit.id)
      if (!normalizedQuery) return true
      return unitNameMatches || hasProjects
    })

    const grouped = Object.fromEntries([
      [undefined, topLevel],
      ...visibleUnits.map((unit) => [
        unit.id,
        filteredProjects.filter((project) => project.unitId === unit.id),
      ]),
    ]) as DataListGroupedRows<TableRow>

    return { groupedRows: grouped, visibleUnitIds: visibleUnits.map((unit) => unit.id) }
  }, [normalizedQuery])

  const searchExpandedIds = normalizedQuery ? visibleUnitIds : expandedUnitIds
  const topLevelRows = (groupedRows as Record<string, TableRow[]>)['undefined'] ?? []
  const showEmptySearch =
    Boolean(normalizedQuery) && topLevelRows.length === 0 && visibleUnitIds.length === 0

  const columns: DataListColumn<TableRow>[] = [
    {
      type: 'custom',
      key: 'name',
      headerName: ORG_NAME,
      icon: officeIcon,
      UNSAFE_render: (row) => (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: row.isUnit ? 0 : 28,
          }}
        >
          <InlineIcon
            icon={row.isUnit ? orgUnitIcon : folderCloseIcon}
            width={20}
            height={20}
          />
          {row.isUnit ? (
            <Typography>{row.name}</Typography>
          ) : (
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault()
                if (row.id === 'online-store-prod') {
                  router.push(ROUTES.projectPage)
                }
              }}
            >
              {row.name}
            </Link>
          )}
        </Box>
      ),
    },
    {
      type: 'custom',
      headerName: 'Tags',
      UNSAFE_render: (row) => {
        if (row.isUnit || row.tags.length === 0) return null
        return (
          <ChipContainer dense>
            {row.tags.map((tag) => {
              const fullLabel = formatTagLabel(tag)
              return (
                <StatusChip
                  key={`${row.id}-${tag.key}`}
                  dense
                  icon={tagIcon}
                  text={truncateTagLabel(fullLabel)}
                />
              )
            })}
          </ChipContainer>
        )
      },
    },
  ]

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        minHeight: 0,
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <ConsoleHeader
        activeNav="projects"
        orgName={ORG_HEADER_NAME}
        orgSublabel="Organization"
        userInitials={USER_INITIALS}
        showPrimaryNav={false}
        onHomeClick={() => router.push(ROUTES.homepage)}
        onProjectsClick={() => undefined}
      />

      <Box
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <OrgSidebar
          orgName={ORG_HEADER_NAME}
          activeItem="projects"
          onItemClick={(id) => {
            if (id === 'overview') router.push(ROUTES.homepage)
            if (id === 'data-flow') router.push(ROUTES.dataFlow)
          }}
        />

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            padding: 24,
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
        <PageHeader
          title="Projects"
          subtitle="View all projects you have access to in this organization."
          breadcrumbs={[
            <Breadcrumbs.Crumb
              key="org"
              href="#"
              onClick={(event) => {
                event.preventDefault()
                router.push(ROUTES.homepage)
              }}
            >
              {ORG_NAME}
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="projects">Projects</Breadcrumbs.Crumb>,
          ]}
        />

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or tags"
          aria-label="Search by name or tags"
        />

        {showEmptySearch ? (
          <EmptyState title="No matching projects">Try another name or tag.</EmptyState>
        ) : (
          <DataList
            columns={columns}
            rows={groupedRows}
            sticky={false}
            getGroupRow={(key) => {
              const unit = ORG_UNITS.find((item) => item.id === key)
              return {
                id: key,
                name: unit?.name ?? key,
                tags: [],
                isUnit: true,
              }
            }}
            renderEmptyGroup={() => (
              <Typography color="muted">There are no projects in this organizational unit.</Typography>
            )}
            expandedGroupIds={searchExpandedIds}
            onGroupToggled={(id, open) => {
              const groupId = String(id)
              // DataList forwards Accordion's inverted open flag.
              setExpandedUnitIds((current) => {
                if (!open) return current.includes(groupId) ? current : [...current, groupId]
                return current.filter((item) => item !== groupId)
              })
            }}
          />
        )}
        </Box>
      </Box>
    </Box>
  )
}
