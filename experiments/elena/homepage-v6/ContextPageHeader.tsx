'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useState, type Key } from 'react'
import {
  Box,
  Button,
  Divider,
  DropdownMenu,
  Icon,
  InlineIcon,
  StatusChip,
  Typography,
} from '@aivenio/aquarium'
import type { IconProps } from '@aivenio/aquarium'
import arrowLeftIcon from '@aivenio/aquarium/icons/arrowLeft'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import helpIcon from '@aivenio/aquarium/icons/help'
import officeIcon from '@aivenio/aquarium/icons/office'
import proPlansIcon from '@aivenio/aquarium/icons/proPlans'
import tickIcon from '@aivenio/aquarium/icons/tick'
import toolsIcon from '@aivenio/aquarium/icons/tools'
import userIcon from '@aivenio/aquarium/icons/user'
import { AivenConsoleLogo } from '@/components/ConsoleHeader'
import { orgMenuIcon } from '@/components/header/menuIllustrations'
import {
  DEFAULT_CURRENT_UNIT_ID,
  MOCK_ORGANIZATIONS,
  type MockOrganization,
} from '@/components/header/shellNavMockData'
import { ProjectSelector } from './ProjectSelector'
import styles from './ContextPageHeader.module.css'

export type ContextPageHeaderProps = {
  orgName: string
  /** When set, renders the project segment after org. */
  projectName?: string
  activeProjectId?: string
  userInitials?: string
  onLogoClick?: () => void
  /** Navigate home when the org segment label is activated (project view). */
  onOrgHomeClick?: () => void
  /** Optional trail segments after project (service, page, etc.). */
  extraSegments?: ReactNode
  onViewAllProjects?: () => void
}

const segmentTriggerStyle = (isOpen: boolean): CSSProperties => ({
  backgroundColor: isOpen ? 'var(--aquarium-background-color-muted)' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 8px',
  height: 32,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 2,
  flexShrink: 0,
  color: 'var(--aquarium-text-color-default)',
  fontSize: 14,
  lineHeight: '20px',
  maxWidth: 220,
})

