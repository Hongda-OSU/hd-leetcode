import type { IndexProblem } from './types'

export interface Stats {
  problems: number
  solutions: number
  /** Solutions dated today; the header only mentions it when > 0. */
  today: number
}

export function computeStats(problems: IndexProblem[], today: string): Stats {
  const solutions = problems.flatMap((p) => p.solutions)
  return {
    problems: problems.length,
    solutions: solutions.length,
    today: solutions.filter((s) => s.dateSolved === today).length,
  }
}
