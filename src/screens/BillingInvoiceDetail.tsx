import { useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Icon,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import cloudUploadIcon from '@aivenio/aquarium/icons/cloudUpload'
import cpuChipIcon from '@aivenio/aquarium/icons/cpuChip'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import infoIcon from '@aivenio/aquarium/icons/infoSign'
import nodesIcon from '@aivenio/aquarium/icons/nodes'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { BillingSidebar } from '../components/BillingSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single ACU charge line item shown in the breakdown of an ACU service row. */
type ChargeLineItem = {
  id: string
  label: string
  /** Optional sub-label shown below the label, e.g. "volume_type: block" */
  sublabel?: string
  iconType: 'acu' | 'storage' | 'network'
  cloud: string
  period: string
  quantity?: string
  unitPrice?: string
  total: string
}

type ServiceChargeRow = {
  id: string
  name: string
  serviceType: string
  /** ACU, Plan (legacy), or undefined for services with no pricing model chip */
  pricing?: 'ACU' | 'Plan'
  /**
   * For legacy / Classic services: the service tier name shown in the Plan column (e.g. "Startup-4").
   * For ACU services: the legacy-equivalent tier name kept for reference.
   */
  plan: string
  /**
   * ACU-only. The compute type label (e.g. "Standard", "Memory-optimized").
   */
  computeType?: string
  cloud: string
  period: string
  total: string
  /**
   * ACU-only. Collapsible breakdown line items (ACU usage, Storage, Network).
   * When present the service row renders with an expand/collapse chevron.
   */
  breakdown?: ChargeLineItem[]
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

// ─── Breakdown helper ─────────────────────────────────────────────────────────

function makeAcuBreakdown(
  id: string,
  total: string,
  cloud: string,
  period: string,
): ChargeLineItem[] {
  const t = parseFloat(total.replace(/[^0-9.]/g, '')) || 0
  const acuTotal = Math.round(t * 0.72 * 100) / 100
  const storageTotal = Math.round(t * 0.20 * 100) / 100
  const networkTotal = Math.round((t - acuTotal - storageTotal) * 100) / 100
  const acuQty = Math.round(acuTotal / 0.083)
  const storageQty = Math.round(storageTotal / 0.00098)
  return [
    {
      id: `${id}-acu`,
      label: 'ACU',
      iconType: 'acu',
      cloud,
      period,
      quantity: `${acuQty.toLocaleString()} ACU`,
      unitPrice: '$0.083',
      total: `$${acuTotal.toFixed(2)} USD`,
    },
    {
      id: `${id}-storage`,
      label: 'Storage usage',
      sublabel: 'volume_type: block',
      iconType: 'storage',
      cloud,
      period,
      quantity: `${storageQty.toLocaleString()} GB·h`,
      unitPrice: '$0.00098',
      total: `$${storageTotal.toFixed(2)} USD`,
    },
    {
      id: `${id}-network`,
      label: 'Network',
      iconType: 'network',
      cloud,
      period,
      total: `$${networkTotal.toFixed(2)} USD`,
    },
  ]
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
        pricing: 'ACU',
        plan: 'Startup-4',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37 – 12 Feb 2026 21:30',
        total: '$20.91 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-startup-4', '$20.91 USD', 'do-syd', '4–12 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-developer-1a',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '12 Feb 2026 21:30 – 28 Feb 2026 23:59',
        total: '$2.71 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-developer-1a', '$2.71 USD', 'do-syd', '12–28 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-developer-1b',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:16 – 4 Feb 2026 10:37',
        total: '$0.16 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-developer-1b', '$0.16 USD', 'do-syd', '3–4 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-hobbyist',
        name: 'pg-34dc00e8: PostgreSQL Hobbyist do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Hobbyist',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37 – 4 Feb 2026 10:37',
        total: '$0.02 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-hobbyist', '$0.02 USD', 'do-syd', '4 Feb 2026'),
      },
      {
        id: 'pg-34dc00e8-free',
        name: 'pg-34dc00e8: PostgreSQL Free-1-1gb do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:10 – 3 Feb 2026 12:16',
        total: '$0.00 USD',
        breakdown: makeAcuBreakdown('pg-34dc00e8-free', '$0.00 USD', 'do-syd', '3 Feb 2026'),
      },
      {
        id: 'pg-2d4b35ac-free',
        name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'upcloud-sg-sin',
        period: '13 Feb 2026 9:25 – 14 Feb 2026 9:39',
        total: '$0.00 USD',
        breakdown: makeAcuBreakdown('pg-2d4b35ac-free', '$0.00 USD', 'upcloud-sg-sin', '13–14 Feb 2026'),
      },
    ],
  },
]

