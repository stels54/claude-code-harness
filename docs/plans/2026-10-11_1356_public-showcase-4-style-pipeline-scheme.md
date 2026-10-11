# Plan: Визуальный стиль и кликабельная схема конвейера

## Контекст
Роадмап: docs/roadmaps/2026-10-11_1236_public-showcase.md, пункт 4

Пункт 3 положил в `site/` каркас Vite + React + TypeScript со страницей-заглушкой
(`site/src/App.tsx`), сборкой под `base: '/claude-code-harness/'` и публикацией
через GitHub Actions. Теперь нужен самобытный визуальный стиль по ориентиру
`docs/linkedInwallpaper.png` (ретро-футуристичная комната в духе Мёбиуса: тёплые
закатные оранжево-розовые и охристые тона, приглушённый бирюзовый и фиолетовый
акцент, тонкая линейная графика ручной иллюстрации) и раздел «Конвейер» —
кликабельная схема: шаг раскрывается в описание, вход, выход, место решения
человека, ссылку на файл команды в `harness/` и фрагмент реального документа
прогона, импортированный из файла при сборке. Описания шагов берутся из «Фактов»
роадмапа (записи пункта 2). Остальные разделы сайта («Зачем», «Устройство»,
«Ограничения», подвал) — пункт 5.

## Окружение
- Node.js 22 и npm 10, зависимости `site/` уже установлены (`site/package-lock.json`).
- Сеть до registry.npmjs.org только на шаге `local-fonts` (`npm pack` пакетов
  шрифтов во временный каталог; в зависимости проекта они не попадают).
- Chrome-расширение (mcp__claude-in-chrome__*) для шага `browser-acceptance` на
  `npm --prefix site run preview` (адрес `http://localhost:4173/claude-code-harness/`).
  Окно расширения не сужается до 360px (минимум около 606px, «Факты» пункта 3):
  ширину 360px проверять в iframe шириной 360px, вставленном на страницу
  через `javascript_tool`. Нет расширения — шаг ⏸️ DEFERRED «нужен браузер».
- Список запрещённых строк `~/.config/harness-publish/denylist.txt` для
  `scripts/check-leaks.sh` (вне git; строки не выводятся и не записываются).

## Шаги

### Step 1 — tsconfig-src-tests
- **Цель**: разрешить тестам в `site/src` пользоваться `node:fs`, а модулям
  данных — импортом `?raw`, не подмешивая типы Node в браузерный код.
- **Файл**: `site/tsconfig.app.json`, `site/tsconfig.node.json`
- **Изменение**: в `tsconfig.app.json` добавить `"exclude": ["src/**/*.test.ts"]`.
  В `tsconfig.node.json` — `types` → `["node", "vite/client"]`, в `include`
  добавить `"src/**/*.test.ts"`. Импортируемые тестами модули `src/**/*.ts`
  проверяются под этим конфигом транзитивно (lib `ES2023` без DOM), поэтому
  модули данных шагов 3, 5, 7 не используют DOM-API.
- **Референс**: `site/tsconfig.app.json:7,25` (`types: ["vite/client"]`,
  `include: ["src"]`); `site/tsconfig.node.json:6,22` (`types: ["node"]`,
  `include`); «Факты» пункта 3: тест-файлы вне `src/` добавляются в `include`
  `tsconfig.node.json`. Прототип при планировании (откачен): тест в
  `site/src` с `node:fs` и импортом модуля с `?raw` из `docs/` — без правки
  `tsc -b` падает TS2591 «Cannot find name 'node:fs'», с правкой typecheck и
  lint проходят, vitest зелёный.
- **Риск**: тест-файл с JSX (`*.test.tsx`) под этот конфиг не попадёт — в
  плане таких нет.
- **Проверка**: `npm --prefix site run typecheck` → exit 0;
  `npm --prefix site test` → прежний тест зелёный.
- **dependsOn**: —

### Step 2 — test-repo-links
- **Цель**: закрепить контракт единой базы ссылок на репозиторий.
- **Файл**: `site/src/repo.test.ts`
- **Изменение**: тест импортирует `REPO_URL`, `REPO_REF`, `repoFileUrl` из
  `./repo.ts`. Контракт:
  - `REPO_URL === 'https://github.com/stels54/claude-code-harness'`,
    `REPO_REF === 'main'`;
  - `repoFileUrl('harness/commands/plan.md')` →
    `'https://github.com/stels54/claude-code-harness/blob/main/harness/commands/plan.md'`;
  - `repoFileUrl('docs/specs/2026-10-11_public-showcase.md', { from: 3, to: 7 })`
    → тот же префикс `…/blob/main/docs/specs/2026-10-11_public-showcase.md#L3-L7`;
  - `repoFileUrl('README.md', { from: 5, to: 5 })` → `…/blob/main/README.md#L5`.
- **Референс**: `site/vite.config.test.ts:1-6` (стиль теста vitest).
- **Риск**: `scripts/check-links.sh:63` проверяет литеральные URL репозитория
  и в `*.ts`, включая тесты, — в ожидаемых значениях только существующие
  файлы (`harness/commands/plan.md`, `docs/specs/…`, `README.md`).
- **Проверка**: red: `npm --prefix site test -- src/repo.test.ts` — «Failed to
  resolve import "./repo.ts"» → green после `repo-links`.
