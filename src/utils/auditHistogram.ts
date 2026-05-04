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

const BUCKET_MATCH_EPS_MS = 90_000

function isRangeSelected(
  selectedRange: HistogramRange | null | undefined,
  startMs: number,
  endMs: number,
): boolean {
  if (!selectedRange) return false
  return (
    Math.abs(selectedRange.startMs - startMs) <= BUCKET_MATCH_EPS_MS &&
    Math.abs(selectedRange.endMs - endMs) <= BUCKET_MATCH_EPS_MS
  )
}

/** Selection wins over hover for bar-stack emphasis (stable selected styling). */
export function getHistogramBucketStackFlags(
  bucket: { index: number; startMs: number; endMs: number },
  selectedRange: HistogramRange | null | undefined,
  hoveredBucketIndex: number | null,
): { isEmphasized: boolean; isDimmed: boolean } {
  const hasSelection = Boolean(selectedRange)
  const hasHover = hoveredBucketIndex !== null
  const isSelected = isRangeSelected(selectedRange, bucket.startMs, bucket.endMs)
  const isHovered = hoveredBucketIndex === bucket.index
  const isEmphasized = hasSelection ? isSelected : hasHover ? isHovered : true
  const isDimmed = hasSelection ? !isSelected : hasHover ? !isHovered : false
  return { isEmphasized, isDimmed }
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
