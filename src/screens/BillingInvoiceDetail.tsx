import { useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import infoIcon from '@aivenio/aquarium/icons/infoSign'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { BillingSidebar } from '../components/BillingSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceChargeRow = {
  id: string
  name: string
  serviceType: string
  plan: string
  cloud: string
  period: string
  total: string
}

type ProjectChargeGroup = {
  id: string
  projectName: string
  total: string
  services: ServiceChargeRow[]
}

type ServiceTypeSummary = {
  serviceType: string
  total: string
  color: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const SERVICE_SUMMARIES: ServiceTypeSummary[] = [
  { serviceType: 'PostgreSQL', total: '$23.80 USD', color: '#4e4fce' },
]

const PROJECT_CHARGE_GROUPS: ProjectChargeGroup[] = [
  {
    id: 'project-psychedelicshoe-8825',
    projectName: 'psychedelicshoe-8825',
    total: '$23.80 USD',
    services: [
      {
        id: 'pg-34dc00e8-startup-4',
        name: 'pg-34dc00e8: PostgreSQL Startup-4 do-syd',
        serviceType: 'PostgreSQL',
        plan: 'Startup-4',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37:58 UTC – 12 Feb 2026 21:30:47 UTC',
        total: '$20.91 USD',
      },
      {
        id: 'pg-34dc00e8-developer-1a',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '12 Feb 2026 21:30:48 UTC – 28 Feb 2026 23:59:59 UTC',
        total: '$2.71 USD',
      },
      {
        id: 'pg-34dc00e8-developer-1b',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:16:05 UTC – 4 Feb 2026 10:37:31 UTC',
        total: '$0.16 USD',
      },
      {
        id: 'pg-34dc00e8-hobbyist',
        name: 'pg-34dc00e8: PostgreSQL Hobbyist do-syd',
        serviceType: 'PostgreSQL',
        plan: 'Hobbyist',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37:32 UTC – 4 Feb 2026 10:37:57 UTC',
        total: '$0.02 USD',
      },
      {
        id: 'pg-34dc00e8-free',
        name: 'pg-34dc00e8: PostgreSQL Free-1-1gb do-syd',
        serviceType: 'PostgreSQL',
        plan: 'Free-1-1gb',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:10:28 UTC – 3 Feb 2026 12:16:04 UTC',
        total: '$0.00 USD',
      },
      {
        id: 'pg-2d4b35ac-free',
        name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',
        serviceType: 'PostgreSQL',
        plan: 'Free-1-1gb',
        cloud: 'upcloud-sg-sin',
        period: '13 Feb 2026 9:25:22 UTC – 14 Feb 2026 9:39:24 UTC',
        total: '$0.00 USD',
      },
    ],
  },
]

// ─── Details of charges table ─────────────────────────────────────────────────

const CHARGES_GRID = '1fr 120px 110px 130px 1fr 110px'

function ChargesTableHeader() {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom: '1px solid #ededf0',
        backgroundColor: '#f9f9fb',
      }}
    >
      {(['Name / description', 'Service type', 'Plan', 'Cloud', 'Period', 'Total'] as const).map(
        (col) => (
          <Box key={col} style={{ color: '#787885' }}>
            <Typography.Caption>{col}</Typography.Caption>
          </Box>
        ),
      )}
    </Box>
  )
}

function ProjectRow({
  group,
  expanded,
  onToggle,
}: {
  group: ProjectChargeGroup
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 12,
        borderBottom: expanded ? 'none' : '1px solid #ededf0',
        backgroundColor: expanded ? '#f5f5fa' : '#fff',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon
          icon={expanded ? chevronDownIcon : chevronRightIcon}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }}
        />
        <Icon
          icon={folderCloseIcon}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0 }}
        />
        <Typography.Default>Project: {group.projectName}</Typography.Default>
      </Box>
      {/* empty cells for other columns */}
      <span />
      <span />
      <span />
      <span />
      <Box>
        <Typography.Default>{group.total}</Typography.Default>
      </Box>
    </Box>
  )
}

function ServiceRow({ row, isLast }: { row: ServiceChargeRow; isLast: boolean }) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom: isLast ? '1px solid #ededf0' : '1px solid #f2f2f5',
        backgroundColor: '#fafafa',
        alignItems: 'center',
      }}
    >
      {/* indent to align with project name text */}
      <Box style={{ paddingLeft: 40 }}>
        <Typography.Small>{row.name}</Typography.Small>
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{row.serviceType}</Typography.Small>
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{row.plan}</Typography.Small>
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{row.cloud}</Typography.Small>
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{row.period}</Typography.Small>
      </Box>
      <Box>
        <Typography.Small>{row.total}</Typography.Small>
      </Box>
    </Box>
  )
}

