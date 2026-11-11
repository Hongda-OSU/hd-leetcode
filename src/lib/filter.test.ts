import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, facetOptions, filterProblems, hasActiveFilters } from './filter'
import { problem } from './fixtures'

const D = ['2026-11-10']
const problems = [
  problem(1, D, {
    title: 'Two Sum',
    difficulty: 'Easy',
    companies: ['Google', 'Amazon'],
    topics: ['Array'],
  }),
  problem(42, D, {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    companies: ['Google'],
    topics: ['Stack'],
  }),
  problem(232, D, {
    title: 'Implement Queue using Stacks',
    difficulty: 'Easy',
    companies: ['Amazon'],
    topics: ['Stack'],
  }),
]
const ids = (ps: { id: number }[]) => ps.map((p) => p.id)

describe('filterProblems', () => {
  it('returns everything with no filters', () => {
    expect(ids(filterProblems(problems, EMPTY_FILTERS))).toEqual([1, 42, 232])
  })

  it('searches id and title, case-insensitive', () => {
    expect(ids(filterProblems(problems, { ...EMPTY_FILTERS, q: '  RAIN ' }))).toEqual([42])
    expect(ids(filterProblems(problems, { ...EMPTY_FILTERS, q: '232' }))).toEqual([232])
  })

  it('combines facets with AND', () => {
    const f = { ...EMPTY_FILTERS, company: 'Google', topic: 'Stack' }
    expect(ids(filterProblems(problems, f))).toEqual([42])
  })
})

describe('facetOptions', () => {
  it('keeps difficulty order and counts within the other filters', () => {
    const f = { ...EMPTY_FILTERS, company: 'Amazon', difficulty: 'Hard' as const }
    expect(facetOptions(problems, f, 'difficulty')).toEqual([
      { value: 'Easy', count: 2 },
      { value: 'Medium', count: 0 },
      { value: 'Hard', count: 0 },
    ])
  })

  it('lists every company, most problems first, zero counts included', () => {
    const f = { ...EMPTY_FILTERS, topic: 'Stack' }
    expect(facetOptions(problems, f, 'company')).toEqual([
      { value: 'Amazon', count: 1 },
      { value: 'Google', count: 1 },
    ])
    const hard = { ...EMPTY_FILTERS, difficulty: 'Hard' as const }
    expect(facetOptions(problems, hard, 'topic')).toEqual([
      { value: 'Stack', count: 1 },
      { value: 'Array', count: 0 },
    ])
  })
})

describe('hasActiveFilters', () => {
  it('ignores the search box', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, q: 'x' })).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, topic: 'Stack' })).toBe(true)
  })
})
