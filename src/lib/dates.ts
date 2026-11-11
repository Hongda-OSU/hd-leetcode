/**
 * Dates are `YYYY-MM-DD` strings in the solver's local calendar.
 * Arithmetic goes through UTC so DST shifts never skip or repeat a day.
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Today's local date as `YYYY-MM-DD`. */
export function localToday(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function toUTC(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function addDays(iso: string, days: number): string {
  const date = toUTC(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUTC(date)
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(iso: string): number {
  return toUTC(iso).getUTCDay()
}
