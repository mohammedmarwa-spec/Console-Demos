'use client'

import { Box, Button, Card, DataTable, InlineIcon, Link, Section, StatusChip, Typography } from '@aivenio/aquarium'
import integrations from '@aivenio/aquarium/icons/integrations'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@/components/ServiceIcon'
import {
  REGION_OPTIONS,
  fmtEurPerMonth,
  isNodeAvailable,
  planFor,
  serviceNameFor,
  type Blueprint,
  type BlueprintNode,
  type ProjectContext,
} from './solutionBlueprints'

export type DeploymentState = {
  blueprint: Blueprint
  /** Nodes the blueprint proposed, including ones left out at the gate. */
  plannedNodeIds: string[]
  /** Nodes confirmed at the gate — these are the ones building. */
  createdNodeIds: string[]
  region: string
  resumeDismissed: boolean
}

type ServiceRow = {
  id: string
  node: BlueprintNode
  name: string
  typeLabel: string
  plan: string
  price: string
  state: 'building' | 'gated'
}

function regionLabel(region: string): string {
  return REGION_OPTIONS.find((option) => option.value === region)?.label ?? region
}

function toRows(state: DeploymentState, project: ProjectContext): ServiceRow[] {
  return state.blueprint.nodes
    .filter((node) => state.createdNodeIds.includes(node.id) || !isNodeAvailable(node))
    .map((node) => {
      const plan = planFor(node, project)
      return {
        id: node.id,
        node,
        name: serviceNameFor(node, project),
        typeLabel: node.typeLabel,
        plan: plan?.name ?? '—',
        price: plan ? fmtEurPerMonth(plan.eur) : '—',
        state: isNodeAvailable(node) ? 'building' : 'gated',
      }
    })
}

/** Top card: how much of the blueprint is on its way, and what gets wired up after. */
function BlueprintStatusCard({
  state,
  project,
}: {
  state: DeploymentState
  project: ProjectContext
}) {
  const planned = state.blueprint.nodes.filter((node) => state.plannedNodeIds.includes(node.id))
  const creating = planned.filter((node) => state.createdNodeIds.includes(node.id))
  const integration = state.blueprint.integration
  const integrationParents = integration
    ? state.blueprint.nodes.filter((node) => integration.between.includes(node.id))
    : []
  const integrationReady =
    integration !== undefined &&
    integrationParents.length === 2 &&
    integrationParents.every((node) => state.createdNodeIds.includes(node.id))

  return (
    <Card
      fullWidth
      title={
        <Card.Title>
          <span>Blueprint: {state.blueprint.title}</span>
        </Card.Title>
      }
      chips={[{ status: 'warning', text: `${creating.length} of ${planned.length} creating` }]}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography.Small color="muted">
          Building in {project.name} · {regionLabel(state.region)}
        </Typography.Small>
        {integrationReady ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InlineIcon icon={integrations} width="16px" height="16px" color="primary-graphic" />
            <Link href="#" onClick={(event) => event.preventDefault()}>
              {integration?.label}
            </Link>
            <Typography.Small color="muted">— created once both are running</Typography.Small>
          </Box>
        ) : null}
      </Box>
    </Card>
  )
}

/** UC4 edge — a partly confirmed blueprint is resumable, never a broken half-state. */
function ResumeCard({
  remaining,
  project,
  onAdd,
  onDismiss,
}: {
  remaining: BlueprintNode[]
  project: ProjectContext
  onAdd: (nodeId: string) => void
  onDismiss: () => void
}) {
  const names = remaining.map((node) => serviceNameFor(node, project)).join(', ')

  return (
    <Card
      fullWidth
      title={
        <Card.Title>
          <span>
            {remaining.length} remaining in your blueprint — {names}
          </span>
        </Card.Title>
      }
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Typography.Small color="muted">
          {remaining
            .map((node) => {
              const plan = planFor(node, project)
              return plan ? `${plan.name} · ${fmtEurPerMonth(plan.eur)}` : node.typeLabel
            })
            .join(' · ')}
        </Typography.Small>
        <Box style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Button.Primary type="button" dense onClick={() => remaining.forEach((node) => onAdd(node.id))}>
            Add
          </Button.Primary>
          <Button.Secondary type="button" dense onClick={onDismiss}>
            Dismiss
          </Button.Secondary>
        </Box>
      </Box>
    </Card>
  )
}

export function BlueprintDeploymentView({
  state,
  project,
  onAdd,
  onDismissResume,
}: {
  state: DeploymentState
  project: ProjectContext
  onAdd: (nodeId: string) => void
  onDismissResume: () => void
}) {
  const rows = toRows(state, project)
  const remaining = state.blueprint.nodes.filter(
    (node) =>
      state.plannedNodeIds.includes(node.id) &&
      !state.createdNodeIds.includes(node.id) &&
      isNodeAvailable(node),
  )

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BlueprintStatusCard state={state} project={project} />

      {remaining.length > 0 && !state.resumeDismissed ? (
        <ResumeCard remaining={remaining} project={project} onAdd={onAdd} onDismiss={onDismissResume} />
      ) : null}

      <Section title="Services">
        <DataTable
          ariaLabel="Services"
          sticky={false}
          rows={rows}
          columns={[
            {
              type: 'custom',
              headerName: 'Service',
              UNSAFE_render: (row: ServiceRow) => (
                <Box.Flex alignItems="center" gap="3">
                  {row.node.iconId ? (
                    <ServiceIcon serviceTypeId={row.node.iconId} size={24} alt="" />
                  ) : (
                    <InlineIcon icon={warningSign} width="20px" height="20px" color="warning-default" />
                  )}
                  <Box>
                    <Typography.SmallStrong>{row.name}</Typography.SmallStrong>
                    <Typography.Small color="muted">{row.typeLabel}</Typography.Small>
                  </Box>
                </Box.Flex>
              ),
            },
            { type: 'text', headerName: 'Plan', field: 'plan' },
            { type: 'text', headerName: 'Price', field: 'price' },
            {
              type: 'custom',
              headerName: 'Status',
              UNSAFE_render: (row: ServiceRow) =>
                row.state === 'building' ? (
                  <StatusChip dense status="warning" text="Building" />
                ) : (
                  <Box.Flex alignItems="center" gap="3">
                    <StatusChip dense status="warning" text="Runtime access required" />
                    <Link href="#" onClick={(event) => event.preventDefault()}>
                      Request access
                    </Link>
                  </Box.Flex>
                ),
            },
          ]}
        />
      </Section>
    </Box>
  )
}

BlueprintDeploymentView.displayName = 'BlueprintDeploymentView'
BlueprintStatusCard.displayName = 'BlueprintStatusCard'
ResumeCard.displayName = 'ResumeCard'
