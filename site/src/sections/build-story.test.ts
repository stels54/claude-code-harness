import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { REPO_URL, repoFileUrl } from '../repo.ts'
import { BUILD_STORY, PARTIAL_NOTE, SELF_PLAN } from './build-story.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const read = (path: string) => readFileSync(join(root, path), 'utf8')

const events = BUILD_STORY.stages.flatMap((stage) =>
  stage.events.map((event) => ({ stage: stage.id, ...event })),
)
const fragments = events.flatMap((event) => event.fragments)
const paths = new Set(fragments.map((fragment) => fragment.path))

const lineAfter = (path: string, heading: string) => {
  const lines = read(path).split('\n')
  const at = lines.indexOf(heading)
  expect(at).toBeGreaterThanOrEqual(0)
  return lines.slice(at + 1).find((line) => line.trim() !== '') ?? ''
}

test('стадии по порядку', () => {
  expect(BUILD_STORY.stages.map((stage) => stage.id)).toEqual([
    'spec',
    'plans',
    'deviations',
    'verifier',
    'review',
    'fixes',
    'result',
    'manual',
  ])
})

test('тексты непусты, у стадий есть события, у событий — фрагменты', () => {
  expect(BUILD_STORY.title.trim()).not.toBe('')
  expect(BUILD_STORY.lead.trim()).not.toBe('')
  for (const stage of BUILD_STORY.stages) {
    expect(stage.title.trim()).not.toBe('')
    expect(stage.lead.trim()).not.toBe('')
    expect(stage.events.length).toBeGreaterThan(0)
    for (const event of stage.events) {
      expect(event.title.trim()).not.toBe('')
      expect(event.text.trim()).not.toBe('')
      expect(event.fragments.length).toBeGreaterThan(0)
      for (const fragment of event.fragments) {
        expect(fragment.label.trim()).not.toBe('')
      }
    }
  }
  const ids = events.map((event) => event.id)
  expect(new Set(ids).size).toBe(ids.length)
})

test('фрагменты совпадают со строками файлов и имеют ссылку', () => {
  for (const { path, text, fromLine, toLine } of fragments) {
    expect(existsSync(join(root, path))).toBe(true)
    expect(text.trim()).not.toBe('')
    expect(text).toBe(read(path).split('\n').slice(fromLine - 1, toLine).join('\n'))
    const url = repoFileUrl(path, { from: fromLine, to: toLine })
    expect(url.startsWith(`${REPO_URL}/blob/`)).toBe(true)
    expect(url).toContain('?plain=1#L')
  }
})

test('у каждого события есть источник в docs/plans/', () => {
  for (const event of events) {
    if (event.stage === 'spec') continue
    expect(event.fragments.some((f) => f.path.startsWith('docs/plans/'))).toBe(true)
  }
})

test('спецификация — вручную, в диалоге с моделью', () => {
  const spec = events.filter((event) => event.stage === 'spec')
  expect(spec.length).toBeGreaterThan(0)
  for (const event of spec) {
    expect(event.fragments.some((f) => f.path.startsWith('docs/specs/'))).toBe(true)
    expect(event.text).toContain('вручную')
    expect(event.text).toContain('в диалоге с моделью')
  }
})

test('показан прогон пунктов сайта и фикс-планов', () => {
  for (const plan of [
    '2026-10-11_1333_public-showcase-3-site-skeleton-pages',
    '2026-10-11_1356_public-showcase-4-style-pipeline-scheme',
    '2026-10-11_1425_public-showcase-5-why-device-limits-footer',
    '2026-10-11_1442_fix-showcase-4-links-aside-hero-h1',
    '2026-10-11_1453_fix-showcase-5-texts',
  ]) {
    for (const suffix of ['.md', '-verify.md', '-review.md']) {
      expect(paths).toContain(`docs/plans/${plan}${suffix}`)
    }
  }
})

test('собственный прогон — только ссылкой', () => {
  expect(SELF_PLAN.path).toMatch(/^docs\/plans\/.+_public-showcase-6-.+\.md$/)
  expect(existsSync(join(root, SELF_PLAN.path))).toBe(true)
  const base = SELF_PLAN.path.replace(/\.md$/, '')
  for (const path of paths) {
    expect(path.startsWith(base)).toBe(false)
  }
})

