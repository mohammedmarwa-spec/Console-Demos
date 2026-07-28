'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  DataTable,
  DropdownMenu,
  Filter,
  InputBase,
  Link,
  PageHeader,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import filterIcon from '@aivenio/aquarium/icons/filter'
import { NodesCountChip } from '@/components/NodesCountChip'
import { ServiceIcon } from '@/components/ServiceIcon'
import { ServiceStatusChip } from '@/components/ServiceStatusChip'
import { PROJECT_NAME, SERVICES, type ServiceListRow } from './servicesData'

function matchesSearch(row: ServiceListRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    row.serviceName.toLowerCase().includes(q) ||
    row.serviceType.toLowerCase().includes(q) ||
    row.planName.toLowerCase().includes(q) ||
    row.cloudRegion.toLowerCase().includes(q) ||
    row.location.toLowerCase().includes(q)
  )
}

export function ServicesListContent() {
  const [search, setSearch] = useState('')
  const [showOnlyWithAlerts, setShowOnlyWithAlerts] = useState(false)

  const filteredRows = useMemo(() => {
    return SERVICES.filter((row) => {
      if (showOnlyWithAlerts && !row.hasAlerts) return false
      return matchesSearch(row, search)
    })
  }, [search, showOnlyWithAlerts])

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        padding: 36,
        overflow: 'auto',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box style={{ marginBottom: 24 }}>
        <PageHeader
          title="Services"
          breadcrumbs={[
            <Breadcrumbs.Crumb key="org" href="#">
              My Organization
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="projects" href="#">
              Projects
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="project">{PROJECT_NAME}</Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="page">Services</Breadcrumbs.Crumb>,
          ]}
          primaryAction={{
            text: 'Create service',
            onClick: () => {
              /* stub — polish later */
            },
          }}
        />
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 auto', minWidth: 0 }}>
          <Box style={{ flex: '1 1 auto', minWidth: 200, maxWidth: 400 }}>
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services by name, plan, cloud and tags..."
              aria-label="Search services"
            />
          </Box>
          <Filter.Trigger
            labelText="Filter"
            icon={filterIcon}
            value=""
            onClick={() => {
              /* simplified v1 — full filter panel later */
            }}
          />
        </Box>

        <Switch
          checked={showOnlyWithAlerts}
          onChange={(event) => setShowOnlyWithAlerts(event.target.checked)}
        >
          Show only services with alerts
        </Switch>
      </Box>

      <DataTable
        ariaLabel="Services"
        rows={filteredRows}
        columns={[
          {
            type: 'custom',
            headerName: 'Service',
            UNSAFE_render: (row) => {
              const isReplica = row.replicationRole === 'read_replica'
              const isFork = row.replicationRole === 'fork'
              return (
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <Box style={{ flexShrink: 0, marginRight: 12 }}>
                    <ServiceIcon serviceTypeId={row.serviceTypeId} size={34} alt="" />
                  </Box>
                  <Box>
                    <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                      >
                        {row.serviceName}
                      </Link>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                        <Typography.Caption>{row.serviceType}</Typography.Caption>
                      </Box>
                      <ServiceStatusChip status={row.status} />
                      {(isReplica || isFork) && (
                        <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
                          <Typography.Caption>
                            <strong>{isFork ? 'Fork' : 'Read replica'}</strong>
                          </Typography.Caption>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            },
          },
          {
            type: 'custom',
            headerName: 'Nodes',
            UNSAFE_render: (row) => (
              <NodesCountChip count={row.nodeCount} serviceStatus={row.status} />
            ),
          },
          {
            type: 'custom',
            headerName: 'Plan',
            UNSAFE_render: (row) => (
              <Box>
                <Typography.SmallStrong>{row.planName}</Typography.SmallStrong>
                <Box style={{ color: 'var(--aquarium-text-color-muted)', marginTop: 2 }}>
                  <Typography.Caption>{row.planDetails}</Typography.Caption>
                </Box>
              </Box>
            ),
          },
          {
            type: 'item',
            headerName: 'Cloud',
            item: (row) => ({
              title: (
                <Box component="span" style={{ color: 'var(--aquarium-text-color-muted)' }}>
                  {row.cloudRegion}
                </Box>
              ),
              caption: (
                <Box component="span" style={{ color: 'var(--aquarium-text-color-muted)' }}>
                  {row.location}
                </Box>
              ),
            }),
          },
          {
            type: 'custom',
            headerName: 'Created',
            UNSAFE_render: (row) => (
              <Box
                component="span"
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  color: 'var(--aquarium-text-color-muted)',
                }}
              >
                {row.created}
              </Box>
            ),
          },
        ]}
        menu={() => (
          <DropdownMenu.Items>
            <DropdownMenu.Item id="power-off">Power off</DropdownMenu.Item>
            <DropdownMenu.Item id="delete">Delete</DropdownMenu.Item>
          </DropdownMenu.Items>
        )}
        menuHeaderName="Action"
        onAction={() => {
          /* stub actions */
        }}
      />
    </Box>
  )
}

ServicesListContent.displayName = 'ServicesListContent'
