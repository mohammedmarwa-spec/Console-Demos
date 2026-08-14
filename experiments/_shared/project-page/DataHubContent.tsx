'use client'

import {
  Box,
  DropdownMenu,
  EmptyState,
  Icon,
  ItemList,
  Link,
  PageHeader,
  StatusChip,
  Typography,
  useStaticInfiniteList,
} from '@aivenio/aquarium'
import type { Columns } from '@aivenio/aquarium'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import warningSignIcon from '@aivenio/aquarium/icons/warningSign'
import { getServiceIconUrl } from '@experiments/_shared/components/ServiceIcon'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import { useProjectPageData } from './ProjectPageDataContext'
import type { DataHubListItem } from './types'

function DataHubServiceCell({ row }: { row: DataHubListItem }) {
  const theme = useResolvedTheme()
  const iconUrl = getServiceIconUrl(row.serviceTypeId, theme)

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <Box
        aria-hidden
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: 'var(--aquarium-background-color-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img src={iconUrl} alt="" width={22} height={22} />
      </Box>
      <Box style={{ minWidth: 0 }}>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          {row.serviceName}
        </Link>
        <Box style={{ color: 'var(--aquarium-text-color-muted)', marginTop: 2 }}>
          <Typography.Caption>{row.serviceType}</Typography.Caption>
        </Box>
      </Box>
    </Box>
  )
}

DataHubServiceCell.displayName = 'DataHubServiceCell'

const columns: Columns<DataHubListItem> = [
  {
    key: 'service',
    type: 'custom',
    headerName: 'Service',
    width: '5',
    UNSAFE_render: (row) => <DataHubServiceCell row={row} />,
  },
  {
    key: 'status',
    type: 'custom',
    headerName: 'Status',
    headerInvisible: true,
    UNSAFE_render: (row) => (
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusChip
          text={row.status}
          status={row.status === 'Running' ? 'success' : 'neutral'}
          dense
        />
        {row.hasAlert ? (
          <Icon
            icon={warningSignIcon}
            style={{
              width: 16,
              height: 16,
              color: 'var(--aquarium-text-color-warning-intense)',
            }}
            aria-label="Has alerts"
          />
        ) : null}
      </Box>
    ),
  },
  {
    key: 'nodes',
    type: 'custom',
    headerName: 'Nodes',
    UNSAFE_render: (row) =>
      row.nodeCount != null ? (
        <StatusChip text="Nodes" status="neutral" icon={nodesIcon} badge={row.nodeCount} dense />
      ) : null,
  },
  {
    key: 'plan',
    type: 'custom',
    headerName: 'Plan',
    width: '3',
    UNSAFE_render: (row) => (
      <Box>
        <Typography.SmallStrong>{row.planName}</Typography.SmallStrong>
        {row.planDetails ? (
          <Box style={{ color: 'var(--aquarium-text-color-muted)', marginTop: 2 }}>
            <Typography.Caption>{row.planDetails}</Typography.Caption>
          </Box>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'cloud',
    type: 'item',
    headerName: 'Cloud',
    width: '3',
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
    key: 'created',
    type: 'text',
    headerName: 'Created',
    field: 'created',
    width: '2',
  },
  {
    type: 'menu',
    headerName: 'Action',
    menu: () => (
      <DropdownMenu.Items>
        <DropdownMenu.Item id="power-off">Power off</DropdownMenu.Item>
        <DropdownMenu.Item id="delete">Delete</DropdownMenu.Item>
      </DropdownMenu.Items>
    ),
    onAction: () => {
      /* stub */
    },
  },
]

/** Data Hub sidebar page — nested solution/services via Aquarium ItemList. */
export function DataHubContent() {
  const { dataHubItems, projectName } = useProjectPageData()
  const infiniteProps = useStaticInfiniteList({
    items: dataHubItems,
    pageSize: 20,
    autoReset: false,
  })

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        padding: 24,
        overflow: 'auto',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box style={{ marginBottom: 24 }}>
        <PageHeader
          title="Data Hub"
          subtitle={
            <Typography.Default color="muted">
              Unified catalog and data solutions in {projectName}.
            </Typography.Default>
          }
        />
      </Box>

      {dataHubItems.length === 0 ? (
        <EmptyState title="No Data Hub solutions yet">
          Create a DataHub solution to group PostgreSQL, OpenSearch, and Kafka services.
        </EmptyState>
      ) : (
        <ItemList {...infiniteProps} columns={columns} />
      )}
    </Box>
  )
}

DataHubContent.displayName = 'DataHubContent'
