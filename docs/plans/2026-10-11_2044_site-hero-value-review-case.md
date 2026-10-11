# Plan: подача сайта — ценность на первом экране, кейс ревью, связка с постановкой задачи

## Контекст
Самостоятельный план, не пункт роадмапа: роадмап
`docs/roadmaps/2026-10-11_1236_public-showcase.md` закрыт и не меняется,
спецификация и мануалы тоже. Сайт должен за тридцать секунд объяснить
читателю из резюме, что это и чем ценно. Три правки: (1) на первом экране под
строкой «план → реализация → изолированная проверка → ревью другой моделью» —
абзац о ценности и три выделенных свойства; (2) в разделе «Как собран этот
сайт» до хронологии — краткий кейс одного ревью (два замечания Codex к
каркасу сайта) со ссылками на строки отчёта; (3) в разделе «Зачем» — фраза,
связывающая постановку задачи инженером с работой конвейера. Ссылки
по-прежнему ведут на `blob/v1` (`REPO_REF = 'v1'`, `site/src/repo.ts:2`).
Отчёт-источник кейса с тега не менялся: `git diff v1 --
docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md`
пуст, поэтому номера строк фрагментов совпадают с v1.

## Окружение
Node и npm (`site/package-lock.json`), Codex CLI для `/code-review`,
Chrome-расширение для приёмки на `npm --prefix site run preview`
(`http://localhost:4173/claude-code-harness/`).

## Тексты (согласованы пользователем дословно)

Первый экран, абзац (`HERO.text`):
«Собственный харнес для Claude Code — конвейер, построенный на разделении
реализации и независимой проверки. Он ведёт задачу через планирование,
написание кода, проверку соответствия плану и ревью другой моделью. Это
рабочий харнес автора; в репозитории лежит его публичный снимок.»

Первый экран, свойства (`HERO.items`, id — заголовок — текст):
- `isolated-verifier` — «Изолированная проверка» — «Агент verifier получает
  только путь к плану, контекста реализации у него нет.»
- `read-only-review` — «Codex только читает» — «Ревью другой моделью идёт в
  режиме только чтения: Codex файлы не меняет.»
- `human-stop` — «Решения за человеком» — «Критичный вопрос или замечание
  останавливает конвейер до решения человека.»

«Зачем», фраза после трёх проблем (`WHY_BRIDGE`):
«Разработка начинается с постановки задачи, которую формулирует инженер:
требования и ожидаемый результат. Конвейер превращает её в план с критериями
приёмки и организует реализацию и проверку соответствия этому плану.»

«Как собран этот сайт», кейс (`BUILD_STORY.highlight`):
- заголовок: «Кейс: что нашло одно ревью»
- текст: «При ревью диффа каркаса сайта (пункт 3) Codex нашёл два замечания.
  Первое: хук перед push выгружал дерево коммита через git archive, а он
  пропускает файлы с атрибутом export-ignore — закоммиченный файл с
  запрещёнными строками мог уйти на remote без проверки. Второе: проверка
  ссылок молча пропускала файл, который не удалось прочитать, и сообщала об
  успехе при неполном результате. Оба замечания исправлены, после правок
  проверки прогнаны повторно.»
- фрагменты: «Отчёт ревью пункта 3: замечания» — строки 6–9 отчёта
  (новый источник `build-review3-table`); «Отчёт ревью пункта 3: проверка
  после правок» — строки 15–22 (новый источник `build-review3-recheck`).
  Существующий источник `code-review` захватывает строки 6–13 (таблица и
  примечание ревьюера), поэтому для кейса не годится и не меняется.

Тексты в коде — посимвольно как здесь (переносы строк плана — пробелы).

## Опора текстов на файлы
- verifier получает только путь: `harness/commands/implement.md:143-144`
  («В задание передай только путь»), `harness/agents/verifier.md:8-10`
  («Контекста реализации у тебя нет»).
- Codex только читает: `harness/commands/code-review.md:33`,
  `harness/commands/plan.md:265` (`codex exec --sandbox read-only`, «файлы не
  меняешь»).
