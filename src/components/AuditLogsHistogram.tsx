import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import { Axis, BarChart, timeHour } from '@aivenio/aquarium/charts'
import {
  type HistogramBucket,
  type HistogramRange,
  getHistogramBucketStackFlags,
} from '../utils/auditHistogram'

const ONE_HOUR_MS = 60 * 60 * 1000
const HOVER_CLEAR_DELAY_MS = 90

/** Secondary categorical chart tokens (Design tokens → Chart Colors). */
const CHART_INFO = 'var(--aquarium-chart-colors-secondary-categorical-0)'
const CHART_WARNING = 'var(--aquarium-chart-colors-secondary-categorical-1)'
const CHART_ERROR = 'var(--aquarium-chart-colors-secondary-categorical-2)'

function chartFillMuted(tokenVar: string): string {
  return `color-mix(in srgb, ${tokenVar} 85%, transparent)`
}

type HistogramStatus = 'loading' | 'ready' | 'error'

type AuditLogsHistogramProps = {
  status: HistogramStatus
  errorMessage?: string
  buckets: HistogramBucket[]
  severityCountsByBucket?: Record<number, { info: number; warning: number; error: number }>
  range: HistogramRange | null
  selectedRange?: HistogramRange | null
  isRefreshing?: boolean
  onRangeSelected: (range: HistogramRange) => void
}

function formatBucketLabel(startMs: number, endMs: number, count: number): string {
  const fmt = (t: number) =>
    new Date(t).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  const itemText = count === 1 ? 'log' : 'logs'
  return `${fmt(startMs)} - ${fmt(endMs)}: ${count} ${itemText}`
}

