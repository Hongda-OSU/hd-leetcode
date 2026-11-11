const pad = (n: number) => String(n).padStart(2, '0')

/** Today's local date as `YYYY-MM-DD`, the same format as `dateSolved`. */
export function localToday(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
