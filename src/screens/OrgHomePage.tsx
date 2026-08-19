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

/** Semantic icon tile tones — token pairs adapt to light/dark via Aquarium CSS variables. */
type MetricIconTone = 'primary' | 'success' | 'info' | 'warning'

const METRIC_ICON_TONE: Record<
  MetricIconTone,
  { iconColor: string; iconBg: string }
> = {
  primary: {
    iconColor: 'var(--aquarium-text-color-primary-graphic)',
    iconBg: 'var(--aquarium-background-color-primary-muted)',
  },
  success: {
    iconColor: 'var(--aquarium-text-color-success-intense)',
    iconBg: 'var(--aquarium-background-color-success-muted)',
  },
  info: {
    iconColor: 'var(--aquarium-text-color-info-intense)',
    iconBg: 'var(--aquarium-background-color-info-muted)',
  },
  warning: {
    iconColor: 'var(--aquarium-text-color-warning-intense)',
    iconBg: 'var(--aquarium-background-color-warning-muted)',
  },
}

// ─── Metric card ─────────────────────────────────────────────────────────────

type MetricCardProps = {
  icon: IconifyIcon
  tone: MetricIconTone
  label: string
  value: string | number
  detail?: string
}

function MetricCard({ icon, tone, label, value, detail }: MetricCardProps) {
  const { iconColor, iconBg } = METRIC_ICON_TONE[tone]
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        padding: 24,
        backgroundColor: 'var(--aquarium-background-color-layer)',
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
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
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
            backgroundColor: 'var(--aquarium-background-color-primary-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            icon={applicationsIcon}
            style={{
              width: 18,
              height: 18,
              color: 'var(--aquarium-text-color-primary-graphic)',
            }}
          />
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
          borderBottom: '1px solid var(--aquarium-border-color-muted)',
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
          borderBottom: '1px solid var(--aquarium-border-color-muted)',
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

type MemberAvatarTone = 'primary' | 'info' | 'success'

const MEMBER_AVATAR_TONE: Record<
  MemberAvatarTone,
  { backgroundColor: string; color: string }
> = {
  primary: {
    backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
    color: 'var(--aquarium-text-color-opposite-default)',
  },
  info: {
    backgroundColor: 'var(--aquarium-background-color-info-graphic)',
    color: 'var(--aquarium-text-color-opposite-default)',
  },
  success: {
    backgroundColor: 'var(--aquarium-background-color-success-graphic)',
    color: 'var(--aquarium-text-color-opposite-default)',
  },
}

type MemberRowProps = {
  initials: string
  name: string
  email: string
  role: string
  avatarTone: MemberAvatarTone
}

function MemberRow({ initials, name, email, role, avatarTone }: MemberRowProps) {
  const avatarStyle = MEMBER_AVATAR_TONE[avatarTone]

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: 12,
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
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
            backgroundColor: avatarStyle.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: avatarStyle.color,
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
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--aquarium-background-color-body)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ConsoleHeader
        activeNav="home"
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
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            padding: 24,
            overflow: 'auto',
            backgroundColor: 'var(--aquarium-background-color-body)',
          }}
        >
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
              tone="primary"
              label="Projects"
              value={1}
            />
            <MetricCard
              icon={databaseIcon}
              tone="success"
              label="Services running"
              value={1}
            />
            <MetricCard
              icon={appUsersIcon}
              tone="info"
              label="Members"
              value={3}
            />
            <MetricCard
              icon={bankAccountIcon}
              tone="warning"
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
                  avatarTone="primary"
                />
                <MemberRow
                  initials="JS"
                  name="Jake Sullivan"
                  email="jake@bigco.io"
                  role="Developer"
                  avatarTone="info"
                />
                <MemberRow
                  initials="MP"
                  name="Maria Pereira"
                  email="maria@bigco.io"
                  role="Developer"
                  avatarTone="success"
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
              <Icon
                icon={tickCircleIcon}
                color="success-intense"
                style={{ width: 16, height: 16 }}
              />
              <Box style={{ color: 'var(--aquarium-text-color-default)' }}>
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
