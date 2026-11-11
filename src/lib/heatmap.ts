import { addDays, dayOfWeek } from './dates'

export interface HeatCell {
  date: string
  count: number
  /** 0–4 color step; 4 means four or more solutions. */
  level: number
}

/**
 * Cells for a GitHub-style heatmap, oldest first, laid out column by
 * column (one column per week, Sunday on top). The last column is the
 * current week and ends at `today`.
 */
export function buildHeatmap(counts: Map<string, number>, today: string, weeks = 53): HeatCell[] {
  const total = (weeks - 1) * 7 + dayOfWeek(today) + 1
  const start = addDays(today, -(total - 1))
  return Array.from({ length: total }, (_, i) => {
    const date = addDays(start, i)
    const count = counts.get(date) ?? 0
    return { date, count, level: Math.min(count, 4) }
  })
}
