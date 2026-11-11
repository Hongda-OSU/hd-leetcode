/**
 * Saves one solution into data/problems/<id>/: reuses meta.json if the
 * problem is already there, otherwise fetches it from LeetCode first.
 * The caller (the /lc skill) has already detected the language, named
 * the approach and formatted the code.
 *
 *   pnpm lc:add 232 --code /path/to/solution.py --language python \
 *     --approach 两栈法 --slug two-stacks [--notes "..."] [--date 2026-11-10]
 *
 * Prints a JSON summary. Does not commit.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { localToday } from '../src/lib/dates.ts'
import { EXTENSIONS } from '../src/lib/languages.ts'
import type { ProblemMeta, Solution } from '../src/lib/types.ts'
import { validateMeta } from './build-index.ts'
import { type FetchedProblem, LeetCodeError, credentialsFromEnv, fetchProblem } from './lc-fetch.ts'

export interface AddOptions {
  /** Problem number or slug. */
  ref: string
  code: string
  language: string
  approach: string
  /** ASCII file-name stem, e.g. `two-stacks`. */
  slug: string
  notes?: string
  /** `YYYY-MM-DD`; defaults to today. */
  date?: string
}

export interface AddResult {
  id: number
  title: string
  file: string
  /** True when this call created the problem folder. */
  newProblem: boolean
}

type Fetcher = (ref: string) => Promise<FetchedProblem>

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function readMeta(dir: string): ProblemMeta {
  return JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf8')) as ProblemMeta
}

/** The local problem folder for `ref`, if this problem was saved before. */
function findLocal(dataDir: string, ref: string): string | undefined {
  const root = path.join(dataDir, 'problems')
  if (/^\d+$/.test(ref)) {
    const dir = path.join(root, String(Number(ref)))
    return existsSync(path.join(dir, 'meta.json')) ? dir : undefined
  }
  if (!existsSync(root)) return undefined
  return readdirSync(root)
    .map((name) => path.join(root, name))
    .find((dir) => existsSync(path.join(dir, 'meta.json')) && readMeta(dir).slug === ref)
}

function uniqueFile(meta: ProblemMeta, dir: string, stem: string, ext: string): string {
  const taken = (f: string) =>
    meta.solutions.some((s) => s.file === f) || existsSync(path.join(dir, f))
  let file = `${stem}.${ext}`
  for (let n = 2; taken(file); n++) file = `${stem}-${n}.${ext}`
  return file
}

const normalize = (code: string) => code.replace(/\r\n/g, '\n').trimEnd()

export async function addSolution(
  opts: AddOptions,
  dataDir: string,
  fetcher: Fetcher,
): Promise<AddResult> {
  const ext = EXTENSIONS[opts.language]
  if (!ext) {
    throw new LeetCodeError(
      `unknown language "${opts.language}"; use one of ${Object.keys(EXTENSIONS).join(', ')}`,
    )
  }
  if (!SLUG_RE.test(opts.slug)) {
    throw new LeetCodeError(`slug must be lowercase ASCII words joined by "-", got "${opts.slug}"`)
  }
  if (!opts.approach.trim()) throw new LeetCodeError('approach is required')
  const code = normalize(opts.code)
  if (!code) throw new LeetCodeError('the code is empty')

  let dir = findLocal(dataDir, opts.ref)
  const newProblem = !dir
  let meta: ProblemMeta
  if (dir) {
    meta = readMeta(dir)
  } else {
    meta = { ...(await fetcher(opts.ref)), solutions: [] }
    dir = path.join(dataDir, 'problems', String(meta.id))
  }

  const dup = meta.solutions.find(
    (s) => normalize(readFileSync(path.join(dir, s.file), 'utf8')) === code,
  )
  if (dup) throw new LeetCodeError(`this code is already saved as ${dup.file}`)

  const file = uniqueFile(meta, dir, opts.slug, ext)
  const solution: Solution = {
    file,
    language: opts.language,
    approach: opts.approach.trim(),
    dateSolved: opts.date ?? localToday(),
    ...(opts.notes?.trim() ? { notes: opts.notes.trim() } : {}),
  }
  const next: ProblemMeta = { ...meta, solutions: [...meta.solutions, solution] }

  // Write, then validate the result; on failure put everything back.
  const metaPath = path.join(dir, 'meta.json')
  const previousMeta = newProblem ? undefined : readFileSync(metaPath, 'utf8')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, file), code + '\n')
  writeFileSync(metaPath, JSON.stringify(next, null, 2) + '\n')
  try {
    validateMeta(JSON.parse(readFileSync(metaPath, 'utf8')), dir)
  } catch (err) {
    rmSync(path.join(dir, file))
    if (previousMeta === undefined) rmSync(dir, { recursive: true })
    else writeFileSync(metaPath, previousMeta)
    throw err
  }
  return { id: next.id, title: next.title, file, newProblem }
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      code: { type: 'string' },
      language: { type: 'string' },
      approach: { type: 'string' },
      slug: { type: 'string' },
      notes: { type: 'string' },
      date: { type: 'string' },
    },
  })
  const [ref] = positionals
  if (!ref || !values.code || !values.language || !values.approach || !values.slug) {
    console.error(
      'Usage: pnpm lc:add <number|slug> --code <file> --language <id> --approach <name> --slug <file-stem> [--notes <text>] [--date YYYY-MM-DD]',
    )
    process.exit(2)
  }
  try {
    const result = await addSolution(
      {
        ref,
        code: readFileSync(values.code, 'utf8'),
        language: values.language,
        approach: values.approach,
        slug: values.slug,
        notes: values.notes,
        date: values.date,
      },
      process.env.DATA_DIR ?? 'data',
      (r) => fetchProblem(r, credentialsFromEnv()),
    )
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }
}
