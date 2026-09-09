'use client'

import { useEffect, useLayoutEffect, useMemo, useState, type RefObject } from 'react'
import { Box, Button, StatusChip, Typography } from '@aivenio/aquarium'
import crossIcon from '@aivenio/aquarium/icons/cross'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import type { ServiceRow } from '@/screens/ProjectServices'
import {
  buildClusterForService,
  rollup,
  STATUS,
  STATUS_ORDER,
  type ClusterNode,
  type NodeStatusKey,
  type NodeTone,
} from './clusterNodes'

// Reuse the same token mapping as NodeView so colors stay consistent.
const TONE_COLOR: Record<NodeTone, string> = {
  success: 'var(--aquarium-background-color-success-graphic)',
  info: 'var(--aquarium-background-color-info-graphic)',
  warning: 'var(--aquarium-background-color-warning-graphic)',
  neutral: 'var(--aquarium-background-color-muted)',
  danger: 'var(--aquarium-background-color-danger-graphic)',
}

// Match the tier chips used in the Cluster overview panel (NodeView RoleChips).
const TIER_TONE: Record<string, NodeTone> = { Hot: 'warning', Warm: 'info', Cold: 'neutral' }

/** How many rows we consider "shown at a glance" for the "+N more" footer label. */
const GLANCE_ROWS = 9
const PANEL_WIDTH = 680

type FilterKey = 'all' | NodeStatusKey

function StatusDot({ tone }: { tone: NodeTone }) {
  return (
    <Box
      component="span"
      style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TONE_COLOR[tone], flexShrink: 0 }}
    />
  )
}

/** Compact monospace role-string chip (e.g. "*mc", "-dHicND"). */
function RoleCode({ raw }: { raw: string }) {
  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--aquarium-border-radius-default)',
        border: '1px solid var(--aquarium-border-color-default)',
        backgroundColor: 'var(--aquarium-background-color-layer)',
      }}
    >
      <Box component="span" style={{ textDecoration: 'underline' }}>
        <Typography.Code>{raw}</Typography.Code>
      </Box>
    </Box>
  )
}

/** Tier chip — same Aquarium StatusChip styling as the Cluster overview panel. */
function TierPill({ tier }: { tier: string }) {
  return <StatusChip dense status={TIER_TONE[tier] ?? 'neutral'} text={tier} />
}

function FilterChip({
  active,
  count,
  label,
  tone,
  onClick,
}: {
  active: boolean
  count: number
  label: string
  tone?: NodeTone
  onClick: () => void
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 9999,
        cursor: 'pointer',
        border: active
          ? '1px solid var(--aquarium-border-color-focus, var(--aquarium-primary-color-default))'
          : '1px solid var(--aquarium-border-color-default)',
        backgroundColor: active
          ? 'var(--aquarium-background-color-primary-subtle, var(--aquarium-background-color-layer))'
          : 'var(--aquarium-background-color-body)',
      }}
    >
      {tone ? <StatusDot tone={tone} /> : null}
      <Typography.SmallStrong color="intense">{count}</Typography.SmallStrong>
      <Typography.Small color="muted">{label}</Typography.Small>
    </Box>
  )
}

