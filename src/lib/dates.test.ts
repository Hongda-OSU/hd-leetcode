import { describe, expect, it } from 'vitest'
import { addDays, dayOfWeek, localToday } from './dates'

describe('dates', () => {
  it('formats the local date', () => {
    expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('adds days across month, year and leap boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09') // US DST start
  })

  it('gets the day of week', () => {
    expect(dayOfWeek('2026-11-08')).toBe(0) // Sunday
    expect(dayOfWeek('2026-11-10')).toBe(2) // Tuesday
  })
})