- Критичное останавливает конвейер: `harness/commands/plan.md:169-176`
  («жди ответа, не составляй план»), `:280` («STOP, жди моего решения»),
  `harness/commands/code-review.md:56-59` («**STOP** — замечание верно»).
- План с критериями приёмки пишет /plan: `README.md:42-45`; постановку готовит
  человек: `README.md:132-133`.
- Кейс: `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md:6-9`
  (таблица, оба «исправлено»), `:15-22` (проверка после правок).

## Шаги

### Step 1 — hero-content-test
- **Цель**: тест фиксирует тексты первого экрана и их опору на `harness/`.
- **Файл**: `site/src/sections/content.test.ts`
- **Изменение**: импорт `HERO` из `./content.ts`. `HERO` имеет форму
  `{ text: string; items: SectionItem[] }`. Тесты:
  (а) `HERO.text` непуст и содержит «Claude Code», «разделении реализации и
  независимой проверки», «публичный снимок»; не матчит `/реальных проектах/`;
  (б) `HERO.items.map(i => i.id)` равно
  `['isolated-verifier','read-only-review','human-stop']`, заголовки и тексты
  непусты;
  (в) `HERO_TEXT`: `isolated-verifier` → «только путь к плану»;
  `read-only-review` → «только чтения»; `human-stop` → «останавливает»,
  «решения человека» — каждая фраза содержится в тексте своего пункта;
  (г) `HERO_FACTS`: ключи совпадают с id пунктов; каждый пункт привязан к
  фразам файлов `harness/` (читаются `readFileSync` от `root`):
  `isolated-verifier` → `harness/commands/implement.md` «В задание передай
  только путь», `harness/agents/verifier.md` «Контекста реализации у тебя»;
  `read-only-review` → `harness/commands/code-review.md` и
  `harness/commands/plan.md` «codex exec --sandbox read-only»; `human-stop` →
  `harness/commands/plan.md` «жди ответа, не составляй план»,
  `harness/commands/code-review.md` «**STOP** — замечание верно»;
  (д) строки HERO (`text`, `id`, `title`, `text` пунктов) входят в
  существующие проверки: нет цифр, нет `/SDD|Spec-Driven/`, нет
  `/спецификац/i`.
- **Референс**: `site/src/sections/content.test.ts:23-58` (DEVICE_FACTS,
  DEVICE_TEXT), `:89-101` (`нет цифр`), `:140-160` (запрещённые названия,
  спецификация)
- **Риск**: фразы `harness/` могут измениться при обновлении снимка — тест
  тогда укажет на расхождение текста сайта с файлами, это и нужно.
- **Проверка**: red: `HERO` не экспортируется — `TypeError: Cannot read
  properties of undefined (reading 'text')` и typecheck `has no exported
  member 'HERO'` → green после hero-content.
- **dependsOn**: —

### Step 2 — hero-content
- **Цель**: тексты первого экрана — данные раздела, покрытые тестом.
- **Файл**: `site/src/sections/content.ts`
- **Изменение**: экспорт `HERO: { text: string; items: SectionItem[] }` с
  текстами из раздела «Тексты» дословно.
- **Референс**: `site/src/sections/content.ts:21-41` (`WHY`)
- **Риск**: опечатка против согласованного текста — сверить посимвольно.
- **Проверка**: `npm --prefix site test` — тесты hero-content-test зелёные.
- **dependsOn**: hero-content-test

### Step 3 — hero-render
- **Цель**: абзац и три свойства видны на первом экране под строкой-цепочкой.
- **Файлы**: `site/src/App.tsx`, `site/src/App.css`
- **Изменение**: в `App.tsx` после `<p className="hero-lead">` и до
  `<HeroArt />` — `<p className="hero-value">{HERO.text}</p>` и
  `<ul className="info-items hero-props">` с `<li className="info-item">`
  на каждый пункт: `<strong>{title}</strong>` и `<p>{text}</p>` (не `h3`:
  над ними нет `h2`, уровни заголовков не перескакиваются). В `App.css`:
  `.hero-value` — `max-width` около 36em, `margin: 0 auto 1.5rem`, цвет
  `var(--ink)` по умолчанию; `.hero-props` — `text-align: left`,
  `margin: 0 0 1.75rem`; `.hero-props strong` — блок, размер и цвет как у
  `.info-item h3` (`0.95rem`, `var(--teal)`, отступ снизу `0.4rem`). Цвета
  только из существующих токенов `index.css`, тёмная тема — через них же.
