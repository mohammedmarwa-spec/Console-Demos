'use client'

import { useMemo, useState } from 'react'
import {
  Accordion,
  Badge,
  Box,
  Card,
  ChipContainer,
  DataTable,
  EmptyState,
  Grid,
  SearchInput,
  Section,
  SelectBase,
  StatusChip,
  Timeline,
  Typography,
} from '@aivenio/aquarium'
import { ServiceIcon } from '@/components/ServiceIcon'
import type { ServiceTypeId as PrototypeServiceTypeId } from '@/screens/ServiceTypeSelectModal'
import {
  attentionSeverityCounts,
  filterServices,
  groupServicesByType,
  criticalActivity,
  needsAttentionCount,
  SERVICE_TYPE_FILTER_OPTIONS,
  statusChip,
} from './deriveLhf'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import type {
  ArchitectureSnapshot,
  OnlineStoreProdFixture,
  Service,
  ServiceTypeId,
  Solution,
} from './fixtures/onlineStoreProd'

function SummaryRow({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const attention = needsAttentionCount(fixture)
  const breakdown = useMemo(() => attentionSeverityCounts(fixture), [fixture])

  return (
    <Grid gap="4" alignItems="stretch">
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card
            fullWidth
            title={
              <Card.Title>
                <Box.Flex alignItems="center" justifyContent="space-between" gap="3">
                  Services
                  {attention > 0 ? (
                    <StatusChip
                      dense
                      status="danger"
                      text={attention === 1 ? '1 needs attention' : `${attention} need attention`}
                    />
                  ) : null}
                </Box.Flex>
              </Card.Title>
            }
          >
            <Typography.Heading>{fixture.services.length}</Typography.Heading>
            {attention > 0 ? (
              <Box marginTop="3">
                <ChipContainer dense>
                  <StatusChip dense status="danger" text={`${breakdown.danger} critical`} />
                  <StatusChip dense status="warning" text={`${breakdown.warning} warning`} />
                  <StatusChip dense status="info" text={`${breakdown.info} info`} />
                </ChipContainer>
              </Box>
            ) : null}
          </Card>
        </Box>
      </Grid.Item>
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card fullWidth title="Apps">
            <Typography.Heading>{fixture.project.appsCount}</Typography.Heading>
          </Card>
        </Box>
      </Grid.Item>
      <Grid.Item xs={12} md={4}>
        <Box height="full">
          <Card fullWidth title="Agents">
            <Typography.Heading>{fixture.project.agentsCount}</Typography.Heading>
          </Card>
        </Box>
      </Grid.Item>
    </Grid>
  )
}

function NeedsAttentionModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return <NeedsAttentionSection fixture={fixture} filterName="lhf-attention-severity" />
}

function ServiceRowTable({ services }: { services: Service[] }) {
  return (
    <DataTable
      ariaLabel="Services in this type"
      sticky={false}
      rows={services.map((service) => ({ ...service, id: service.name }))}
      columns={[
        {
          type: 'custom',
          headerName: 'Service',
          UNSAFE_render: (row) => (
            <Box.Flex alignItems="center" gap="3">
              <ServiceIcon serviceTypeId={row.type as PrototypeServiceTypeId} size={32} alt="" />
              <Typography.SmallStrong>{row.name}</Typography.SmallStrong>
            </Box.Flex>
          ),
        },
        { type: 'text', field: 'typeLabel', headerName: 'Type' },
        { type: 'text', field: 'plan', headerName: 'Plan' },
        {
          type: 'status',
          headerName: 'Status',
          status: (row) => statusChip(row.status),
        },
      ]}
    />
  )
}

function ServicesModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<ServiceTypeId | 'all'>('all')
  const filtered = useMemo(() => filterServices(fixture.services, query, type), [fixture.services, query, type])
  const groups = useMemo(() => groupServicesByType(filtered), [filtered])
  const hasFilters = query.trim() !== '' || type !== 'all'

  return (
    <Section title="Services" badge={filtered.length}>
      <Box.Flex gap="4" marginBottom="4" alignItems="flex-end">
        <Box grow={1} minWidth="0">
          <SearchInput
            aria-label="Search services"
            placeholder="Search services"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Box>
        <Box width="1/4" minWidth="l7">
          <SelectBase
            aria-label="Service type"
            placeholder="Select type"
            value={type}
            options={[...SERVICE_TYPE_FILTER_OPTIONS]}
            onChange={(option) => setType((option?.value as ServiceTypeId | 'all') ?? 'all')}
          />
        </Box>
      </Box.Flex>
      {groups.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching services' : 'No services yet'}
          primaryAction={
            hasFilters
              ? {
                  text: 'Clear filters',
                  onClick: () => {
                    setQuery('')
                    setType('all')
                  },
                }
              : { text: 'Create service', onClick: () => undefined }
          }
          borderStyle="solid"
          fullHeight={false}
        >
          {hasFilters
            ? 'Try a different search or service type'
            : 'Create a service to populate this list'}
        </EmptyState>
      ) : (
        <Box.Flex flexDirection="column">
          {groups.map((group) => (
            <Accordion key={group.type}>
              <Accordion.Container panelId={group.type}>
                <Accordion.Summary
                  title={group.label}
                  description={<Badge dense kind="outlined" value={group.services.length} />}
                  toggle={<Accordion.Toggle />}
                />
                <Accordion.UnanimatedPanel>
                  <ServiceRowTable services={group.services} />
                </Accordion.UnanimatedPanel>
              </Accordion.Container>
            </Accordion>
          ))}
        </Box.Flex>
      )}
    </Section>
  )
}

function RecentActivityModule({ fixture }: { fixture: OnlineStoreProdFixture }) {
  const events = useMemo(() => criticalActivity(fixture), [fixture])

  return (
    <Section title="Recent activity" subtitle="Critical and warning changes only">
      {events.length === 0 ? (
        <EmptyState
          title="No recent activity"
          primaryAction={{ text: 'View event log', onClick: () => undefined }}
          borderStyle="solid"
          fullHeight={false}
        >
          Changes across services, applications and agents will appear here
        </EmptyState>
      ) : (
        <Timeline aria-label="Recent project activity">
          {events.map((event) => (
            <Timeline.Item key={event.id} title={event.change} variant={event.variant}>
              <Typography.Small color="muted">
                {event.resource} · {event.actor} · {event.when}
              </Typography.Small>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Section>
  )
}

function SolutionsModule({ solutions }: { solutions: Solution[] }) {
  return (
    <Section title="Solutions">
      <Box.Flex flexDirection="column" gap="4">
        {solutions.map((solution) => (
          <Card key={solution.id} fullWidth title={solution.name}>
            <Typography.Small color="muted">{solution.description}</Typography.Small>
          </Card>
        ))}
      </Box.Flex>
    </Section>
  )
}

function ArchitectureModule({ snapshot }: { snapshot: ArchitectureSnapshot }) {
  return (
    <Card
      fullWidth
      title="Architecture"
      primaryAction={{ text: 'Explore architecture', onClick: () => undefined }}
    >
      <Typography.DefaultStrong>
        {snapshot.connectedSystems} connected systems
      </Typography.DefaultStrong>
      <Box marginTop="2">
        <Typography.Small color="muted">{snapshot.connections} connections</Typography.Small>
      </Box>
    </Card>
  )
}

export function LhfBody({ fixture }: { fixture: OnlineStoreProdFixture }) {
  return (
    <Box.Flex flexDirection="column" gap="6">
      <SummaryRow fixture={fixture} />
      <NeedsAttentionModule fixture={fixture} />
      <ServicesModule fixture={fixture} />
      <RecentActivityModule fixture={fixture} />
      {fixture.solutions.length > 0 ? <SolutionsModule solutions={fixture.solutions} /> : null}
      {fixture.architecture ? <ArchitectureModule snapshot={fixture.architecture} /> : null}
    </Box.Flex>
  )
}

LhfBody.displayName = 'LhfBody'
SummaryRow.displayName = 'SummaryRow'
NeedsAttentionModule.displayName = 'NeedsAttentionModule'
ServicesModule.displayName = 'ServicesModule'
RecentActivityModule.displayName = 'RecentActivityModule'
SolutionsModule.displayName = 'SolutionsModule'
ArchitectureModule.displayName = 'ArchitectureModule'
