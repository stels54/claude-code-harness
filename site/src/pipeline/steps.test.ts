import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { PIPELINE_STEPS } from './steps.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))

const ids = (kind: 'chain' | 'aside') =>
  PIPELINE_STEPS.filter((step) => step.kind === kind).map((step) => step.id)

test('состав и порядок шагов', () => {
  expect(ids('chain')).toEqual([
    'roadmap',
    'plan',
    'implement',
    'verifier',
    'code-review',
    'manual',
  ])
  expect(ids('aside')).toEqual(['verify', 'plan-fix', 'fix-tests'])
  expect(PIPELINE_STEPS).toHaveLength(9)
})

describe.each(PIPELINE_STEPS.map((step) => [step.id, step] as const))(
  'шаг %s',
  (id, step) => {
    test('описание, вход, выход, решение человека непусты', () => {
      for (const value of [step.title, step.summary, step.input, step.output, step.human]) {
        expect(value.trim()).not.toBe('')
      }
    })

    test('файл команды существует в harness/', () => {
      expect(step.file).toMatch(/^harness\/(commands|agents)\/[a-z-]+\.md$/)
      expect(existsSync(join(root, step.file))).toBe(true)
    })

    test('опционален только /roadmap', () => {
      expect(step.optional).toBe(id === 'roadmap')
    })

    test('фрагмент есть только у шагов цепочки', () => {
      expect(step.fragment !== undefined).toBe(step.kind === 'chain')
    })

    test('фрагмент совпадает со строками исходного файла', () => {
      if (!step.fragment) return
      const { path, text, fromLine, toLine } = step.fragment
      expect(existsSync(join(root, path))).toBe(true)
      const source = readFileSync(join(root, path), 'utf8').split('\n')
      expect(text.trim()).not.toBe('')
      expect(text).toBe(source.slice(fromLine - 1, toLine).join('\n'))
    })

    test('нет запрещённых названий', () => {
      const strings = Object.values(step).filter((v) => typeof v === 'string')
      if (step.fragment) strings.push(step.fragment.label, step.fragment.text)
      for (const value of strings) {
        expect(value).not.toMatch(/SDD|Spec-Driven/)
      }
    })
  },
)
