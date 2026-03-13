import { useMemo, useState } from 'react'
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
import { useScenario } from '../scenarios'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceChargeRow = {
  id: string
  name: string
  serviceType: string
  /** ACU, Classic, or undefined for services with no pricing model chip */
  pricing?: 'ACU' | 'Classic'
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
        pricing: 'ACU',
        plan: 'Startup-4',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37:58 UTC – 12 Feb 2026 21:30:47 UTC',
        total: '$20.91 USD',
      },
      {
        id: 'pg-34dc00e8-developer-1a',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '12 Feb 2026 21:30:48 UTC – 28 Feb 2026 23:59:59 UTC',
        total: '$2.71 USD',
      },
      {
        id: 'pg-34dc00e8-developer-1b',
        name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Developer-1',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:16:05 UTC – 4 Feb 2026 10:37:31 UTC',
        total: '$0.16 USD',
      },
      {
        id: 'pg-34dc00e8-hobbyist',
        name: 'pg-34dc00e8: PostgreSQL Hobbyist do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Hobbyist',
        cloud: 'do-syd',
        period: '4 Feb 2026 10:37:32 UTC – 4 Feb 2026 10:37:57 UTC',
        total: '$0.02 USD',
      },
      {
        id: 'pg-34dc00e8-free',
        name: 'pg-34dc00e8: PostgreSQL Free-1-1gb do-syd',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'do-syd',
        period: '3 Feb 2026 12:10:28 UTC – 3 Feb 2026 12:16:04 UTC',
        total: '$0.00 USD',
      },
      {
        id: 'pg-2d4b35ac-free',
        name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',
        serviceType: 'PostgreSQL',
        pricing: 'ACU',
        plan: 'Free-1-1gb',
        cloud: 'upcloud-sg-sin',
        period: '13 Feb 2026 9:25:22 UTC – 14 Feb 2026 9:39:24 UTC',
        total: '$0.00 USD',
      },
    ],
  },
]

// ─── Scenario: mixed-service invoice ─────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const MIXED_SERVICE_SUMMARIES: ServiceTypeSummary[] = [
  { serviceType: 'PostgreSQL',    total: '$23.80 USD', color: '#4e4fce' },
  { serviceType: 'MySQL',         total: '$12.40 USD', color: '#f59e0b' },
  { serviceType: 'Apache Kafka',  total: '$6.20 USD',  color: '#8b5cf6' },
  { serviceType: 'OpenSearch',    total: '$1.80 USD',  color: '#0ea5e9' },
]

