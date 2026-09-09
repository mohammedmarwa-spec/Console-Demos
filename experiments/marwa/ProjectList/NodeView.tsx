'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  ChoiceChip,
  ChoiceChipGroup,
  DataTable,
  Divider,
  Drawer,
  PageHeader,
  ProgressBar,
  StatusChip,
  Switch,
  Tooltip,
  Typography,
} from '@aivenio/aquarium'
import duplicateIcon from '@aivenio/aquarium/icons/duplicate'
import { ServiceIcon } from '@/components/ServiceIcon'
import type { ServiceRow } from '@/screens/ProjectServices'
import {
  buildClusterForService,
  isSettled,
  progressPct,
  rollup,
  specLabel,
  type ClusterNode,
  type NodeStatusKey,
  type NodeTone,
  type RoleChip,
} from './clusterNodes'

const TONE_DOT: Record<NodeTone, string> = {
  success: 'var(--aquarium-background-color-success-graphic)',
  info: 'var(--aquarium-background-color-info-graphic)',
  warning: 'var(--aquarium-background-color-warning-graphic)',
  neutral: 'var(--aquarium-background-color-muted)',
  danger: 'var(--aquarium-background-color-danger-graphic)',
}

const TIER_STATUS: Record<string, NodeTone> = { Hot: 'warning', Warm: 'info', Cold: 'neutral' }

// ─── Small building blocks ───────────────────────────────────────────────────────

function StatusDot({ tone }: { tone: NodeTone }) {
  return (
    <Box
      component="span"
      style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TONE_DOT[tone], flexShrink: 0 }}
    />
  )
}

function NodeStatusChip({ node }: { node: ClusterNode }) {
  return <StatusChip dense status={node.status.tone} text={node.status.label} />
}

function RoleChips({ chips }: { chips: RoleChip[] }) {
  return (
    <Box style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {chips.map((chip, index) => (
        <Fragment key={`${chip.key}-${index}`}>
          <Chip dense text={chip.label} />
          {chip.tier ? <StatusChip dense status={TIER_STATUS[chip.tier] ?? 'neutral'} text={chip.tier} /> : null}
        </Fragment>
      ))}
    </Box>
  )
}

/** Compact metric bar used inside table cells. */
function SyncCell({ node }: { node: ClusterNode }) {
  const key = node.status.key
  const inProgress = key === 'syncing_data' || key === 'timing_out' || key === 'setting_up_vm'

  if (inProgress) {
    const pct = progressPct(node)
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 200 }}>
        <ProgressBar dense value={pct} progresStatus={key === 'timing_out' ? 'warning' : 'info'} />
        <Typography.Caption color="muted">
          {node.sync
            ? `${node.sync.done} ${node.sync.unitDone} / ${node.sync.total} ${node.sync.unitTotal}`
            : `${pct}% recovered`}
        </Typography.Caption>
      </Box>
    )
  }

  if (isSettled(node)) {
    const m = node.metrics
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 200 }}>
        <ProgressBar dense value={m.disk} progresStatus="info" completedStatus="success" />
        <Typography.Caption color="muted">
          {m.disk}% · {m.diskUsed} / {m.diskTotal} GB
        </Typography.Caption>
      </Box>
    )
  }

  return <Typography.Small color="muted">—</Typography.Small>
}

// ─── Detail drawer ───────────────────────────────────────────────────────────────

function DrawerMetric({ label, pct, extra }: { label: string; pct: number; extra?: string }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <Typography.Small color="muted">{label}</Typography.Small>
        <Typography.SmallStrong>
          {pct}%{extra ? <Typography.Small color="muted"> · {extra}</Typography.Small> : null}
        </Typography.SmallStrong>
      </Box>
      <ProgressBar dense value={pct} progresStatus={pct >= 85 ? 'warning' : 'info'} completedStatus="success" />
    </Box>
  )
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Typography.SmallStrong color="intense">{title}</Typography.SmallStrong>
      {children}
    </Box>
  )
}

