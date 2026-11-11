import { describe, expect, it } from 'vitest'
import { formatHash, parseHash } from './route'

describe('route', () => {
  it('parses id and file', () => {
    expect(parseHash('#/232/two-stacks.java')).toEqual({ id: 232, file: 'two-stacks.java' })
    expect(parseHash('#/232')).toEqual({ id: 232 })
    expect(parseHash('#232')).toEqual({ id: 232 })
  })

  it('ignores anything that is not a problem id', () => {
    expect(parseHash('')).toEqual({})
    expect(parseHash('#/')).toEqual({})
    expect(parseHash('#/abc/x.py')).toEqual({})
  })

  it('round-trips', () => {
    const route = { id: 1, file: 'hash-map.py' }
    expect(parseHash(formatHash(route))).toEqual(route)
    expect(formatHash({})).toBe('')
  })
})
