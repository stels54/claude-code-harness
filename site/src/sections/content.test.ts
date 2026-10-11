import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { REPO_REF, REPO_URL } from '../repo.ts'
import { PIPELINE_STEPS } from '../pipeline/steps.ts'
import { AUTHOR, DEVICE, LIMITS, SNAPSHOT, WHY, type Section } from './content.ts'

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
    'пустое → STOP',
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
    'пропуск флагом `--no-codex`',
    'нет бинаря `codex` → ⏭️',
  ],
  hooks: [
    'подключает `notify.sh` на `Notification` и `Stop`',
    'пишет jsonl в `$HOME/.claude/pipeline-clock.jsonl`',
    'Оба при любом сбое завершаются с кодом 0 и работу не блокируют',
    'требует `jq`',
    'в строку попадают время, событие, id сессии, рабочий каталог и до 200 символов первой строки запроса пользователя или задания субагенту',
  ],
  'thin-layer': [
    '`harness/settings-hooks.json` (только ключ `hooks`)',
    '`harness/CLAUDE.md` — часть ядра, а не пример',
    'требует `jq`',
    '`notify.sh` — уведомление через `terminal-notifier` или `notify-send`',
    'Ревью другой моделью — Codex CLI',
  ],
}

const DEVICE_TEXT: Record<string, string[]> = {
  commands: ['STOP'],
  'cross-review': ['--no-codex', '⏭️'],
  hooks: ['jq', 'id сессии', 'рабочий каталог', 'двухсот символов', 'задания субагенту'],
  'thin-layer': ['jq', 'terminal-notifier', 'notify-send', 'Codex CLI', 'Выбор автора'],
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

test('пункты «Устройства» называют свои факты', () => {
  for (const [id, phrases] of Object.entries(DEVICE_TEXT)) {
    expect(ids(DEVICE)).toContain(id)
    const item = DEVICE.items.find((it) => it.id === id)
    for (const phrase of phrases) {
      expect(item?.text).toContain(phrase)
    }
  }
})

test('«Команды» определяют основную цепочку по схеме', () => {
  const text = DEVICE.items.find((item) => item.id === 'commands')?.text
  const chain = PIPELINE_STEPS.filter((step) => step.kind === 'chain')
  const aside = PIPELINE_STEPS.filter((step) => step.kind === 'aside')
  for (const step of [chain[0], chain[chain.length - 1], ...aside]) {
    expect(text).toContain(step.title)
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

test('снимок в подвале', () => {
  const readme = readFileSync(join(root, 'README.md'), 'utf8')
  const date = readme.match(/^- Дата снимка: (\d{4}-\d{2}-\d{2})\.$/m)?.[1]
  expect(date).toBeDefined()
  expect(SNAPSHOT.date).toBe(date)
  expect(SNAPSHOT.ref).toBe(REPO_REF)
  expect(SNAPSHOT.href).toBe(`${REPO_URL}/tree/v1`)
  expect(SNAPSHOT.label.trim()).not.toBe('')
  expect(SNAPSHOT.label).not.toMatch(/SDD|Spec-Driven/)
})