function NodeRow({ service, node }: { service: string; node: ClusterNode }) {
  const tone = node.status.tone
  const tierChip = node.chips.find((c) => c.tier)?.tier
  const isWarning = node.status.key === 'timing_out'

  const copy = () => {
    void navigator.clipboard?.writeText(`${service}-${node.n}`)
  }

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr)',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderBottom: '1px solid var(--aquarium-border-color-subtle, var(--aquarium-border-color-default))',
        backgroundColor: isWarning ? 'var(--aquarium-background-color-warning-subtle, transparent)' : 'transparent',
      }}
    >
      {/* NAME */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Box
          component="span"
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography.Code>{service}</Typography.Code>
        </Box>
        <Typography.SmallStrong color="intense">{node.n}</Typography.SmallStrong>
        {node.isLeader ? (
          <Box
            component="span"
            aria-label="Elected cluster manager"
            title="Elected cluster manager"
            style={{ color: 'var(--aquarium-background-color-warning-graphic)', flexShrink: 0, lineHeight: 1 }}
          >
            ★
          </Box>
        ) : null}
        <Button.Icon type="button" aria-label="Copy node name" tooltip="Copy" icon={duplicateIcon} onClick={copy} />
      </Box>

      {/* ROLE */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <RoleCode raw={node.raw} />
        {tierChip ? <TierPill tier={tierChip} /> : null}
      </Box>

      {/* STATUS */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <StatusDot tone={tone} />
        <Box component="span" style={{ color: TONE_COLOR[tone] }}>
          <Typography.SmallStrong>{node.status.label}</Typography.SmallStrong>
        </Box>
      </Box>

      {/* SYNC PROGRESS */}
      <Box style={{ minWidth: 0 }}>
        {node.sync ? (
          <Typography.Small color="muted">
            {node.sync.done} {node.sync.unitDone} / {node.sync.total} {node.sync.unitTotal}
          </Typography.Small>
        ) : (
          <Typography.Small color="muted">—</Typography.Small>
        )}
      </Box>
    </Box>
  )
}

export function NodesPopover({
  service,
  open,
  triggerRef,
  onClose,
  onViewAll,
}: {
  service: ServiceRow
  open: boolean
  triggerRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onViewAll: () => void
}) {
  const cluster = useMemo(() => buildClusterForService(service.serviceName), [service.serviceName])
  const segments = useMemo(() => rollup(cluster.nodes), [cluster.nodes])
  const [filter, setFilter] = useState<FilterKey>('all')
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  // Anchor the panel to the trigger (fixed positioning avoids clipping by scroll containers).
  useLayoutEffect(() => {
    if (!open) return
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 12))
    setPos({ top: rect.bottom + 8, left })
  }, [open, triggerRef])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(
    () => (filter === 'all' ? cluster.nodes : cluster.nodes.filter((n) => n.status.key === filter)),
    [cluster.nodes, filter],
  )

  if (!open || !pos) return null

  const hidden = Math.max(0, filtered.length - GLANCE_ROWS)

  return (
    <>
      {/* Click-away backdrop */}
      <Box
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'transparent' }}
      />

      {/* Panel */}
      <Box
        role="dialog"
        aria-label="Nodes"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: PANEL_WIDTH,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--aquarium-border-radius-large, 12px)',
          border: '1px solid var(--aquarium-border-color-default)',
          backgroundColor: 'var(--aquarium-background-color-body)',
          boxShadow: 'var(--aquarium-box-shadow-hover, 0 12px 32px rgba(0,0,0,0.18))',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
          }}
        >
          <Typography.LargeStrong color="intense">Nodes</Typography.LargeStrong>
          <Button.Icon type="button" aria-label="Close" tooltip="Close" icon={crossIcon} onClick={onClose} />
        </Box>

        {/* Filter chips */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 14px', flexWrap: 'wrap' }}>
          <FilterChip
            active={filter === 'all'}
            count={cluster.nodes.length}
            label="All nodes"
            onClick={() => setFilter('all')}
          />
          {STATUS_ORDER.filter((k) => segments.some((s) => s.key === k)).map((k) => {
            const seg = segments.find((s) => s.key === k)!
            return (
              <FilterChip
                key={k}
                active={filter === k}
                count={seg.count}
                label={STATUS[k].label}
                tone={STATUS[k].tone}
                onClick={() => setFilter(k)}
              />
            )
          })}
        </Box>

        {/* Column headers */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr)',
            gap: 12,
            padding: '8px 20px',
            borderTop: '1px solid var(--aquarium-border-color-default)',
            borderBottom: '1px solid var(--aquarium-border-color-default)',
            backgroundColor: 'var(--aquarium-background-color-layer)',
          }}
        >
          <Typography.Caption color="muted">NAME</Typography.Caption>
          <Typography.Caption color="muted">ROLE</Typography.Caption>
          <Typography.Caption color="muted">STATUS</Typography.Caption>
          <Typography.Caption color="muted">SYNC PROGRESS</Typography.Caption>
        </Box>

        {/* Rows */}
        <Box style={{ maxHeight: 380, overflowY: 'auto' }}>
          {filtered.map((node) => (
            <NodeRow key={node.id} service={service.serviceName} node={node} />
          ))}
        </Box>

        {/* Footer */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 20px',
            borderTop: '1px solid var(--aquarium-border-color-default)',
          }}
        >
          {hidden > 0 ? <Typography.Small color="muted">+{hidden} more ·</Typography.Small> : null}
          <Box
            component="button"
            onClick={() => {
              onClose()
              onViewAll()
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              color: 'var(--aquarium-foreground-color-primary, var(--aquarium-primary-color-default))',
            }}
          >
            <Typography.SmallStrong>View all nodes ↗</Typography.SmallStrong>
          </Box>
        </Box>
      </Box>
    </>
  )
}

NodesPopover.displayName = 'NodesPopover'
