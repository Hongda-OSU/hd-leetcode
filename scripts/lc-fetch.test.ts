import { describe, expect, it } from 'vitest'
import { LeetCodeError, TOP_COMPANIES, parseCompanies, toProblem } from './lc-fetch.ts'

// Shape copied from a real companyTagStats response (problem 232).
const STATS = JSON.stringify({
  '1': [
    { name: 'Google', slug: 'google', timesEncountered: 6 },
    { name: 'Amazon', slug: 'amazon', timesEncountered: 2 },
    { name: 'Microsoft', slug: 'microsoft', timesEncountered: 2 },
  ],
  '2': [{ name: 'Apple', slug: 'apple', timesEncountered: 2 }],
  '3': [
    { name: 'Bloomberg', slug: 'bloomberg', timesEncountered: 3 },
    { name: 'Amazon', slug: 'amazon', timesEncountered: 4 },
  ],
})

describe('parseCompanies', () => {
  it('merges buckets, most encountered first, ties by name', () => {
    expect(parseCompanies(STATS)).toEqual(['Amazon', 'Google', 'Bloomberg', 'Apple', 'Microsoft'])
  })

  it(`keeps only the top ${TOP_COMPANIES}`, () => {
    const many = JSON.stringify({
      '1': Array.from({ length: 9 }, (_, i) => ({ name: `C${i}`, timesEncountered: 9 - i })),
    })
    expect(parseCompanies(many)).toEqual(['C0', 'C1', 'C2', 'C3', 'C4'])
  })

  it('returns [] when there are no stats', () => {
    expect(parseCompanies(null)).toEqual([])
    expect(parseCompanies('{}')).toEqual([])
  })
})

describe('toProblem', () => {
  const node = {
    questionFrontendId: '232',
    title: 'Implement Queue using Stacks',
    titleSlug: 'implement-queue-using-stacks',
    difficulty: 'Easy',
    topicTags: [{ name: 'Stack' }, { name: 'Design' }, { name: 'Queue' }],
    companyTagStats: STATS,
  }

  it('maps a question to meta.json fields', () => {
    expect(toProblem(node)).toEqual({
      id: 232,
      slug: 'implement-queue-using-stacks',
      title: 'Implement Queue using Stacks',
      difficulty: 'Easy',
      topics: ['Stack', 'Design', 'Queue'],
      companies: ['Amazon', 'Google', 'Bloomberg', 'Apple', 'Microsoft'],
      url: 'https://leetcode.com/problems/implement-queue-using-stacks/',
    })
  })

  it('rejects an unknown difficulty', () => {
    expect(() => toProblem({ ...node, difficulty: 'Insane' })).toThrow(LeetCodeError)
  })
})
