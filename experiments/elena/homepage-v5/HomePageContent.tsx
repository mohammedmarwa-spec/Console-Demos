'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  DataList,
  Divider,
  EmptyState,
  Icon,
  Link,
  PageHeader,
  SearchInput,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { DataListColumn } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import arrowRight from '@aivenio/aquarium/icons/arrowRight'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import bookIcon from '@aivenio/aquarium/icons/book'
import chevronRight from '@aivenio/aquarium/icons/chevronRight'
import errorIcon from '@aivenio/aquarium/icons/error'
import infoSignIcon from '@aivenio/aquarium/icons/infoSign'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
import plusIcon from '@aivenio/aquarium/icons/plus'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import warningSignIcon from '@aivenio/aquarium/icons/warningSign'
import { getServiceIconUrl } from '@experiments/_shared/components/ServiceIcon'
import { OrgSidebar } from '@/components/OrgSidebar'
import { ROUTES } from '@/lib/navigation'
import { useResolvedTheme } from '@/theme/ThemeProvider'
import {
  ATTENTION_FILTERS,
  ATTENTION_ITEMS,
  DOCS,
  FLEET_METRICS,
  LAST_INVOICE,
  ORG_NAME,
  ORG_USERS,
  PROJECTS,
  RELIABILITY_ITEMS,
  USER_NAME,
  filterAttentionItems,
  type AttentionFilterId,
  type AttentionItem,
  type AttentionTone,
  type HomeProject,
  type IconTone,
} from './mockData'
import { HomeRightColumn } from '@experiments/_shared/home/HomeRightColumn'
import styles from './HomePageContent.module.css'

const SERVICE_ICON_STACK_SIZE = 32
const SERVICE_ICON_STACK_OVERLAP = 10

const ICON_TONE: Record<IconTone, { iconColor: string; iconBg: string }> = {
  primary: {
    iconColor: 'var(--aquarium-text-color-primary-graphic)',
    iconBg: 'var(--aquarium-background-color-primary-muted)',
  },
  info: {
    iconColor: 'var(--aquarium-text-color-info-intense)',
    iconBg: 'var(--aquarium-background-color-info-muted)',
  },
  warning: {
    iconColor: 'var(--aquarium-text-color-warning-intense)',
    iconBg: 'var(--aquarium-background-color-warning-muted)',
  },
  danger: {
    iconColor: 'var(--aquarium-text-color-danger-intense)',
    iconBg: 'var(--aquarium-background-color-danger-muted)',
  },
}

const ATTENTION_ICON: Record<AttentionTone, { icon: IconifyIcon; tone: IconTone }> = {
  danger: { icon: errorIcon, tone: 'danger' },
  warning: { icon: warningSignIcon, tone: 'warning' },
  info: { icon: infoSignIcon, tone: 'info' },
}

function noopClick(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function HomePageContent() {
  const router = useRouter()

  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <OrgSidebar
        orgName={ORG_NAME}
        activeItem="overview"
        onItemClick={(id) => {
          if (id === 'projects') router.push(ROUTES.projectsPage)
          if (id === 'data-flow') router.push(ROUTES.dataFlow)
        }}
      />
      <Box className={styles.overviewGrid}>
        <Box className={styles.page}>
          <PageHeader
            title={`Welcome to Aiven Platform, ${USER_NAME}`}
            subtitle="Here's what's happening across your organization."
          />
          <MetricRow />
          <RecentProjects />
          <AttentionNeeded />
          <ReliabilityOverview />
          <HomeFooter />
        </Box>

        <Divider direction="vertical" />

        <HomeRightColumn />
      </Box>
    </Box>
  )
}

HomePageContent.displayName = 'HomePageContent'

function IconTile({ icon, tone, size = 40 }: { icon: IconifyIcon; tone: IconTone; size?: number }) {
  const { iconColor, iconBg } = ICON_TONE[tone]
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--aquarium-border-radius-default)',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon icon={icon} style={{ width: 20, height: 20, color: iconColor }} />
    </Box>
  )
}

IconTile.displayName = 'IconTile'

function MetricRow() {
  return (
    <Box className={styles.metricGrid}>
      {FLEET_METRICS.map((metric) => (
        <SummaryCard key={metric.id} label={metric.label} icon={metric.icon} tone={metric.tone}>
          <Typography.LargeHeading>{metric.value}</Typography.LargeHeading>
        </SummaryCard>
      ))}
      <LastInvoiceCard />
      <UsersCard />
    </Box>
  )
}