// ─── Details of charges table ─────────────────────────────────────────────────

// Name/description | Cloud | Effective date | Quantity | Unit price | Total
const CHARGES_GRID = '1fr 160px 150px 90px 120px 130px'
const CHARGES_HEADERS = ['Name / description', 'Cloud', 'Effective date', 'Quantity', 'Unit price', 'Total'] as const

const BREAKDOWN_ICON: Record<ChargeLineItem['iconType'], typeof cpuChipIcon> = {
  acu: cpuChipIcon,
  storage: nodesIcon,
  network: cloudUploadIcon,
}

function ChargesTableHeader() {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      {CHARGES_HEADERS.map((col, i) => (
        <Box key={col} style={{ color: '#787885', textAlign: i === CHARGES_HEADERS.length - 1 ? 'right' : 'left' }}>
          <Typography.Caption>{col}</Typography.Caption>
        </Box>
      ))}
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
        borderBottom: expanded ? 'none' : '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: expanded ? 'var(--aquarium-background-color-muted)' : 'var(--aquarium-background-color-layer)',
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
      {/* empty cells: Cloud, Effective date, Quantity, Unit price */}
      <span /><span /><span /><span />
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{group.total}</Box>
      </Box>
    </Box>
  )
}

function ServiceRow({
  row,
  isLast,
  expanded,
  onToggle,
}: {
  row: ServiceChargeRow
  isLast: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const isExpandable = Boolean(row.breakdown?.length)
  const serviceName = row.name.split(':')[0]

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom:
          isLast && !expanded
            ? '1px solid var(--aquarium-border-color-muted)'
            : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: expanded ? 'var(--aquarium-background-color-primary-muted)' : 'var(--aquarium-background-color-muted)',
        alignItems: 'center',
        cursor: isExpandable ? 'pointer' : 'default',
        outline: 'none',
      }}
      onClick={isExpandable ? onToggle : undefined}
      role={isExpandable ? 'button' : undefined}
      aria-expanded={isExpandable ? expanded : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      onKeyDown={isExpandable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() } : undefined}
    >
      {/* Name / description */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 24 }}>
        {/* Chevron or spacer */}
        <Box style={{ width: 16, flexShrink: 0 }}>
          {isExpandable && (
            <Icon
              icon={expanded ? chevronDownIcon : chevronRightIcon}
              style={{ width: 16, height: 16, color: '#787885' }}
            />
          )}
        </Box>
        <Typography.Small>{serviceName}</Typography.Small>
        {row.pricing && (
          <StatusChip text={row.pricing} status="neutral" dense />
        )}
      </Box>

      {/* For non-ACU services, show cloud + period inline */}
      <Box style={{ color: '#4a4b57' }}>
        {!isExpandable && <Typography.Small>{row.cloud}</Typography.Small>}
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        {!isExpandable && <Typography.Small>{row.period}</Typography.Small>}
      </Box>

      {/* Quantity — empty for service row */}
      <span />

      {/* Unit price — empty for service row */}
      <span />

      {/* Total */}
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>{row.total}</Box>
      </Box>
    </Box>
  )
}

function BreakdownRow({ item, isLast }: { item: ChargeLineItem; isLast: boolean }) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: CHARGES_GRID,
        paddingInline: 16,
        paddingBlock: 10,
        borderBottom:
          isLast ? '1px solid var(--aquarium-border-color-muted)' : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
        alignItems: 'center',
      }}
    >
      {/* Name / description — indented further with icon */}
      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 56 }}>
        <Icon
          icon={BREAKDOWN_ICON[item.iconType]}
          style={{ width: 16, height: 16, color: '#787885', flexShrink: 0, marginTop: 1 }}
        />
        <Box>
          <Typography.Small>{item.label}</Typography.Small>
          {item.sublabel && (
            <Box style={{ color: '#787885', marginTop: 1 }}>
              <Typography.Caption>{item.sublabel}</Typography.Caption>
            </Box>
          )}
        </Box>
      </Box>

      {/* Cloud */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.cloud}</Typography.Small>
      </Box>

      {/* Effective date */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.period}</Typography.Small>
      </Box>

      {/* Quantity */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.quantity ?? ''}</Typography.Small>
      </Box>

      {/* Unit price */}
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{item.unitPrice ?? ''}</Typography.Small>
      </Box>

      {/* Total */}
      <Box style={{ textAlign: 'right' }}>
        <Box component="span" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>{item.total}</Box>
      </Box>
    </Box>
  )
}