const isReport = (path: string) => path.endsWith('-verify.md') || path.endsWith('-review.md')

test('заявленный статус отчёта совпадает с итогом в файле', () => {
  for (const fragment of fragments) {
    if (fragment.path.endsWith('-verify.md')) {
      const verdict = lineAfter(fragment.path, '## Итог').match(/^(PASSED|PARTIAL|FAILED)/)?.[1]
      expect(verdict).toBeDefined()
      expect(fragment.claim).toEqual({ verdict })
    } else if (fragment.path.endsWith('-review.md')) {
      const rejected = lineAfter(fragment.path, '## Итог').match(/отклонено: (\d+)/)?.[1]
      expect(rejected).toBeDefined()
      expect(fragment.claim).toEqual({ rejected: Number(rejected) })
    } else {
      expect(fragment.claim).toBeUndefined()
    }
  }
})

test('заголовки событий не расходятся с заявленным статусом', () => {
  for (const event of events) {
    if (event.stage !== 'verifier' && event.stage !== 'review') continue
    const claims = event.fragments.flatMap((f) => (f.claim && isReport(f.path) ? [f.claim] : []))
    expect(claims.length).toBeGreaterThan(0)
    for (const claim of claims) {
      if ('verdict' in claim) {
        expect(event.title).toContain(claim.verdict)
      } else if (claim.rejected > 0) {
        expect(event.title).toContain('отклонен')
      } else {
        expect(event.title).not.toContain('отклонен')
      }
    }
  }
})

test('итоговый статус в заголовке события — последний названный', () => {
  for (const event of events) {
    if (event.stage !== 'verifier') continue
    const named = event.title.match(/PASSED|PARTIAL|FAILED/g) ?? []
    for (const { claim } of event.fragments) {
      if (claim && 'verdict' in claim) expect(named.at(-1)).toBe(claim.verdict)
    }
  }
})

test('PARTIAL и отклонённое замечание показаны', () => {
  const verifier = events.filter((event) => event.stage === 'verifier')
  expect(verifier.some((e) => e.fragments.some((f) => f.text.includes('PARTIAL')))).toBe(true)
  expect(paths).toContain('docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot-review.md')
  const review = events.filter((event) => event.stage === 'review')
  expect(
    review.some((e) =>
      e.fragments.some((f) => f.claim !== undefined && 'rejected' in f.claim && f.claim.rejected > 0),
    ),
  ).toBe(true)
})

test('обрезанные фрагменты подписаны', () => {
  expect(PARTIAL_NOTE.trim()).not.toBe('')
  const partial = fragments.filter((fragment) => fragment.partial)
  expect(partial.length).toBe(3)
  for (const { path, fromLine, toLine } of partial) {
    const lines = read(path).split('\n')
    const omitted = [
      ...lines.slice(toLine, toLine + 3),
      ...lines.slice(Math.max(0, fromLine - 4), fromLine - 1),
    ].join('\n')
    expect(omitted).toMatch(/SDD|Spec-Driven/)
  }
})

test('нет запрещённых названий', () => {
  const strings = [
    BUILD_STORY.title,
    BUILD_STORY.lead,
    PARTIAL_NOTE,
    SELF_PLAN.label,
    SELF_PLAN.path,
    ...BUILD_STORY.stages.flatMap((stage) => [stage.id, stage.title, stage.lead]),
    ...events.flatMap((event) => [event.id, event.title, event.text]),
    ...fragments.flatMap((fragment) => [fragment.label, fragment.path, fragment.text]),
  ]
  for (const value of strings) {
    expect(value).not.toMatch(/SDD|Spec-Driven/)
  }
})

test('нет цифр в авторских текстах, кроме номера пункта роадмапа', () => {
  const authored = [
    BUILD_STORY.title,
    BUILD_STORY.lead,
    PARTIAL_NOTE,
    SELF_PLAN.label,
    ...BUILD_STORY.stages.flatMap((stage) => [stage.title, stage.lead]),
    ...events.flatMap((event) => [event.title, event.text]),
    ...fragments.map((fragment) => fragment.label),
  ]
  for (const value of authored) {
    expect(value.replace(/пункт[а-яё]*\s+\d+/gi, '')).not.toMatch(/[0-9]/)
  }
})
