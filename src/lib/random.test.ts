import { describe, expect, it } from 'vitest'
import { pickRandom } from './random'

describe('pickRandom', () => {
  it('picks from the pool', () => {
    expect(pickRandom([1, 2, 3], [9], undefined, () => 0.99)).toBe(3)
  })

  it('falls back when the pool is empty', () => {
    expect(pickRandom([], [7, 8], undefined, () => 0)).toBe(7)
  })

  it('avoids the current item when it can', () => {
    expect(pickRandom([1, 2], [], 1, () => 0)).toBe(2)
    expect(pickRandom([1], [], 1, () => 0)).toBe(1)
  })

  it('returns undefined when there is nothing to pick', () => {
    expect(pickRandom([], [])).toBeUndefined()
  })
})