function SlashSeparator() {
  return (
    <Box
      aria-hidden
      className={styles.slash}
      style={{
        color: 'var(--aquarium-text-color-muted)',
        fontSize: 14,
        lineHeight: '20px',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      /
    </Box>
  )
}

function IconAction({
  label,
  icon,
  as = 'button',
}: {
  label: string
  icon: IconProps['icon']
  as?: 'button' | 'span'
}) {
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

function OrgSelectorItem({
  text,
  chip,
  chevron,
  selected,
}: {
  text: string
  chip?: string
  chevron?: boolean
  selected?: boolean
}) {
  return (
    <Box
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        padding: 2,
      }}
    >
      <Box
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        <Typography.Small>{text}</Typography.Small>
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {chip && <StatusChip dense text={chip} />}
        {chevron && <InlineIcon icon={chevronRightIcon} color="default" />}
        {selected && <InlineIcon icon={tickIcon} color="default" />}
      </Box>
    </Box>
  )
}

function OrgSelectorHeader({
  organizationName,
  onBackClick,
}: {
  organizationName: string | null
  onBackClick: () => void
}) {
  return (
    <>
      <Box
        style={{
          position: 'relative',
          padding: '10px 0 10px 20px',
          backgroundColor: 'var(--aquarium-background-color-primary-active)',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Box style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <Box style={{ marginBottom: 4 }}>
              <Typography.Large color="intense">Organizations</Typography.Large>
            </Box>
            <Typography.SmallStrong color="muted">
              Switch between organizations and units to manage projects.
            </Typography.SmallStrong>
          </Box>
          <Box
            style={{
              position: 'relative',
              right: -10,
              color: 'var(--aquarium-text-color-primary-graphic)',
              opacity: 0.4,
              flexShrink: 0,
            }}
          >
            <Icon icon={orgMenuIcon} height={80} width={80} />
          </Box>
        </Box>
      </Box>
      {organizationName && (
        <Box style={{ padding: '16px 16px 0' }}>
          <Box
            component="button"
            type="button"
            onClick={onBackClick}
            style={{
              maxWidth: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Typography.DefaultStrong color="muted">
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                <InlineIcon icon={arrowLeftIcon} />
                <Box
                  component="span"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {organizationName}
                </Box>
              </Box>
            </Typography.DefaultStrong>
          </Box>
        </Box>
      )}
    </>
  )
}

/**
 * Single-line org segment for the context trail.
 * When `onLabelClick` is set (project view), the label navigates home;
 * the chevron still opens the organization switcher.
 */
function CompactOrgSelector({
  orgName,
  onLabelClick,
}: {
  orgName: string
  onLabelClick?: () => void
}) {
  const [isOpen, setOpen] = useState(false)
  const [selectedOrganizationInList, setSelectedOrganizationInList] =
    useState<MockOrganization | null>(null)

  const currentOrg =
    MOCK_ORGANIZATIONS.find((org) => org.name === orgName) ?? MOCK_ORGANIZATIONS[0]!
  const currentUnitId = DEFAULT_CURRENT_UNIT_ID

  const handleClose = useCallback(() => {
    setSelectedOrganizationInList(null)
  }, [])

  const handleOpen = useCallback(() => {
    if (MOCK_ORGANIZATIONS.length === 1 && MOCK_ORGANIZATIONS[0]) {
      setSelectedOrganizationInList(MOCK_ORGANIZATIONS[0])
      return
    }
    if (currentOrg.units.length > 0 || currentUnitId) {
      setSelectedOrganizationInList(currentOrg)
      return
    }
    setSelectedOrganizationInList(null)
  }, [currentOrg, currentUnitId])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) handleOpen()
      else handleClose()
      setOpen(newOpen)
    },
    [handleClose, handleOpen],
  )

  const handleMenuAction = useCallback(
    (organizationOrUnitId: Key) => {
      const id = String(organizationOrUnitId)
      if (selectedOrganizationInList) {
        if (
          selectedOrganizationInList.id === id ||
          selectedOrganizationInList.units.some((u) => u.id === id)
        ) {
          setOpen(false)
          handleClose()
        }
        return
      }
      const org = MOCK_ORGANIZATIONS.find((o) => o.id === id)
      if (!org) return
      if (org.units.length === 0) {
        setOpen(false)
        handleClose()
        return
      }
      setSelectedOrganizationInList(org)
    },
    [handleClose, selectedOrganizationInList],
  )

  const triggerInner = (
    <>
      <Icon icon={officeIcon} color="muted" style={{ width: 16, height: 16, flexShrink: 0 }} />
      {onLabelClick ? (
        <Box
          component="span"
          role="link"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onLabelClick()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation()
              event.preventDefault()
              onLabelClick()
            }
          }}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            cursor: 'pointer',
          }}
        >
          {orgName}
        </Box>
      ) : (
        <Box
          component="span"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {orgName}
        </Box>
      )}
      <Icon
        icon={isOpen ? chevronUpIcon : chevronDownIcon}
        style={{ width: 12, height: 12, flexShrink: 0, opacity: 0.7 }}
      />
    </>
  )

  return (
    <DropdownMenu
      maxWidth={300}
      searchable={false}
      placement="bottom-start"
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onAction={handleMenuAction}
      header={
        <OrgSelectorHeader
          organizationName={selectedOrganizationInList?.name ?? null}
          onBackClick={() => setSelectedOrganizationInList(null)}
        />
      }
      footer={
        !selectedOrganizationInList ? (
          <Box>
            <Box style={{ padding: '20px 16px' }}>
              <Divider />
            </Box>
            <Box style={{ padding: '0 16px 20px' }}>
              <Box style={{ paddingInline: 12 }}>
                <Button.Ghost dense onClick={() => setOpen(false)}>
                  Manage organizations
                </Button.Ghost>
              </Box>
            </Box>
          </Box>
        ) : undefined
      }
    >
      <DropdownMenu.Trigger>
        <Box
          component="button"
          type="button"
          aria-label="Switch organization"
          style={segmentTriggerStyle(isOpen)}
        >
          {triggerInner}
        </Box>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        <DropdownMenu.Section
          title={selectedOrganizationInList?.name ? undefined : 'ALL ORGANIZATIONS'}
        >
          {selectedOrganizationInList
            ? [
                <DropdownMenu.Item
                  key={selectedOrganizationInList.id}
                  id={selectedOrganizationInList.id}
                  textValue={selectedOrganizationInList.name}
                >
                  <OrgSelectorItem text={selectedOrganizationInList.name} chip="ORGANIZATION" />
                </DropdownMenu.Item>,
                ...selectedOrganizationInList.units.map((unit) => (
                  <DropdownMenu.Item key={unit.id} id={unit.id} textValue={unit.name}>
                    <OrgSelectorItem
                      text={unit.name}
                      selected={unit.id === currentUnitId}
                    />
                  </DropdownMenu.Item>
                )),
              ]
            : MOCK_ORGANIZATIONS.map((org) => (
                <DropdownMenu.Item
                  key={org.id}
                  id={org.id}
                  textValue={org.name}
                  closeOnSelect={org.units.length === 0}
                >
                  <OrgSelectorItem
                    text={org.name}
                    chip={org.id === currentOrg.id ? 'CURRENT' : undefined}
                    chevron={org.units.length > 0}
                  />
                </DropdownMenu.Item>
              ))}
        </DropdownMenu.Section>
      </DropdownMenu.Items>
    </DropdownMenu>
  )
}

