import type { IndexFile } from './types'

const DATA = `${import.meta.env.BASE_URL}data/`

export async function loadIndex(): Promise<IndexFile> {
  const res = await fetch(`${DATA}index.json`)
  if (!res.ok) throw new Error(`index.json: HTTP ${res.status}`)
  return res.json()
}
