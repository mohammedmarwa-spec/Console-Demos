import { Box, DropdownMenu, Icon } from '@aivenio/aquarium'
import notificationsIcon from '@aivenio/aquarium/icons/notifications'
import helpIcon from '@aivenio/aquarium/icons/help'
import officeIcon from '@aivenio/aquarium/icons/office'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import aivenConsoleLogo from '../assets/aiven-console-logo.svg'

export type NavItem = 'home' | 'projects' | 'tools' | 'billing' | 'support' | 'admin'

export type ConsoleHeaderProps = {
  /** Which top-level nav item is currently active. */
  activeNav?: NavItem
  /** Organization name shown in the org selector. */
  orgName?: string
  /** Sub-label (e.g. project name) shown below org name. */
  orgSublabel?: string
  /** User initials shown in the avatar. */
  userInitials?: string
  /** Called when the Home nav item is clicked. */
  onHomeClick?: () => void
  /** Called when the Billing nav item is clicked. */
  onBillingClick?: () => void
  /** Called when the Projects nav item is clicked. */
  onProjectsClick?: () => void
}

// ─── Aiven Console Logo ───────────────────────────────────────────────────────

function AivenConsoleLogo() {
  return (
    <Box
      style={{
        flexShrink: 0,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src={aivenConsoleLogo}
        alt="Aiven Console"
        style={{ height: 32, width: 'auto', display: 'block' }}
      />
    </Box>
  )
}

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavButtonProps = {
  label: string
  active?: boolean
  hasDropdown?: boolean
}

function NavButton({ label, active = false, hasDropdown = false }: NavButtonProps) {
  return (
    <Box
      component="button"
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: active ? '#292a31' : '#4a4b57',
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        lineHeight: '20px',
        borderRadius: 0,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {label}
      {hasDropdown && (
        <Icon icon={chevronDownIcon} style={{ width: 12, height: 12, opacity: 0.6 }} />
      )}
    </Box>
  )
}

// ─── Org selector button ──────────────────────────────────────────────────────

type OrgSelectorProps = {
  orgName: string
  orgSublabel: string
}

function OrgSelector({ orgName, orgSublabel }: OrgSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <Box
          component="button"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon icon={officeIcon} style={{ width: 20, height: 20, color: '#4a4b57' }} />
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
            <Box component="span" style={{ color: '#292a31', fontSize: 13, lineHeight: '16px', fontWeight: 600 }}>
              {orgName}
            </Box>
            <Box component="span" style={{ color: '#4a4b57', fontSize: 11, lineHeight: '14px' }}>
              {orgSublabel}
            </Box>
          </Box>
          <Icon icon={chevronDownIcon} style={{ width: 12, height: 12, color: '#4a4b57' }} />
        </Box>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        <DropdownMenu.Item id="switch-org">Switch organization</DropdownMenu.Item>
      </DropdownMenu.Items>
    </DropdownMenu>
  )
}

// ─── User avatar ──────────────────────────────────────────────────────────────

type AvatarProps = { initials: string }

function Avatar({ initials }: AvatarProps) {
  return (
    <Box
      aria-hidden
      style={{
        width: 35,
        height: 35,
        borderRadius: '50%',
        backgroundColor: 'var(--aquarium-background-color-primary-graphic)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--aquarium-text-color-opposite-default)',
        fontSize: 13,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  )
}

// ─── ConsoleHeader ────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavItem; label: string; hasDropdown: boolean }[] = [
  { id: 'home', label: 'Home', hasDropdown: false },
  { id: 'projects', label: 'Projects', hasDropdown: true },
  { id: 'tools', label: 'Tools', hasDropdown: true },
  { id: 'billing', label: 'Billing', hasDropdown: false },
  { id: 'support', label: 'Support', hasDropdown: false },
  { id: 'admin', label: 'Admin', hasDropdown: false },
]

/**
 * Console-wide top navigation header.
 * Matches the "Console Header (New)" frame from the Figma design
 * (Pricing model UX 2025 / Forking, read-replica etc, node 10058:41546).
 */
export function ConsoleHeader({
  activeNav = 'projects',
  orgName = 'BigCo Ltd.',
  orgSublabel = 'Engineering',
  userInitials = 'LI',
  onHomeClick,
  onBillingClick,
  onProjectsClick,
}: ConsoleHeaderProps) {
  return (
    <Box
      component="header"
      style={{
        height: 66,
        backgroundColor: 'var(--aquarium-background-color-body)',
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 16,
        gap: 46,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Logo */}
      <AivenConsoleLogo />

      {/* Nav */}
      <Box
        component="nav"
        aria-label="Main navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          minWidth: 0,
          height: 40,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Box
            key={item.id}
            component="span"
            onClick={() => {
              if (item.id === 'home') onHomeClick?.()
              if (item.id === 'billing') onBillingClick?.()
              if (item.id === 'projects') onProjectsClick?.()
            }}
            style={{
              cursor: (item.id === 'home' || item.id === 'billing' || item.id === 'projects')
                ? 'pointer'
                : undefined,
            }}
          >
            <NavButton
              label={item.label}
              active={activeNav === item.id}
              hasDropdown={item.hasDropdown}
            />
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Organization selector */}
        <OrgSelector orgName={orgName} orgSublabel={orgSublabel} />

        {/* Notification icon */}
        <Box
          component="button"
          aria-label="Notifications"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: 36,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            color: '#4a4b57',
          }}
        >
          <Icon icon={notificationsIcon} style={{ width: 20, height: 20 }} />
        </Box>

        {/* Help icon */}
        <Box
          component="button"
          aria-label="Help"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: 36,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            color: '#4a4b57',
          }}
        >
          <Icon icon={helpIcon} style={{ width: 20, height: 20 }} />
        </Box>

        {/* User avatar */}
        <Avatar initials={userInitials} />
      </Box>
    </Box>
  )
}
