export const REPO_URL = 'https://github.com/stels54/claude-code-harness'
export const REPO_REF = 'main'

export interface LineRange {
  from: number
  to: number
}

export function repoFileUrl(path: string, lines?: LineRange): string {
  const url = `${REPO_URL}/blob/${REPO_REF}/${path}`
  if (!lines) return url
  const base = path.endsWith('.md') ? `${url}?plain=1` : url
  return lines.from === lines.to
    ? `${base}#L${lines.from}`
    : `${base}#L${lines.from}-L${lines.to}`
}
