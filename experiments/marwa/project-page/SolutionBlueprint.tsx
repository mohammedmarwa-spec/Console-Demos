'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Divider,
  DropdownMenu,
  InlineIcon,
  Select,
  Switch,
  Typography,
} from '@aivenio/aquarium'
import arrowLeft from '@aivenio/aquarium/icons/arrowLeft'
import plus from '@aivenio/aquarium/icons/plus'
import projectIcon from '@aivenio/aquarium/icons/projects'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { aquariumSelectValue } from '@/lib/aquariumSelect'
import type { OutcomeId } from './ExploreSolutions'
import { BlueprintGateSheet } from './BlueprintGateSheet'
import {
  BLUEPRINTS,
  REGION_OPTIONS,
  blueprintTotal,
  fmtEurPerMonth,
  isNodeAvailable,
  planFor,
  planTierFor,
  serviceNameFor,
  siblingsOf,
  type BlueprintNode,
  type ProjectContext,
} from './solutionBlueprints'

const MONO = 'var(--aquarium-font-family-code, ui-monospace, Menlo, monospace)'

const CREATE_DEVELOPMENT_ACTION = 'create-development-project'

function Mono({
  children,
  color,
  nowrap,
}: {
  children: React.ReactNode
  color?: 'muted' | 'inactive'
  nowrap?: boolean
}) {
  return (
    <Box
      component="span"
      style={{
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: '20px',
        whiteSpace: nowrap ? 'nowrap' : undefined,
      }}
    >
      {color ? <Typography.Small color={color}>{children}</Typography.Small> : children}
    </Box>
  )
}

/** One row of the blueprint tree: glyph + service name + plan · price, toggle for optional nodes. */
function BlueprintRow({
  node,
  project,
  isLast,
  enabled,
  onToggle,
}: {
  node: BlueprintNode
  project: ProjectContext
  isLast: boolean
  enabled: boolean
  onToggle: (next: boolean) => void
}) {
  const plan = planFor(node, project)
  const gated = !isNodeAvailable(node)
  const dimmed = node.optional && !enabled

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          columnGap: 12,
          minHeight: 32,
          opacity: dimmed ? 0.55 : 1,
        }}
      >
        <Mono nowrap color={dimmed ? 'inactive' : undefined}>
          {isLast ? '└── ' : '├── '}
          {node.optional && !enabled ? '(optional) ' : ''}
          {serviceNameFor(node, project)}
        </Mono>
        {plan ? (
          <Mono nowrap color="muted">
            {plan.name} · {fmtEurPerMonth(plan.eur)}
          </Mono>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <InlineIcon icon={warningSign} width="14px" height="14px" color="warning-default" />
            <Typography.Small color="warning-default">Runtime access required</Typography.Small>
          </Box>
        )}
        {gated ? (
          <Button.Ghost type="button" dense onClick={() => undefined}>
            Request access
          </Button.Ghost>
        ) : node.optional ? (
          <Switch
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
            aria-label={`Include ${serviceNameFor(node, project)}`}
          />
        ) : null}
      </Box>
      {node.optional && node.note ? (
        <Box style={{ paddingLeft: 34, paddingBottom: 4 }}>
          <Typography.Caption color="muted">{node.note}</Typography.Caption>
        </Box>
      ) : null}
    </Box>
  )
}

