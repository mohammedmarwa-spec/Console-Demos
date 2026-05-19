/**
 * Shared primitives for every "Create / Fork / Replica" service modal.
 * All layout constants follow the 8px base-unit grid.
 */
import { Box, Divider, Icon, Link, RadioButton, Switch, Table, Typography } from '@aivenio/aquarium'

// ─── Layout constants ─────────────────────────────────────────────────────────

export const LAYOUT_GAP = 60
export const SIDEBAR_WIDTH = 360
export const PADDING = 24

// ─── CreationFlowSection ──────────────────────────────────────────────────────
// Icon + title header with a vertical connector line above the content body.

const SECTION_ICON_WIDTH = 32
const SECTION_LINE_WIDTH = 1

export function CreationFlowSection({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Icon>['icon']
  title: string
  children: React.ReactNode
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `${SECTION_ICON_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: 'auto auto',
        columnGap: 16,
        marginBottom: 48,
        minWidth: 0,
        alignItems: 'start',
      }}
    >
      <Box
        style={{
          width: SECTION_ICON_WIDTH,
          height: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon aria-hidden icon={icon} color="muted" style={{ width: 20, height: 20 }} />
      </Box>

      <Box style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <Typography.Large color="intense" htmlTag="h3">
          {title}
        </Typography.Large>
      </Box>

      <Box
        style={{
          paddingTop: 16,
          width: SECTION_ICON_WIDTH,
          minWidth: SECTION_ICON_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            width: SECTION_LINE_WIDTH,
            minWidth: SECTION_LINE_WIDTH,
            backgroundColor: 'var(--aquarium-border-color-muted)',
            alignSelf: 'stretch',
            minHeight: 40,
          }}
        />
      </Box>

      <Box style={{ paddingTop: 16, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  )
}

CreationFlowSection.displayName = 'CreationFlowSection'

// ─── DetailField ──────────────────────────────────────────────────────────────
// Label + value pair used in summary sidebars and source-service cards.

export function DetailField({
  label,
  value,
  valueTypography = 'small',
}: {
  label: string
  value: React.ReactNode
  /** `defaultStrong` for source-service card rows; `small` for summary sidebar. */
  valueTypography?: 'small' | 'defaultStrong'
}) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography.Caption color="muted">{label}</Typography.Caption>
      {typeof value === 'string' ? (
        valueTypography === 'defaultStrong' ? (
          <Typography.DefaultStrong>{value}</Typography.DefaultStrong>
        ) : (
          <Typography.Small color="intense">{value}</Typography.Small>
        )
      ) : (
        value
      )}
    </Box>
  )
}

DetailField.displayName = 'DetailField'

// ─── FixedPlanTable ─────────────────────────────────────────────────────────────
// Single-row plan table for Free / Developer tiers (Plan, VMs, CPUs, RAM, Storage, price).

export type FixedPlanRow = {
  label: string
  nodes: number
  cpu: number
  ram: string
  storage: string
  monthlyPrice: string
}

export function FixedPlanTable({ plan }: { plan: FixedPlanRow }) {
  return (
    <Box
      style={{
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Table ariaLabel="Plan" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Table.Head>
          <Table.Cell style={{ width: 40 }} />
          <Table.Cell style={{ width: '22%' }}>
            <Typography.Caption color="muted">Plan</Typography.Caption>
          </Table.Cell>
          <Table.Cell style={{ width: '10%' }}>
            <Typography.Caption color="muted">VMs</Typography.Caption>
          </Table.Cell>
          <Table.Cell style={{ width: '14%' }}>
            <Typography.Caption color="muted">CPUs per VM</Typography.Caption>
          </Table.Cell>
          <Table.Cell style={{ width: '14%' }}>
            <Typography.Caption color="muted">RAM per VM</Typography.Caption>
          </Table.Cell>
          <Table.Cell>
            <Typography.Caption color="muted">Storage</Typography.Caption>
          </Table.Cell>
          <Table.Cell style={{ width: '16%', textAlign: 'right' }}>
            <Typography.Caption color="muted">Monthly price</Typography.Caption>
          </Table.Cell>
        </Table.Head>
        <Table.Body>
          <Table.Row className="plan-row-selected">
            <Table.Cell>
              <RadioButton
                aria-label={`Plan ${plan.label}`}
                name="fixedPlan"
                value={plan.label}
                checked
                onChange={() => {}}
              />
            </Table.Cell>
            <Table.Cell>
              <Typography.DefaultStrong color="intense">{plan.label}</Typography.DefaultStrong>
            </Table.Cell>
            <Table.Cell>
              <Typography.Small color="intense">{plan.nodes}</Typography.Small>
            </Table.Cell>
            <Table.Cell>
              <Typography.Small color="intense">{plan.cpu}</Typography.Small>
            </Table.Cell>
            <Table.Cell>
              <Typography.Small color="intense">{plan.ram}</Typography.Small>
            </Table.Cell>
            <Table.Cell>
              <Typography.Small color="intense">{plan.storage}</Typography.Small>
            </Table.Cell>
            <Table.Cell style={{ textAlign: 'right' }}>
              <Typography.DefaultStrong color="intense">{plan.monthlyPrice}</Typography.DefaultStrong>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Box>
  )
}

FixedPlanTable.displayName = 'FixedPlanTable'

// ─── ServiceSummarySidebar ────────────────────────────────────────────────────
// Right-side sticky sidebar wrapper shared by all service creation flows.

export function ServiceSummarySidebar({
  children,
  footer,
  style,
  top = PADDING,
}: {
  children: React.ReactNode
  /** Content rendered below the scrollable area (e.g. a CTA button). */
  footer?: React.ReactNode
  style?: React.CSSProperties
  top?: number
}) {
  return (
    <Box
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        backgroundColor: 'var(--aquarium-background-color-layer)',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        position: 'sticky',
        top,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Box
        style={{
          padding: PADDING,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {children}
      </Box>

      {footer && (
        <>
          <Divider />
          <Box style={{ padding: `0 ${PADDING}px ${PADDING}px` }}>{footer}</Box>
        </>
      )}
    </Box>
  )
}

ServiceSummarySidebar.displayName = 'ServiceSummarySidebar'

// ─── PricingBanner ────────────────────────────────────────────────────────────
// Toggle card for ACU vs legacy pricing in service creation flows.

export type PricingBannerCopy = {
  title: string
  description: React.ReactNode
}

export function PricingBanner({
  checked,
  onChange,
  acu,
  legacy,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  acu: PricingBannerCopy
  legacy: PricingBannerCopy
}) {
  const copy = checked ? acu : legacy

  return (
    <Box
      style={{
        backgroundColor: 'var(--aquarium-background-color-success-muted)',
        borderRadius: 8,
        padding: '0 16px',
        display: 'flex',
        gap: 0,
        alignItems: 'center',
        minHeight: 64,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Switch checked={checked} onChange={() => onChange(!checked)} />
      <Box style={{ minWidth: 0 }}>
        <Typography.SmallStrong>{copy.title}</Typography.SmallStrong>
        <Box style={{ marginTop: 2 }}>
          <Typography.Caption color="muted">{copy.description}</Typography.Caption>
        </Box>
      </Box>
    </Box>
  )
}

PricingBanner.displayName = 'PricingBanner'

const PRICING_BANNER_ACU_DESCRIPTION = (
  <>
    Fine-tune CPU, RAM and disk.{' '}
    <Link href="#" onClick={(e) => e.preventDefault()}>
      Details
    </Link>
  </>
)

/** Default ACU / legacy copy used by fork and read-replica modals. */
export const FORK_REPLICA_PRICING_BANNER: {
  acu: PricingBannerCopy
  legacy: PricingBannerCopy
} = {
  acu: {
    title: 'Flexible configuration & pricing',
    description: PRICING_BANNER_ACU_DESCRIPTION,
  },
  legacy: {
    title: 'Flexible configuration & pricing',
    description: PRICING_BANNER_ACU_DESCRIPTION,
  },
}
