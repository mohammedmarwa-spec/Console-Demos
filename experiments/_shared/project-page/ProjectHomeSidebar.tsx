'use client'

import { Badge, Box, DropdownMenu, Icon, Navigation, Typography } from '@aivenio/aquarium'
import type { IconifyIcon } from '@iconify/react'
import homeIcon from '@aivenio/aquarium/icons/home'
import gridIcon from '@aivenio/aquarium/icons/grid'
import dataflow01Icon from '@aivenio/aquarium/icons/dataflow01'
import queriesEditorIcon from '@aivenio/aquarium/icons/queriesEditor'
import magicIcon from '@aivenio/aquarium/icons/proPlans'
import databaseIcon from '@aivenio/aquarium/icons/database'
import codeBlockIcon from '@aivenio/aquarium/icons/codeBlock'
import cloudIcon from '@aivenio/aquarium/icons/cloud'
import propertyIcon from '@aivenio/aquarium/icons/property'
import peopleIcon from '@aivenio/aquarium/icons/people'
import performanceIcon from '@aivenio/aquarium/icons/performance'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import { SidebarShell } from '@/components/SidebarShell'
import aiGatewayIcon from './icons/aiGatewayIcon'
import agentIcon from './icons/agentIcon'
import { useProjectPageData } from './ProjectPageDataContext'

type NavEntry = {
  id: string
  label: string
  icon: IconifyIcon
  badge?: string
}

type NavSection = {
  title?: string
  items: NavEntry[]
}

const SECTIONS: NavSection[] = [
  {
    title: 'PROJECT',
    items: [
      { id: 'overview', label: 'Overview', icon: homeIcon },
      { id: 'resources', label: 'Resources', icon: gridIcon },
      { id: 'architecture', label: 'Architecture', icon: dataflow01Icon },
    ],
  },
  {
    title: 'BUILD',
    items: [
      { id: 'aiven-studio', label: 'Aiven Studio', icon: magicIcon },
      { id: 'apps', label: 'Apps', icon: queriesEditorIcon },
      { id: 'agents', label: 'Agents', icon: agentIcon },
    ],
  },
  {
    title: 'DISCOVER',
    items: [{ id: 'data-hub', label: 'Data Hub', icon: databaseIcon }],
  },
  {
    title: 'OBSERVE',
    items: [
      { id: 'project-ai-insights', label: 'Project AI insights', icon: performanceIcon },
      { id: 'event-log', label: 'Event log', icon: propertyIcon },
    ],
  },
  {
    title: 'CONNECT',
    items: [
      { id: 'integration-endpoints', label: 'Integration endpoints', icon: codeBlockIcon },
      { id: 'vpcs', label: 'VPCs', icon: cloudIcon },
    ],
  },
  {
    title: 'OPERATE',
    items: [
      { id: 'ai-gateway', label: 'AI Gateway', icon: aiGatewayIcon },
      { id: 'permissions', label: 'Permissions', icon: peopleIcon },
    ],
  },
]

/** Resolve sidebar nav id to its display label (for page headers). */
export function getProjectNavLabel(id: string): string {
  for (const section of SECTIONS) {
    const match = section.items.find((item) => item.id === id)
    if (match) return match.label
  }
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export type ProjectHomeSidebarProps = {
  projectName?: string
  activeItem: string
  onItemClick: (id: string) => void
  /** Hide the sidebar project dropdown when the parent header already switches projects. */
  hideProjectSwitcher?: boolean
}

export function ProjectHomeSidebar({
  projectName: projectNameProp,
  activeItem,
  onItemClick,
  hideProjectSwitcher = false,
}: ProjectHomeSidebarProps) {
  const { projectName: projectNameFromData } = useProjectPageData()
  const projectName = projectNameProp ?? projectNameFromData

  return (
    <SidebarShell
      ariaLabel="Project navigation"
      omitHeader={hideProjectSwitcher}
      header={(collapsed) =>
        collapsed || hideProjectSwitcher ? null : (
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Box
              component="button"
              type="button"
              aria-label="Select project"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--aquarium-border-color-muted)',
                backgroundColor: 'var(--aquarium-background-color-body)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Box style={{ minWidth: 0 }}>
                <Box style={{ color: 'var(--aquarium-text-color-muted)', marginBottom: 2 }}>
                  <Typography.Caption>Project</Typography.Caption>
                </Box>
                <Typography.SmallStrong>{projectName}</Typography.SmallStrong>
              </Box>
              <Icon
                icon={chevronDownIcon}
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  color: 'var(--aquarium-text-color-muted)',
                }}
              />
            </Box>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenu.Item id="online-store-prod">{projectName}</DropdownMenu.Item>
            <DropdownMenu.Item id="online-store-staging">online-store-staging</DropdownMenu.Item>
            <DropdownMenu.Item id="online-store-dev">online-store-dev</DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu>
        )
      }
    >
      {(collapsed) =>
        SECTIONS.map((section, index) => (
          <Navigation.Section
            key={section.title ?? `primary-${index}`}
            title={collapsed ? undefined : section.title}
          >
            {section.items.map(({ id, label, icon, badge }) => (
              <Navigation.Item
                key={id}
                icon={icon}
                active={id === activeItem}
                href="#"
                aria-label={label}
                title={label}
                onClick={(e) => {
                  e.preventDefault()
                  onItemClick(id)
                }}
              >
                {badge ? (
                  <Box
                    component="span"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {label}
                    <Badge value={badge} dense kind="filled" />
                  </Box>
                ) : (
                  label
                )}
              </Navigation.Item>
            ))}
          </Navigation.Section>
        ))
      }
    </SidebarShell>
  )
}

ProjectHomeSidebar.displayName = 'ProjectHomeSidebar'
