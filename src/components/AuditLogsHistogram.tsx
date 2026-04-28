import { useMemo } from 'react'
import { Box, Typography } from '@aivenio/aquarium'
import { Axis, BarChart, timeMinute } from '@aivenio/aquarium/charts'
import type { HistogramBucket, HistogramRange } from '../utils/auditHistogram'

type HistogramStatus = 'loading' | 'ready' | 'error'

type AuditLogsHistogramProps = {
  status: HistogramStatus
  errorMessage?: string
  buckets: HistogramBucket[]
  severityCountsByBucket?: Record<number, { info: number; warning: number; error: number }>
  range: HistogramRange | null
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
  onRangeSelected,
}: AuditLogsHistogramProps) {
  const chartData = useMemo(() => {
    return buckets.map((bucket) => {
      const severity = severityCountsByBucket?.[bucket.index]
      if (!severity) {
        return {
          index: bucket.index,
          time: bucket.startMs,
          startMs: bucket.startMs,
          endMs: bucket.endMs,
          info: bucket.count,
          warning: 0,
          error: 0,
          total: bucket.count,
        }
      }
      return {
        index: bucket.index,
        time: bucket.startMs,
        startMs: bucket.startMs,
        endMs: bucket.endMs,
        info: severity.info,
        warning: severity.warning,
        error: severity.error,
        total: severity.info + severity.warning + severity.error,
      }
    })
  }, [buckets, severityCountsByBucket])

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
        <Box>
          <BarChart data={chartData} height={130} palette="secondary" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Axis.XAxis.Time
              dataKey="time"
              utc
              ticks={timeMinute.every(5)}
              domain={range ? [new Date(range.startMs), new Date(range.endMs)] : undefined}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatShortTime(Number(value))}
            />
            <Axis.YAxis hide />
            <BarChart.Tooltip
              formatter={(_value, name, item) => {
                const payload = item?.payload as { startMs: number; endMs: number; total: number } | undefined
                if (!payload) return ['0', String(name)]
                return [String(payload.total), formatBucketLabel(payload.startMs, payload.endMs, payload.total)]
              }}
            />
            <BarChart.Bar
              dataKey="info"
              stackId="logs"
              name="Neutral"
              fill="#3545BE"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="warning"
              stackId="logs"
              name="Warning"
              fill="#f79009"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
            <BarChart.Bar
              dataKey="error"
              stackId="logs"
              name="Error"
              fill="#d92d20"
              onClick={(entry) => {
                const payload = entry?.payload as { startMs: number; endMs: number } | undefined
                if (payload) onRangeSelected({ startMs: payload.startMs, endMs: payload.endMs })
              }}
            />
          </BarChart>
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: '#787885' }}>
            <Typography.Caption>Older</Typography.Caption>
            <Typography.Caption>Newer</Typography.Caption>
          </Box>
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
