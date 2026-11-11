import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DataError, loadProblems, toIndex } from './build-index.ts'

let dataDir: string

const meta = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  slug: `problem-${id}`,
  title: `Problem ${id}`,
  difficulty: 'Easy',
  topics: ['Array'],
  companies: [],
  url: `https://leetcode.com/problems/problem-${id}/`,
  solutions: [{ file: 'a.py', language: 'python', approach: 'A', dateSolved: '2026-11-01' }],
  ...overrides,
})

function writeProblem(id: number | string, data: unknown, files = ['a.py']): void {
  const dir = path.join(dataDir, 'problems', String(id))
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'meta.json'), typeof data === 'string' ? data : JSON.stringify(data))
  for (const f of files) writeFileSync(path.join(dir, f), 'pass\n')
}

beforeEach(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'hd-leetcode-'))
})

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true })
})

describe('loadProblems', () => {
  it('returns [] when there is no problems folder', () => {
    expect(loadProblems(dataDir)).toEqual([])
  })

  it('loads a valid problem', () => {
    writeProblem(1, meta(1))
    expect(loadProblems(dataDir)).toEqual([meta(1)])
  })

  it.each([
    ['id not matching folder', meta(2)],
    ['bad difficulty', meta(1, { difficulty: 'Insane' })],
    ['non-leetcode url', meta(1, { url: 'https://example.com/' })],
    ['companies missing', meta(1, { companies: undefined })],
    ['unknown field', meta(1, { tags: [] })],
    ['empty solutions', meta(1, { solutions: [] })],
    [
      'invalid date',
      meta(1, {
        solutions: [{ file: 'a.py', language: 'python', approach: 'A', dateSolved: '2026-02-30' }],
      }),
    ],
    [
      'non-slug file name',
      meta(1, {
        solutions: [
          { file: 'A B.py', language: 'python', approach: 'A', dateSolved: '2026-11-01' },
        ],
      }),
    ],
    [
      'missing source file',
      meta(1, {
        solutions: [{ file: 'b.py', language: 'python', approach: 'A', dateSolved: '2026-11-01' }],
      }),
    ],
    [
      'duplicate file',
      meta(1, {
        solutions: [
          { file: 'a.py', language: 'python', approach: 'A', dateSolved: '2026-11-01' },
          { file: 'a.py', language: 'python', approach: 'B', dateSolved: '2026-11-02' },
        ],
      }),
    ],
  ])('rejects %s', (_name, data) => {
    writeProblem(1, data)
    expect(() => loadProblems(dataDir)).toThrow(DataError)
  })

  it('rejects invalid JSON', () => {
    writeProblem(1, '{ nope')
    expect(() => loadProblems(dataDir)).toThrow(/invalid JSON/)
  })

  it('rejects a folder without meta.json', () => {
    mkdirSync(path.join(dataDir, 'problems', '7'), { recursive: true })
    expect(() => loadProblems(dataDir)).toThrow(/missing meta.json/)
  })
})

describe('toIndex', () => {
  it('sorts by latest solve date, drops slug and notes', () => {
    const older = meta(1)
    const newer = meta(2, {
      solutions: [
        { file: 'a.py', language: 'python', approach: 'A', dateSolved: '2026-10-01' },
        {
          file: 'b.java',
          language: 'java',
          approach: 'A',
          dateSolved: '2026-11-05',
          notes: 'secret sauce',
        },
      ],
    })
    const index = toIndex([older, newer] as never)
    expect(index.problems.map((p) => p.id)).toEqual([2, 1])
    expect(index.problems[0]).not.toHaveProperty('slug')
    expect(index.problems[0].solutions[1]).toEqual({
      file: 'b.java',
      language: 'java',
      approach: 'A',
      dateSolved: '2026-11-05',
    })
  })

  it('breaks date ties by problem id', () => {
    const index = toIndex([meta(9), meta(3)] as never)
    expect(index.problems.map((p) => p.id)).toEqual([3, 9])
  })
})