- **dependsOn**: tsconfig-src-tests

### Step 3 — repo-links
- **Цель**: одна точка, где задана база ссылок на файлы репозитория; пункт 7
  поменяет `main` на тег в одном месте.
- **Файл**: `site/src/repo.ts`
- **Изменение**: модуль экспортирует `REPO_URL`, `REPO_REF = 'main'` и
  `repoFileUrl(path, lines?)` по контракту шага `test-repo-links`. Строка `main`
  как ref встречается в `site/src` только здесь.
- **Референс**: `site/src/App.tsx:3,18` (сейчас `repoUrl` и ссылка на README
  собираются прямо в компоненте — переключение в шаге `app-layout`).
- **Риск**: `scripts/check-links.sh` проверяет только литеральные URL
  («Факты» пункта 3) — собранные `repoFileUrl` ссылки он не видит; их пути
  проверяет тест шага `test-pipeline-steps` (существование файлов).
- **Проверка**: тест шага `test-repo-links` зелёный (`npm --prefix site test`
  → все тесты зелёные: тест-шаги следующих пар ещё не начаты);
  `grep -rn "'main'" site/src --include='*.ts' --include='*.tsx' | grep -v
  '\.test\.ts'` → одна строка в `site/src/repo.ts`.
- **dependsOn**: test-repo-links

### Step 4 — test-fragment-extract
- **Цель**: закрепить контракт вырезания фрагмента документа по маркерам.
- **Файл**: `site/src/pipeline/fragment.test.ts`
- **Изменение**: тест импортирует `extractFragment(raw, start, end)` из
  `./fragment.ts`. Контракт: строки нумеруются с 1; начало — первая строка,
  которая начинается с `start` (включительно); конец — первая строка ПОСЛЕ
  начала, которая начинается с `end` (не включительно); `end === null` — до
  конца файла; пустые строки в хвосте фрагмента отбрасываются; результат
  `{ text, fromLine, toLine }`. Случаи:
  1. `raw = 'a\n## X\nl1\nl2\n\n## Y\nz'`, `start '## X'`, `end '## Y'` →
     `{ text: '## X\nl1\nl2', fromLine: 2, toLine: 4 }`;
  2. тот же `raw`, `start '## Y'`, `end null` → `{ text: '## Y\nz', fromLine: 6, toLine: 7 }`;
  3. маркер конца встречается и ДО начала: `raw = '## Y\n## X\nl\n## Y'`,
     `start '## X'`, `end '## Y'` → `{ text: '## X\nl', fromLine: 2, toLine: 3 }`;
  4. `start '## Q'` отсутствует → бросает ошибку, в сообщении есть `## Q`;
  5. `raw = '## X\nl'`, `end '## Y'` после начала нет → бросает ошибку, в
     сообщении есть `## Y`.
- **Референс**: `site/vite.config.test.ts:1-6`.
- **Риск**: —
- **Проверка**: red: `npm --prefix site test -- src/pipeline/fragment.test.ts`
  — «Failed to resolve import "./fragment.ts"» → green после `fragment-extract`.
- **dependsOn**: repo-links

### Step 5 — fragment-extract
- **Цель**: вырезать фрагмент документа по маркерам; несовпадение маркеров —
  ошибка, а не пустое место. Функцию вызывает плагин сборки (шаг
  `fragments-plugin`), в браузер она не попадает.
- **Файл**: `site/src/pipeline/fragment.ts`
- **Изменение**: функция `extractFragment` по контракту шага
  `test-fragment-extract`; без DOM-API.
- **Референс**: — (аналога в коде нет)
- **Риск**: маркер, совпадающий с несколькими строками, берёт первую —
  маркеры шага `pipeline-steps-data` подобраны уникальными (проверено `grep -n`).
- **Проверка**: тест шага `test-fragment-extract` зелёный; `npm --prefix site
  test` → все тесты зелёные.
- **dependsOn**: test-fragment-extract

### Step 6 — test-fragments-plugin
- **Цель**: закрепить контракт вырезания фрагментов при сборке: в бандл
  попадают только фрагменты, пропавший маркер валит сборку.
- **Файл**: `site/fragments-plugin.test.ts`, `site/tsconfig.node.json`
  (`include` += `fragments-plugin.test.ts`, `fragments-plugin.ts`)
- **Изменение**: тест импортирует из `./fragments-plugin.ts` функции
  `loadFragments(root, sources)`, `resolveFragmentsId(id)` и
  `fragmentsModuleCode(root, sources)`; фикстура — временный каталог
  (`mkdtempSync` в `os.tmpdir()`) с файлом `doc.md` =
  `'a\n## X\nl1\n\n## Y\nz'`. Контракт:
  1. `loadFragments(tmp, { one: { path: 'doc.md', start: '## X', end: '## Y' } })`
     → `{ one: { path: 'doc.md', text: '## X\nl1', fromLine: 2, toLine: 3 } }`;
  2. маркер начала `'## Q'` в источнике → бросает ошибку, в сообщении есть
     `doc.md` и `## Q` (по ней видно, какой документ сломан);
  3. несуществующий `path` → бросает ошибку, в сообщении есть путь;
  4. `resolveFragmentsId('virtual:pipeline-fragments')` →
     `'\0virtual:pipeline-fragments'`, `resolveFragmentsId('./x.ts')` → `null`;
  5. `fragmentsModuleCode(tmp, <источник из п.1>)` — строка, которая
     начинается с `export default ` и после этого префикса разбирается
     `JSON.parse` в результат п.1.
