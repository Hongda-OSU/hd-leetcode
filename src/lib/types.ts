export type Difficulty = 'Easy' | 'Medium' | 'Hard'

/** One stored solution, as listed in `meta.json`. */
export interface Solution {
  /** Source file name inside the problem folder, e.g. `two-stacks.py`. */
  file: string
  language: string
  approach: string
  /** `YYYY-MM-DD`; streaks and daily counts use this date. */
  dateSolved: string
  notes?: string
}

/** `data/problems/<id>/meta.json` */
export interface ProblemMeta {
  id: number
  slug: string
  title: string
  difficulty: Difficulty
  topics: string[]
  companies: string[]
  url: string
  solutions: Solution[]
}

/** A solution as listed in `index.json` (no notes). */
export type IndexSolution = Omit<Solution, 'notes'>

export interface IndexProblem extends Omit<ProblemMeta, 'slug' | 'solutions'> {
  solutions: IndexSolution[]
}

/** `data/index.json`, generated at build time. */
export interface IndexFile {
  problems: IndexProblem[]
}
