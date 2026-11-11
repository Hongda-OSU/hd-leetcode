import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { dataPlugin } from './scripts/vite-plugin-data.ts'

// https://vite.dev/config/
// DATA_DIR points at another data folder, e.g. sample data for UI work.
export default defineConfig({
  plugins: [svelte(), dataPlugin(process.env.DATA_DIR ?? 'data')],
})
