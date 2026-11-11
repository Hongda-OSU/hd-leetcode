import { describe, expect, it } from 'vitest'
import { problem } from './fixtures'
import { computeStats, countByDay } from './stats'

const TODAY = '2026-11-10'

describe('countByDay', () => {
  it('counts solutions, not problems', () => {
    const counts = countByDay([
      problem(1, ['2026-11-10', '2026-11-10']),
      problem(2, ['2026-11-09']),
    ])
    expect(Object.fromEntries(counts)).toEqual({ '2026-11-10': 2, '2026-11-09': 1 })
  })
})

describe('computeStats', () => {
  it('handles no data', () => {
    expect(computeStats([], TODAY)).toEqual({
      problems: 0,
      solutions: 0,
      activeDays: 0,
      today: 0,
      streak: 0,
    })
  })

  it('counts totals and a streak that includes today', () => {
    const stats = computeStats(
      [problem(1, ['2026-11-10', '2026-11-09']), problem(2, ['2026-11-08', '2026-11-01'])],
      TODAY,
    )
    expect(stats).toEqual({ problems: 2, solutions: 4, activeDays: 4, today: 1, streak: 3 })
  })

  it('keeps yesterday’s streak alive before solving today', () => {
    const stats = computeStats([problem(1, ['2026-11-09', '2026-11-08'])], TODAY)
    expect(stats.streak).toBe(2)
    expect(stats.today).toBe(0)
  })

  it('resets the streak after a missed day', () => {
    expect(computeStats([problem(1, ['2026-11-08'])], TODAY).streak).toBe(0)
  })
})
