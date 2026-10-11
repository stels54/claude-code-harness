declare module 'virtual:pipeline-fragments' {
  import type { Fragment } from './fragment.ts'
  import type { FragmentName } from './fragment-sources.ts'

  const fragments: Record<FragmentName, Fragment & { path: string }>
  export default fragments
}
