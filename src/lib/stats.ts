import { addDays } from './dates'
import type { IndexProblem } from './types'

/** Number of solutions per `dateSolved`. */
export function countByDay(problems: IndexProblem[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const p of problems) {
    for (const s of p.solutions) counts.set(s.dateSolved, (counts.get(s.dateSolved) ?? 0) + 1)
  }
  return counts
}

export interface Stats {
  problems: number
  solutions: number
  activeDays: number
  /** Solutions added today. */
  today: number
  /** Consecutive active days up to today; an empty today doesn't break it yet. */
  streak: number
}

export function computeStats(problems: IndexProblem[], today: string): Stats {
  const counts = countByDay(problems)
  let day = counts.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (counts.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return {
    problems: problems.length,
    solutions: problems.reduce((n, p) => n + p.solutions.length, 0),
    activeDays: counts.size,
    today: counts.get(today) ?? 0,
    streak,
  }
}