- **Референс**: `site/src/App.tsx:15-20`, `site/src/App.css:25-30`
  (`.hero-lead`), `:66-92` (`.info-items`, `.info-item`)
- **Риск**: сетка `.info-items` на 360px — `minmax(min(100%, 17rem), 1fr)`
  даёт одну колонку, горизонтальной прокрутки быть не должно.
- **Проверка**: `npm --prefix site run typecheck`, `lint`, `build`; браузер —
  в шаге browser-acceptance.
- **dependsOn**: hero-content

### Step 4 — why-bridge-test
- **Цель**: тест фиксирует фразу-связку «Зачем».
- **Файл**: `site/src/sections/content.test.ts`
- **Изменение**: импорт `WHY_BRIDGE: string`. Тест: содержит «постановки
  задачи», «формулирует инженер», «критериями приёмки», «проверку
  соответствия»; строка входит в проверки «нет цифр», «нет запрещённых
  названий» и «спецификация упомянута только как отсутствующая стадия».
- **Референс**: `site/src/sections/content.test.ts:140-160`
- **Риск**: —
- **Проверка**: red: `WHY_BRIDGE` undefined — `expect(undefined).toContain`
  падает → green после why-bridge.
- **dependsOn**: —

### Step 5 — why-bridge
- **Цель**: фраза видна в «Зачем» после трёх проблем.
- **Файлы**: `site/src/sections/content.ts`,
  `site/src/components/InfoSections.tsx`, `site/src/App.css`
- **Изменение**: экспорт `WHY_BRIDGE` с текстом из «Тексты». В `WhySection`
  после `<SectionItems section={WHY} />` — `<p className="section-note">`.
  В `App.css` `.section-note` — `margin: 1.5rem 0 0`, `max-width: 40em`,
  `color: var(--ink-soft)`.
- **Референс**: `site/src/components/InfoSections.tsx:17-24`,
  `site/src/App.css:126-129` (`.build-self`)
- **Риск**: —
- **Проверка**: `npm --prefix site test` (why-bridge-test зелёный),
  `typecheck`, `lint`.
- **dependsOn**: why-bridge-test

### Step 6 — case-source
- **Цель**: источники фрагментов кейса: таблица замечаний (строки 6–9) и
  «проверка после правок» (строки 15–22) отчёта ревью пункта 3.
- **Файл**: `site/src/pipeline/fragment-sources.ts`
- **Изменение**: две записи с `path: \`${PLAN_3}-review.md\``:
  `'build-review3-table'` — `start: '| № |'`, `end: 'Ревьюер не смог'`
  (строки 6–9: пустая строка 10 срезается `extractFragment`,
  `site/src/pipeline/fragment.ts:23`); `'build-review3-recheck'` —
  `start: '## Проверка после правок'`, `end: '## Ждёт решения'` (строки
  15–22). Существующий `code-review` (`fragment-sources.ts:37-41`, строки
  6–13) не трогается: его использует схема конвейера и хронология.
- **Референс**: `site/src/pipeline/fragment-sources.ts:117-121`
  (`build-review3-total`)
- **Риск**: маркер не найден — сборка упадёт с «Маркер начала не найден»
  (`site/fragments-plugin.ts:21`), это заметно сразу.
- **Проверка**: `npm --prefix site run typecheck`.
- **dependsOn**: —

### Step 7 — case-test
- **Цель**: тест фиксирует кейс ревью и подключает его фрагменты к общим
  проверкам.
