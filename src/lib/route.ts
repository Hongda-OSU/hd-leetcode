/** Selection stored in the URL hash: `#/<id>` or `#/<id>/<file>`. */
export interface Route {
  id?: number
  file?: string
}

export function parseHash(hash: string): Route {
  const [id, file] = hash.replace(/^#\/?/, '').split('/')
  if (!/^\d+$/.test(id ?? '')) return {}
  return file ? { id: Number(id), file: decodeURIComponent(file) } : { id: Number(id) }
}

export function formatHash({ id, file }: Route): string {
  if (id === undefined) return ''
  return file ? `#/${id}/${encodeURIComponent(file)}` : `#/${id}`
}