- **Референс**: `site/vite.config.test.ts:1-6` (тест вне `src/`, подключён в
  `site/tsconfig.node.json:22`); «Факты» пункта 3 — тест-файлы вне `src/`
  добавляются в `include` `tsconfig.node.json`.
- **Риск**: хуки плагина Vite типизированы как `ObjectHook` — тест вызывает
  чистые функции, а не хуки; связку с Vite проверяет негативная сборка шага
  `fragments-plugin`.
- **Проверка**: red: `npm --prefix site test -- fragments-plugin.test.ts` —
  «Cannot find module './fragments-plugin.ts'» → green после
  `fragments-plugin`.
- **dependsOn**: fragment-extract

### Step 7 — fragments-plugin
- **Цель**: вырезать фрагменты документов в `vite build` (и dev-сервере), а
  не в браузере: в бандл идут только фрагменты, пропавший маркер — ошибка
  сборки.
- **Файл**: `site/fragments-plugin.ts`, `site/vite.config.ts`,
  `site/src/pipeline/fragment-sources.ts`,
  `site/src/pipeline/pipeline-fragments.d.ts`, `site/tsconfig.node.json`
  (`include` += `src/pipeline/pipeline-fragments.d.ts`)
- **Изменение**: `fragment-sources.ts` — объект `FRAGMENT_SOURCES`
  (имя → `{ path, start, end }`, путь от корня репозитория) с маркерами из
  таблицы шага `pipeline-steps-data`, без DOM-API. `fragments-plugin.ts` —
  функции по контракту шага `test-fragments-plugin` (чтение `readFileSync`,
  вырезание `extractFragment` из `src/pipeline/fragment.ts`, ошибка с путём
  файла) и плагин `pipelineFragments(root, sources)`: `resolveId` через
  `resolveFragmentsId`, `load` для `\0virtual:pipeline-fragments` отдаёт
  `fragmentsModuleCode` и вызывает `this.addWatchFile` по каждому документу.
  `vite.config.ts` — плагин в `plugins` с корнем репозитория
  (`fileURLToPath(new URL('..', import.meta.url))`) и `FRAGMENT_SOURCES`.
  `pipeline-fragments.d.ts` — `declare module 'virtual:pipeline-fragments'` с
  типом `Record<FragmentName, Fragment & { path: string }>`. Новых
  зависимостей нет.
- **Референс**: `site/vite.config.ts:1-8`; `site/src/pipeline/fragment.ts`
  (шаг `fragment-extract`).
- **Риск**: `site/vite.config.test.ts:2` импортирует конфиг — импорт плагина
  не должен читать файлы на этапе импорта (только в `load`); иначе тест
  `base` начнёт зависеть от документов.
- **Проверка**: тест шага `test-fragments-plugin` зелёный; `npm --prefix site
  test` → все зелёные; `npm --prefix site run typecheck && npm --prefix site
  run lint` → exit 0; негатив: во временной правке `fragment-sources.ts`
  маркер `### Пункт 3` → `### Пункт 33` → `npm --prefix site run build`
  завершается ошибкой с этим маркером и путём роадмапа; правка откатывается,
  `build` → exit 0.
- **dependsOn**: test-fragments-plugin

### Step 8 — test-pipeline-steps
- **Цель**: тест данных схемы из критерия роадмапа: у каждого шага есть
  описание, вход, выход, путь к файлу команды, и файл существует в `harness/`;
  фрагменты взяты из файлов, а не вписаны руками.
- **Файл**: `site/src/pipeline/steps.test.ts`
- **Изменение**: тест импортирует `PIPELINE_STEPS` из `./steps.ts`; корень
  репозитория — `fileURLToPath(new URL('../../../', import.meta.url))`.
  Проверки:
  1. порядок id шагов `kind: 'chain'` строго `['roadmap', 'plan', 'implement',
     'verifier', 'code-review', 'manual']`, шагов `kind: 'aside'` —
     `['verify', 'plan-fix', 'fix-tests']`, других нет;
  2. у каждого шага непустые после `trim()` `title`, `summary`, `input`,
     `output`, `human`;
  3. у каждого шага `file` соответствует `^harness/(commands|agents)/[a-z-]+\.md$`
     и `existsSync(<корень>/<file>)` истинно;
  4. `optional` истинно только у `roadmap`;
  5. у каждого шага `chain` есть `fragment`; у `aside` — нет;
  6. для каждого фрагмента `existsSync(<корень>/<fragment.path>)` и
     `fragment.text` совпадает со строками `fromLine..toLine` этого файла,
     прочитанного `readFileSync` (доказывает импорт из файла), `text` непуст;
  7. ни одно строковое поле шагов не содержит `SDD` и `Spec-Driven`.
- **Референс**: `site/vite.config.test.ts:1-6`; критерий пункта 4 роадмапа
  («Результат»).
- **Риск**: красный тест после правки документа-источника (маркер пропал) —
  это и есть сигнал; правится маркер в `steps.ts`, а не документ.
