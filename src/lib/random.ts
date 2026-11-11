/**
 * Picks a random item from `pool`, or from `fallback` when `pool` is
 * empty. Avoids returning `current` again when there is another choice.
 */
export function pickRandom<T>(
  pool: T[],
  fallback: T[],
  current?: T,
  rand: () => number = Math.random,
): T | undefined {
  const source = pool.length ? pool : fallback
  const choices = source.length > 1 ? source.filter((x) => x !== current) : source
  return choices[Math.floor(rand() * choices.length)]
}
