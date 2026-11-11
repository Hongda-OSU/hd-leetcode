import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type AddOptions, addSolution, metaFileFetcher } from './lc-add.ts'
import type { FetchedProblem } from './lc-fetch.ts'

const P232: FetchedProblem = {
  id: 232,
  slug: 'implement-queue-using-stacks',
  title: 'Implement Queue using Stacks',
  difficulty: 'Easy',
  topics: ['Stack', 'Design', 'Queue'],
  companies: ['Google', 'Bloomberg'],
  url: 'https://leetcode.com/problems/implement-queue-using-stacks/',
}

const opts = (over: Partial<AddOptions> = {}): AddOptions => ({
  ref: '232',
  code: 'class MyQueue:\n    pass\n',
  language: 'python',
  approach: '两栈法',
  slug: 'two-stacks',
  date: '2026-11-10',
  ...over,
})

let dataDir: string
const dir = () => path.join(dataDir, 'problems', '232')
const meta = () => JSON.parse(readFileSync(path.join(dir(), 'meta.json'), 'utf8'))
const fetcher = vi.fn(async () => P232)
const noFetch = async (): Promise<FetchedProblem> => {
  throw new Error('should not fetch a problem that is already saved')
}

beforeEach(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'hd-leetcode-add-'))
  fetcher.mockClear()
})

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true })
})

describe('addSolution', () => {
  it('creates a new problem from LeetCode metadata', async () => {
    const result = await addSolution(opts({ notes: '  摊还 O(1)  ' }), dataDir, fetcher)
    expect(result).toEqual({ id: 232, title: P232.title, file: 'two-stacks.py', newProblem: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(meta()).toEqual({
      ...P232,
      solutions: [
        {
          file: 'two-stacks.py',
          language: 'python',
          approach: '两栈法',
          dateSolved: '2026-11-10',
          notes: '摊还 O(1)',
        },
      ],
    })
    expect(readFileSync(path.join(dir(), 'two-stacks.py'), 'utf8')).toBe(
      'class MyQueue:\n    pass\n',
    )
  })

  it('reuses a saved problem without fetching, by number or slug', async () => {
    await addSolution(opts(), dataDir, fetcher)
    await addSolution(opts({ language: 'java', code: 'class MyQueue {}' }), dataDir, noFetch)
    const r = await addSolution(
      opts({ ref: P232.slug, slug: 'one-stack', code: 'x = 1' }),
      dataDir,
      noFetch,
    )
    expect(r.newProblem).toBe(false)
    expect(meta().solutions.map((s: { file: string }) => s.file)).toEqual([
      'two-stacks.py',
      'two-stacks.java',
      'one-stack.py',
    ])
  })

  it('adds a suffix when the file name is taken', async () => {
    await addSolution(opts(), dataDir, fetcher)
    const r = await addSolution(opts({ code: 'y = 2' }), dataDir, noFetch)
    expect(r.file).toBe('two-stacks-2.py')
  })

  it('refuses the same code twice', async () => {
    await addSolution(opts(), dataDir, fetcher)
    await expect(
      addSolution(opts({ slug: 'again', code: 'class MyQueue:\r\n    pass' }), dataDir, noFetch),
    ).rejects.toThrow(/already saved as two-stacks.py/)
    expect(meta().solutions).toHaveLength(1)
  })

  it.each([
    ['an unknown language', { language: 'brainfuck' }, /unknown language/],
    ['a non-ASCII slug', { slug: '两栈' }, /slug must be/],
    ['empty code', { code: '  \n' }, /empty/],
  ])('rejects %s before touching anything', async (_name, over, message) => {
    await expect(addSolution(opts(over), dataDir, fetcher)).rejects.toThrow(message)
    expect(fetcher).not.toHaveBeenCalled()
    expect(existsSync(dir())).toBe(false)
  })

  it('rolls back a new problem when validation fails', async () => {
    await expect(addSolution(opts({ date: '2026-02-30' }), dataDir, fetcher)).rejects.toThrow(
      /dateSolved/,
    )
    expect(existsSync(dir())).toBe(false)
  })

  it('rolls back an existing problem when validation fails', async () => {
    await addSolution(opts(), dataDir, fetcher)
    const before = readFileSync(path.join(dir(), 'meta.json'), 'utf8')
    await expect(
      addSolution(opts({ slug: 'bad', code: 'z', date: 'tomorrow' }), dataDir, noFetch),
    ).rejects.toThrow(/dateSolved/)
    expect(readFileSync(path.join(dir(), 'meta.json'), 'utf8')).toBe(before)
    expect(readdirSync(dir()).sort()).toEqual(['meta.json', 'two-stacks.py'])
  })

  it('can reuse saved lc:fetch output instead of fetching', async () => {
    const file = path.join(dataDir, 'p232.json')
    writeFileSync(file, JSON.stringify(P232))
    const r = await addSolution(opts(), dataDir, metaFileFetcher(file))
    expect(r.newProblem).toBe(true)
    expect(meta().companies).toEqual(P232.companies)
    await expect(addSolution(opts({ ref: '20' }), dataDir, metaFileFetcher(file))).rejects.toThrow(
      /is problem #232, not "20"/,
    )
  })
})