- **Проверка**: red: `npm --prefix site test -- src/pipeline/steps.test.ts` —
  «Failed to resolve import "./steps.ts"» → green после `pipeline-steps-data`.
- **dependsOn**: fragments-plugin

### Step 9 — pipeline-steps-data
- **Цель**: данные схемы конвейера в одном модуле, описания — по «Фактам»
  пункта 2, фрагменты — из модуля `virtual:pipeline-fragments`, который
  собирает плагин шага `fragments-plugin`.
- **Файл**: `site/src/pipeline/steps.ts`
- **Изменение**: тип `PipelineStep` (`id`, `kind: 'chain' | 'aside'`,
  `title` — имя команды как в харнесе, `optional`, `summary`, `input`,
  `output`, `human`, `model?`, `file`, `fragment?: { path, label, text,
  fromLine, toLine }`) и массив `PIPELINE_STEPS`. Тексты `input`, `output`,
  `human`, `model` — сокращённый пересказ записи «Фактов» пункта 2 для этой
  команды без добавлений сверх записи; `summary` — поле `description`
  frontmatter файла команды или первая фраза записи «Фактов». Ревью другой
  моделью (Codex) упоминается в `/plan` и `/code-review` по записи «Фактов»
  о ревью.

  Маркеры фрагментов (они же — содержимое `FRAGMENT_SOURCES` шага
  `fragments-plugin`):

  | id | title | file | fragment: путь · начало · конец |
  |---|---|---|---|
  | roadmap | `/roadmap` (опционально) | `harness/commands/roadmap.md` | `docs/roadmaps/2026-10-11_1236_public-showcase.md` · `### Пункт 3` · `### Пункт 4` |
  | plan | `/plan` | `harness/commands/plan.md` | `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md` · `### Step 4 — vite-base` · `### Step 5 — stub-page` |
  | implement | `/implement` | `harness/commands/implement.md` | тот же план · `- Проверка шага scaffold-vite-site` · `- Code review (Codex)` |
  | verifier | агент `verifier` | `harness/agents/verifier.md` | `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-verify.md` · `## Итог` · `## Что требует внимания` |
  | code-review | `/code-review` | `harness/commands/code-review.md` | `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md` · `\| № \|` · `## Проверка после правок` |
  | manual | `/manual` | `harness/commands/manual.md` | `docs/manual/2026-10-11_1347_public-showcase-3-site-skeleton-pages.md` · `### 4.2. Локальный preview` · `### 4.3. Хук перед push` |
  | verify | `/verify` | `harness/commands/verify.md` | — |
  | plan-fix | `/plan-fix` | `harness/commands/plan-fix.md` | — |
  | fix-tests | `/fix-tests` | `harness/commands/fix-tests.md` | — |

  Фрагменты: `import fragments from 'virtual:pipeline-fragments'`, у шага —
  `{ ...fragments.<id>, label }`; импортов `?raw` и вызовов `extractFragment`
  в `site/src` нет. `label` — короткая подпись, что это за документ (например, «шаг плана
  пункта 3»). Для `implement` подпись поясняет, что это отклонение,
  согласованное при реализации и записанное в «Решения» плана.
- **Референс**: «Факты» роадмапа, записи `[2026-10-11, пункт 2]`
  (`docs/roadmaps/2026-10-11_1236_public-showcase.md:131-207`); frontmatter
  `harness/commands/*.md:2`, `harness/agents/verifier.md:3`; маркеры
  проверены `grep -n` при планировании: каждый встречается в своём файле один
  раз как начало строки (план 3: строки 95, 108, 451, 455; verify: 73, 78;
  review: 6 `| № |`, 15; manual: 87, 110; роадмап: 49, 66).
- **Риск**: `docs/roadmaps/…` меняется при каждом синке роадмапа — блок
  пункта 3 стабилен, маркер `### Пункт 4` — заголовок соседнего пункта;
  если пункт 4 будет разбит на подпункты, заголовок останется (подпункты
  идут внутри). Фрагмент для `/roadmap` берётся из `docs/roadmaps/`, а не из
  `docs/plans/` — см. «Допущения».
- **Проверка**: тест шага `test-pipeline-steps` зелёный (`npm --prefix site
  test` → все тесты зелёные); `npm --prefix site run typecheck && npm --prefix
  site run lint` → exit 0; сверка вручную
  (verifier): каждое `input`/`output`/`human` не содержит утверждений,
  которых нет в записи «Фактов» для этой команды;
  `grep -rn -E '\?raw|extractFragment' site/src --include='*.ts' --include='*.tsx'
  | grep -v -E '\.test\.ts|pipeline/fragment\.ts'` → пусто.
- **dependsOn**: test-pipeline-steps, repo-links, fragments-plugin

### Step 10 — local-fonts
- **Цель**: локальные шрифты с лицензией OFL, без запросов к сторонним доменам.
- **Файл**: `site/public/fonts/*.woff2`, `site/public/fonts/OFL-*.txt`
- **Изменение**: во временном каталоге (scratchpad) `npm pack
  @fontsource-variable/unbounded@5.3.0 @fontsource-variable/literata@5.3.0
  @fontsource-variable/jetbrains-mono@5.3.0`, распаковать; в
  `site/public/fonts/` скопировать по два файла `*-cyrillic-wght-normal.woff2`
  и `*-latin-wght-normal.woff2` каждого семейства (Unbounded — заголовки,
  Literata — текст, JetBrains Mono — фрагменты документов) и `LICENSE` пакета
  как `OFL-unbounded.txt`, `OFL-literata.txt`, `OFL-jetbrains-mono.txt`.
  Пакеты в `package.json` не добавляются.
