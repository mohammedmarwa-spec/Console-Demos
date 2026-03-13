import {
  Box,
  Breadcrumbs,
  Button,
  Icon,
  Link,
  PageHeader,
  Section,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import databaseIcon from '@aivenio/aquarium/icons/database'
import applicationsIcon from '@aivenio/aquarium/icons/applications'
import appUsersIcon from '@aivenio/aquarium/icons/appUsers'
import bankAccountIcon from '@aivenio/aquarium/icons/bankAccount'
import tickCircleIcon from '@aivenio/aquarium/icons/tickCircle'
import type { IconifyIcon } from '@iconify/react'
import { ConsoleHeader } from '../components/ConsoleHeader'
import { OrgSidebar } from '../components/OrgSidebar'

const ORG_NAME = 'My Organization'

// ─── Metric card ─────────────────────────────────────────────────────────────

type MetricCardProps = {
  icon: IconifyIcon
  iconColor: string
  iconBg: string
  label: string
  value: string | number
  detail?: string
}

function MetricCard({ icon, iconColor, iconBg, label, value, detail }: MetricCardProps) {
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        border: '1px solid #ededf0',
        borderRadius: 8,
        padding: 24,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Box
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon icon={icon} style={{ width: 20, height: 20, color: iconColor }} />
      </Box>
      <Box>
        <Box style={{ color: '#787885', marginBottom: 4 }}>
          <Typography.Small>{label}</Typography.Small>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Typography.LargeHeading>{value}</Typography.LargeHeading>
          {detail && (
            <Box style={{ color: '#787885' }}>
              <Typography.Small>{detail}</Typography.Small>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Projects list ────────────────────────────────────────────────────────────

type ProjectRowProps = {
  name: string
  serviceCount: number
  region: string
  onOpen: () => void
}

function ProjectRowItem({ name, serviceCount, region, onOpen }: ProjectRowProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: 14,
        borderBottom: '1px solid #ededf0',
        gap: 16,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Box
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: '#eef1ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon={applicationsIcon} style={{ width: 18, height: 18, color: '#4e4fce' }} />
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Link href="#" onClick={(e) => { e.preventDefault(); onOpen() }}>
            {name}
          </Link>
          <Box style={{ color: '#787885', marginTop: 2 }}>
            <Typography.Caption>{serviceCount} service{serviceCount !== 1 ? 's' : ''} · {region}</Typography.Caption>
          </Box>
        </Box>
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <StatusChip text="Active" status="success" dense />
        <Button.Secondary type="button" dense onClick={onOpen}>
          Open
        </Button.Secondary>
      </Box>
    </Box>
  )
}

// ─── Billing summary ──────────────────────────────────────────────────────────

type BillingSummaryProps = {
  onViewInvoice: () => void
}

function BillingSummary({ onViewInvoice }: BillingSummaryProps) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Current period */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: 24,
          paddingBlock: 16,
          borderBottom: '1px solid #ededf0',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Current period</Typography.Caption>
          </Box>
          <Typography.Default>1 Feb – 1 Mar 2026</Typography.Default>
        </Box>
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Status</Typography.Caption>
          </Box>
          <StatusChip text="Paid" status="success" />
        </Box>
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Amount</Typography.Caption>
          </Box>
          <Typography.Default>$23.80 USD</Typography.Default>
        </Box>
        <Link href="#" onClick={(e) => { e.preventDefault(); onViewInvoice() }}>
          View invoice
        </Link>
      </Box>

      {/* Previous period */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: 24,
          paddingBlock: 16,
          borderBottom: '1px solid #ededf0',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Previous period</Typography.Caption>
          </Box>
          <Typography.Default>1 Jan – 1 Feb 2026</Typography.Default>
        </Box>
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Status</Typography.Caption>
          </Box>
          <StatusChip text="Paid" status="success" />
        </Box>
        <Box>
          <Box style={{ color: '#787885', marginBottom: 4 }}>
            <Typography.Caption>Amount</Typography.Caption>
          </Box>
          <Typography.Default>$18.40 USD</Typography.Default>
        </Box>
        <Link href="#">View invoice</Link>
      </Box>
    </Box>
  )
}

// ─── Members list ──────────────────────────────────────────────────────────────

type MemberRowProps = {
  initials: string
  name: string
  email: string
  role: string
  avatarColor: string
}

function MemberRow({ initials, name, email, role, avatarColor }: MemberRowProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: 12,
        borderBottom: '1px solid #ededf0',
        gap: 16,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Box
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>
        <Box>
          <Typography.Default>{name}</Typography.Default>
          <Box style={{ color: '#787885', marginTop: 2 }}>
            <Typography.Caption>{email}</Typography.Caption>
          </Box>
        </Box>
      </Box>
      <Box style={{ color: '#787885' }}>
        <Typography.Small>{role}</Typography.Small>
      </Box>
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export type OrgHomePageProps = {
  onProjectsClick?: () => void
  onBillingClick?: () => void
  onInvoiceClick?: () => void
}

function OrgHomePage({ onProjectsClick, onBillingClick, onInvoiceClick }: OrgHomePageProps) {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column' }}>
      <ConsoleHeader
        activeNav="home"
        onHomeClick={() => {}}
        onBillingClick={onBillingClick}
        onProjectsClick={onProjectsClick}
      />

      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <OrgSidebar
          activeItem="overview"
          onItemClick={(id) => {
            if (id === 'billing') onBillingClick?.()
            if (id === 'projects') onProjectsClick?.()
          }}
        />

        {/* Main content */}
        <Box style={{ flex: 1, minWidth: 0, padding: 24, overflow: 'auto', backgroundColor: '#f9f9fb' }}>
          {/* Page header */}
          <Box style={{ marginBottom: 24 }}>
            <PageHeader
              title={ORG_NAME}
              breadcrumbs={[
                <Breadcrumbs.Crumb key="org">{ORG_NAME}</Breadcrumbs.Crumb>,
              ]}
            />
          </Box>

          {/* Metric cards */}
          <Box style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <MetricCard
              icon={applicationsIcon}
              iconColor="#4e4fce"
              iconBg="#eef1ff"
              label="Projects"
              value={1}
            />
            <MetricCard
              icon={databaseIcon}
              iconColor="#16a34a"
              iconBg="#f0fdf4"
              label="Services running"
              value={1}
            />
            <MetricCard
              icon={appUsersIcon}
              iconColor="#0369a1"
              iconBg="#f0f9ff"
              label="Members"
              value={3}
            />
            <MetricCard
              icon={bankAccountIcon}
              iconColor="#b45309"
              iconBg="#fffbeb"
              label="Current billing"
              value="$23.80"
              detail="USD · Feb 2026"
            />
          </Box>

          {/* Two-column: Projects + Members */}
          <Box style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
            {/* Projects */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Section
                title="Projects"
                actions={{ text: 'View all projects', onClick: () => onProjectsClick?.() }}
              >
                <ProjectRowItem
                  name="psychedelicshoe-8825"
                  serviceCount={1}
                  region="Digital Ocean, Sydney"
                  onOpen={() => onProjectsClick?.()}
                />
              </Section>
            </Box>

            {/* Members */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Section title="Members">
                <MemberRow
                  initials="EI"
                  name="Elena Ivanova"
                  email="elena@bigco.io"
                  role="Admin"
                  avatarColor="#222f95"
                />
                <MemberRow
                  initials="JS"
                  name="Jake Sullivan"
                  email="jake@bigco.io"
                  role="Developer"
                  avatarColor="#0369a1"
                />
                <MemberRow
                  initials="MP"
                  name="Maria Pereira"
                  email="maria@bigco.io"
                  role="Developer"
                  avatarColor="#16a34a"
                />
              </Section>
            </Box>
          </Box>

          {/* Billing summary */}
          <Section
            title="Billing"
            actions={{ text: 'Go to billing', onClick: () => onBillingClick?.() }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon icon={tickCircleIcon} style={{ width: 16, height: 16, color: '#16a34a' }} />
              <Box style={{ color: '#4a4b57' }}>
                <Typography.Small>Payment method on file · Visa ending in 4242</Typography.Small>
              </Box>
            </Box>
            <BillingSummary onViewInvoice={() => onInvoiceClick?.()} />
          </Section>
        </Box>
      </Box>
    </Box>
  )
}

OrgHomePage.displayName = 'OrgHomePage'

export default OrgHomePage
