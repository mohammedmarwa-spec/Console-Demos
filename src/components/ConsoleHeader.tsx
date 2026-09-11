'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Divider, DropdownMenu, Icon, InlineIcon } from '@aivenio/aquarium'
import notificationsIcon from '@aivenio/aquarium/icons/notifications'
import helpIcon from '@aivenio/aquarium/icons/help'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import linkExternalIcon from '@aivenio/aquarium/icons/linkExternal'
import { getAivenIcon } from '../assets/icons/aivenIcon'
import { useResolvedTheme } from '../theme/ThemeProvider'
import { OrganizationSelector } from './header/OrganizationSelector'
import { ProjectsPopover } from './header/ProjectsPopover'
import { DEFAULT_ACTIVE_PROJECT_ID } from './header/shellNavMockData'
import { SIDEBAR_WIDTH_COLLAPSED } from './SidebarShell'
import { ROUTES } from '../lib/navigation'

export type NavItem = 'home' | 'projects' | 'tools' | 'billing' | 'support' | 'admin'

export type ConsoleHeaderProps = {
  /** Which top-level nav item is currently active. */
  activeNav?: NavItem
  /** Organization name shown in the org selector. */
  orgName?: string
  /** Sub-label (e.g. unit name) shown below org name. */
  orgSublabel?: string
  /** User initials shown in the avatar. */
  userInitials?: string
  /** Selected project id for the Projects panel checkmark. */
  activeProjectId?: string
  /** Called when the Home nav item is clicked. Defaults to Console Homepage. */
  onHomeClick?: () => void
  /** Called when the Billing nav item is clicked. */
  onBillingClick?: () => void
  /** Called when View all projects is clicked (shell callback, no route). */
  onProjectsClick?: () => void
  /** Optional custom content rendered on the right, before header icon actions. */
  beforeOrganizationSelector?: ReactNode
  /** Optional content rendered immediately after the organization selector (left cluster). */
  afterOrganizationSelector?: ReactNode
  /** Show primary navigation buttons in the header. */
  showPrimaryNav?: boolean
  /** Show the Projects item inside primary nav. Hidden when a dedicated project selector is used. */
  showProjectsNavItem?: boolean
}

// ─── Aiven Console Logo ───────────────────────────────────────────────────────

const CRAB_ASPECT = 230 / 202

export function AivenConsoleLogo({ width = 32 }: { width?: number }) {
  const theme = useResolvedTheme()
  const height = Math.round(width / CRAB_ASPECT)

  return (
    <Box
      aria-label="Aiven"
      style={{
        flexShrink: 0,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon
        icon={getAivenIcon(theme)}
        style={{ width, height, display: 'block', flexShrink: 0 }}
      />
    </Box>
  )
}

// ─── Nav chrome ───────────────────────────────────────────────────────────────

const navButtonStyle = (active: boolean): CSSProperties => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 12px',
  height: 40,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: active
    ? 'var(--aquarium-text-color-default)'
    : 'var(--aquarium-text-color-muted)',
  fontWeight: active ? 600 : 400,
  fontSize: 14,
  lineHeight: '20px',
  borderRadius: 2,
  flexShrink: 0,
  boxSizing: 'border-box',
})

type NavButtonProps = {
  label: string
  active?: boolean
  hasDropdown?: boolean
  external?: boolean
  onClick?: () => void
  /** Use span when nested inside DropdownMenu.Trigger (avoids button-in-button). */
  as?: 'button' | 'span'
}

function NavButton({
  label,
  active = false,
  hasDropdown = false,
  external = false,
  onClick,
  as = 'button',
}: NavButtonProps) {
  return (
    <Box
      component={as}
      role={as === 'span' ? 'button' : undefined}
      tabIndex={as === 'span' ? 0 : undefined}
      onClick={onClick}
      style={navButtonStyle(active)}
    >
      {label}
      {hasDropdown && (
        <Icon icon={chevronDownIcon} style={{ width: 12, height: 12, opacity: 0.6 }} />
      )}
      {external && (
        <InlineIcon icon={linkExternalIcon} style={{ width: 12, height: 12, opacity: 0.6 }} />
      )}
    </Box>
  )
}

type IconActionProps = {
  label: string
  icon: typeof notificationsIcon
  as?: 'button' | 'span'
}

