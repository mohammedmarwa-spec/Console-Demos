'use client'

import { useState, type ReactNode } from 'react'
import { Box, Button, Navigation } from '@aivenio/aquarium'
import collapsePanelIcon from '@aivenio/aquarium/icons/caretLeft'
import expandPanelIcon from '@aivenio/aquarium/icons/caretRight'
import styles from './SidebarShell.module.css'

export const SIDEBAR_WIDTH_EXPANDED = 280
export const SIDEBAR_WIDTH_COLLAPSED = 68

export type SidebarShellRender = ReactNode | ((collapsed: boolean) => ReactNode)

export type SidebarShellProps = {
  ariaLabel: string
  header: SidebarShellRender
  children: SidebarShellRender
  /** Skip header slot and its divider (e.g. when context lives in the page header). */
  omitHeader?: boolean
}

function resolveSlot(slot: SidebarShellRender, collapsed: boolean): ReactNode {
  return typeof slot === 'function' ? slot(collapsed) : slot
}

/**
 * Shared Console sidebar chrome: collapsible rail, header + divider,
 * top-aligned menu, and footer collapse control. Matches production
 * NavigationContainer (68px collapsed, icon-only preview).
 */
export function SidebarShell({
  ariaLabel,
  header,
  children,
  omitHeader = false,
}: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box
      className={styles.shell}
      data-collapsed={collapsed ? 'true' : 'false'}
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      <Navigation aria-label={ariaLabel}>
        {omitHeader ? null : (
          <>
            <Navigation.Header>
              {resolveSlot(header, collapsed) ?? (
                <Box style={{ minHeight: 44 }} aria-hidden />
              )}
            </Navigation.Header>
            <Navigation.Divider />
          </>
        )}
        <li className={styles.menu} role="presentation">
          <ul className={styles.menuList} role="group">
            {resolveSlot(children, collapsed)}
          </ul>
        </li>
        <Navigation.Footer>
          <Box style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
            <Button.Icon
              type="button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              tooltip={collapsed ? 'Expand' : 'Collapse'}
              icon={collapsed ? expandPanelIcon : collapsePanelIcon}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Box>
        </Navigation.Footer>
      </Navigation>
    </Box>
  )
}

SidebarShell.displayName = 'SidebarShell'
