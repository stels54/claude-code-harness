import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { pipelineFragments } from './fragments-plugin.ts'
import { FRAGMENT_SOURCES } from './src/pipeline/fragment-sources.ts'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/claude-code-harness/',
  plugins: [react(), pipelineFragments(repoRoot, FRAGMENT_SOURCES)],
})
