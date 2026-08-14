'use client'

import { Box, Button, DropdownMenu, PageHeader, Typography } from '@aivenio/aquarium'
import { OverviewContent } from './OverviewContent'
import { ServicesListContent } from './ServicesListContent'
import { ArchitectureContent } from './ArchitectureContent'
import { CREATE_MENU_AGENT, CREATE_MENU_SECTIONS, CREATE_MENU_SOLUTION } from './createMenu'
import { useProjectPageData } from './ProjectPageDataContext'
import type { ProjectTab } from './types'

export type ProjectHomeContentProps = {
  /** Active view driven by sidebar navigation. */
  activeView?: ProjectTab
}

export function ProjectHomeContent({ activeView = 'overview' }: ProjectHomeContentProps) {
  const { projectName, projectSubtitle } = useProjectPageData()
  const fillCanvas = activeView === 'architecture'

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        overflow: fillCanvas ? 'hidden' : 'auto',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box
        style={{
          marginBottom: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Box style={{ flex: 1, minWidth: 0 }}>
          <PageHeader
            title={projectName}
            subtitle={
              <Typography.Default color="muted">{projectSubtitle}</Typography.Default>
            }
          />
        </Box>
        <Box style={{ display: 'flex', gap: 8, flexShrink: 0, paddingTop: 4 }}>
          <Button.Dropdown type="button" kind="secondary">
            Connect AI editor
          </Button.Dropdown>
          <DropdownMenu placement="bottom-right">
            <DropdownMenu.Trigger>
              <Button.Dropdown type="button" kind="primary">
                Create
              </Button.Dropdown>
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              {CREATE_MENU_SECTIONS.map((section) => (
                <DropdownMenu.Section key={section.title} title={section.title}>
                  {section.items.map((item) => (
                    <DropdownMenu.Item key={item.id} id={item.id}>
                      {item.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Section>
              ))}
              <DropdownMenu.Item id={CREATE_MENU_AGENT.id}>{CREATE_MENU_AGENT.label}</DropdownMenu.Item>
              <DropdownMenu.Section title={CREATE_MENU_SOLUTION.title}>
                {CREATE_MENU_SOLUTION.items.map((item) => (
                  <DropdownMenu.Item key={item.id} id={item.id}>
                    {item.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Section>
            </DropdownMenu.Items>
          </DropdownMenu>
        </Box>
      </Box>

      {activeView === 'overview' ? <OverviewContent /> : null}
      {activeView === 'resources' ? <ServicesListContent /> : null}
      {activeView === 'architecture' ? (
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ArchitectureContent />
        </Box>
      ) : null}
    </Box>
  )
}

ProjectHomeContent.displayName = 'ProjectHomeContent'
