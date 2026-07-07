import type { PlaygroundEntry, PlaygroundEntryType, ScenarioStatus } from '../../registry/types'

type BadgeProps = {
  variant: 'type' | 'status'
  value: PlaygroundEntryType | ScenarioStatus
}

const TYPE_LABELS: Record<PlaygroundEntryType, string> = {
  'reusable-scenario': 'Reusable',
  prototype: 'Prototype',
  archived: 'Archived',
}

const STATUS_LABELS: Record<ScenarioStatus, string> = {
  active: 'Active',
  rough: 'Rough',
  'review-ready': 'Review',
  validated: 'Validated',
  archived: 'Archived',
}

export function TypeBadge({ type }: { type: PlaygroundEntryType }) {
  const isReusable = type === 'reusable-scenario'
  return (
    <span
      className={`playground-badge playground-badge--type${isReusable ? ' playground-badge--reusable' : ''}`}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}

export function StatusBadge({ status }: { status: ScenarioStatus }) {
  return (
    <span className={`playground-badge playground-badge--status playground-badge--status-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function ScenarioBadges({ entry }: { entry: PlaygroundEntry }) {
  return (
    <span className="playground-badges">
      <TypeBadge type={entry.type} />
      <StatusBadge status={entry.status} />
    </span>
  )
}

/** @internal */
export function _Badge({ variant, value }: BadgeProps) {
  if (variant === 'type') return <TypeBadge type={value as PlaygroundEntryType} />
  return <StatusBadge status={value as ScenarioStatus} />
}