function NodeDetail({ node }: { node: ClusterNode }) {
  const [stream, setStream] = useState(node.stream)
  useEffect(() => setStream(node.stream), [node])

  const m = node.metrics
  const settled = isSettled(node)

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <NodeStatusChip node={node} />
        {node.isLeader ? <StatusChip dense status="primary" text="Elected manager" /> : null}
        <Typography.Small color="muted">{node.zone}</Typography.Small>
      </Box>

      <Divider />

      <DrawerSection title="Node roles">
        <RoleChips chips={node.chips} />
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: '8px 12px',
            borderRadius: 'var(--aquarium-border-radius-default)',
            backgroundColor: 'var(--aquarium-background-color-muted)',
          }}
        >
          <Typography.Small color="muted">role string</Typography.Small>
          <Typography.CodeSmallStrong>{node.raw}</Typography.CodeSmallStrong>
        </Box>
      </DrawerSection>

      <Divider />

      <DrawerSection title="Resource utilisation">
        {settled ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DrawerMetric label="CPU" pct={m.cpu} />
            <DrawerMetric label="Memory" pct={m.mem} />
            <DrawerMetric label="JVM heap" pct={m.heap} />
            <DrawerMetric label="Disk" pct={m.disk} extra={`${m.diskUsed} / ${m.diskTotal} GB`} />
          </Box>
        ) : (
          <Box
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--aquarium-border-radius-default)',
              border: '1px solid var(--aquarium-border-color-muted)',
              backgroundColor: 'var(--aquarium-background-color-muted)',
            }}
          >
            <Typography.Small color="muted">
              {node.status.key === 'unknown'
                ? 'Node is unreachable — metrics unavailable. Aiven is attempting automatic recovery.'
                : `Node is ${node.status.label.toLowerCase()}. Live metrics become available once it joins the cluster.`}
            </Typography.Small>
            {node.sync ? (
              <Box style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ProgressBar dense value={progressPct(node)} progresStatus="info" />
                <Typography.Caption color="muted">
                  {node.sync.done} {node.sync.unitDone} / {node.sync.total} {node.sync.unitTotal} transferred
                </Typography.Caption>
              </Box>
            ) : null}
          </Box>
        )}
      </DrawerSection>

      <Divider />

      <DrawerSection title="Placement">
        <Box style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography.Caption color="muted">Availability zone</Typography.Caption>
            <Typography.Default>{node.zone}</Typography.Default>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography.Caption color="muted">Shards</Typography.Caption>
            <Typography.Default>{settled ? m.shards : '—'}</Typography.Default>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography.Caption color="muted">Node type</Typography.Caption>
            <Typography.Default>{specLabel(node.spec)}</Typography.Default>
          </Box>
        </Box>
      </DrawerSection>

      <Divider />

      <DrawerSection title="Streaming">
        <Switch checked={stream} onChange={() => setStream((value) => !value)}>
          Real-time metric stream {stream ? 'on' : 'off'}
        </Switch>
      </DrawerSection>
    </Box>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────────

