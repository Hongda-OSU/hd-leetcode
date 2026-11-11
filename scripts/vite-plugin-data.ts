import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { loadProblems, toIndex } from './build-index.ts'

const PREFIX = 'data/'

/**
 * Serves `data/` in dev and emits it into the build as `data/…`:
 * a generated `data/index.json`, plus each problem's `meta.json`
 * and listed solution files (nothing else in the folder ships).
 */
export function dataPlugin(dataDir: string): Plugin {
  const root = path.resolve(dataDir)
  let base = '/'

  return {
    name: 'hd-leetcode-data',

    configResolved(config) {
      base = config.base
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0])
        if (!url.startsWith(base + PREFIX)) return next()
        const sub = url.slice(base.length + PREFIX.length)
        try {
          // Rebuilt per request so new data shows up on refresh.
          const problems = loadProblems(root)
          if (sub === 'index.json') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(toIndex(problems)))
            return
          }
          const file = shippedFiles(problems).find((f) => f === sub)
          if (!file) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          const type = file.endsWith('.json') ? 'application/json' : 'text/plain'
          res.setHeader('Content-Type', `${type}; charset=utf-8`)
          res.end(readFileSync(path.join(root, file)))
        } catch (err) {
          res.statusCode = 500
          res.end((err as Error).message)
        }
      })
    },

    generateBundle() {
      const problems = loadProblems(root)
      this.emitFile({
        type: 'asset',
        fileName: PREFIX + 'index.json',
        source: JSON.stringify(toIndex(problems)),
      })
      for (const file of shippedFiles(problems)) {
        this.emitFile({
          type: 'asset',
          fileName: PREFIX + file,
          source: readFileSync(path.join(root, file)),
        })
      }
    },
  }
}

/** Paths relative to the data dir, e.g. `problems/232/two-stacks.py`. */
function shippedFiles(problems: ReturnType<typeof loadProblems>): string[] {
  return problems.flatMap((p) => [
    `problems/${p.id}/meta.json`,
    ...p.solutions.map((s) => `problems/${p.id}/${s.file}`),
  ])
}