- **Референс**: пробный `npm pack` при планировании: все три `LICENSE`
  начинаются с копирайта проекта и «This Font Software is licensed under the
  SIL Open Font License, Version 1.1»; размеры woff2 — Unbounded 31+51 КБ,
  Literata 28+52 КБ, JetBrains Mono 12+40 КБ. Прототип: `url('/fonts/…')` в
  CSS Vite переписывает в `/claude-code-harness/fonts/…`.
- **Риск**: `scripts/check-leaks.sh` обходит и текст лицензий — в них нет
  ключей и путей домашней папки; проверяется прогоном.
- **Проверка**: `ls site/public/fonts/*.woff2 | wc -l` → 6;
  `grep -l 'SIL Open Font License' site/public/fonts/OFL-*.txt | wc -l` → 3;
  `scripts/check-leaks.sh` → 0 совпадений.
- **dependsOn**: —

### Step 11 — theme-tokens
- **Цель**: палитра, типографика и базовые стили сайта по ориентиру.
- **Файл**: `site/src/index.css`
- **Изменение**: заменить стили заглушки: `@font-face` трёх семейств по
  шрифтам шага `local-fonts` (`font-display: swap`, `unicode-range`
  кириллицы и латиницы из `wght.css` пакетов fontsource); токены на `:root` —
  тёплый бумажный фон, тёмные «чернила» для текста и линий, акценты: закатный
  оранжевый, розовый, охра, приглушённый бирюзовый, фиолетовый; тёмная тема
  под `prefers-color-scheme: dark` — «сумеречная комната» (тёмный
  фиолетово-коричневый фон, кремовый текст, те же акценты). Типографика:
  заголовки — Unbounded, текст — Literata, код — JetBrains Mono, фолбэк —
  системные стеки. Глобальный видимый фокус `:focus-visible` (контурная
  обводка акцентом с отступом). `box-sizing: border-box`, `body { margin: 0 }`,
  `overflow-wrap: anywhere` для ссылок. Никаких `@import` и `url()` на внешние
  адреса.
- **Референс**: `site/src/index.css:1-17` (текущие токены заглушки);
  `docs/linkedInwallpaper.png` — только ориентир палитры, в сборку не попадает.
- **Риск**: низкий контраст тёплых тонов — основной текст на фоне ≥ 4.5:1 в
  обеих темах, проверяется расчётом.
- **Проверка**: `npm --prefix site run build` → exit 0; все `url(` в
  `site/dist/assets/*.css` начинаются с `/claude-code-harness/fonts/`;
  контраст пар «текст/фон» обеих тем по WCAG (однострочный `node -e` по
  hex-токенам) ≥ 4.5.
- **dependsOn**: local-fonts, pipeline-steps-data (`build` запускает `tsc -b`
  и по тест-файлам: до зелёной пары `test-pipeline-steps` → `pipeline-steps-data`
  он красный)

### Step 12 — hero-line-art
- **Цель**: линейная графика в духе ориентира без растровых картинок.
- **Файл**: `site/src/components/HeroArt.tsx`
- **Изменение**: компонент с inline SVG (`viewBox`, ширина 100%,
  `aria-hidden="true"`, `focusable="false"`): арочное окно, за ним
  силуэты шпилей ретро-футуристичного города, планета с кольцом, линия
  горизонта; только тонкие штрихи (`stroke` 1–1.5, `fill="none"` или
  полупрозрачные заливки из токенов шага `theme-tokens` через
  `currentColor`/CSS-переменные). Без копирования сюжета картинки (стол,
  кот, ковёр не рисуются).
- **Референс**: — (компонентов в `site/src` нет, кроме `App.tsx`)
- **Риск**: тяжёлый SVG раздувает бандл — держать в пределах ~10 КБ исходника.
- **Проверка**: `npm --prefix site run typecheck && npm --prefix site run
  lint` → exit 0; `wc -c site/src/components/HeroArt.tsx` ≤ 12000;
  визуально — шаг `browser-acceptance`.
- **dependsOn**: theme-tokens

### Step 13 — pipeline-scheme
- **Цель**: кликабельная схема конвейера, доступная с клавиатуры и на 360px.
- **Файл**: `site/src/components/PipelineScheme.tsx`,
  `site/src/components/PipelineScheme.css`
- **Изменение**: компонент рендерит `PIPELINE_STEPS`: цепочка `chain` —
  упорядоченный список «станций», соединённых тонкой линией (вертикально на
  узком экране, сеткой на широком), `/roadmap` помечен «опционально»; группа
  «Вне цепочки» — шаги `aside`. Каждый шаг — `<button type="button">` с
  `aria-expanded` и `aria-controls` на панель раскрытия (Enter/Space работают
  нативно); раскрыт не более одного шага, повторное нажатие сворачивает. Панель:
  «Что делает» (`summary`), «Вход», «Выход», «Решение за человеком», «Модель»
  (если задана), ссылка «Файл команды» → `repoFileUrl(file)`; для шагов с
  фрагментом — подпись `label`, ссылка на документ → `repoFileUrl(path,
  { from: fromLine, to: toLine })` и `<pre>` с `text` (`white-space:
  pre-wrap`, `overflow-wrap: anywhere` — длинные строки переносятся, страница
  не прокручивается по горизонтали); для шагов без фрагмента — строка
  «Документа этой команды в репозитории нет». Внешние ссылки — обычные `<a>`
  с `rel="noreferrer"`. Видимый фокус — из `theme-tokens`. Цвета — только
  токены шага `theme-tokens`.
