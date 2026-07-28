'use client'

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
import arrowLeftIcon from '@aivenio/aquarium/icons/arrowLeft'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronRightIcon from '@aivenio/aquarium/icons/chevronRight'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import officeIcon from '@aivenio/aquarium/icons/office'
import tickIcon from '@aivenio/aquarium/icons/tick'
import { orgMenuIcon } from './menuIllustrations'
import {
  DEFAULT_CURRENT_ORG_ID,
  DEFAULT_CURRENT_UNIT_ID,
  MOCK_ORGANIZATIONS,
  type MockOrganization,
} from './shellNavMockData'

type OrganizationSelectorProps = {
  orgName?: string
  orgSublabel?: string
  currentOrganizationId?: string
  currentUnitId?: string
}

function OrganizationSelectorItem({
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

function OrganizationSelectorHeader({
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
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                }}
              >
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
 * Shell organization switcher — mirrors Console OrganizationSelectorContent.
 * Mock data only; selecting an item updates local panel state and does not navigate.
 */
export function OrganizationSelector({
  orgName = 'BigCo Ltd.',
  orgSublabel = 'Engineering',
  currentOrganizationId = DEFAULT_CURRENT_ORG_ID,
  currentUnitId = DEFAULT_CURRENT_UNIT_ID,
}: OrganizationSelectorProps) {
  const [isOpen, setOpen] = useState(false)
  const [selectedOrganizationInList, setSelectedOrganizationInList] =
    useState<MockOrganization | null>(null)

  const currentOrg =
    MOCK_ORGANIZATIONS.find((org) => org.id === currentOrganizationId) ??
    MOCK_ORGANIZATIONS.find((org) => org.name === orgName) ??
    MOCK_ORGANIZATIONS[0]!

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
        // Unit or org root selected while drilled in — shell only, close.
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

  const showUnitInTrigger = Boolean(orgSublabel)

  return (
    <DropdownMenu
      maxWidth={300}
      searchable={false}
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onAction={handleMenuAction}
      header={
        <OrganizationSelectorHeader
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
          aria-label="Switch account"
          style={{
            backgroundColor: isOpen
              ? 'var(--aquarium-background-color-muted)'
              : 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: showUnitInTrigger ? '6px 12px' : '8px 12px',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 2,
            flexShrink: 0,
            color: 'var(--aquarium-text-color-default)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
            {showUnitInTrigger ? (
              <>
                <Box
                  component="span"
                  style={{
                    fontSize: 12,
                    lineHeight: 1,
                    color: 'var(--aquarium-text-color-muted)',
                    textAlign: 'right',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {orgName}
                </Box>
                <Box
                  component="span"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.42,
                    textAlign: 'right',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {orgSublabel}
                </Box>
              </>
            ) : (
              <Box
                component="span"
                style={{
                  fontSize: 14,
                  lineHeight: 1.42,
                  textAlign: 'right',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {orgName}
              </Box>
            )}
          </Box>
          <Icon icon={officeIcon} style={{ width: 20, height: 20 }} />
          <Icon
            icon={isOpen ? chevronUpIcon : chevronDownIcon}
            style={{ width: 12, height: 12 }}
          />
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
                  <OrganizationSelectorItem
                    text={selectedOrganizationInList.name}
                    chip="ORGANIZATION"
                  />
                </DropdownMenu.Item>,
                ...selectedOrganizationInList.units.map((unit) => (
                  <DropdownMenu.Item key={unit.id} id={unit.id} textValue={unit.name}>
                    <OrganizationSelectorItem
                      text={unit.name}
                      selected={unit.id === currentUnitId || unit.name === orgSublabel}
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
                  <OrganizationSelectorItem
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