function ChargesTable({ groups }: { groups: ProjectChargeGroup[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.id)),
  )

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Box
      style={{
        border: '1px solid #ededf0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <ChargesTableHeader />
      {groups.map((group) => {
        const expanded = expandedIds.has(group.id)
        return (
          <Box key={group.id}>
            <ProjectRow group={group} expanded={expanded} onToggle={() => toggle(group.id)} />
            {expanded &&
              group.services.map((svc, idx) => (
                <ServiceRow
                  key={svc.id}
                  row={svc}
                  isLast={idx === group.services.length - 1}
                />
              ))}
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Pie chart ────────────────────────────────────────────────────────────────

function PieChart({ summaries }: { summaries: ServiceTypeSummary[] }) {
  const size = 100
  const cx = size / 2
  const cy = size / 2
  const r = 40

  if (summaries.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill={summaries[0].color} />
      </svg>
    )
  }

  // For multiple segments, compute arc paths
  const total = summaries.length
  let startAngle = -Math.PI / 2
  const paths: React.ReactNode[] = []

  summaries.forEach((s, i) => {
    const slice = (2 * Math.PI) / total
    const endAngle = startAngle + slice
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = slice > Math.PI ? 1 : 0
    paths.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={s.color}
      />,
    )
    startAngle = endAngle
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {paths}
    </svg>
  )
}

// ─── Summary section ──────────────────────────────────────────────────────────

function SummaryByServiceType({ summaries }: { summaries: ServiceTypeSummary[] }) {
  return (
    <Box
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'flex-start',
      }}
    >
      {/* Table */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* Table header */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            paddingBottom: 8,
            borderBottom: '1px solid #ededf0',
            marginBottom: 4,
          }}
        >
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>Service type</Typography.Caption>
          </Box>
          <Box style={{ color: '#787885' }}>
            <Typography.Caption>Total</Typography.Caption>
          </Box>
        </Box>

        {/* Table rows */}
        {summaries.map((s) => (
          <Box
            key={s.serviceType}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              paddingBlock: 12,
              borderBottom: '1px solid #ededf0',
            }}
          >
            <Typography.Default>{s.serviceType}</Typography.Default>
            <Typography.Default>{s.total}</Typography.Default>
          </Box>
        ))}
      </Box>

      {/* Legend + pie chart */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {summaries.map((s) => (
            <Box key={s.serviceType} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  flexShrink: 0,
                }}
              />
              <Typography.Small>{s.serviceType}</Typography.Small>
            </Box>
          ))}
        </Box>
        <PieChart summaries={summaries} />
      </Box>
    </Box>
  )
}

// ─── Invoice status row ───────────────────────────────────────────────────────

function InvoiceStatusRow() {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <StatusChip text="Paid" status="success" />
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography.Small>Total: $0.00 USD</Typography.Small>
        <Icon icon={infoIcon} style={{ width: 14, height: 14, color: '#787885' }} />
      </Box>
      <Box style={{ color: '#787885' }}>
        <Typography.Small>·</Typography.Small>
      </Box>
      <Typography.Small>Due date: 1 March 2026</Typography.Small>
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export type BillingInvoiceDetailProps = {
  onBack?: () => void
}

function BillingInvoiceDetail({ onBack }: BillingInvoiceDetailProps) {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader activeNav="billing" />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <BillingSidebar activeItem="invoices" />

        {/* Main content */}
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: '#fff' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title="Invoice for 1 February - 1 March 2026"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBack?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="billing">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBack?.() }}>
                    Billing
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoices">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBack?.() }}>
                    Invoices
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoice">
                  Invoice for 1 February - 1 March 2026
                </Breadcrumbs.Crumb>,
              ]}
            />
            <InvoiceStatusRow />
          </Box>

          {/* Sections */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary by service type */}
            <Section title="Summary by service type">
              <SummaryByServiceType summaries={SERVICE_SUMMARIES} />
            </Section>

            {/* Details of charges */}
            <Section
              title="Details of charges"
              actions={[
                { text: 'Download PDF', onClick: () => {} },
                { text: 'Download CSV', onClick: () => {} },
              ]}
            >
              <ChargesTable groups={PROJECT_CHARGE_GROUPS} />
            </Section>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

BillingInvoiceDetail.displayName = 'BillingInvoiceDetail'

export default BillingInvoiceDetail