- **Референс**: `site/src/pipeline/steps.ts` (шаг `pipeline-steps-data`),
  `site/src/repo.ts` (шаг `repo-links`).
- **Риск**: таблица в фрагменте `/code-review` — длинные строки markdown;
  `pre-wrap` переносит их, проверяется в iframe 360px при раскрытом
  `/code-review`.
- **Проверка**: `npm --prefix site run typecheck && npm --prefix site run
  lint && npm --prefix site test` → exit 0; поведение — шаг `browser-acceptance`.
- **dependsOn**: pipeline-steps-data, theme-tokens

### Step 14 — app-layout
- **Цель**: собрать страницу: шапка с линейной графикой и раздел «Конвейер».
- **Файл**: `site/src/App.tsx`, `site/src/App.css`
- **Изменение**: заменить заглушку. Шапка: заголовок «Конвейер разработки с
  ИИ-агентами», подзаголовок «план → реализация → изолированная проверка →
  ревью другой моделью», `HeroArt`, ссылки на репозиторий (`REPO_URL`) и
  README (`repoFileUrl('README.md')`), пометка, что остальные разделы сайта в
  работе. Раздел `<section id="pipeline">` с заголовком «Конвейер», одной
  вводной фразой (шаг раскрывается по нажатию) и `PipelineScheme`. Локальный
  `repoUrl` и шаблонная строка ссылки на README удаляются. Без слов «SDD» и
  «Spec-Driven Development», без цифр статистики. `App.css` — раскладка
  (максимальная ширина контента, отступы, без горизонтальной прокрутки от 360px).
- **Референс**: `site/src/App.tsx:1-25`, `site/src/App.css:1-16` (заглушка).
- **Риск**: `id="pipeline"` без ссылки на него — `scripts/check-links.sh`
  проверяет только `href="#…"`, лишний `id` не нарушение.