- **Файл**: `site/src/sections/build-story.test.ts`
- **Изменение**: `BUILD_STORY.highlight` типа `StoryEvent`. Константа
  `fragments` включает `BUILD_STORY.highlight.fragments`, авторские строки
  (`title`, `text`, `label`) — в тесты «нет запрещённых названий» и «нет цифр
  в авторских текстах». Новый тест: `title` равен «Кейс: что нашло одно
  ревью»; `text` содержит «git archive», «export-ignore», «проверка ссылок»,
  «Оба замечания исправлены»; все фрагменты из
  `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md`;
  первый — `fromLine` 6, `toLine` 9, содержит строки, начинающиеся с `| 1 |`
  и `| 2 |`; второй — `fromLine` 15, `toLine` 22, начинается с `## Проверка
  после правок`; у каждого `claim` —
  `{ rejected: 0 }`. Тест «стадии по порядку» не меняется: кейс — не стадия.
- **Референс**: `site/src/sections/build-story.test.ts:10-16`, `:58-67`,
  `:105-120`, `:174-210`
- **Риск**: тест «заявленный статус отчёта совпадает» сверит claim кейса с
  итогом отчёта — ожидаемо `отклонено: 0`.
- **Проверка**: red: `BUILD_STORY.highlight` undefined — `TypeError` при
  чтении `.fragments` → green после case-data.
- **dependsOn**: case-source

### Step 8 — case-data
- **Цель**: данные кейса.
- **Файл**: `site/src/sections/build-story.ts`
- **Изменение**: в `BuildStory` поле `highlight: StoryEvent`; в `BUILD_STORY`
  — `highlight: { id: 'review-case', title, text, fragments: [frag('build-review3-table',
  'Отчёт ревью пункта 3: замечания', rejected(0)), frag('build-review3-recheck',
  'Отчёт ревью пункта 3: проверка после правок', rejected(0))] }` с текстами из
  «Тексты». Стадии не меняются.
- **Референс**: `site/src/sections/build-story.ts:189-197` (`review-3`)
- **Риск**: id `review-case` не должен совпасть с id событий стадий — он вне
  `stages`, тест уникальности их не смешивает.
- **Проверка**: `npm --prefix site test` — case-test зелёный.
- **dependsOn**: case-test

### Step 9 — case-render
- **Цель**: кейс виден до хронологии.
- **Файлы**: `site/src/components/BuildStory.tsx`, `site/src/App.css`
- **Изменение**: после `section-lead` и до `stages.map` — `<div
  className="build-highlight">` с `<h3>{title}</h3>`, `<p>{text}</p>` и
  `StoryFragment` на каждый фрагмент (ссылка через существующий
  `repoFileUrl` с диапазоном строк). В `App.css` `.build-highlight` — рамка
  как у `.info-item` (`border: 1px solid var(--line-faint)`, `border-left: 2px
  solid var(--ochre)`, `border-radius: 0 12px 12px 0`, `padding: 0.9rem
  1.1rem`, `overflow-wrap: anywhere`), `h3` — `0.95rem`, `var(--teal)`;
  `summary` фрагментов — как `.build-events summary` (`App.css:119-124`).
- **Референс**: `site/src/components/BuildStory.tsx:9-30`, `:32-58`;
  `site/src/App.css:75-92`
- **Риск**: длинные пути в подписи фрагмента на 360px — `overflow-wrap:
  anywhere` у `figcaption` унаследуется от блока; проверить в браузере.
- **Проверка**: `typecheck`, `lint`, `build`; браузер — в browser-acceptance.
- **dependsOn**: case-data

### Step 10 — browser-acceptance
- **Цель**: приёмка в браузере.
- **Файл**: —
- **Изменение**: `npm --prefix site run build`, `npm --prefix site run
  preview`; Chrome в новой вкладке на
  `http://localhost:4173/claude-code-harness/`. Проверить: первый экран —
  абзац и три свойства под строкой-цепочкой; «Зачем» — фраза после трёх
  пунктов; «Как собран этот сайт» — кейс до «Постановки»; ссылки кейса —
  `https://github.com/stels54/claude-code-harness/blob/v1/docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md?plain=1#L6-L9`
  и `…#L15-L22`; iframe 360px — `scrollWidth <= clientWidth`; тёмная тема
  (`prefers-color-scheme: dark` эмуляцией или токенами) — текст читаем;
  сетевые запросы только к `localhost`.
