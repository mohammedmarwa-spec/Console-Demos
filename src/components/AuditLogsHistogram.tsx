import { useMemo } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import { Axis, BarChart, timeHour } from '@aivenio/aquarium/charts'
import type { HistogramBucket, HistogramRange } from '../utils/auditHistogram'

const ONE_HOUR_MS = 60 * 60 * 1000
const GMT_PLUS_3_OFFSET_MS = 3 * ONE_HOUR_MS

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
  const hasSelection = Boolean(selectedRange)
  const chartData = useMemo(() => {
    return buckets.map((bucket) => {
      const isSelected = isRangeSelected(selectedRange, bucket.startMs, bucket.endMs)
      const severity = severityCountsByBucket?.[bucket.index]
      if (!severity) {
        const infoValue = bucket.count
        return {
          index: bucket.index,
          time: bucket.startMs,
          startMs: bucket.startMs,
          endMs: bucket.endMs,
          infoActive: !hasSelection || isSelected ? infoValue : 0,
          infoInactive: hasSelection && !isSelected ? infoValue : 0,
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
        infoActive: !hasSelection || isSelected ? severity.info : 0,
        infoInactive: hasSelection && !isSelected ? severity.info : 0,
        warningActive: !hasSelection || isSelected ? severity.warning : 0,
        warningInactive: hasSelection && !isSelected ? severity.warning : 0,
        errorActive: !hasSelection || isSelected ? severity.error : 0,
        errorInactive: hasSelection && !isSelected ? severity.error : 0,
        total,
      }
    })
  }, [buckets, hasSelection, selectedRange, severityCountsByBucket])
  const tickEveryHours = useMemo(() => {
    if (!range) return 1
    const spanHours = Math.max(1, Math.ceil((range.endMs - range.startMs) / ONE_HOUR_MS))
    return Math.max(1, Math.ceil(spanHours / 12))
  }, [range])
  const histogramMetaText = useMemo(() => {
    if (!range) return ''
    const firstBucket = buckets[0]
    const bucketSizeMs = firstBucket ? Math.max(1, firstBucket.endMs - firstBucket.startMs) : ONE_HOUR_MS
    const bucketHours = bucketSizeMs / ONE_HOUR_MS
    const bucketSizeText = Number.isInteger(bucketHours) ? `${bucketHours} h` : `${bucketHours.toFixed(1)} h`
    return `GMT+3 | Bucket size: ${bucketSizeText} | Last updated ${formatGmtPlus3TimeWithSeconds(range.endMs)}`
  }, [buckets, range])

  return (
    <Box
      style={{
        border: '1px solid #e7e8ed',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
      }}
    >
      {status === 'loading' && (
        <Box style={{ color: '#787885', padding: '10px 4px' }}>
          <Typography.Small>Loading histogram...</Typography.Small>
        </Box>
      )}

      {status === 'error' && (
        <Box style={{ color: '#d92d20', padding: '10px 4px' }}>
          <Typography.Small>{errorMessage ?? 'Failed to load histogram'}</Typography.Small>
        </Box>
      )}

      {status === 'ready' && buckets.length === 0 && (
        <Box style={{ color: '#787885', padding: '10px 4px' }}>
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
            <Box style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, color: '#242429' }}>
              Live logs for past 24 hours
            </Box>
            <Box
              style={{
                color: '#787885',
                fontSize: 14,
                lineHeight: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 16,
                flexWrap: 'wrap',
                maxWidth: '78%',
              }}
            >
              <Box>{histogramMetaText}</Box>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                <LegendDot color="#d92d20" label="Error" />
                <LegendDot color="#f79009" label="Warning" />
                <LegendDot color="#3545BE" label="Info" />
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
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                border: '1px solid #e7e8ed',
                borderRadius: 999,
                padding: '2px 8px',
                color: '#787885',
              }}
            >
              <Typography.Caption>Updating...</Typography.Caption>
            </Box>
          )}
          <BarChart data={chartData} height={130} palette="secondary" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
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
            <BarChart.Tooltip content={<HistogramTooltipContent />} />
            <BarChart.Bar
              dataKey="infoInactive"
              stackId="logs"
              name="Neutral (inactive)"
              fill="#b8bff2"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="infoActive"
              stackId="logs"
              name="Neutral"
              fill="#3545BE"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="warningInactive"
              stackId="logs"
              name="Warning (inactive)"
              fill="#fbd79b"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="warningActive"
              stackId="logs"
              name="Warning"
              fill="#f79009"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="errorInactive"
              stackId="logs"
              name="Error (inactive)"
              fill="#f7b7b0"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="errorActive"
              stackId="logs"
              name="Error"
              fill="#d92d20"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
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

function formatGmtPlus3TimeWithSeconds(ms: number): string {
  const date = new Date(ms + GMT_PLUS_3_OFFSET_MS)
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

AuditLogsHistogram.displayName = 'AuditLogsHistogram'

type TooltipSeries = {
  payload?: {
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
}

type TooltipContentProps = {
  active?: boolean
  payload?: TooltipSeries[]
}

function HistogramTooltipContent({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0]?.payload
  if (!row) return null
  const info = (row.infoActive ?? 0) + (row.infoInactive ?? 0)
  const warning = (row.warningActive ?? 0) + (row.warningInactive ?? 0)
  const error = (row.errorActive ?? 0) + (row.errorInactive ?? 0)
  return (
    <Box style={{ backgroundColor: '#fff', border: '1px solid #d7d8df', borderRadius: 8, padding: 12, minWidth: 260 }}>
      <Box style={{ marginBottom: 8, color: '#4a4b57' }}>
        <Typography.Small>{formatBucketLabel(row.startMs, row.endMs, row.total)}</Typography.Small>
      </Box>
      <Box style={{ display: 'grid', gap: 6 }}>
        <TooltipRow color="#3545BE" label="Info" value={info} />
        <TooltipRow color="#f79009" label="Warning" value={warning} />
        <TooltipRow color="#d92d20" label="Error" value={error} />
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

function isRangeSelected(
  selectedRange: HistogramRange | null | undefined,
  startMs: number,
  endMs: number,
): boolean {
  if (!selectedRange) return false
  return selectedRange.startMs === startMs && selectedRange.endMs === endMs
}
