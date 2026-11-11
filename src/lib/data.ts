import type { IndexFile, ProblemMeta } from './types'

const DATA = `${import.meta.env.BASE_URL}data/`
const cache = new Map<string, Promise<unknown>>()

/** Fetches once per path; a failed fetch is dropped from the cache so it can retry. */
function get<T>(path: string, as: 'json' | 'text'): Promise<T> {
  let p = cache.get(path) as Promise<T> | undefined
  if (!p) {
    p = fetch(DATA + path).then((res) => {
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
      return res[as]() as Promise<T>
    })
    p.catch(() => cache.delete(path))
    cache.set(path, p)
  }
  return p
}

export const loadIndex = () => get<IndexFile>('index.json', 'json')

export const loadMeta = (id: number) => get<ProblemMeta>(`problems/${id}/meta.json`, 'json')

export const loadSource = (id: number, file: string) =>
  get<string>(`problems/${id}/${file}`, 'text')
