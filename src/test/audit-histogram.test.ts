import { describe, expect, it } from 'vitest'
import { buildHistogramBuckets, toRangeFromSelection } from '../utils/auditHistogram'

describe('buildHistogramBuckets', () => {
  it('distributes logs into expected buckets', () => {
    const logs = [
      { occurredAt: new Date(Date.UTC(2024, 0, 1, 0, 0, 0)) },
      { occurredAt: new Date(Date.UTC(2024, 0, 1, 0, 10, 0)) },
      { occurredAt: new Date(Date.UTC(2024, 0, 1, 0, 20, 0)) },
      { occurredAt: new Date(Date.UTC(2024, 0, 1, 0, 50, 0)) },
    ]

    const { buckets } = buildHistogramBuckets(logs, 3, {
      startMs: Date.UTC(2024, 0, 1, 0, 0, 0),
      endMs: Date.UTC(2024, 0, 1, 1, 0, 0),
    })

    expect(buckets).toHaveLength(3)
    expect(buckets.map((b) => b.count)).toEqual([2, 1, 1])
  })

  it('returns empty-count buckets when no logs are present', () => {
    const { buckets, range } = buildHistogramBuckets([], 4, {
      startMs: Date.UTC(2024, 0, 1, 0, 0, 0),
      endMs: Date.UTC(2024, 0, 1, 1, 0, 0),
    })

    expect(buckets).toHaveLength(4)
    expect(buckets.every((b) => b.count === 0)).toBe(true)
    expect(range.startMs).toBeLessThan(range.endMs)
  })

  it('places range-end timestamps in the final bucket', () => {
    const range = {
      startMs: Date.UTC(2024, 0, 1, 0, 0, 0),
      endMs: Date.UTC(2024, 0, 1, 0, 30, 0),
    }
    const logs = [
      { occurredAt: new Date(range.startMs) },
      { occurredAt: new Date(range.endMs) },
    ]

    const { buckets } = buildHistogramBuckets(logs, 3, range)

    expect(buckets.map((b) => b.count)).toEqual([1, 0, 1])
  })
})

describe('toRangeFromSelection', () => {
  it('maps drag selection pixels to time range', () => {
    const range = {
      startMs: Date.UTC(2024, 0, 1, 0, 0, 0),
      endMs: Date.UTC(2024, 0, 1, 1, 0, 0),
    }
    const selected = toRangeFromSelection(25, 75, 100, range)
    expect(selected.startMs).toBe(Date.UTC(2024, 0, 1, 0, 15, 0))
    expect(selected.endMs).toBe(Date.UTC(2024, 0, 1, 0, 45, 0))
  })
})
