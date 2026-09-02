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
import consoleIcon from '@aivenio/aquarium/icons/console'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import { getServiceIconUrl } from '@experiments/_shared/components/ServiceIcon'
import { NodesCountChip } from '@/components/NodesCountChip'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import { useProjectPageData } from './ProjectPageDataContext'
import type { AppsListItem } from './types'

function AppsServiceCell({ row }: { row: AppsListItem }) {
  const theme = useResolvedTheme()
  const isApplication = row.serviceType === 'Application' || !row.serviceTypeId
  const iconUrl = row.serviceTypeId ? getServiceIconUrl(row.serviceTypeId, theme) : null

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <Box
        aria-hidden
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: isApplication
            ? 'var(--aquarium-background-color-danger-graphic)'
            : 'var(--aquarium-background-color-muted)',
          color: isApplication
            ? 'var(--aquarium-text-color-opposite-default)'
            : 'var(--aquarium-text-color-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {iconUrl ? (
          <img src={iconUrl} alt="" width={22} height={22} />
        ) : (
          <Icon icon={consoleIcon} style={{ width: 18, height: 18 }} />
        )}
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
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 2,
          }}
        >
          <Box style={{ color: 'var(--aquarium-text-color-muted)' }}>
            <Typography.Caption>{row.serviceType}</Typography.Caption>
          </Box>
          <StatusChip
            dense
            text={row.status}
            status={row.status === 'Running' ? 'success' : 'neutral'}
            icon={row.status === 'Running' ? tickCircleIcon : undefined}
          />
        </Box>
      </Box>
    </Box>
  )
}

AppsServiceCell.displayName = 'AppsServiceCell'

const columns: Columns<AppsListItem> = [
  {
    key: 'service',
    type: 'custom',
    headerName: 'Service',
    width: '5',
    UNSAFE_render: (row) => <AppsServiceCell row={row} />,
  },
  {
    key: 'nodes',
    type: 'custom',
    headerName: 'Nodes',
    UNSAFE_render: (row) =>
      row.nodeCount != null ? (
        <NodesCountChip count={row.nodeCount} serviceStatus={row.status} />
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
      title: row.cloudRegion,
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

/** Apps sidebar page — nested application + backing services via Aquarium ItemList. */
export function AppsContent() {
  const { appsItems, projectName } = useProjectPageData()
  const infiniteProps = useStaticInfiniteList({
    items: appsItems,
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
          title="Apps"
          subtitle={
            <Typography.Default color="muted">
              Applications and their backing services in {projectName}.
            </Typography.Default>
          }
        />
      </Box>

      {appsItems.length === 0 ? (
        <EmptyState title="No apps yet">
          Deploy an application to group services and manage them together.
        </EmptyState>
      ) : (
        <ItemList {...infiniteProps} columns={columns} />
      )}
    </Box>
  )
}

AppsContent.displayName = 'AppsContent'