function IconAction({ label, icon, as = 'button' }: IconActionProps) {
  return (
    <Box
      component={as}
      role={as === 'span' ? 'button' : undefined}
      tabIndex={as === 'span' ? 0 : undefined}
      aria-label={label}
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
        color: 'var(--aquarium-text-color-muted)',
      }}
    >
      <Icon icon={icon} color="muted" style={{ width: 20, height: 20 }} />
    </Box>
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

/**
 * Console-wide top navigation header.
 * Visual IA mirrors production HeadingPanel + OrganizationNavigation + ProfileUserActionPanel.
 */
export function ConsoleHeader({
  activeNav = 'projects',
  orgName = 'BigCo Ltd.',
  orgSublabel = 'Engineering',
  userInitials = 'LI',
  activeProjectId = DEFAULT_ACTIVE_PROJECT_ID,
  onHomeClick,
  onBillingClick,
  onProjectsClick,
  beforeOrganizationSelector,
  afterOrganizationSelector,
  showPrimaryNav = true,
  showProjectsNavItem = true,
}: ConsoleHeaderProps) {
  const router = useRouter()
  const handleHomeClick = onHomeClick ?? (() => router.push(ROUTES.homepage))

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      style={{
        height: 66,
        backgroundColor: 'var(--aquarium-background-color-body)',
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 16,
        gap: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box
        style={{
          width: SIDEBAR_WIDTH_COLLAPSED,
          flexShrink: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          boxShadow: 'inset -1px 0 0 var(--aquarium-border-color-muted)',
        }}
      >
        <AivenConsoleLogo width={42} />
      </Box>

      <Box
        style={{
          marginLeft: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <OrganizationSelector orgName={orgName} orgSublabel={orgSublabel} />
        {afterOrganizationSelector}
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flex: 1,
          minWidth: 0,
          height: 40,
          marginLeft: 16,
        }}
      >
        {showPrimaryNav ? (
          <>
            <NavButton label="Home" active={activeNav === 'home'} onClick={handleHomeClick} />

            {showProjectsNavItem ? (
              <ProjectsPopover
                active={activeNav === 'projects'}
                activeProjectId={activeProjectId}
                onViewAllProjects={onProjectsClick}
              />
            ) : null}

            <DropdownMenu>
              <DropdownMenu.Trigger>
                <NavButton label="Tools" active={activeNav === 'tools'} hasDropdown as="span" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Items>
                <DropdownMenu.Item id="topic-catalog">Topic catalog</DropdownMenu.Item>
                <DropdownMenu.Item id="data-flow">Data flow</DropdownMenu.Item>
                <DropdownMenu.Item id="sql-optimizer">SQL query optimizer</DropdownMenu.Item>
                <DropdownMenu.Item id="mcp-use-cases">Aiven MCP use cases</DropdownMenu.Item>
              </DropdownMenu.Items>
            </DropdownMenu>

            <NavButton label="Billing" active={activeNav === 'billing'} onClick={onBillingClick} />
            <NavButton label="Support" active={activeNav === 'support'} external />
            <NavButton label="Admin" active={activeNav === 'admin'} />
          </>
        ) : null}
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
          backgroundColor: 'var(--aquarium-background-color-body)',
          zIndex: 1,
          paddingLeft: 8,
        }}
      >
        {beforeOrganizationSelector ? (
          <Box style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            {beforeOrganizationSelector}
          </Box>
        ) : null}

        <Box style={{ height: 40, marginLeft: 6, marginRight: 6 }}>
          <Divider direction="vertical" size={2} />
        </Box>

        <IconAction label="Notifications" icon={notificationsIcon} />

        <DropdownMenu>
          <DropdownMenu.Trigger>
            <IconAction label="Support" icon={helpIcon} as="span" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenu.Item id="help-center">Help center</DropdownMenu.Item>
            <DropdownMenu.Item id="support-tickets">Support tickets</DropdownMenu.Item>
            <DropdownMenu.Item id="status">Status page</DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Box
              component="button"
              type="button"
              aria-label="User menu"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar initials={userInitials} />
            </Box>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenu.Item id="profile">Profile</DropdownMenu.Item>
            <DropdownMenu.Item id="appearance">Appearance</DropdownMenu.Item>
            <DropdownMenu.Item id="log-out">Log out</DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu>
      </Box>
    </Box>
  )
}
