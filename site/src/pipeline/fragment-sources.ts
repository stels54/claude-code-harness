export interface FragmentSource {
  path: string
  start: string
  end: string
}

const PLAN = 'docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md'

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
} satisfies Record<string, FragmentSource>

export type FragmentName = keyof typeof FRAGMENT_SOURCES