function ChargesTable({ groups }: { groups: ProjectChargeGroup[] }) {
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.id)),
  )
  const [expandedServiceIds, setExpandedServiceIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  function toggleProject(id: string) {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleService(id: string) {
    setExpandedServiceIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <ChargesTableHeader />
      {groups.map((group) => {
        const projectExpanded = expandedProjectIds.has(group.id)
        return (
          <Box key={group.id}>
            <ProjectRow
              group={group}
              expanded={projectExpanded}
              onToggle={() => toggleProject(group.id)}
            />
            {projectExpanded &&
              group.services.map((svc, svcIdx) => {
                const isLastService = svcIdx === group.services.length - 1
                const serviceExpanded = expandedServiceIds.has(svc.id)
                return (
                  <Box key={svc.id}>
                    <ServiceRow
                      row={svc}
                      isLast={isLastService}
                      expanded={serviceExpanded}
                      onToggle={() => toggleService(svc.id)}
                    />
                    {serviceExpanded && svc.breakdown?.map((item, itemIdx) => (
                      <BreakdownRow
                        key={item.id}
                        item={item}
                        isLast={isLastService && itemIdx === (svc.breakdown?.length ?? 0) - 1}
                      />
                    ))}
                  </Box>
                )
              })}
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Pie chart ────────────────────────────────────────────────────────────────

function parseAmount(total: string): number {
  return parseFloat(total.replace(/[^0-9.]/g, '')) || 0
}

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

  const amounts = summaries.map((s) => parseAmount(s.total))
  const totalAmount = amounts.reduce((a, b) => a + b, 0) || 1

  let startAngle = -Math.PI / 2
  const paths: React.ReactNode[] = []

  summaries.forEach((s, i) => {
    const slice = (2 * Math.PI) * (amounts[i] / totalAmount)
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
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
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
              borderBottom: '1px solid var(--aquarium-border-color-muted)',
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

function InvoiceStatusRow({
  total = '$0.00 USD',
  paid = true,
  dueDate = '1 March 2026',
}: {
  total?: string
  paid?: boolean
  dueDate?: string
}) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <StatusChip text={paid ? 'Paid' : 'Due'} status={paid ? 'success' : 'warning'} />
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography.Small>Total: {total}</Typography.Small>
        <Icon icon={infoIcon} style={{ width: 14, height: 14, color: '#787885' }} />
      </Box>
      <Box style={{ color: '#787885' }}>
        <Typography.Small>·</Typography.Small>
      </Box>
      <Typography.Small>Due date: {dueDate}</Typography.Small>
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export type BillingInvoiceDetailProps = {
  onBack?: () => void
  onOrgHomeClick?: () => void
  onBillingClick?: () => void
}

function BillingInvoiceDetail({ onBack, onOrgHomeClick, onBillingClick }: BillingInvoiceDetailProps) {
  const chargeGroups = PROJECT_CHARGE_GROUPS
  const summaries = SERVICE_SUMMARIES
  const invoiceTotal = '$0.00 USD'
  const invoicePaid = true

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--aquarium-background-color-body)', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader
        activeNav="billing"
        onBillingClick={onBillingClick}
        onProjectsClick={onOrgHomeClick}
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <BillingSidebar
          activeItem="invoices"
          onItemClick={(id) => {
            if (id === 'overview') onOrgHomeClick?.()
          }}
        />

        {/* Main content */}
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: 'var(--aquarium-background-color-body)' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title="Invoice for 1 February - 1 March 2026"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org" href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                  My Organization
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="billing" href="#" onClick={(e) => { e.preventDefault(); onBillingClick?.() }}>
                  Billing
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoices" href="#" onClick={(e) => { e.preventDefault(); onBack?.() }}>
                  Invoices
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="invoice">
                  Invoice for 1 February - 1 March 2026
                </Breadcrumbs.Crumb>,
              ]}
            />
            <InvoiceStatusRow total={invoiceTotal} paid={invoicePaid} dueDate="1 March 2026" />
          </Box>

          {/* Sections */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary by service type */}
            <Section title="Summary by service type">
              <SummaryByServiceType summaries={summaries} />
            </Section>

            {/* Details of charges */}
            <Section
              title="Details of charges"
              actions={[
                { text: 'Download PDF', onClick: () => {} },
                { text: 'Download CSV', onClick: () => {} },
              ]}
            >
              <ChargesTable groups={chargeGroups} />
            </Section>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

BillingInvoiceDetail.displayName = 'BillingInvoiceDetail'

export default BillingInvoiceDetail
