import type { IndexProblem } from './types'

/** Builds an index problem for tests; `dates` gives one solution per date. */
export function problem(
  id: number,
  dates: string[],
  extra: Partial<Omit<IndexProblem, 'id' | 'solutions'>> = {},
): IndexProblem {
  return {
    id,
    title: `Problem ${id}`,
    difficulty: 'Easy',
    topics: [],
    companies: [],
    url: `https://leetcode.com/problems/problem-${id}/`,
    ...extra,
    solutions: dates.map((dateSolved, i) => ({
      file: `s${i}.py`,
      language: 'python',
      approach: 'A',
      dateSolved,
    })),
  }
}
