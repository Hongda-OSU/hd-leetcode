import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Project rule: every <img> is either lazy-loaded or preloaded, so images
 * never block first paint or pop in late. Inline <svg> icons are exempt.
 */

const root = path.resolve(import.meta.dirname, '..')
const indexHtml = readFileSync(path.join(root, 'index.html'), 'utf8')

const files = [
  'index.html',
  ...readdirSync(path.join(root, 'src'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.svelte') || f.endsWith('.html'))
    .map((f) => path.join('src', f)),
]

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`))?.[1]

const preloadedImages = new Set(
  [...indexHtml.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => attr(tag, 'rel') === 'preload' && attr(tag, 'as') === 'image')
    .map((tag) => attr(tag, 'href')),
)

/** The <img> tags in `markup` that are neither lazy nor preloaded. */
function check(markup: string): string[] {
  return [...markup.matchAll(/<img\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => attr(tag, 'loading') !== 'lazy' && !preloadedImages.has(attr(tag, 'src')))
}

describe('images', () => {
  it.each(files)('%s: every <img> is lazy or preloaded', (file) => {
    expect(check(readFileSync(path.join(root, file), 'utf8'))).toEqual([])
  })

  it('catches an eager image that is not preloaded', () => {
    expect(check('<img src="/a.png" alt="">')).toHaveLength(1)
    expect(check('<img src="/a.png" loading="lazy" alt="">')).toEqual([])
  })
})