// prettier-ignore
const MIXED_SERVICES_P1: ServiceChargeRow[] = [
  // ACU services
  { id: 'pg-34dc00e8-startup-4',      name: 'pg-34dc00e8: PostgreSQL Startup-4 do-syd',                  serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Startup-4',   cloud: 'do-syd',           period: '4 Feb 2026 10:37:58 UTC – 12 Feb 2026 21:30:47 UTC', total: '$20.91 USD' },
  { id: 'pg-34dc00e8-developer-1',    name: 'pg-34dc00e8: PostgreSQL Developer-1 do-syd',                serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Developer-1', cloud: 'do-syd',           period: '12 Feb 2026 21:30:48 UTC – 28 Feb 2026 23:59:59 UTC', total: '$2.89 USD' },
  { id: 'mysql-a1b2c3d4-business-4',  name: 'mysql-a1b2c3d4: MySQL Business-4 do-syd',                  serviceType: 'MySQL',              pricing: 'ACU',     plan: 'Business-4',  cloud: 'do-syd',           period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$12.40 USD' },
  { id: 'pg-2d4b35ac-free',           name: 'pg-2d4b35ac: PostgreSQL Free-1-1gb upcloud-sg-sin',         serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Free-1-1gb',  cloud: 'upcloud-sg-sin',   period: '13 Feb 2026 9:25:22 UTC – 14 Feb 2026 9:39:24 UTC',   total: '$0.00 USD' },
  { id: 'pg-9a8b7c6d-business-4',     name: 'pg-9a8b7c6d: PostgreSQL Business-4 aws-eu-west-1',         serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Business-4',  cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$8.44 USD' },
  { id: 'mysql-d4e5f6a7-startup-4',   name: 'mysql-d4e5f6a7: MySQL Startup-4 aws-eu-west-1',            serviceType: 'MySQL',              pricing: 'ACU',     plan: 'Startup-4',   cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$4.80 USD' },
  { id: 'pg-b1c2d3e4-hobbyist',       name: 'pg-b1c2d3e4: PostgreSQL Hobbyist do-syd',                  serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Hobbyist',    cloud: 'do-syd',           period: '4 Feb 2026 10:37:32 UTC – 4 Feb 2026 10:37:57 UTC',   total: '$0.02 USD' },
  { id: 'mysql-e5f6a7b8-free',        name: 'mysql-e5f6a7b8: MySQL Free-1-1gb do-syd',                  serviceType: 'MySQL',              pricing: 'ACU',     plan: 'Free-1-1gb',  cloud: 'do-syd',           period: '3 Feb 2026 12:10:28 UTC – 3 Feb 2026 12:16:04 UTC',   total: '$0.00 USD' },
  { id: 'pg-c5d6e7f8-developer-1',    name: 'pg-c5d6e7f8: PostgreSQL Developer-1 google-us-central1',   serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Developer-1', cloud: 'google-us-central1', period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC', total: '$1.20 USD' },
  // Legacy / no-pricing services
  { id: 'kafka-events-p1',            name: 'kafka-1a2b3c4d: Apache Kafka Startup-2 do-syd',            serviceType: 'Apache Kafka',       pricing: 'Classic', plan: 'Startup-2',   cloud: 'do-syd',           period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$3.20 USD' },
  { id: 'redis-c3d4e5f6-startup-4',   name: 'redis-c3d4e5f6: Caching & ValkeyDB Startup-4 do-syd',     serviceType: 'Caching & ValkeyDB', plan: 'Startup-4',   cloud: 'do-syd',           period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$2.10 USD' },
  { id: 'kafka-telemetry-p1',         name: 'kafka-2b3c4d5e: Apache Kafka Business-4 aws-eu-west-1',   serviceType: 'Apache Kafka',       pricing: 'Classic', plan: 'Business-4',  cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$0.00 USD' },
  { id: 'os-a2b3c4d5-developer-1',    name: 'os-a2b3c4d5: OpenSearch Developer-1 aws-eu-west-1',       serviceType: 'OpenSearch',         plan: 'Developer-1', cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$1.50 USD' },
  { id: 'grafana-f1e2d3c4-startup-1', name: 'grafana-f1e2d3c4: Grafana Startup-1 aws-eu-west-1',       serviceType: 'Grafana',            plan: 'Startup-1',   cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$0.80 USD' },
]

// prettier-ignore
const MIXED_SERVICES_P2: ServiceChargeRow[] = [
  // ACU services
  { id: 'pg-d7e8f9a0-business-4',     name: 'pg-d7e8f9a0: PostgreSQL Business-4 azure-eastus',          serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Business-4',  cloud: 'azure-eastus',     period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$7.30 USD' },
  { id: 'mysql-a0b1c2d3-business-4',  name: 'mysql-a0b1c2d3: MySQL Business-4 google-us-central1',      serviceType: 'MySQL',              pricing: 'ACU',     plan: 'Business-4',  cloud: 'google-us-central1', period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC', total: '$6.90 USD' },
  { id: 'pg-c4d5e6f7-startup-4',      name: 'pg-c4d5e6f7: PostgreSQL Startup-4 azure-eastus',           serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Startup-4',   cloud: 'azure-eastus',     period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$2.10 USD' },
  { id: 'mysql-f9e8d7c6-hobbyist',    name: 'mysql-f9e8d7c6: MySQL Hobbyist aws-eu-west-1',             serviceType: 'MySQL',              pricing: 'ACU',     plan: 'Hobbyist',    cloud: 'aws-eu-west-1',    period: '3 Feb 2026 08:12:00 UTC – 3 Feb 2026 09:45:00 UTC',   total: '$0.00 USD' },
  { id: 'pg-f8a9b0c1-developer-1',    name: 'pg-f8a9b0c1: PostgreSQL Developer-1 google-us-central1',   serviceType: 'PostgreSQL',         pricing: 'ACU',     plan: 'Developer-1', cloud: 'google-us-central1', period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC', total: '$0.90 USD' },
  // Legacy / no-pricing services
  { id: 'kafka-5a4b3c2d-business-4',  name: 'kafka-5a4b3c2d: Apache Kafka Business-4 google-us-central1', serviceType: 'Apache Kafka',    pricing: 'Classic', plan: 'Business-4',  cloud: 'google-us-central1', period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC', total: '$6.20 USD' },
  { id: 'ch-analytics-p2',            name: 'ch-a1b2c3d4: ClickHouse Business-8 aws-eu-west-1',          serviceType: 'ClickHouse',         plan: 'Business-8',  cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$15.60 USD' },
  { id: 'kafka-payments-p2',          name: 'kafka-c5d6e7f8: Apache Kafka Premium-6 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Classic', plan: 'Premium-6',   cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$12.80 USD' },
  { id: 'redis-e8f9a0b1-business-4',  name: 'redis-e8f9a0b1: Caching & ValkeyDB Business-4 aws-eu-west-1', serviceType: 'Caching & ValkeyDB', plan: 'Business-4', cloud: 'aws-eu-west-1',   period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$4.20 USD' },
  { id: 'os-b2c3d4e5-business-4',     name: 'os-b2c3d4e5: OpenSearch Business-4 aws-eu-west-1',          serviceType: 'OpenSearch',         plan: 'Business-4',  cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$3.40 USD' },
  { id: 'kafka-cdc-p2',               name: 'kafka-d6e7f8a9: Apache Kafka Startup-2 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Classic', plan: 'Startup-2',   cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$1.80 USD' },
  { id: 'os-7f6e5d4c-startup-4',      name: 'os-7f6e5d4c: OpenSearch Startup-4 aws-eu-west-1',           serviceType: 'OpenSearch',         plan: 'Startup-4',   cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$1.80 USD' },
  { id: 'flink-jobs-p2',              name: 'flink-e7f8a9b0: Apache Flink Business-4 aws-eu-west-1',     serviceType: 'Apache Flink',       plan: 'Business-4',  cloud: 'aws-eu-west-1',    period: '1 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC',  total: '$5.40 USD' },
  { id: 'kafka-inkless-premium',      name: 'kafka-b3c4d5e6: Apache Kafka Premium-6 aws-eu-west-1',      serviceType: 'Apache Kafka',       pricing: 'Classic', plan: 'Premium-6',   cloud: 'aws-eu-west-1',    period: '14 Feb 2026 00:00:00 UTC – 28 Feb 2026 23:59:59 UTC', total: '$0.00 USD' },
]

const MIXED_PROJECT_GROUPS: ProjectChargeGroup[] = [
  {
    id: 'project-psychedelicshoe-8825',
    projectName: 'psychedelicshoe-8825',
    total: '$58.26 USD',
    services: MIXED_SERVICES_P1,
  },
  {
    id: 'project-aiven-prod-eu',
    projectName: 'aiven-prod-eu',
    total: '$68.40 USD',
    services: MIXED_SERVICES_P2,
  },
]

// ─── Details of charges table ─────────────────────────────────────────────────

// Name | Service type | Pricing | Plan | Cloud | Period | Total
const CHARGES_GRID = '1fr 120px 80px 110px 130px 1fr 110px'
const CHARGES_HEADERS = ['Name / description', 'Service type', 'Pricing', 'Plan', 'Cloud', 'Period', 'Total'] as const

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
      {CHARGES_HEADERS.map((col) => (
        <Box key={col} style={{ color: '#787885' }}>
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
      {/* empty cells for: Service type, Pricing, Plan, Cloud, Period */}
      <span />
      <span />
      <span />
      <span />
      <span />
      <Box>
        <Box component="span" style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{group.total}</Box>
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
        <Typography.Small>{row.name.split(':')[0]}</Typography.Small>
      </Box>
      <Box style={{ color: '#4a4b57' }}>
        <Typography.Small>{row.serviceType}</Typography.Small>
      </Box>
      <Box>
        {row.pricing && (
          <StatusChip
            text={row.pricing}
            status={row.pricing === 'ACU' ? 'success' : 'neutral'}
            dense
          />
        )}
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
        <Box component="span" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>{row.total}</Box>
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
  onOrgHomeClick?: () => void
  onBillingClick?: () => void
}

function BillingInvoiceDetail({ onBack, onOrgHomeClick, onBillingClick }: BillingInvoiceDetailProps) {
  const { activeScenarioId } = useScenario()
  const isMixed = activeScenarioId === 'invoice-mixed-services'

  // Shuffle service rows within each project group once on mount / scenario change.
  const chargeGroups = useMemo<ProjectChargeGroup[]>(() => {
    if (!isMixed) return PROJECT_CHARGE_GROUPS
    return MIXED_PROJECT_GROUPS.map((g) => ({ ...g, services: shuffle(g.services) }))
  }, [isMixed])

  const summaries = isMixed ? MIXED_SERVICE_SUMMARIES : SERVICE_SUMMARIES

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader
        activeNav="billing"
        onHomeClick={onOrgHomeClick}
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
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: '#fff' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title="Invoice for 1 February - 1 March 2026"
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onOrgHomeClick?.() }}>
                    My Organization
                  </Link>
                </Breadcrumbs.Crumb>,
                <Breadcrumbs.Crumb key="billing">
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBillingClick?.() }}>
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