MetricRow.displayName = 'MetricRow'

function SummaryCard({
  label,
  icon,
  tone,
  children,
}: {
  label: string
  icon: IconifyIcon
  tone: IconTone
  children: ReactNode
}) {
  return (
    <Box className={styles.metricCard}>
      <Card
        fullWidth
        title={
          <Card.Title>
            <Box className={styles.metricTitle}>
              <Typography.Small color="muted">{label}</Typography.Small>
              <IconTile icon={icon} tone={tone} />
            </Box>
          </Card.Title>
        }
      >
        {children}
      </Card>
    </Box>
  )
}

SummaryCard.displayName = 'SummaryCard'

function LastInvoiceCard() {
  return (
    <SummaryCard label="Last invoice" icon={bankAccountIcon} tone="info">
      <Box className={styles.summaryBody}>
        <Box>
          <Typography.LargeHeading>{LAST_INVOICE.amount}</Typography.LargeHeading>
          <Typography.Small color="muted">
            {LAST_INVOICE.currency} · {LAST_INVOICE.period}
          </Typography.Small>
        </Box>
        <Box className={styles.summaryFooter}>
          <StatusChip dense text={LAST_INVOICE.statusText} status={LAST_INVOICE.status} />
          <Typography.Default>
            <Link href="#" onClick={noopClick}>
              View invoice
            </Link>
          </Typography.Default>
        </Box>
      </Box>
    </SummaryCard>
  )
}

LastInvoiceCard.displayName = 'LastInvoiceCard'

function UsersCard() {
  return (
    <SummaryCard label="Users" icon={appUsersIcon} tone="primary">
      <Box className={styles.summaryBody}>
        <Typography.LargeHeading>{ORG_USERS.count}</Typography.LargeHeading>
        <Box className={styles.summaryFooter} style={{ justifyContent: 'flex-end' }}>
          <Button.Ghost type="button" dense icon={plusIcon} onClick={() => undefined}>
            Add user
          </Button.Ghost>
        </Box>
      </Box>
    </SummaryCard>
  )
}

UsersCard.displayName = 'UsersCard'

function ServiceIconStack({ serviceTypeIds }: { serviceTypeIds: HomeProject['serviceTypeIds'] }) {
  const theme = useResolvedTheme()
  const logoSize = Math.round(SERVICE_ICON_STACK_SIZE * 0.56)

  if (serviceTypeIds.length === 0) return null

  return (
    <Box className={styles.serviceIconStack} aria-hidden>
      {serviceTypeIds.map((serviceTypeId, index) => (
        <Box
          key={serviceTypeId}
          className={styles.serviceIconStackItem}
          style={{
            marginLeft: index === 0 ? 0 : -SERVICE_ICON_STACK_OVERLAP,
            zIndex: serviceTypeIds.length - index,
          }}
        >
          <img
            src={getServiceIconUrl(serviceTypeId, theme)}
            width={logoSize}
            height={logoSize}
            alt=""
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </Box>
      ))}
    </Box>
  )
}

ServiceIconStack.displayName = 'ServiceIconStack'

function RecentProjects() {
  const router = useRouter()
  const columns: DataListColumn<HomeProject>[] = [
    {
      headerName: 'Project',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (project) => (
        <Typography.DefaultStrong className={styles.projectName}>
          <Link href="#" onClick={noopClick}>
            {project.name}
          </Link>
        </Typography.DefaultStrong>
      ),
    },
    {
      headerName: 'Services',
      type: 'custom',
      width: 280,
      UNSAFE_render: (project) => (
        <Box className={styles.projectCell}>
          <ServiceIconStack serviceTypeIds={project.serviceTypeIds} />
          <Box className={styles.projectTags}>
            {project.tags.map((tag) => (
              <Chip key={tag.id} text={tag.label} dense />
            ))}
          </Box>
        </Box>
      ),
    },
    {
      headerName: 'Resources',
      type: 'custom',
      width: 140,
      UNSAFE_render: (project) => (
        <Typography.Small color="muted">
          {project.resourceCount} {project.resourceCount === 1 ? 'resource' : 'resources'}
        </Typography.Small>
      ),
    },
    {
      headerName: 'Status',
      type: 'custom',
      width: 140,
      UNSAFE_render: (project) => <StatusChip dense text={project.statusText} status={project.status} />,
    },
    {
      headerName: 'Last activity',
      type: 'custom',
      width: 200,
      UNSAFE_render: (project) => (
        <Typography.Small color="muted">{project.lastActivity}</Typography.Small>
      ),
    },
    {
      headerName: 'Open',
      type: 'custom',
      width: 48,
      UNSAFE_render: () => (
        <Box aria-hidden style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Icon
            icon={chevronRight}
            style={{ width: 16, height: 16, color: 'var(--aquarium-text-color-muted)' }}
          />
        </Box>
      ),
    },
  ]

  return (
    <Section
      title="Recent projects"
      subtitle="Review your infrastructure resources across projects"
      actions={{ text: 'View all projects', onClick: () => router.push(ROUTES.projectsPage) }}
    >
      <DataList columns={columns} rows={PROJECTS} sticky={false} hideHeader />
    </Section>
  )
}