- **Референс**: —
- **Риск**: эмуляция тёмной темы через расширение может быть недоступна —
  тогда DEFERRED с причиной.
- **Проверка**: наблюдения выше.
- **dependsOn**: hero-render, why-bridge, case-render

## Граф зависимостей
- hero-content-test → hero-content → hero-render
- why-bridge-test → why-bridge
- case-source → case-test → case-data → case-render
- hero-render, why-bridge, case-render → browser-acceptance

## Параллельные группы
- Нет. Шаги выполняются по порядку номеров: каждая пара red → green
  закрывается до следующего тест-шага, иначе `tsc -b` (`site/package.json:10`)
  и полный `npm test` останутся красными из-за чужого незакрытого теста.
  case-source выполняется при зелёной типизации.

## Финальный проход
- `npm --prefix site run typecheck`, `lint`, `test`, `build`
- `scripts/check-leaks.sh`, `scripts/check-harness-refs.sh`,
  `scripts/check-links.sh`
- `grep -rE 'SDD|Spec-Driven' site/dist` — пусто
- `git diff v1 --
  docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md`
  — пусто
- browser-acceptance

## Критерии приёмки
- Читатель первого экрана видит под строкой-цепочкой абзац о ценности и три
  свойства с согласованными текстами; формулировки опираются на файлы
  `harness/` (тест падает при расхождении).
- В «Как собран этот сайт» до хронологии виден кейс ревью с двумя
  замечаниями; ссылки ведут на `blob/v1` с якорями `#L6-L9` и `#L15-L22`
  отчёта ревью пункта 3, и эти строки совпадают с файлом в теге.
- В «Зачем» после трёх проблем — фраза о постановке задачи инженером; слов
  «SDD» и «Spec-Driven» нет ни в данных, ни в бандле.
- На 360px нет горизонтальной прокрутки, тёмная тема читаема, запросов к
  сторонним доменам нет.
- Все проверки репозитория и сайта зелёные.

## Не делаем
- Роадмап, спецификацию, мануалы, README не правим.
- `REPO_REF` не меняем, ссылки остаются на `v1`.
- Подробную хронологию «Как собран этот сайт» не меняем.
- Цифры статистики на сайт не добавляем; не пишем «используется в реальных
  проектах».
- Тест на совпадение файлов с тегом через git не заводим: CI собирает без
  тегов; сверка `git diff v1` — ручная команда финального прохода.
- `/manual` не делаем.

## Решения
- Фраза в «Зачем» о критериях приёмки → «Разработка начинается с постановки
  задачи, которую формулирует инженер: требования и ожидаемый результат.
  Конвейер превращает её в план с критериями приёмки и организует реализацию
  и проверку соответствия этому плану.» (критерии приёмки пишет /plan, README
  это фиксирует; «Харнес» варианта 1b заменён на «Конвейер» по решению о
  термине).
- Термин → на первом экране один раз «харнес … — конвейер …», дальше на
  сайте «конвейер», в том числе в «Зачем».
- Место фразы в «Зачем» → отдельным абзацем после трёх проблем, как переход
  к «Конвейеру».
- Черновики текстов (абзац, три свойства, кейс, подписи ссылок) приняты
  пользователем дословно.
- Сдвиг фрагментов роадмапа относительно v1 проверен при приёмке пункта 7,
  действий не нужно.

## Допущения
- Тексты первого экрана переносятся в `content.ts`, чтобы покрыть их тестом;
  `kicker`, `h1` и строка-цепочка остаются в `App.tsx`.
- Заголовки свойств первого экрана — `<strong>`, не `h3`: над ними нет `h2`.
- Кейс — поле `highlight` в `BUILD_STORY`, а не стадия: тест порядка стадий
  не меняется.
