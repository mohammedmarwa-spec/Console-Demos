export type HistogramRange = {
  startMs: number
  endMs: number
}

export type HistogramBucket = {
  index: number
  startMs: number
  endMs: number
  count: number
}

export type TimestampedLog = {
  occurredAt: Date
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function buildHistogramBuckets(
  logs: TimestampedLog[],
  bucketCount: number,
  range?: HistogramRange,
): { buckets: HistogramBucket[]; range: HistogramRange } {
  const normalizedBucketCount = Math.max(1, Math.floor(bucketCount))
  const timestamps = logs.map((log) => log.occurredAt.getTime()).filter((t) => Number.isFinite(t))
  const minTs = range?.startMs ?? (timestamps.length > 0 ? Math.min(...timestamps) : Date.now())
  const maxTs = range?.endMs ?? (timestamps.length > 0 ? Math.max(...timestamps) : minTs + 60_000)
  const safeEnd = maxTs > minTs ? maxTs : minTs + 1
  const span = safeEnd - minTs
  const bucketSize = span / normalizedBucketCount

  const buckets: HistogramBucket[] = Array.from({ length: normalizedBucketCount }, (_, index) => ({
    index,
    startMs: minTs + index * bucketSize,
    endMs: index === normalizedBucketCount - 1 ? safeEnd : minTs + (index + 1) * bucketSize,
    count: 0,
  }))

  for (const timestamp of timestamps) {
    const position = (timestamp - minTs) / span
    const bucketIndex = clamp(Math.floor(position * normalizedBucketCount), 0, normalizedBucketCount - 1)
    buckets[bucketIndex].count += 1
  }

  return {
    buckets,
    range: { startMs: minTs, endMs: safeEnd },
  }
}

export function toRangeFromSelection(
  selectionStartX: number,
  selectionEndX: number,
  width: number,
  range: HistogramRange,
): HistogramRange {
  const safeWidth = Math.max(1, width)
  const minX = clamp(Math.min(selectionStartX, selectionEndX), 0, safeWidth)
  const maxX = clamp(Math.max(selectionStartX, selectionEndX), 0, safeWidth)
  const span = range.endMs - range.startMs
  return {
    startMs: range.startMs + (minX / safeWidth) * span,
    endMs: range.startMs + (maxX / safeWidth) * span,
  }
}
