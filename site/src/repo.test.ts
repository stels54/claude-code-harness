import { expect, test } from 'vitest'
import { REPO_REF, REPO_URL, repoFileUrl } from './repo.ts'

const blob = 'https://github.com/stels54/claude-code-harness/blob/v1'

test('база ссылок на репозиторий', () => {
  expect(REPO_URL).toBe('https://github.com/stels54/claude-code-harness')
  expect(REPO_REF).toBe('v1')
})

test('ссылка на файл без строк', () => {
  expect(repoFileUrl('harness/commands/plan.md')).toBe(`${blob}/harness/commands/plan.md`)
})

test('ссылка на диапазон строк', () => {
  expect(
    repoFileUrl('docs/specs/2026-10-11_public-showcase.md', { from: 3, to: 7 }),
  ).toBe(`${blob}/docs/specs/2026-10-11_public-showcase.md?plain=1#L3-L7`)
})

test('ссылка на одну строку', () => {
  expect(repoFileUrl('README.md', { from: 5, to: 5 })).toBe(`${blob}/README.md?plain=1#L5`)
})

test('ссылка на строки не-markdown файла без plain', () => {
  expect(repoFileUrl('site/src/repo.ts', { from: 1, to: 2 })).toBe(
    `${blob}/site/src/repo.ts#L1-L2`,
  )
})
