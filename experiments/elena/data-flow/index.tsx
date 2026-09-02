'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  DropdownMenu,
  Filter,
  Link,
  PageHeader,
  Switch,
} from '@aivenio/aquarium'
import type { Selection } from '@react-types/shared'
import filterIcon from '@aivenio/aquarium/icons/filter'
import type { PageMeta } from '@/lib/experiments/types'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import {
  ArchitectureContent,
  ProjectPageDataProvider,
  type ArchitectureView,
} from '@experiments/_shared/project-page'
import {
  ORG_HEADER_NAME,
  ORG_NAME,
  PROJECT_OPTIONS,
  USER_INITIALS,
  dataFlowPageData,
} from './mockData'

export const pageMeta: PageMeta = {
  title: 'Data flow',
  description: 'Org Tools — visualize how data flows through services (node canvas).',
}

function formatFilterValue(selected: string[]): string | undefined {
  if (selected.length === 0) return undefined
  if (selected.length === 1) return selected[0]
  return `${selected.length} selected`
}

function selectionToStrings(keys: Selection): string[] {
  if (keys === 'all') return []
  return [...keys].map(String)
}

function MultiSelectFilter({
  labelText,
  options,
  selected,
  onChange,
}: {
  labelText: string
  options: readonly string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const value = formatFilterValue(selected)

  return (
    <DropdownMenu
      placement="bottom-left"
      searchable
      emptyState="No results found"
      selectionMode="multiple"
      selection={new Set(selected)}
      onSelectionChange={(keys) => onChange(selectionToStrings(keys))}
    >
      <DropdownMenu.Trigger>
        <Filter.Trigger
          labelText={labelText}
          icon={filterIcon}
          value={value}
          onClear={selected.length > 0 ? () => onChange([]) : undefined}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {options.map((option) => (
          <DropdownMenu.Item key={option} id={option} closeOnSelect={false}>
            {option}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  )
}

export default function Page() {
  const router = useRouter()
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['dev-sandbox'])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [onlyConnectedServices, setOnlyConnectedServices] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)

  const serviceOptions = useMemo(
    () => dataFlowPageData.services.map((service) => service.serviceName),
    [],
  )

  const canvasData = useMemo(() => {
    const services =
      selectedServices.length === 0
        ? dataFlowPageData.services
        : dataFlowPageData.services.filter((service) =>
            selectedServices.includes(service.serviceName),
          )

    const serviceIds = new Set(services.map((service) => service.id))
    const architectureEdges = dataFlowPageData.architectureEdges.filter(
      (edge) => serviceIds.has(edge.source) && serviceIds.has(edge.target),
    )

    return {
      ...dataFlowPageData,
      services,
      architectureEdges,
    }
  }, [selectedServices])

  const architectureView: ArchitectureView = onlyConnectedServices ? 'integrated' : 'all'

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
        onProjectsClick={() => router.push(ROUTES.projectsPage)}
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
          activeItem="data-flow"
          onItemClick={(id) => {
            if (id === 'overview') router.push(ROUTES.homepage)
            if (id === 'projects') router.push(ROUTES.projectsPage)
            if (id === 'data-flow') return
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
            overflow: 'hidden',
          }}
        >
          <PageHeader
            title="Data flow"
            subtitle="Visualize how data flows through services."
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
              <Breadcrumbs.Crumb key="data-flow">Data flow</Breadcrumbs.Crumb>,
            ]}
          />

          <Alert type="announcement">
            <>
              This feature is in the{' '}
              <Link href="https://aiven.io/docs/platform/concepts/beta_services" target="_blank">
                early availability
              </Link>{' '}
              stage. We&apos;d love to hear your thoughts and suggestions.{' '}
              <Button.Text type="button" onClick={() => undefined}>
                Give feedback
              </Button.Text>
            </>
          </Alert>

          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 16,
                alignItems: 'center',
                flexWrap: 'wrap',
                flex: '1 1 auto',
                minWidth: 0,
              }}
            >
              <MultiSelectFilter
                labelText="Projects"
                options={PROJECT_OPTIONS}
                selected={selectedProjects}
                onChange={setSelectedProjects}
              />
              <MultiSelectFilter
                labelText="Services"
                options={serviceOptions}
                selected={selectedServices}
                onChange={setSelectedServices}
              />
              <Filter.Trigger
                labelText="Filter list"
                icon={filterIcon}
                value={undefined}
                onClick={() => {
                  /* stub — full filter panel later */
                }}
              />
            </Box>

            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 24,
                flexShrink: 0,
                flexWrap: 'wrap',
              }}
            >
              <Switch
                checked={showAlerts}
                onChange={(event) => setShowAlerts(event.target.checked)}
              >
                Show alerts
              </Switch>
              <Switch
                checked={onlyConnectedServices}
                onChange={(event) => setOnlyConnectedServices(event.target.checked)}
              >
                Show only connected services
              </Switch>
            </Box>
          </Box>

          <ProjectPageDataProvider data={canvasData}>
            <ArchitectureContent
              showViewFilter={false}
              view={architectureView}
              showAlerts={showAlerts}
            />
          </ProjectPageDataProvider>
        </Box>
      </Box>
    </Box>
  )
}
