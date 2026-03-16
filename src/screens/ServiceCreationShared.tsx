/**
 * Shared primitives for every "Create / Fork / Replica" service modal.
 * All layout constants follow the 8px base-unit grid.
 */
import { Box, Icon, Link, Switch, Typography } from '@aivenio/aquarium'

// ─── Layout constants ─────────────────────────────────────────────────────────

export const LAYOUT_GAP = 60
export const SIDEBAR_WIDTH = 360
export const PADDING = 24

// ─── Section ─────────────────────────────────────────────────────────────────
// Icon + title header with a vertical connector line above the content body.

const SECTION_ICON_WIDTH = 32
const SECTION_LINE_WIDTH = 1

export function Section({
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
        <Icon aria-hidden icon={icon} style={{ width: 20, height: 20, color: '#c4c4cf' }} />
      </Box>

      <Box style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <Box component="h3" className="typography-large text-intense" style={{ margin: 0 }}>
          {title}
        </Box>
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
            backgroundColor: '#ededf0',
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

Section.displayName = 'Section'

// ─── SummaryDetail ────────────────────────────────────────────────────────────
// Label + value pair used inside the service summary sidebar.

export function SummaryDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box style={{ color: '#787885' }}>
        <Typography.Caption>{label}</Typography.Caption>
      </Box>
      {typeof value === 'string' ? (
        <Box style={{ color: '#16171a' }}>
          <Typography.Small>{value}</Typography.Small>
        </Box>
      ) : (
        value
      )}
    </Box>
  )
}

SummaryDetail.displayName = 'SummaryDetail'

// ─── ServiceSummarySidebar ────────────────────────────────────────────────────
// Right-side sticky sidebar wrapper shared by all service creation flows.

export function ServiceSummarySidebar({
  children,
  footer,
}: {
  children: React.ReactNode
  /** Content rendered below the scrollable area (e.g. a CTA button). */
  footer?: React.ReactNode
}) {
  return (
    <Box
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        border: '1px solid #ededf0',
        borderRadius: 8,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: PADDING,
      }}
    >
      <Box
        style={{
          padding: PADDING,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          flex: 1,
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box style={{ padding: `0 ${PADDING}px ${PADDING}px` }}>
          {footer}
        </Box>
      )}
    </Box>
  )
}

ServiceSummarySidebar.displayName = 'ServiceSummarySidebar'

// ─── PricingBanner ────────────────────────────────────────────────────────────
// Toggle card shown in Fork / Read-replica modals to let users choose the
// pricing mode for the new service being created.

export function PricingBanner({
  title,
  checked,
  onChange,
}: {
  title: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Box
      style={{
        backgroundColor: '#ebfbee',
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
        <Typography.SmallStrong>{title}</Typography.SmallStrong>
        <Box style={{ color: '#4a4b57', marginTop: 2 }}>
          <Typography.Caption>
            Fine-tune CPU, RAM and disk.{' '}
            <Link href="#" onClick={(e) => e.preventDefault()}>Details</Link>
          </Typography.Caption>
        </Box>
      </Box>
    </Box>
  )
}

PricingBanner.displayName = 'PricingBanner'
