export interface FragmentSource {
  path: string
  start: string
  end: string | null
}

const PLAN = 'docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md'
const SPEC = 'docs/specs/2026-10-11_public-showcase.md'
const ROADMAP = 'docs/roadmaps/2026-10-11_1236_public-showcase.md'
const PLAN_3 = 'docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages'
const PLAN_4 = 'docs/plans/2026-10-11_1356_public-showcase-4-style-pipeline-scheme'
const PLAN_5 = 'docs/plans/2026-10-11_1425_public-showcase-5-why-device-limits-footer'
const FIX_4 = 'docs/plans/2026-10-11_1442_fix-showcase-4-links-aside-hero-h1'
const FIX_5 = 'docs/plans/2026-10-11_1453_fix-showcase-5-texts'

export const FRAGMENT_SOURCES = {
  roadmap: {
    path: 'docs/roadmaps/2026-10-11_1236_public-showcase.md',
    start: '### Пункт 3',
    end: '### Пункт 4',
  },
  plan: {
    path: PLAN,
    start: '### Step 4 — vite-base',
    end: '### Step 5 — stub-page',
  },
  implement: {
    path: PLAN,
    start: '- Проверка шага scaffold-vite-site',
    end: '- Code review (Codex)',
  },
  verifier: {
    path: 'docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-verify.md',
    start: '## Итог',
    end: '## Что требует внимания',
  },
  'code-review': {
    path: 'docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md',
    start: '| № |',
    end: '## Проверка после правок',
  },
  manual: {
    path: 'docs/manual/2026-10-11_1347_public-showcase-3-site-skeleton-pages.md',
    start: '### 4.2. Локальный preview',
    end: '### 4.3. Хук перед push',
  },
  'build-spec-part': {
    path: SPEC,
    start: '### Часть 2. Сайт',
    end: 'Технически:',
  },
  'build-spec-backlog': {
    path: SPEC,
    start: '- **Б3.',
    end: '- **Б4.',
  },
  'build-plan3-criteria': {
    path: `${PLAN_3}.md`,
    start: '## Критерии приёмки',
    end: '## Не делаем',
  },
  'build-plan3-notdo': {
    path: `${PLAN_3}.md`,
    start: '## Не делаем',
    end: '## Решения',
  },
  'build-plan4-criteria': {
    path: `${PLAN_4}.md`,
    start: '## Критерии приёмки',
    end: '- Страница грузит только',
  },
  'build-plan4-notdo': {
    path: `${PLAN_4}.md`,
    start: '## Не делаем',
    end: '## Решения',
  },
  'build-plan4-plugin': {
    path: `${PLAN_4}.md`,
    start: '  этот текст не показывался.',
    end: '- Порядок при /implement',
  },
  'build-plan4-partial': {
    path: `${PLAN_4}.md`,
    start: '- Первый verify — PARTIAL',
    end: '## Допущения',
  },
  'build-plan5-criteria': {
    path: `${PLAN_5}.md`,
    start: '## Критерии приёмки',
    end: '- На сайте нет слов',
  },
  'build-plan5-notdo': {
    path: `${PLAN_5}.md`,
    start: '## Не делаем',
    end: '## Решения',
  },
  'build-plan5-hh': {
    path: `${PLAN_5}.md`,
    start: '- Подвал «Автор»',
    end: '- «Зачем»',
  },
  'build-plan5-port': {
    path: `${PLAN_5}.md`,
    start: '- Порт приёмки',
    end: '## Допущения',
  },
  'build-fact-raw': {
    path: ROADMAP,
    start: '- [2026-10-11, пункт 4] Фрагменты документов',
    end: '- [2026-10-11, пункт 4] База ссылок',
  },
  'build-fact-published': {
    path: ROADMAP,
    start: '- [2026-10-11, пункт 3] Сайт опубликован',
    end: '- [2026-10-11, пункт 4] Фрагменты',
  },
  'build-roadmap-clean-env': {
    path: ROADMAP,
    start: '- Пункт 1 принят с DEFERRED',
    end: '- Пункт 3 принят со статусом',
  },
  'build-roadmap-deferred': {
    path: ROADMAP,
    start: '- Пункт 3 принят со статусом',
    end: '- Пункт 5 принят',
  },
  'build-verify1-clean-env': {
    path: 'docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot-verify.md',
    start: '| 5. Ручная проверка',
    end: '## Итог',
  },
  'build-review1-rejected': {
    path: 'docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot-review.md',
    start: '| 2 | `/code-review` не видит',
    end: '| 3 |',
  },
  'build-verify4-repeat': {
    path: `${PLAN_4}-verify.md`,
    start: 'Повторная проверка',
    end: '## Результат по шагам',
  },
  'build-verify4-result': {
    path: `${PLAN_4}-verify.md`,
    start: '## Итог',
    end: '## Что требует внимания',
  },
  'build-verify5-result': {
    path: `${PLAN_5}-verify.md`,
    start: '## Итог',
    end: '## Что требует внимания',
  },
  'build-verify5-deferred': {
    path: `${PLAN_5}-verify.md`,
    start: '| Тёмная тема, Network',
    end: '## Итог',
  },
  'build-review3-total': {
    path: `${PLAN_3}-review.md`,
    start: '## Итог',
    end: null,
  },
  'build-review3-table': {
    path: `${PLAN_3}-review.md`,
    start: '| № |',
    end: 'Ревьюер не смог',
  },
  'build-review3-recheck': {
    path: `${PLAN_3}-review.md`,
    start: '## Проверка после правок',
    end: '## Ждёт решения',
  },
  'build-review4-total': {
    path: `${PLAN_4}-review.md`,
    start: '## Итог',
    end: null,
  },
  'build-review5-total': {
    path: `${PLAN_5}-review.md`,
    start: '## Итог',
    end: null,
  },
  'build-fix4-problem': {
    path: `${FIX_4}.md`,
    start: '## Контекст',
    end: '## Причина',
  },
  'build-fix4-verify': {
    path: `${FIX_4}-verify.md`,
    start: '## Итог',
    end: '## Что требует внимания',
  },
  'build-fix4-review': {
    path: `${FIX_4}-review.md`,
    start: '## Итог',
    end: null,
  },
  'build-fix5-problem': {
    path: `${FIX_5}.md`,
    start: '## Контекст',
    end: '## Причина',
  },
  'build-fix5-verify': {
    path: `${FIX_5}-verify.md`,
    start: '## Итог',
    end: '## Что требует внимания',
  },
  'build-fix5-review': {
    path: `${FIX_5}-review.md`,
    start: '## Итог',
    end: null,
  },
  'build-manual3-access': {
    path: 'docs/manual/2026-10-11_1347_public-showcase-3-site-skeleton-pages.md',
    start: '### 4.5. Опубликованный сайт',
    end: '## 5. Матрица веток',
  },
  'build-manual4-dark': {
    path: 'docs/manual/2026-10-11_1421_public-showcase-4-style-pipeline-scheme.md',
    start: '### 4.3. Тёмная тема',
    end: '### 4.4.',
  },
} satisfies Record<string, FragmentSource>

export type FragmentName = keyof typeof FRAGMENT_SOURCES
