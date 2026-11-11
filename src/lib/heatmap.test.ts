import { describe, expect, it } from 'vitest'
import { dayOfWeek } from './dates'
import { buildHeatmap } from './heatmap'

describe('buildHeatmap', () => {
  const today = '2026-11-10' // Tuesday
  const cells = buildHeatmap(
    new Map([
      ['2026-11-10', 2],
      ['2026-11-09', 9],
    ]),
    today,
  )

  it('starts on a Sunday and ends today', () => {
    expect(dayOfWeek(cells[0].date)).toBe(0)
    expect(cells.at(-1)?.date).toBe(today)
    expect(cells).toHaveLength(52 * 7 + 3)
  })

  it('caps the color level at 4', () => {
    expect(cells.at(-1)).toEqual({ date: today, count: 2, level: 2 })
    expect(cells.at(-2)).toEqual({ date: '2026-11-09', count: 9, level: 4 })
    expect(cells[0].level).toBe(0)
  })

  it('ends a full week when today is Saturday', () => {
    expect(buildHeatmap(new Map(), '2026-11-14', 2)).toHaveLength(14)
  })
})
