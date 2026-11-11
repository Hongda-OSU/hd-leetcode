import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { dataPlugin } from './scripts/vite-plugin-data.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), dataPlugin('data')],
})