export function NodeView({ service, onBack }: { service: ServiceRow; onBack: () => void }) {
  const cluster = useMemo(() => buildClusterForService(service.serviceName), [service.serviceName])

  const [statusFilter, setStatusFilter] = useState<'all' | NodeStatusKey>('all')
  const [selected, setSelected] = useState<ClusterNode | null>(null)

  const segments = useMemo(() => rollup(cluster.nodes), [cluster])

  // A filtered-out status should reset the filter back to "all".
  useEffect(() => {
    if (statusFilter !== 'all' && !cluster.nodes.some((node) => node.status.key === statusFilter)) {
      setStatusFilter('all')
    }
  }, [cluster, statusFilter])

  const filtered = useMemo(() => {
    const base =
      statusFilter === 'all' ? cluster.nodes : cluster.nodes.filter((node) => node.status.key === statusFilter)
    // Leader first, then by node number.
    return [...base].sort((a, b) => (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0) || a.n - b.n)
  }, [cluster, statusFilter])

  const stateTone: NodeTone =
    cluster.state === 'Running' ? 'success' : cluster.state === 'Rebalancing' ? 'warning' : 'info'

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        padding: 24,
        overflow: 'auto',
        backgroundColor: 'var(--aquarium-background-color-body)',
      }}
    >
      <Box style={{ marginBottom: 16 }}>
        <PageHeader
          title=""
          breadcrumbs={[
            <Breadcrumbs.Crumb key="org" href="#" onClick={(event) => event.preventDefault()}>
              My Organization
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="project" href="#" onClick={(event) => event.preventDefault()}>
              quick-upgrade-demo
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb
              key="service"
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onBack()
              }}
            >
              {cluster.name}
            </Breadcrumbs.Crumb>,
            <Breadcrumbs.Crumb key="page">Cluster nodes</Breadcrumbs.Crumb>,
          ]}
        />
      </Box>

      <Box style={{ marginBottom: 16 }}>
        <Button.Ghost dense type="button" onClick={onBack}>
          ← Back to services
        </Button.Ghost>
      </Box>

      {/* Service header */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <ServiceIcon serviceTypeId={service.serviceTypeId} size={44} alt="" />
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Typography.LargeStrong color="intense">{cluster.name}</Typography.LargeStrong>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <Chip dense text={cluster.version} />
            <StatusChip dense status={stateTone} text={cluster.state} />
            <Chip dense text={`${cluster.nodes.length} nodes`} />
          </Box>
        </Box>
        <Button.Secondary type="button" onClick={() => undefined}>
          Open support ticket
        </Button.Secondary>
      </Box>

      {/* Node status rollup */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '12px 16px',
          marginBottom: 16,
          borderRadius: 'var(--aquarium-border-radius-default)',
          border: '1px solid var(--aquarium-border-color-muted)',
          backgroundColor: 'var(--aquarium-background-color-layer)',
        }}
      >
        <Typography.SmallStrong color="intense">Node status</Typography.SmallStrong>
        <ChoiceChipGroup
          name="node-status-filter"
          selectionMode="radio"
          dense
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as 'all' | NodeStatusKey)}
        >
          {[
            <ChoiceChip key="all" value="all" dense>
              <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Typography.SmallStrong>{cluster.nodes.length}</Typography.SmallStrong> All nodes
              </Box>
            </ChoiceChip>,
            ...segments.map((segment) => (
              <ChoiceChip key={segment.key} value={segment.key} dense>
                <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <StatusDot tone={segment.status.tone} />
                  <Typography.SmallStrong>{segment.count}</Typography.SmallStrong> {segment.status.label}
                </Box>
              </ChoiceChip>
            )),
          ]}
        </ChoiceChipGroup>
      </Box>

      {/* Nodes table */}
      <DataTable
        ariaLabel="Cluster nodes"
        rows={filtered}
        sticky={false}
        columns={[
          {
            type: 'custom',
            headerName: 'Node',
            UNSAFE_render: (node) => (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setSelected(node)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    minWidth: 0,
                    color: 'var(--aquarium-foreground-color-primary, var(--aquarium-primary-color-default))',
                  }}
                >
                  <Typography.Code>{node.id}</Typography.Code>
                </Box>
                <Button.Icon
                  type="button"
                  aria-label={`Copy ${node.id}`}
                  tooltip="Copy node name"
                  icon={duplicateIcon}
                  onClick={() => void navigator.clipboard?.writeText(node.id)}
                />
                {node.isLeader ? (
                  <Tooltip content="Elected lead manager — if this node fails, all manager nodes fail">
                    <StatusChip dense status="primary" text="lead" />
                  </Tooltip>
                ) : null}
              </Box>
            ),
          },
          {
            type: 'custom',
            headerName: 'Roles',
            UNSAFE_render: (node) => (
              <Box style={{ maxWidth: 180 }}>
                <RoleChips chips={node.chips} />
              </Box>
            ),
          },
          {
            type: 'custom',
            headerName: 'Node type',
            UNSAFE_render: (node) => <Typography.Small color="muted">{specLabel(node.spec)}</Typography.Small>,
          },
          {
            type: 'custom',
            headerName: 'Status',
            UNSAFE_render: (node) => <NodeStatusChip node={node} />,
          },
          {
            type: 'custom',
            headerName: 'Disk / Sync',
            UNSAFE_render: (node) => <SyncCell node={node} />,
          },
        ]}
      />

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        size="md"
        title={selected?.id ?? 'Node details'}
        secondaryActions={[{ text: 'View logs', onClick: () => undefined }]}
        primaryAction={{ text: 'Restart node', onClick: () => undefined }}
      >
        {selected ? <NodeDetail node={selected} /> : null}
      </Drawer>
    </Box>
  )
}

NodeView.displayName = 'NodeView'
