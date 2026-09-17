'use client'

import { useState } from 'react'
import { Box, Button, Checkbox, Divider, Drawer, InlineIcon, Typography } from '@aivenio/aquarium'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import { ServiceIcon } from '@/components/ServiceIcon'
import {
  billableNodes,
  fmtEurPerMonth,
  isNodeAvailable,
  planFor,
  planTierFor,
  serviceNameFor,
  sumPrices,
  type Blueprint,
  type BlueprintNode,
  type ProjectContext,
} from './solutionBlueprints'

/** One gate row per billable item — nothing is created for an unchecked row. */
function GateRow({
  node,
  project,
  checked,
  onChange,
}: {
  node: BlueprintNode
  project: ProjectContext
  checked: boolean
  onChange: (next: boolean) => void
}) {
  const plan = planFor(node, project)

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
      <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={serviceNameFor(node, project)} />
      {node.iconId ? <ServiceIcon serviceTypeId={node.iconId} size={24} alt="" /> : null}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography.SmallStrong>{serviceNameFor(node, project)}</Typography.SmallStrong>
        <Typography.Small color="muted">
          {node.typeLabel} · {plan?.name}
        </Typography.Small>
      </Box>
      <Typography.SmallStrong>{plan ? fmtEurPerMonth(plan.eur) : '—'}</Typography.SmallStrong>
    </Box>
  )
}

/** Gated items are listed so the count adds up, but they are not billed or created. */
function GatedRow({ node, project }: { node: BlueprintNode; project: ProjectContext }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
      <Box style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
        <InlineIcon icon={warningSign} width="16px" height="16px" color="warning-default" />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography.SmallStrong>{serviceNameFor(node, project)}</Typography.SmallStrong>
        <Typography.Small color="warning-default">
          Runtime access required — not created now, not billed
        </Typography.Small>
      </Box>
      <Button.Ghost type="button" dense onClick={() => undefined}>
        Request access
      </Button.Ghost>
    </Box>
  )
}

export function BlueprintGateSheet({
  blueprint,
  project,
  selectedNodeIds,
  onClose,
  onConfirm,
}: {
  blueprint: Blueprint
  project: ProjectContext
  /** Nodes the blueprint proposed — optional nodes only appear once toggled on. */
  selectedNodeIds: string[]
  onClose: () => void
  onConfirm: (nodeIds: string[]) => void
}) {
  const selected = blueprint.nodes.filter((node) => selectedNodeIds.includes(node.id))
  const billable = billableNodes(selected)
  const gated = selected.filter((node) => !isNodeAvailable(node))
  const [checkedIds, setCheckedIds] = useState<string[]>(billable.map((node) => node.id))

  const checked = billable.filter((node) => checkedIds.includes(node.id))
  const total = sumPrices(checked, project)
  const confirmText =
    checked.length === 0
      ? 'Select at least one item'
      : `Create ${checked.length} service${checked.length === 1 ? '' : 's'} · ${fmtEurPerMonth(total)}`

  return (
    <Drawer
      open
      onClose={onClose}
      size="md"
      title="Confirm what gets created"
      primaryAction={{
        text: confirmText,
        disabled: checked.length === 0,
        onClick: () => onConfirm(checked.map((node) => node.id)),
      }}
      secondaryActions={[{ text: 'Cancel', onClick: onClose }]}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Typography.Small color="muted">
          Each item is created separately in {project.name}. Uncheck anything you do not want yet — you can
          add it later from your blueprint.
        </Typography.Small>

        <Divider />

        <Box style={{ display: 'flex', flexDirection: 'column' }}>
          {billable.map((node) => (
            <GateRow
              key={node.id}
              node={node}
              project={project}
              checked={checkedIds.includes(node.id)}
              onChange={(next) =>
                setCheckedIds((prev) =>
                  next ? [...prev, node.id] : prev.filter((id) => id !== node.id),
                )
              }
            />
          ))}
          {gated.map((node) => (
            <GatedRow key={node.id} node={node} project={project} />
          ))}
        </Box>

        <Divider />

        <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Typography.Small color="muted">
            Running total · {planTierFor(project.environment) === 'business' ? 'Business' : 'Startup'} plans
          </Typography.Small>
          <Typography.LargeStrong>{fmtEurPerMonth(total)}</Typography.LargeStrong>
        </Box>
      </Box>
    </Drawer>
  )
}

BlueprintGateSheet.displayName = 'BlueprintGateSheet'
GateRow.displayName = 'GateRow'
GatedRow.displayName = 'GatedRow'
