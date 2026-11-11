import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import type { IndexFile, ProblemMeta, Solution } from '../src/lib/types.ts'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const PROBLEM_KEYS = [
  'id',
  'slug',
  'title',
  'difficulty',
  'topics',
  'companies',
  'url',
  'solutions',
]
const SOLUTION_KEYS = ['file', 'language', 'approach', 'dateSolved', 'notes']
const FILE_RE = /^[a-z0-9][a-z0-9-]*\.[a-z0-9]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export class DataError extends Error {}

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)

function isRealDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function checkKeys(obj: Obj, allowed: string[], where: string): void {
  const extra = Object.keys(obj).filter((k) => !allowed.includes(k))
  if (extra.length) throw new DataError(`${where}: unknown field(s) ${extra.join(', ')}`)
}

function validateSolution(raw: unknown, dir: string, where: string): Solution {
  if (!isObj(raw)) throw new DataError(`${where}: must be an object`)
  checkKeys(raw, SOLUTION_KEYS, where)
  const { file, language, approach, dateSolved, notes } = raw
  if (!isStr(file) || !FILE_RE.test(file)) {
    throw new DataError(
      `${where}.file: must be an ASCII slug with an extension, got ${JSON.stringify(file)}`,
    )
  }
  if (!existsSync(path.join(dir, file)))
    throw new DataError(`${where}.file: ${file} does not exist`)
  if (!isStr(language)) throw new DataError(`${where}.language: required string`)
  if (!isStr(approach)) throw new DataError(`${where}.approach: required string`)
  if (typeof dateSolved !== 'string' || !isRealDate(dateSolved)) {
    throw new DataError(
      `${where}.dateSolved: must be YYYY-MM-DD, got ${JSON.stringify(dateSolved)}`,
    )
  }
  if (notes !== undefined && typeof notes !== 'string') {
    throw new DataError(`${where}.notes: must be a string`)
  }
  return { file, language, approach, dateSolved, ...(notes ? { notes } : {}) }
}

/** Validates one parsed `meta.json`; `dir` is its problem folder. */
export function validateMeta(raw: unknown, dir: string): ProblemMeta {
  const where = path.join(path.basename(dir), 'meta.json')
  if (!isObj(raw)) throw new DataError(`${where}: must be a JSON object`)
  checkKeys(raw, PROBLEM_KEYS, where)
  const { id, slug, title, difficulty, topics, companies, url, solutions } = raw

  if (!Number.isInteger(id) || String(id) !== path.basename(dir)) {
    throw new DataError(`${where}.id: must be an integer matching the folder name`)
  }
  if (!isStr(slug)) throw new DataError(`${where}.slug: required string`)
  if (!isStr(title)) throw new DataError(`${where}.title: required string`)
  if (typeof difficulty !== 'string' || !DIFFICULTIES.includes(difficulty)) {
    throw new DataError(`${where}.difficulty: must be one of ${DIFFICULTIES.join(' / ')}`)
  }
  if (!isStrArr(topics)) throw new DataError(`${where}.topics: must be a string array`)
  if (!isStrArr(companies)) throw new DataError(`${where}.companies: must be a string array`)
  if (!isStr(url) || !url.startsWith('https://leetcode.com/problems/')) {
    throw new DataError(`${where}.url: must be a https://leetcode.com/problems/ link`)
  }
  if (!Array.isArray(solutions) || solutions.length === 0) {
    throw new DataError(`${where}.solutions: must be a non-empty array`)
  }

  const sols = solutions.map((s, i) => validateSolution(s, dir, `${where}.solutions[${i}]`))
  const files = sols.map((s) => s.file)
  const dup = files.find((f, i) => files.indexOf(f) !== i)
  if (dup) throw new DataError(`${where}.solutions: duplicate file ${dup}`)

  return {
    id: id as number,
    slug,
    title,
    difficulty: difficulty as ProblemMeta['difficulty'],
    topics,
    companies,
    url,
    solutions: sols,
  }
}

/** Reads and validates every `<dataDir>/problems/<id>/meta.json`. */
export function loadProblems(dataDir: string): ProblemMeta[] {
  const root = path.join(dataDir, 'problems')
  if (!existsSync(root)) return []
  return readdirSync(root)
    .filter((name) => statSync(path.join(root, name)).isDirectory())
    .map((name) => {
      const dir = path.join(root, name)
      const metaPath = path.join(dir, 'meta.json')
      if (!existsSync(metaPath)) throw new DataError(`${name}: missing meta.json`)
      let raw: unknown
      try {
        raw = JSON.parse(readFileSync(metaPath, 'utf8'))
      } catch (err) {
        throw new DataError(`${name}/meta.json: invalid JSON (${(err as Error).message})`)
      }
      return validateMeta(raw, dir)
    })
}

const latest = (p: ProblemMeta): string =>
  p.solutions.reduce((max, s) => (s.dateSolved > max ? s.dateSolved : max), '')

/** Builds `index.json`: newest problems first, notes and slug left out. */
export function toIndex(problems: ProblemMeta[]): IndexFile {
  const sorted = [...problems].sort((a, b) => latest(b).localeCompare(latest(a)) || a.id - b.id)
  return {
    problems: sorted.map(({ slug: _slug, solutions, ...rest }) => ({
      ...rest,
      solutions: solutions.map(({ notes: _notes, ...s }) => s),
    })),
  }
}
