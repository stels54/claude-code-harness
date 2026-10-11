import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { REPO_URL } from '../repo.ts'
import { AUTHOR, DEVICE, LIMITS, WHY, type Section } from './content.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))

const roadmap = readFileSync(
  join(root, 'docs/roadmaps/2026-10-11_1236_public-showcase.md'),
  'utf8',
)

const facts = roadmap
  .slice(roadmap.indexOf('## Факты'), roadmap.indexOf('## Решения'))
  .split('\n')
  .map((line) => line.replace(/^\s*-\s*/, '').trim())
  .join(' ')
  .replace(/\s+/g, ' ')

const DEVICE_FACTS: Record<string, string[]> = {
  commands: [
    'кода не пишет',
    'критичные вопросы до плана',
    'коммит при PASSED предлагается, а не делается',
  ],
  verifier: [
    'контекста реализации у него нет намеренно',
    'проверяет файл плана и фактическое состояние репозитория',
    'итог PASSED/FAILED/PARTIAL',
    'вызывается из `/implement` с заданием «Проверь план <путь>»',
  ],
  'cross-review': [
    'codex exec --sandbox read-only',
    'ревьюер без контекста обсуждения и файлов не меняет',
    'каждое замечание проверяется по коду, один цикл без повторного ревью',
  ],
  hooks: [
    'подключает `notify.sh` на `Notification` и `Stop`',
    'пишет jsonl в `$HOME/.claude/pipeline-clock.jsonl`',
    'Оба при любом сбое завершаются с кодом 0 и работу не блокируют',
  ],
  'thin-layer': [
    '`harness/settings-hooks.json` (только ключ `hooks`)',
    '`harness/CLAUDE.md` — часть ядра, а не пример',
  ],
}

const sectionStrings = (section: Section) => [
  section.title,
  section.lead,
  ...section.items.flatMap((item) => [item.id, item.title, item.text]),
]

const authorStrings = () => [
  AUTHOR.name,
  ...AUTHOR.links.flatMap((link) => [link.label, link.href]),
]

const ids = (section: Section) => section.items.map((item) => item.id)

describe.each([
  ['WHY', WHY],
  ['DEVICE', DEVICE],
  ['LIMITS', LIMITS],
] as const)('раздел %s', (_, section) => {
  test('заголовок, вводная и пункты непусты', () => {
    expect(section.title.trim()).not.toBe('')
    expect(section.lead.trim()).not.toBe('')
    for (const item of section.items) {
      expect(item.title.trim()).not.toBe('')
      expect(item.text.trim()).not.toBe('')
    }
  })

  test('нет цифр', () => {
    for (const value of sectionStrings(section)) {
      expect(value).not.toMatch(/[0-9]/)
    }
  })
})

test('состав и порядок пунктов', () => {
  expect(ids(WHY)).toEqual(['requirements', 'completeness', 'verification'])
  expect(ids(DEVICE)).toEqual([
    'commands',
    'verifier',
    'cross-review',
    'hooks',
    'thin-layer',
  ])
  expect(ids(LIMITS)).toEqual([
    'auto-vs-human',
    'model-checks-model',
    'price',
    'no-spec-stage',
    'snapshot',
  ])
})

test('каждый пункт «Устройства» привязан к «Фактам»', () => {
  expect(Object.keys(DEVICE_FACTS).sort()).toEqual([...ids(DEVICE)].sort())
  for (const anchors of Object.values(DEVICE_FACTS)) {
    for (const anchor of anchors) {
      expect(facts).toContain(anchor)
    }
  }
})

test('нет запрещённых названий', () => {
  const all = [WHY, DEVICE, LIMITS].flatMap(sectionStrings).concat(authorStrings())
  for (const value of all) {
    expect(value).not.toMatch(/SDD|Spec-Driven/)
  }
})

test('спецификация упомянута только как отсутствующая стадия', () => {
  const sections = [WHY, DEVICE, LIMITS]
  for (const value of [...sections.map((s) => [s.title, s.lead]).flat(), ...authorStrings()]) {
    expect(value).not.toMatch(/спецификац/i)
  }
  for (const section of sections) {
    for (const item of section.items) {
      if (section === LIMITS && item.id === 'no-spec-stage') continue
      expect(`${item.title} ${item.text}`).not.toMatch(/спецификац/i)
    }
  }
})

test('подвал «Автор»', () => {
  expect(AUTHOR.name).toBe('Кирилл Жиркин')
  expect(AUTHOR.links.map((link) => link.href)).toEqual([
    'mailto:stels54@gmail.com',
    'https://t.me/stels54',
    'https://github.com/stels54',
    'https://www.linkedin.com/in/kirill-zhirkin/',
    REPO_URL,
  ])
  for (const link of AUTHOR.links) {
    expect(link.label.trim()).not.toBe('')
  }
  for (const value of authorStrings()) {
    expect(value).not.toMatch(/hh\./)
  }
})
