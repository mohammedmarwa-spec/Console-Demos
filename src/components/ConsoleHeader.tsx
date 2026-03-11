import { Box, DropdownMenu, Icon, Typography } from '@aivenio/aquarium'
import notificationsIcon from '@aivenio/aquarium/icons/notifications'
import helpIcon from '@aivenio/aquarium/icons/help'
import officeIcon from '@aivenio/aquarium/icons/office'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'

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
}

// ─── Aiven Console Logo ───────────────────────────────────────────────────────

function AivenConsoleLogo() {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Gradient mark — matches Figma "Ellipse 1" (32×32, orange→pink gradient) */}
      <Box
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF7700 0%, #FF3554 100%)',
          flexShrink: 0,
        }}
      />
      {/* Wordmark */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <Box
          component="span"
          style={{
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.07em',
            color: '#191919',
            lineHeight: '18px',
          }}
        >
          AIVEN
        </Box>
        <Box
          component="span"
          style={{
            fontSize: 7.5,
            letterSpacing: '0.06em',
            color: '#3a3a44',
            lineHeight: '9px',
          }}
        >
          CONSOLE
        </Box>
      </Box>
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
        background: 'none',
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
            background: 'none',
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
            <Typography.DefaultStrong style={{ color: '#292a31', fontSize: 13, lineHeight: '16px' }}>
              {orgName}
            </Typography.DefaultStrong>
            <Typography.Caption style={{ color: '#4a4b57', fontSize: 11, lineHeight: '14px' }}>
              {orgSublabel}
            </Typography.Caption>
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

// ─── Vertical divider ─────────────────────────────────────────────────────────

function VerticalDivider() {
  return (
    <Box
      aria-hidden
      style={{
        width: 1,
        height: 17,
        backgroundColor: '#e5e7eb',
        flexShrink: 0,
        marginInline: 12,
      }}
    />
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
        backgroundColor: '#222f95',
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
}: ConsoleHeaderProps) {
  return (
    <Box
      component="header"
      style={{
        height: 66,
        backgroundColor: '#fff',
        borderBottom: '1px solid #ededed',
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
          <NavButton
            key={item.id}
            label={item.label}
            active={activeNav === item.id}
            hasDropdown={item.hasDropdown}
          />
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
            background: 'none',
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
            background: 'none',
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