/** UC3 — move the same selection to a cheaper sibling project without losing it. */
function ProjectSwitcher({
  project,
  projects,
  onProjectChange,
  onCreateDevelopmentProject,
}: {
  project: ProjectContext
  projects: ProjectContext[]
  onProjectChange: (projectId: string) => void
  onCreateDevelopmentProject: () => void
}) {
  const siblings = siblingsOf(project, projects)

  return (
    <DropdownMenu
      placement="bottom-left"
      onAction={(action) => {
        if (action === CREATE_DEVELOPMENT_ACTION) {
          onCreateDevelopmentProject()
          return
        }
        onProjectChange(String(action))
      }}
    >
      <DropdownMenu.Trigger>
        <Button.Ghost type="button" dense>
          Create in Development instead
        </Button.Ghost>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        <DropdownMenu.Section title="Projects in this unit">
          {siblings.map((sibling) => (
            <DropdownMenu.Item
              key={sibling.id}
              id={sibling.id}
              icon={projectIcon}
              description={`${sibling.environmentLabel} · ${planTierFor(sibling.environment) === 'business' ? 'HA plans' : 'Single-node plans'}`}
            >
              {sibling.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Section>
        <DropdownMenu.Item id={CREATE_DEVELOPMENT_ACTION} icon={plus} kind="action">
          Create Development project
        </DropdownMenu.Item>
      </DropdownMenu.Items>
    </DropdownMenu>
  )
}

export function SolutionBlueprint({
  outcomeId,
  project,
  projects,
  onProjectChange,
  onCreateDevelopmentProject,
  onChangeOutcome,
  onCreate,
}: {
  outcomeId: OutcomeId
  project: ProjectContext
  projects: ProjectContext[]
  onProjectChange: (projectId: string) => void
  onCreateDevelopmentProject: () => void
  onChangeOutcome: () => void
  onCreate: (payload: { plannedNodeIds: string[]; confirmedNodeIds: string[]; region: string }) => void
}) {
  const blueprint = BLUEPRINTS[outcomeId]
  // Optional nodes stay off until asked for; kept across project switches (UC3).
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const [region, setRegion] = useState(project.regionDefault)
  const [gateOpen, setGateOpen] = useState(false)
  const isProduction = project.environment === 'production'
  const total = blueprintTotal(blueprint, project, enabled)
  const selectedNodeIds = blueprint.nodes
    .filter((node) => !node.optional || enabled[node.id])
    .map((node) => node.id)

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ alignSelf: 'flex-start' }}>
        <Button.Ghost type="button" dense icon={arrowLeft} onClick={onChangeOutcome}>
          Back
        </Button.Ghost>
      </Box>

      <Box>
        <Typography.Subheading>{blueprint.title}</Typography.Subheading>
        <Box marginTop="2">
          <Typography.Default color="muted">
            Here is what we would create in {project.name}. Nothing is created until you confirm.
          </Typography.Default>
        </Box>
      </Box>

      {isProduction ? (
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <InlineIcon icon={warningSign} width="16px" height="16px" color="warning-default" />
          <Typography.Small color="warning-default">
            Production project — proposing HA plans. Trying it out?
          </Typography.Small>
          <ProjectSwitcher
            project={project}
            projects={projects}
            onProjectChange={onProjectChange}
            onCreateDevelopmentProject={onCreateDevelopmentProject}
          />
        </Box>
      ) : null}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <Box
          style={{
            border: '1px solid var(--aquarium-border-color-default)',
            borderRadius: 'var(--aquarium-border-radius-md, 8px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Mono>{project.name}</Mono>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {blueprint.nodes.map((node, index) => (
              <BlueprintRow
                key={node.id}
                node={node}
                project={project}
                isLast={index === blueprint.nodes.length - 1}
                enabled={enabled[node.id] ?? false}
                onToggle={(next) => setEnabled((prev) => ({ ...prev, [node.id]: next }))}
              />
            ))}
          </Box>
          <Divider />
          <Typography.Small color="muted">
            Names follow this project&apos;s convention. Edit after creation.
          </Typography.Small>
        </Box>

        <Box
          style={{
            border: '1px solid var(--aquarium-border-color-default)',
            borderRadius: 'var(--aquarium-border-radius-md, 8px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography.SmallStrong color="intense">You&apos;ll be able to</Typography.SmallStrong>
            {blueprint.capabilities.map((capability) => (
              <Box key={capability} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Box style={{ paddingTop: 2 }}>
                  <InlineIcon icon={tickCircle} width="16px" height="16px" color="success-default" />
                </Box>
                <Typography.Small color="muted">{capability}</Typography.Small>
              </Box>
            ))}
          </Box>

          <Divider />

          <Select
            labelText="Region"
            options={REGION_OPTIONS}
            value={region}
            onChange={(selected) => setRegion(aquariumSelectValue(selected, region))}
            helperText="Prefilled from this project's default"
            reserveSpaceForError={false}
          />

          <Divider />

          <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <Typography.Small color="muted">
              Total · {planTierFor(project.environment) === 'business' ? 'Business' : 'Startup'} plans
            </Typography.Small>
            <Typography.LargeStrong>{fmtEurPerMonth(total)}</Typography.LargeStrong>
          </Box>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button.Primary type="button" onClick={() => setGateOpen(true)}>
              Create blueprint
            </Button.Primary>
            <Button.Secondary type="button" onClick={onChangeOutcome}>
              Change outcome
            </Button.Secondary>
          </Box>
        </Box>
      </Box>

      {gateOpen ? (
        <BlueprintGateSheet
          blueprint={blueprint}
          project={project}
          selectedNodeIds={selectedNodeIds}
          onClose={() => setGateOpen(false)}
          onConfirm={(confirmedNodeIds) => {
            setGateOpen(false)
            onCreate({ plannedNodeIds: selectedNodeIds, confirmedNodeIds, region })
          }}
        />
      ) : null}
    </Box>
  )
}

SolutionBlueprint.displayName = 'SolutionBlueprint'
BlueprintRow.displayName = 'BlueprintRow'
ProjectSwitcher.displayName = 'ProjectSwitcher'
Mono.displayName = 'Mono'
