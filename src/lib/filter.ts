import type { Difficulty, IndexProblem } from './types'

export interface Filters {
  /** Matches problem id or title, case-insensitive. */
  q: string
  /** `''` = any. */
  difficulty: Difficulty | ''
  company: string
  topic: string
}

export const EMPTY_FILTERS: Filters = { q: '', difficulty: '', company: '', topic: '' }

export type Facet = 'difficulty' | 'company' | 'topic'

export interface FacetOption {
  value: string
  /** Problems this option would show, given the other active filters. */
  count: number
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

/** `skip` ignores one facet, so its options can show their own counts. */
function matches(p: IndexProblem, f: Filters, skip?: Facet): boolean {
  if (skip !== 'difficulty' && f.difficulty && p.difficulty !== f.difficulty) return false
  if (skip !== 'company' && f.company && !p.companies.includes(f.company)) return false
  if (skip !== 'topic' && f.topic && !p.topics.includes(f.topic)) return false
  const q = f.q.trim().toLowerCase()
  if (q && !`${p.id} ${p.title}`.toLowerCase().includes(q)) return false
  return true
}

export function filterProblems(problems: IndexProblem[], f: Filters): IndexProblem[] {
  return problems.filter((p) => matches(p, f))
}

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.difficulty || f.company || f.topic)
}

/**
 * Options for one facet's dropdown. Difficulty keeps Easy → Hard order;
 * companies and topics list every known value, most problems first.
 */
export function facetOptions(problems: IndexProblem[], f: Filters, facet: Facet): FacetOption[] {
  const pool = problems.filter((p) => matches(p, f, facet))
  if (facet === 'difficulty') {
    return DIFFICULTIES.map((d) => ({
      value: d,
      count: pool.filter((p) => p.difficulty === d).length,
    }))
  }
  const key = facet === 'company' ? 'companies' : 'topics'
  const counts = new Map<string, number>()
  for (const p of problems) for (const v of p[key]) counts.set(v, 0)
  for (const p of pool) for (const v of p[key]) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}