export function AuditLogsHistogram({
  status,
  errorMessage,
  buckets,
  severityCountsByBucket,
  range,
  selectedRange,
  isRefreshing = false,
  onRangeSelected,
}: AuditLogsHistogramProps) {
  const [hoveredBucketIndex, setHoveredBucketIndex] = useState<number | null>(null)
  const hoverClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (hoverClearTimeoutRef.current) {
        clearTimeout(hoverClearTimeoutRef.current)
      }
    }
  }, [])

  const clearPendingHoverReset = () => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current)
      hoverClearTimeoutRef.current = null
    }
  }

  const scheduleHoverReset = () => {
    clearPendingHoverReset()
    hoverClearTimeoutRef.current = setTimeout(() => {
      setHoveredBucketIndex(null)
      hoverClearTimeoutRef.current = null
    }, HOVER_CLEAR_DELAY_MS)
  }

  const dismissTooltipAfterSelect = () => {
    clearPendingHoverReset()
    setHoveredBucketIndex(null)
  }

  const handleBarClick = (entry: { payload?: { startMs?: number; endMs?: number } }) => {
    const payload = entry?.payload
    if (
      !payload ||
      typeof payload.startMs !== 'number' ||
      typeof payload.endMs !== 'number' ||
      !Number.isFinite(payload.startMs) ||
      !Number.isFinite(payload.endMs)
    ) {
      return
    }
    onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
    dismissTooltipAfterSelect()
  }

  const handleBarPointerEnter = (data: { payload?: { index?: number } }) => {
    const idx = data?.payload?.index
    if (typeof idx !== 'number' || !Number.isFinite(idx)) return
    clearPendingHoverReset()
    setHoveredBucketIndex(idx)
  }

  const handleBarPointerLeave = () => {
    scheduleHoverReset()
  }

  useEffect(() => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current)
      hoverClearTimeoutRef.current = null
    }
    setHoveredBucketIndex(null)
  }, [selectedRange?.startMs, selectedRange?.endMs])

  const chartData = useMemo(() => {
    return buckets.map((bucket) => {
      const { isEmphasized, isDimmed } = getHistogramBucketStackFlags(bucket, selectedRange, hoveredBucketIndex)
      const severity = severityCountsByBucket?.[bucket.index]
      if (!severity) {
        const infoValue = bucket.count
        return {
          index: bucket.index,
          time: bucket.startMs,
          startMs: bucket.startMs,
          endMs: bucket.endMs,
          infoActive: isEmphasized ? infoValue : 0,
          infoInactive: isDimmed ? infoValue : 0,
          warningActive: 0,
          warningInactive: 0,
          errorActive: 0,
          errorInactive: 0,
          total: infoValue,
        }
      }
      const total = severity.info + severity.warning + severity.error
      return {
        index: bucket.index,
        time: bucket.startMs,
        startMs: bucket.startMs,
        endMs: bucket.endMs,
        infoActive: isEmphasized ? severity.info : 0,
        infoInactive: isDimmed ? severity.info : 0,
        warningActive: isEmphasized ? severity.warning : 0,
        warningInactive: isDimmed ? severity.warning : 0,
        errorActive: isEmphasized ? severity.error : 0,
        errorInactive: isDimmed ? severity.error : 0,
        total,
      }
    })
  }, [buckets, hoveredBucketIndex, selectedRange, severityCountsByBucket])
  const tickEveryHours = useMemo(() => {
    if (!range) return 1
    const spanHours = Math.max(1, Math.ceil((range.endMs - range.startMs) / ONE_HOUR_MS))
    return Math.max(1, Math.ceil(spanHours / 12))
  }, [range])
  const histogramMetaText = 'Last 24h · GMT+3 · Bucket size 1 h · Click a bar to inspect window'

  return (
    <Box
      className="audit-logs-histogram"
      style={{
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
      }}
    >
      {status === 'loading' && (
        <Box style={{ color: 'var(--aquarium-text-color-muted)', padding: '10px 4px' }}>
          <Typography.Small>Loading histogram...</Typography.Small>
        </Box>
      )}

      {status === 'error' && (
        <Box style={{ color: 'var(--aquarium-text-color-danger-default)', padding: '10px 4px' }}>
          <Typography.Small>{errorMessage ?? 'Failed to load histogram'}</Typography.Small>
        </Box>
      )}

      {status === 'ready' && buckets.length === 0 && (
        <Box style={{ color: 'var(--aquarium-text-color-muted)', padding: '10px 4px' }}>
          <Typography.Small>No logs found for selected filters.</Typography.Small>
        </Box>
      )}

      {status === 'ready' && buckets.length > 0 && (
        <Box style={{ position: 'relative' }}>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Box>
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 16,
                  lineHeight: '24px',
                  fontWeight: 500,
                  color: 'var(--aquarium-text-color-default)',
                }}
              >
                <Box
                  className="logs-live-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--aquarium-background-color-success-graphic)',
                  }}
                />
                Log volume timeline
              </Box>
              <Box style={{ color: 'var(--aquarium-text-color-muted)', fontSize: 14, lineHeight: '20px', marginTop: 4 }}>
                {histogramMetaText}
              </Box>
            </Box>
            <Box
              style={{
                color: 'var(--aquarium-text-color-muted)',
                fontSize: 14,
                lineHeight: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                maxWidth: '45%',
              }}
            >
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                <LegendDot color={CHART_ERROR} label="Error" />
                <LegendDot color={CHART_WARNING} label="Warning" />
                <LegendDot color={CHART_INFO} label="Info" />
              </Box>
            </Box>
          </Box>
          {isRefreshing && (
            <Box
              style={{
                position: 'absolute',
                top: 6,
                right: 8,
                zIndex: 10,
                pointerEvents: 'none',
                backgroundColor: 'color-mix(in srgb, var(--aquarium-background-color-popover-content) 88%, transparent)',
                border: '1px solid var(--aquarium-border-color-muted)',
                borderRadius: 999,
                padding: '2px 8px',
                color: 'var(--aquarium-text-color-muted)',
              }}
            >
              <Typography.Caption>Updating...</Typography.Caption>
            </Box>
          )}
          <BarChart
            data={chartData}
            height={130}
            palette="secondary"
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state: { activeTooltipIndex?: number | string | null } | undefined) => {
              const rawIndex = state?.activeTooltipIndex
              const nextIndex =
                typeof rawIndex === 'number'
                  ? rawIndex
                  : typeof rawIndex === 'string' && rawIndex !== ''
                    ? Number(rawIndex)
                    : null
              const safeIndex = Number.isFinite(nextIndex) ? Number(nextIndex) : null
              if (safeIndex === null) scheduleHoverReset()
            }}
            onMouseLeave={scheduleHoverReset}
          >
            <Axis.XAxis.Time
              dataKey="time"
              utc
              ticks={timeHour.every(tickEveryHours)}
              domain={range ? [new Date(range.startMs), new Date(range.endMs)] : undefined}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatShortTime(Number(value))}
            />
            <Axis.YAxis hide />
            <BarChart.Tooltip
              content={<HistogramTooltipContent chartData={chartData} hoveredBucketIndex={hoveredBucketIndex} />}
            />
            <BarChart.Bar
              dataKey="infoInactive"
              stackId="logs"
              name="Neutral (inactive)"
              fill={chartFillMuted(CHART_INFO)}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
            <BarChart.Bar
              dataKey="infoActive"
              stackId="logs"
              name="Neutral"
              fill={CHART_INFO}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
            <BarChart.Bar
              dataKey="warningInactive"
              stackId="logs"
              name="Warning (inactive)"
              fill={chartFillMuted(CHART_WARNING)}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
            <BarChart.Bar
              dataKey="warningActive"
              stackId="logs"
              name="Warning"
              fill={CHART_WARNING}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
            <BarChart.Bar
              dataKey="errorInactive"
              stackId="logs"
              name="Error (inactive)"
              fill={chartFillMuted(CHART_ERROR)}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
            <BarChart.Bar
              dataKey="errorActive"
              stackId="logs"
              name="Error"
              fill={CHART_ERROR}
              isAnimationActive={false}
              onMouseEnter={handleBarPointerEnter}
              onMouseLeave={handleBarPointerLeave}
              onClick={handleBarClick}
            />
          </BarChart>
        </Box>
      )}
    </Box>
  )
}

function formatShortTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
}

AuditLogsHistogram.displayName = 'AuditLogsHistogram'

type HistogramChartRow = {
  index: number
  startMs: number
  endMs: number
  total: number
  infoActive?: number
  infoInactive?: number
  warningActive?: number
  warningInactive?: number
  errorActive?: number
  errorInactive?: number
}

type TooltipContentProps = {
  active?: boolean
  chartData: HistogramChartRow[]
  hoveredBucketIndex: number | null
}

function HistogramTooltipContent({ active, chartData, hoveredBucketIndex }: TooltipContentProps) {
  if (hoveredBucketIndex === null || !active || chartData.length === 0) return null
  const row = chartData[hoveredBucketIndex]
  if (!row) return null
  const info = (row.infoActive ?? 0) + (row.infoInactive ?? 0)
  const warning = (row.warningActive ?? 0) + (row.warningInactive ?? 0)
  const error = (row.errorActive ?? 0) + (row.errorInactive ?? 0)
  return (
    <Box
      style={{
        backgroundColor: 'var(--aquarium-background-color-popover-content)',
        border: '1px solid var(--aquarium-border-color-muted)',
        borderRadius: 8,
        padding: 12,
        minWidth: 260,
        pointerEvents: 'none',
      }}
    >
      <Box style={{ marginBottom: 8, color: 'var(--aquarium-text-color-muted)' }}>
        <Typography.Small>{formatBucketLabel(row.startMs, row.endMs, row.total)}</Typography.Small>
      </Box>
      <Box style={{ display: 'grid', gap: 6 }}>
        <TooltipRow color={CHART_INFO} label="Info" value={info} />
        <TooltipRow color={CHART_WARNING} label="Warning" value={warning} />
        <TooltipRow color={CHART_ERROR} label="Error" value={error} />
      </Box>
    </Box>
  )
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
        <Typography.Small>{label}</Typography.Small>
      </Box>
      <Typography.Small>{value}</Typography.Small>
    </Box>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
      <Box style={{ fontSize: 14, lineHeight: '20px' }}>{label}</Box>
    </Box>
  )
}
