'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  InlineIcon,
  Popover,
  SearchInput,
  Typography,
} from '@aivenio/aquarium'
import chevronDownIcon from '@aivenio/aquarium/icons/chevronDown'
import chevronUpIcon from '@aivenio/aquarium/icons/chevronUp'
import folderCloseIcon from '@aivenio/aquarium/icons/folderClose'
import plusIcon from '@aivenio/aquarium/icons/plus'
import tickIcon from '@aivenio/aquarium/icons/tick'
import { projectsMenuIcon } from '@/components/header/menuIllustrations'
import { PROJECTS, type HomeProject } from './mockData'

type ProjectSelectorProps = {
  projectName: string
  /** @deprecated Two-line chrome removed; kept for call-site compatibility. */
  projectSublabel?: string
  activeProjectId?: string
  onViewAllProjects?: () => void
  /** `segment` = single-line icon + name + chevron for the context trail. */
  variant?: 'segment' | 'default'
}

function ProjectListItem({
  project,
  selected,
}: {
  project: HomeProject
  selected: boolean
}) {
  return (
    <Box
      component="li"
      style={{
        listStyle: 'none',
        marginBottom: 1,
        width: '100%',
      }}
    >
      <Popover.CloseToggle>
        <Box
          component="button"
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 8,
            border: 'none',
            backgroundColor: selected
              ? 'var(--aquarium-background-color-muted)'
              : 'transparent',
            cursor: 'pointer',
            color: 'var(--aquarium-text-color-default)',
            textAlign: 'left',
            borderRadius: 2,
          }}
        >
          <Box
            style={{
              overflow: 'hidden',
              maxWidth: 220,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography.Default>{project.name}</Typography.Default>
          </Box>
          {selected && <InlineIcon icon={tickIcon} />}
        </Box>
      </Popover.CloseToggle>
    </Box>
  )
}

/**
 * Header project switcher — single-line trail segment (icon + name + chevron).
 */
export function ProjectSelector({
  projectName,
  activeProjectId,
  onViewAllProjects,
  variant = 'segment',
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedId = activeProjectId ?? projectName
  const searchEnabled = PROJECTS.length >= 5
  const showSearchResults = searchTerm.length >= 1
  const foundProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return []
    return PROJECTS.filter((project) => project.name.toLowerCase().includes(query))
  }, [searchTerm])

  const recentProjects = PROJECTS.slice(0, 4)
  const isSegment = variant === 'segment'

  return (
    <Popover
      placement="bottom-left"
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setSearchTerm('')
      }}
    >
      <Popover.Trigger>
        <Box
          component="button"
          type="button"
          aria-expanded={isOpen}
          aria-label="Switch project"
          style={{
            backgroundColor: isOpen
              ? 'var(--aquarium-background-color-muted)'
              : 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: isSegment ? '4px 8px' : '6px 12px',
            height: isSegment ? 32 : 40,
            display: 'flex',
            alignItems: 'center',
            gap: isSegment ? 6 : 8,
            borderRadius: 2,
            flexShrink: 0,
            color: 'var(--aquarium-text-color-default)',
            fontSize: 14,
            lineHeight: '20px',
            maxWidth: 220,
          }}
        >
          <Icon
            icon={folderCloseIcon}
            color="muted"
            style={{ width: isSegment ? 16 : 20, height: isSegment ? 16 : 20, flexShrink: 0 }}
          />
          <Box
            component="span"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {projectName}
          </Box>
          <Icon
            icon={isOpen ? chevronUpIcon : chevronDownIcon}
            style={{ width: 12, height: 12, flexShrink: 0, opacity: 0.7 }}
          />
        </Box>
      </Popover.Trigger>
      <Popover.Panel>
        <Box
          style={{
            width: 250,
            borderRadius: 2,
            backgroundColor: 'var(--aquarium-background-color-overlay)',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '10px 0 10px 20px',
              backgroundColor: 'var(--aquarium-background-color-primary-active)',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Box style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <Box style={{ marginBottom: 4 }}>
                  <Typography.Large color="intense">Projects</Typography.Large>
                </Box>
                <Typography.SmallStrong color="muted">
                  Easily switch between recent projects or view all projects.
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
                <Icon icon={projectsMenuIcon} height={80} width={80} />
              </Box>
            </Box>
          </Box>

          <Box style={{ padding: '20px 12px' }}>
            {searchEnabled && (
              <Box>
                <Box
                  style={{
                    marginBottom: 4,
                    padding: '0 8px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--aquarium-text-color-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Search projects
                </Box>
                <Box style={{ paddingLeft: 8, marginBottom: showSearchResults ? 12 : 0 }}>
                  <SearchInput
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </Box>
                {showSearchResults &&
                  (foundProjects.length > 0 ? (
                    <Box
                      component="ul"
                      style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        maxHeight: 272,
                        overflowY: 'auto',
                      }}
                    >
                      {foundProjects.map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          selected={project.id === selectedId}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box style={{ paddingLeft: 8 }}>
                      <Typography.Small color="danger-default">
                        No results matching your criteria!
                      </Typography.Small>
                    </Box>
                  ))}
              </Box>
            )}

            {!showSearchResults && recentProjects.length > 0 && (
              <Box style={{ marginBottom: 12, marginTop: searchEnabled ? 24 : 0 }}>
                <Box
                  style={{
                    marginBottom: 4,
                    padding: '0 8px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--aquarium-text-color-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Recent projects
                </Box>
                <Box component="ul" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {recentProjects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      selected={project.id === selectedId}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box
              style={{
                height: 1,
                backgroundColor: 'var(--aquarium-border-color-muted)',
                marginBottom: 10,
              }}
            />

            <Box style={{ width: '100%', paddingLeft: 8, fontWeight: 500 }}>
              <Popover.CloseToggle>
                <Button.Ghost dense icon={folderCloseIcon} onClick={() => onViewAllProjects?.()}>
                  View all projects
                </Button.Ghost>
              </Popover.CloseToggle>
            </Box>
            <Box style={{ width: '100%', paddingLeft: 8, fontWeight: 500 }}>
              <Popover.CloseToggle>
                <Button.Ghost dense icon={plusIcon}>
                  Create project
                </Button.Ghost>
              </Popover.CloseToggle>
            </Box>
          </Box>
        </Box>
      </Popover.Panel>
    </Popover>
  )
}

ProjectSelector.displayName = 'ProjectSelector'
