'use client'

import { Box, InlineIcon, ProgressBar, Typography } from '@aivenio/aquarium'
import tickCircle from '@aivenio/aquarium/icons/tickCircle'
import warningSign from '@aivenio/aquarium/icons/warningSign'
import loadingIcon from '@aivenio/aquarium/icons/loading'
import circleIcon from '@aivenio/aquarium/icons/circle'
import {
  PREP_STAGES,
  formatCount,
  stageDoneLabel,
  stageLabel,
  stageTotal,
  stageUnit,
  type DemoDataSource,
  type DemoPlan,
} from './ragDemo'

type StageState = 'done' | 'active' | 'failed' | 'pending'

function StageIcon({ state }: { state: StageState }) {
  if (state === 'failed') return <InlineIcon color="warning-default" icon={warningSign} />
  if (state === 'active') return <InlineIcon color="success-default" icon={loadingIcon} />
  if (state === 'done') return <InlineIcon color="success-default" icon={tickCircle} />
  return <InlineIcon color="muted" icon={circleIcon} />
}

/**
 * Named setup stages with counts — modelled on Console's Kafka data generator
 * `ResourceStatusList` (tick / loading / warning per resource).
 */
export function PrepStageList({
  source,
  plan,
  progress,
  stageIndex,
  failed,
  showBar = true,
}: {
  source: DemoDataSource
  plan: DemoPlan
  progress: number[]
  stageIndex: number
  failed: boolean
  showBar?: boolean
}) {
  return (
    <Box component="ul" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {PREP_STAGES.map((stage, index) => {
        const total = stageTotal(stage, plan)
        const done = progress[index] ?? 0
        const state: StageState =
          index < stageIndex || done >= total
            ? 'done'
            : index === stageIndex
              ? failed
                ? 'failed'
                : 'active'
              : 'pending'
        const unit = stageUnit(stage, source, total)
        const count =
          state === 'done'
            ? `${formatCount(total)} ${unit}`
            : state === 'pending'
              ? `${formatCount(total)} ${unit}`
              : `${formatCount(done)} of ${formatCount(total)} ${unit}`
        const label =
          state === 'done'
            ? stageDoneLabel(stage, source)
            : state === 'failed'
              ? `${stageLabel(stage, source)} failed`
              : stageLabel(stage, source)

        return (
          <Box key={stage} component="li" paddingBottom="3">
            <Box.Flex alignItems="center" colGap="2" justifyContent="space-between">
              <Box.Flex alignItems="center" colGap="2">
                <StageIcon state={state} />
                <Typography.Small color={state === 'pending' ? 'muted' : 'default'}>{label}</Typography.Small>
              </Box.Flex>
              <Typography.Small color="muted">{count}</Typography.Small>
            </Box.Flex>
            {showBar && (state === 'active' || state === 'failed') ? (
              <Box style={{ paddingLeft: 19, paddingTop: 6 }}>
                <ProgressBar
                  dense
                  value={total === 0 ? 0 : Math.round((done / total) * 100)}
                  min={0}
                  max={100}
                  progresStatus={state === 'failed' ? 'warning' : 'info'}
                  completedStatus="success"
                />
              </Box>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}

/** Short one-line status for cards and the sidebar page header. */
export function currentStageSummary(
  source: DemoDataSource,
  plan: DemoPlan,
  progress: number[],
  stageIndex: number,
): string {
  const stage = PREP_STAGES[stageIndex]
  const total = stageTotal(stage, plan)
  return `${stageLabel(stage, source)} · ${formatCount(progress[stageIndex] ?? 0)} of ${formatCount(total)} ${stageUnit(stage, source, total)}`
}

PrepStageList.displayName = 'PrepStageList'