RecentProjects.displayName = 'RecentProjects'

function AttentionNeeded() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AttentionFilterId>('all')

  const rows = useMemo(
    () => filterAttentionItems(ATTENTION_ITEMS, filter, query),
    [filter, query],
  )

  const columns: DataListColumn<AttentionItem>[] = [
    {
      headerName: 'Issue',
      type: 'custom',
      width: 'auto',
      UNSAFE_render: (item) => {
        const { icon, tone } = ATTENTION_ICON[item.tone]
        return (
          <Box className={styles.attentionCell}>
            <IconTile icon={icon} tone={tone} size={32} />
            <Box style={{ minWidth: 0 }}>
              <Typography.DefaultStrong>{item.title}</Typography.DefaultStrong>
              <Typography.Small color="muted">{item.description}</Typography.Small>
            </Box>
          </Box>
        )
      },
    },
    {
      headerName: 'Action',
      type: 'custom',
      width: 180,
      UNSAFE_render: (item) => (
        <Button.Ghost type="button" dense onClick={() => undefined}>
          {item.actionLabel}
        </Button.Ghost>
      ),
    },
  ]

  return (
    <Section title="Attention needed">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Box className={styles.attentionToolbar}>
          <Box className={styles.searchField}>
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects and resources"
              aria-label="Search projects and resources"
            />
          </Box>
          <ChoiceChipGroup
            name="attention-filter"
            selectionMode="radio"
            dense
            value={filter}
            onChange={(value) => setFilter(value as AttentionFilterId)}
            aria-label="Attention category"
          >
            {ATTENTION_FILTERS.map((item) => (
              <ChoiceChip key={item.id} value={item.id} dense>
                {item.label}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </Box>
        {rows.length === 0 ? (
          <EmptyState title="No matching items">
            Try another search or category.
          </EmptyState>
        ) : (
          <DataList columns={columns} rows={rows} sticky={false} hideHeader />
        )}
      </Box>
    </Section>
  )
}

AttentionNeeded.displayName = 'AttentionNeeded'

function ReliabilityOverview() {
  return (
    <Card fullWidth title="Reliability overview">
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {RELIABILITY_ITEMS.map((item) => (
          <Box key={item.id} className={styles.reliabilityRow}>
            <Box className={styles.reliabilityCopy}>
              <Icon
                icon={tickCircleIcon}
                style={{
                  width: 20,
                  height: 20,
                  color: 'var(--aquarium-text-color-success-intense)',
                  flexShrink: 0,
                }}
              />
              <Typography.Default>{item.summary}</Typography.Default>
            </Box>
            <Typography.Default>
              <Link href="#" icon={arrowRight} iconPlacement="right" onClick={noopClick}>
                View details
              </Link>
            </Typography.Default>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

ReliabilityOverview.displayName = 'ReliabilityOverview'

function HomeFooter() {
  return (
    <Box className={styles.footer}>
      <Typography.Default>
        <Link href={DOCS.documentation} target="_blank" icon={bookIcon}>
          Documentation
        </Link>
      </Typography.Default>
      <Typography.Default>
        <Link href={DOCS.askAi} target="_blank" icon={linkExternalIcon} iconPlacement="right">
          Ask AI
        </Link>
      </Typography.Default>
    </Box>
  )
}

HomeFooter.displayName = 'HomeFooter'