- **Проверка**: `npm --prefix site run typecheck && npm --prefix site run
  lint && npm --prefix site test && npm --prefix site run build` → exit 0;
  `grep -rn -E 'SDD|Spec-Driven|repoUrl' site/src --exclude='*.test.ts'` →
  пусто (тест шага `test-pipeline-steps` содержит эти строки в проверках);
  `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → 0 в каждом файле;
  документов целиком в бандле нет: `grep -c 'Пункт 5 — Разделы' site/dist/assets/*.js`
  → 0 (заголовок соседнего пункта роадмапа вне фрагмента);
  `scripts/check-links.sh` → 0 нарушений.
- **dependsOn**: hero-line-art, pipeline-scheme, repo-links

### Step 15 — static-external-check
- **Цель**: подтвердить по статике сборки, что страница не обращается к
  сторонним доменам и не тащит картинку-ориентир.
- **Файл**: — (проверка, правок нет)
- **Изменение**: `npm --prefix site run build`, затем проверки по `site/dist`.
- **Референс**: проверка шага `stub-page` плана
  `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md`
  (строки 136-143) и «Факты» пункта 3 о допустимых строках в JS.
- **Риск**: строка URL в JS не равна запросу — каждое вхождение
  классифицируется: адреса внутри фрагментов документов — текст цитаты.
- **Проверка**: `grep -rhoE '(src|href)="[^"]*"|url\([^)]*\)' site/dist
  --include='*.html' --include='*.css' | grep -E 'https?://|//'` → пусто;
  `grep -rhoE 'https?://[^"'"'"' )]+' site/dist --include='*.js' | sort -u` →
  каждый адрес либо из допустимых строк без запросов (адреса репозитория
  `github.com/stels54/claude-code-harness…`, XML-namespace `www.w3.org`,
  `react.dev/errors`), либо встречается дословно в одном из шести
  фрагментов (шаг `pipeline-steps-data`; например,
  `http://localhost:4173/claude-code-harness/` из мануала пункта 3 — текст
  цитаты, не запрос). Запросы как таковые проверяет шаг `browser-acceptance`; `find site/dist -name
  '*.png' -o -name '*wallpaper*'` → пусто; `du -sh site/dist` ≤ 1 МБ.
- **dependsOn**: app-layout

### Step 16 — browser-acceptance
- **Цель**: принять стиль и схему в браузере: клавиатура, 360px, сеть.
- **Файл**: — (проверка, правок нет)
- **Изменение**: `npm --prefix site run build`, `npm --prefix site run preview
  -- --port 4173 --strictPort` в фоне; открыть
  `http://localhost:4173/claude-code-harness/` через Chrome-расширение.
- **Референс**: `harness/agents/verifier.md:30-35` (браузерная приёмка);
  приём с iframe — `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-verify.md`
  (раздел «Браузерная приёмка»).
- **Риск**: окно расширения не сужается до 360px — проверка ширины только в
  iframe; занят порт 4173 — `--strictPort` упадёт явно, взять другой.
- **Проверка**:
  1. сетевые запросы страницы (`read_network_requests`) — только
     `localhost:4173`, среди них шрифты `/claude-code-harness/fonts/*.woff2`;
     ошибок в консоли нет;
  2. клавиатура: Tab доходит до кнопки шага, у сфокусированной кнопки видна
     обводка (`getComputedStyle(document.activeElement).outlineStyle !==
     'none'` и скриншот); Enter раскрывает шаг (`aria-expanded="true"`, панель
     с описанием, входом, выходом, решением человека, ссылкой на файл
     команды видна), Space сворачивает; раскрытие другого шага сворачивает
     предыдущий;
  3. ширина 360px: `javascript_tool` вставляет на страницу
     `<iframe src="/claude-code-harness/" width="360" height="800">`; внутри
     iframe `documentElement.scrollWidth <= innerWidth` в исходном состоянии
     и после раскрытия (клик по кнопке внутри iframe) шагов `code-review` и
     `plan` — самых длинных фрагментов; скриншот iframe;
  4. ссылки «Файл команды» и «документ» раскрытого шага ведут на
     `https://github.com/stels54/claude-code-harness/blob/main/…`, у
     документа — с `#L<from>-L<to>`;
  5. визуально (скриншот на широком окне и в iframe): тёплая палитра и
     линейная графика по ориентиру, без растровых картинок; обе темы —
     переключение `prefers-color-scheme` эмуляцией недоступно → тёмная тема
     проверяется человеком по мануалу.
  Без Chrome-расширения — ⏸️ DEFERRED «нужен браузер», шаг
  `static-external-check` остаётся.
- **dependsOn**: static-external-check

## Граф зависимостей
```
tsconfig-src-tests → test-repo-links → repo-links → test-fragment-extract
  → fragment-extract → test-fragments-plugin → fragments-plugin
  → test-pipeline-steps → pipeline-steps-data
local-fonts, pipeline-steps-data → theme-tokens → hero-line-art
pipeline-steps-data, theme-tokens → pipeline-scheme
hero-line-art, pipeline-scheme, repo-links → app-layout → static-external-check → browser-acceptance
```

## Параллельные группы
- Пары тест → product идут подряд: следующий тест-шаг начинается после
  зелёного product-шага предыдущей пары, иначе общий `npm test` и `tsc -b`
  (он типизирует и тест-файлы) красные из-за чужого red.
- Группа A (можно одновременно с парами тестов): local-fonts
- Группа B: hero-line-art, pipeline-scheme (после theme-tokens и pipeline-steps-data)

## Финальный проход
- static-external-check, browser-acceptance; затем полный набор проверок из
  корневого `CLAUDE.md`: typecheck, lint, test, build, `scripts/check-leaks.sh`,
  `scripts/check-harness-refs.sh`, `scripts/check-links.sh`.

## Критерии приёмки
- Тест данных схемы проходит: у каждого из девяти шагов есть описание, вход,
  выход и путь к файлу команды, файл существует в `harness/`; фрагменты
  совпадают со строками исходных файлов (`npm --prefix site test`).
- На странице раздел «Конвейер»: шаги цепочки `/roadmap` (опционально) →
  `/plan` → `/implement` → `verifier` → `/code-review` → `/manual` и вне
  цепочки `/verify`, `/plan-fix`, `/fix-tests`; шаг раскрывается мышью и с
  клавиатуры (Enter/Space) с видимым фокусом и показывает описание, вход,
  выход, решение человека, ссылку на файл команды и (для цепочки) фрагмент
  реального документа со ссылкой на строки.
- На ширине 360px нет горизонтальной прокрутки, в том числе с раскрытым
  шагом с самым длинным фрагментом.
- Страница грузит только ресурсы своего адреса (шрифты локальные), картинки-
  ориентира в сборке нет; на сайте нет «SDD»/«Spec-Driven Development» и
  цифр статистики.
- Описания шагов совпадают с «Фактами» пункта 2; typecheck, lint, test,
  build и три скрипта `scripts/` проходят.

## Не делаем
- Разделы «Зачем», «Устройство», «Ограничения», подвал — пункт 5; «Как
  собран этот сайт» — пункт 6; перевод ссылок на тег — пункт 7 (меняется
  только `REPO_REF` в `site/src/repo.ts`).
- Картинку `docs/linkedInwallpaper.png` в сайт не кладём и не копируем её
  сюжет; растровых иллюстраций нет.
- Переключатель темы на странице — тема только по `prefers-color-scheme`.
- Подсветку синтаксиса markdown во фрагментах — показывается исходный текст.
- Анимации раскрытия сверх CSS-перехода; маршрутизацию и отдельные страницы
  шагов; глубокие ссылки на раскрытый шаг.
- Правку `scripts/check-links.sh` под URL, собранные функцией: их пути
  проверяет тест данных схемы.
- Компонентные тесты (jsdom, testing-library) — новых инструментов не
  заводим, поведение схемы проверяется в браузере.
- Фрагменты для `/verify`, `/plan-fix`, `/fix-tests`: их документов в
  репозитории нет, сайт так и пишет.

## Решения
- Дизайн-ориентир → `docs/linkedInwallpaper.png`: ретро-футуристичная комната
  в духе Мёбиуса, тёплые закатные оранжево-розовые и охристые тона,
  приглушённый бирюзовый и фиолетовый акцент, тонкая детальная линейная
  графика, ощущение ручной иллюстрации. Сайт берёт палитру, настроение и
  линейную графику, а не копирует картинку; саму картинку на сайт не класть.
  Не шаблон «портфолио разработчика».
- Шрифты → только локальные файлы с лицензией OFL в репозитории
  (`site/public/fonts/` с файлом лицензии) или системный стек; запросов к
  сторонним доменам нет; проверка внешних доменов — по статике сборки.
- Состав схемы → по «Фактам» пункта 2: `/roadmap` (опционально), `/plan`,
  `/implement`, агент `verifier`, `/code-review`, `/manual`; вне цепочки
  `/verify`, `/plan-fix`, `/fix-tests`.
- Раскрытие шага → описание, вход, выход, где решение за человеком, ссылка на
  файл команды в `harness/` (GitHub, ветка `main`; база ссылок — одна
  константа, пункт 7 меняет её в одном месте), фрагмент реального документа
  этого репозитория (импорт `?raw` при сборке, диапазон строк по маркерам, не
  копия руками).
- Тест данных схемы → vitest: для каждого шага наличие описания, входа,
  выхода, пути к файлу команды и существование файла в `harness/`.
- Доступность → шаги — кнопки, раскрытие по Enter/Space, видимый фокус; на
  360px без горизонтальной прокрутки.
- Тексты → без «Spec-Driven Development» и «SDD», без цифр статистики, на
  русском.
- Браузерная приёмка → Chrome-расширение на локальном `preview`; ширина 360px
  — в iframe шириной 360px (окно расширения не сужается).
- Новых инструментов сверх vitest/eslint/tsc не заводить.
- Отклонение при /implement, шаг `app-layout`: проверка `grep -c -E
  'SDD|Spec-Driven' site/dist/assets/*.js` дала 1 вместо 0 — импорт `?raw`
  клал документы-источники в JS-бандл целиком (332 КБ), включая цель
  пункта 5 роадмапа со словами «Spec-Driven Development» и «SDD»; на странице
  этот текст не показывался. Решение пользователя → вырезать фрагменты при
  сборке Vite-плагином в `site/vite.config.ts` на основе `extractFragment`,
  без новых зависимостей: это требование спецификации («фрагменты
  подтягиваются из файлов при сборке») и критерия «на сайте нет слов»;
  пропавший маркер должен валить `vite build`. В план добавлены шаги
  `test-fragments-plugin` и `fragments-plugin`, скорректированы
  `fragment-extract`, `pipeline-steps-data`, `app-layout`; допущение о
  компромиссе «документы целиком в бандле» снято.
- Порядок при /implement: шаги `test-pipeline-steps` (red «Cannot find module
  './steps.ts'») и `pipeline-steps-data` (в версии с `?raw`) выполнены до
  решения о плагине; после него тест-файл не менялся, `steps.ts` переведён на
  `virtual:pipeline-fragments`, шаги `test-fragments-plugin` →
  `fragments-plugin` выполнены отдельно (red «Cannot find module
  './fragments-plugin.ts'»). Vitest 5 пишет red как «Cannot find module …», а
  не «Failed to resolve import …» — смысл red тот же.
- Первый verify — PARTIAL: в панели шага не было подписи «Что делает»
  (шаг `pipeline-scheme`), поле `human` агента `verifier` было собрано из
  записей «Фактов» `/implement` и `/verify` (шаг `pipeline-steps-data`) →
  реализация приведена к плану: подпись добавлена, `human` переписан только
  по записи `verifier` (агент вызывается из `/implement` и `/code-review`,
  своих точек решения в записи нет).

## Допущения
- Фрагмент для `/roadmap` берётся из `docs/roadmaps/…` (блок пункта 3): выход
  этой команды — роадмап, в `docs/plans/` его следа нет; остальные фрагменты —
  из `docs/plans/` и `docs/manual/` (выход `/manual` — мануал).
- Фрагмент для `/implement` — отклонение, записанное в «Решения» плана
  пункта 3 при реализации: таблица итогов `/implement` в репозиторий не
  сохраняется.
- Фрагменты берутся из документов пункта 3 — последнего полностью закрытого
  прогона с планом, verify, review и мануалом.
- Шрифты — Unbounded (заголовки), Literata (текст), JetBrains Mono
  (фрагменты), вариативные woff2 из пакетов fontsource (редистрибуция Google
  Fonts под OFL), только кириллица и латиница.
- Раскрыт не более одного шага; по умолчанию все свёрнуты.
- Документы-источники фрагментов читает плагин сборки по путям от корня
  репозитория; в dev-сервере изменения документов подхватываются через
  `addWatchFile`.
- Тесты, которым нужен `node:fs`, лежат рядом с модулями в `site/src` и
  типизируются конфигом `tsconfig.node.json`.
- Ссылки на файлы команд не проверяются `scripts/check-links.sh` (собираются
  функцией), их пути проверяет тест данных схемы; ссылка на строки документа
  на `main` может сдвинуться, если документ правится после push, — пункт 7
  переводит ссылки на тег.
