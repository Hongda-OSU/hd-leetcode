import { describe, expect, it } from 'vitest'
import { problem } from './fixtures'
import { computeStats } from './stats'

const TODAY = '2026-11-10'

describe('computeStats', () => {
  it('handles no data', () => {
    expect(computeStats([], TODAY)).toEqual({ problems: 0, solutions: 0, today: 0 })
  })

  it('counts problems, solutions and today’s solutions', () => {
    const stats = computeStats(
      [problem(1, ['2026-11-10', '2026-11-10', '2026-11-09']), problem(2, ['2026-11-01'])],
      TODAY,
    )
    expect(stats).toEqual({ problems: 2, solutions: 4, today: 2 })
  })
})
