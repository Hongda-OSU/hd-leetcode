import { describe, expect, it } from 'vitest'
import { localToday } from './dates'

describe('localToday', () => {
  it('formats the local date, zero-padded', () => {
    expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
