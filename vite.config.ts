import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { dataPlugin } from './scripts/vite-plugin-data.ts'

// https://vite.dev/config/
// DATA_DIR points at another data folder, e.g. sample data for UI work.
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site under /hd-leetcode/; only the dev server stays at /.
  // (`vite preview` also runs with command "serve", so check isPreview too.)
  base: command === 'serve' && !isPreview ? '/' : '/hd-leetcode/',
  plugins: [svelte(), dataPlugin(process.env.DATA_DIR ?? 'data')],
}))
