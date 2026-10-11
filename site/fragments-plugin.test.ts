import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import {
  fragmentsModuleCode,
  loadFragments,
  resolveFragmentsId,
} from './fragments-plugin.ts'

const root = mkdtempSync(join(tmpdir(), 'fragments-'))
writeFileSync(join(root, 'doc.md'), 'a\n## X\nl1\n\n## Y\nz')

const sources = { one: { path: 'doc.md', start: '## X', end: '## Y' } }
const expected = {
  one: { path: 'doc.md', text: '## X\nl1', fromLine: 2, toLine: 3 },
}

test('фрагмент вырезается из файла по маркерам', () => {
  expect(loadFragments(root, sources)).toEqual(expected)
})

test('нет маркера начала — ошибка с путём и маркером', () => {
  const broken = { one: { path: 'doc.md', start: '## Q', end: '## Y' } }
  expect(() => loadFragments(root, broken)).toThrow(/doc\.md[\s\S]*## Q|## Q[\s\S]*doc\.md/)
})

test('нет файла — ошибка с путём', () => {
  const missing = { one: { path: 'nope.md', start: '## X', end: '## Y' } }
  expect(() => loadFragments(root, missing)).toThrow('nope.md')
})

test('виртуальный модуль разрешается только по своему имени', () => {
  expect(resolveFragmentsId('virtual:pipeline-fragments')).toBe(
    '\0virtual:pipeline-fragments',
  )
  expect(resolveFragmentsId('./x.ts')).toBeNull()
})

test('код модуля — export default с JSON фрагментов', () => {
  const code = fragmentsModuleCode(root, sources)
  const prefix = 'export default '
  expect(code.startsWith(prefix)).toBe(true)
  expect(JSON.parse(code.slice(prefix.length))).toEqual(expected)
})