/**
 * Compact slash-separated context trail — replaces content breadcrumbs for PG convenience.
 * Homepage: Logo · Org
 * Project: Logo · Org / Project
 * Extra segments (service, page) can be appended via `extraSegments`.
 */
export function ContextPageHeader({
  orgName,
  projectName,
  activeProjectId,
  userInitials = 'EI',
  onLogoClick,
  onOrgHomeClick,
  extraSegments,
  onViewAllProjects,
}: ContextPageHeaderProps) {
  const showProject = Boolean(projectName)

  return (
    <Box
      component="nav"
      aria-label="Context navigation"
      className={styles.header}
      style={{
        height: 56,
        backgroundColor: 'var(--aquarium-background-color-body)',
        borderBottom: '1px solid var(--aquarium-border-color-muted)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box
        component="button"
        type="button"
        aria-label="Go to homepage"
        onClick={onLogoClick}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: onLogoClick ? 'pointer' : 'default',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <AivenConsoleLogo width={32} />
      </Box>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flex: 1,
          minWidth: 0,
          marginLeft: 8,
        }}
      >
        <CompactOrgSelector
          orgName={orgName}
          onLabelClick={showProject ? onOrgHomeClick : undefined}
        />

        {showProject && projectName ? (
          <>
            <SlashSeparator />
            <ProjectSelector
              projectName={projectName}
              activeProjectId={activeProjectId}
              variant="segment"
              onViewAllProjects={onViewAllProjects}
            />
          </>
        ) : null}

        {extraSegments}
      </Box>

      <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Box style={{ marginRight: 8 }}>
          <StatusChip dense text="All systems operational" status="success" badge />
        </Box>
        <IconAction label="Ask AI" icon={proPlansIcon} />
        <Box style={{ height: 24, marginLeft: 4, marginRight: 4 }}>
          <Divider direction="vertical" size={2} />
        </Box>
        <IconAction label="Tools" icon={toolsIcon} />
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <IconAction label="Help" icon={helpIcon} as="span" />
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
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon icon={userIcon} color="muted" style={{ width: 20, height: 20 }} />
            </Box>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenu.Item id="profile">Profile ({userInitials})</DropdownMenu.Item>
            <DropdownMenu.Item id="appearance">Appearance</DropdownMenu.Item>
            <DropdownMenu.Item id="log-out">Log out</DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu>
      </Box>
    </Box>
  )
}

ContextPageHeader.displayName = 'ContextPageHeader'
