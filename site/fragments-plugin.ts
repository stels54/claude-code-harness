import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { extractFragment, type Fragment } from './src/pipeline/fragment.ts'
import type { FragmentSource } from './src/pipeline/fragment-sources.ts'

const MODULE_ID = 'virtual:pipeline-fragments'
const RESOLVED_ID = `\0${MODULE_ID}`

type Sources = Record<string, FragmentSource>
type Fragments = Record<string, Fragment & { path: string }>

export function loadFragments(root: string, sources: Sources): Fragments {
  const result: Fragments = {}
  for (const [name, { path, start, end }] of Object.entries(sources)) {
    try {
      const raw = readFileSync(join(root, path), 'utf8')
      result[name] = { path, ...extractFragment(raw, start, end) }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`Фрагмент «${name}» из ${path}: ${reason}`, { cause: error })
    }
  }
  return result
}

export function resolveFragmentsId(id: string): string | null {
  return id === MODULE_ID ? RESOLVED_ID : null
}

export function fragmentsModuleCode(root: string, sources: Sources): string {
  return `export default ${JSON.stringify(loadFragments(root, sources))}`
}

export function pipelineFragments(root: string, sources: Sources): Plugin {
  return {
    name: 'pipeline-fragments',
    resolveId: (id) => resolveFragmentsId(id),
    load(id) {
      if (id !== RESOLVED_ID) return null
      for (const { path } of Object.values(sources)) {
        this.addWatchFile(join(root, path))
      }
      return fragmentsModuleCode(root, sources)
    },
  }
}
