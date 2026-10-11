# Plan: Раздел «Как собран этот сайт»

## Контекст
Роадмап: docs/roadmaps/2026-10-11_1236_public-showcase.md, пункт 6

Сайт объясняет конвейер, но пока не показывает, как этим конвейером собран
он сам: в шапке висит строка «Раздел «Как собран этот сайт» в работе.»
(`site/src/App.tsx:44`). Пункт 6 заменяет её разделом, который показывает
реальный прогон пунктов 3–5 (сайт) по стадиям спецификации (часть 3):
постановка (спецификация — вручную, в диалоге с моделью; роадмап — командой
`/roadmap`), планы (критерии приёмки, «Не делаем»), отклонения из «Решений»,
отчёты агента `verifier`, замечания ревью другой моделью, исправления по
итогам ручного тестирования (фикс-планы
`docs/plans/2026-10-11_1442_fix-showcase-4-links-aside-hero-h1.md` и
`docs/plans/2026-10-11_1453_fix-showcase-5-texts.md`), итог и отдельно —
что проверялось руками. Каждое событие показано фрагментом оригинального
файла, вырезанным при сборке существующим плагином
(`site/fragments-plugin.ts`, источники — `FRAGMENT_SOURCES` в
`site/src/pipeline/fragment-sources.ts`), со ссылкой на строки через
`repoFileUrl` (`site/src/repo.ts`). Тексты и ссылки на фрагменты живут в
модуле данных без DOM, чтобы тест мог механически проверить: у каждого
события есть источник в `docs/plans/`, фрагмент совпадает со строками файла,
итоги verify — PASSED, отклонённых замечаний ревью нет, слов
«Spec-Driven Development»/«SDD» нет. Собственный прогон пункта 6 упомянут
только ссылкой на этот план.

## Окружение
- Node.js и npm, зависимости `site/` установлены (`site/package-lock.json`).
- Chrome-расширение (mcp__claude-in-chrome__*) для шага `browser-acceptance`
  на `npm --prefix site run preview -- --port 4177 --strictPort`
  (`http://localhost:4177/claude-code-harness/`; порт `4173` может держать
  чужой `vite preview` — «Факты» пункта 5). Ширины 360px и 1280px — только в
  iframe нужной ширины (сниппет — §7 мануала
  `docs/manual/2026-10-11_1421_public-showcase-4-style-pipeline-scheme.md`);
  клавиши доходят до страницы только после клика в неё («Факты» пункта 4).
  Нет расширения — шаг ⏸️ DEFERRED «нужен браузер».
- Список запрещённых строк `~/.config/harness-publish/denylist.txt` для
  `scripts/check-leaks.sh` (вне git; строки не выводятся и не записываются).

## Шаги

### Step 1 — build-fragment-sources
- **Цель**: вырезать фрагменты документов прогона при сборке тем же плагином.
- **Файл**: `site/src/pipeline/fragment-sources.ts`
- **Изменение**: в `FragmentSource` поле `end` становится `string | null`
  (`null` — до конца файла: у `-review.md` раздел `## Итог` последний;
  `extractFragment` уже принимает `null` — `site/src/pipeline/fragment.ts:10,17`,
  плагин передаёт `end` как есть — `site/fragments-plugin.ts:15-18`). В
  `FRAGMENT_SOURCES` добавить ключи (путь · маркер начала · маркер конца;
  `P` = `docs/plans/2026-10-11_`, строки — по текущему дереву):

  | ключ | путь | начало | конец | строки |
  |---|---|---|---|---|
  | build-spec-part | `docs/specs/2026-10-11_public-showcase.md` | `### Часть 2. Сайт` | `Технически:` | 80–91 |
  | build-spec-backlog | то же | `- **Б3.` | `- **Б4.` | 158 |
  | build-plan3-criteria | `P1333_public-showcase-3-site-skeleton-pages.md` | `## Критерии приёмки` | `## Не делаем` | 389–407 |
  | build-plan3-notdo | то же | `## Не делаем` | `## Решения` | 409–425 |
  | build-plan4-criteria | `P1356_public-showcase-4-style-pipeline-scheme.md` | `## Критерии приёмки` | `- Страница грузит только` | 479–490 |
  | build-plan4-notdo | то же | `## Не делаем` | `## Решения` | 497–512 |
  | build-plan4-plugin | то же | `  этот текст не показывался.` | `- Порядок при /implement` | 545–552 |
  | build-plan4-partial | то же | `- Первый verify — PARTIAL` | `## Допущения` | 560–565 |
  | build-plan5-criteria | `P1425_public-showcase-5-why-device-limits-footer.md` | `## Критерии приёмки` | `- На сайте нет слов` | 280–285 |
  | build-plan5-notdo | то же | `## Не делаем` | `## Решения` | 298–307 |
  | build-plan5-hh | то же | `- Подвал «Автор»` | `- «Зачем»` | 310–316 |
  | build-plan5-port | то же | `- Порт приёмки` | `## Допущения` | 328–331 |
  | build-fact-raw | `docs/roadmaps/2026-10-11_1236_public-showcase.md` | `- [2026-10-11, пункт 4] Фрагменты документов` | `- [2026-10-11, пункт 4] База ссылок` | 249–255 |
  | build-fact-published | то же | `- [2026-10-11, пункт 3] Сайт опубликован` | `- [2026-10-11, пункт 4] Фрагменты` | 239–248 |
  | build-roadmap-clean-env | то же | `- Пункт 1 принят с DEFERRED` | `- Пункт 3 принят со статусом` | 303–309 |
  | build-roadmap-deferred | то же | `- Пункт 3 принят со статусом` | `- Пункт 5 принят` | 310–314 |
  | build-verify1-clean-env | `P1303_public-showcase-1-harness-snapshot-verify.md` | `\| 5. Ручная проверка` | `## Итог` | 65 |
  | build-verify4-repeat | `P1356_public-showcase-4-style-pipeline-scheme-verify.md` | `Повторная проверка` | `## Результат по шагам` | 5 |
  | build-verify4-result | то же | `## Итог` | `## Что требует внимания` | 81–82 |
  | build-verify5-result | `P1425_public-showcase-5-why-device-limits-footer-verify.md` | `## Итог` | `## Что требует внимания` | 56–59 |
  | build-verify5-deferred | то же | `\| Тёмная тема, Network` | `## Итог` | 54 |
  | build-review3-total | `P1333_public-showcase-3-site-skeleton-pages-review.md` | `## Итог` | `null` | 27–28 |
  | build-review4-total | `P1356_public-showcase-4-style-pipeline-scheme-review.md` | `## Итог` | `null` | 21–22 |
  | build-review5-total | `P1425_public-showcase-5-why-device-limits-footer-review.md` | `## Итог` | `null` | 20–21 |
  | build-fix4-problem | `P1442_fix-showcase-4-links-aside-hero-h1.md` | `## Контекст` | `## Причина` | 3–14 |
  | build-fix4-verify | `P1442_fix-showcase-4-links-aside-hero-h1-verify.md` | `## Итог` | `## Что требует внимания` | 45–46 |
  | build-fix4-review | `P1442_fix-showcase-4-links-aside-hero-h1-review.md` | `## Итог` | `null` | 22–23 |
  | build-fix5-problem | `P1453_fix-showcase-5-texts.md` | `## Контекст` | `## Причина` | 3–16 |
  | build-fix5-verify | `P1453_fix-showcase-5-texts-verify.md` | `## Итог` | `## Что требует внимания` | 35–36 |
  | build-fix5-review | `P1453_fix-showcase-5-texts-review.md` | `## Итог` | `null` | 21–22 |
  | build-manual3-access | `docs/manual/2026-10-11_1347_public-showcase-3-site-skeleton-pages.md` | `### 4.5. Опубликованный сайт` | `## 5. Матрица веток` | 140–157 |
  | build-manual4-dark | `docs/manual/2026-10-11_1421_public-showcase-4-style-pipeline-scheme.md` | `### 4.3. Тёмная тема` | `### 4.4.` | 110–117 |

  Существующие ключи `roadmap`, `implement`, `verifier`, `code-review`
  (`site/src/pipeline/fragment-sources.ts:9-37`) переиспользуются в шаге
  `build-story-data`, не дублируются. В `|`-маркерах обратного слэша нет —
  это экранирование таблицы плана.
- **Референс**: `site/src/pipeline/fragment-sources.ts:7-38`; маркеры и
  диапазоны проверены прогоном `extractFragment`-эквивалента по дереву
  `b81834e`: у каждого маркера начала одно вхождение в файле, ни один
  диапазон не содержит `SDD`/`Spec-Driven`.
- **Риск**: маркер не найден — `vite build` падает (так задумано плагином).
  Диапазоны, которые обрываются раньше запретных слов (`build-plan4-criteria`,
  `build-plan5-criteria`, `build-plan4-plugin`), держатся на маркерах: если
  документ поправят, запрет в бандле поймают тест (проверка 9 шага
  `test-build-story`) и grep шага `repo-checks`. Роадмап меняется по ходу
  прогона (синк /implement) — диапазоны `build-roadmap-*`/`build-fact-*`
  ограничены соседними записями, а не концом раздела, чтобы в них не попали
  записи пункта 6.
- **Проверка**: `npm --prefix site run typecheck` и
  `npm --prefix site run build` — exit 0 (все маркеры найдены; шаг идёт до
  тест-шага: `tsc -b` типизирует `src/**/*.test.ts`, и тест с импортом ещё
  не созданного `build-story.ts` уронил бы обе команды);
  `npm --prefix site test -- steps fragments` — зелёные, как до шага.
- **dependsOn**: —

### Step 2 — test-build-story
- **Цель**: закрепить контракт данных раздела до их написания.
- **Файл**: `site/src/sections/build-story.test.ts` (новый)
- **Изменение**: тест импортирует `BUILD_STORY` и `SELF_PLAN` из
  `./build-story.ts`, `REPO_URL`/`repoFileUrl` из `../repo.ts`, читает файлы
  от корня репозитория (`fileURLToPath(new URL('../../../', import.meta.url))`).
  Контракт данных: `BUILD_STORY = { title, lead, stages }`, стадия —
  `{ id, title, lead, events }`, событие — `{ id, title, text, fragments }`,
  фрагмент — `StepFragment` из `site/src/pipeline/steps.ts:4-7`
  (`path`, `text`, `fromLine`, `toLine`, `label`); `SELF_PLAN = { label, path }`.
  Проверки (каждая — свой `test`):
  1. id стадий по порядку: `spec`, `plans`, `deviations`, `verifier`,
     `review`, `fixes`, `result`, `manual`;
  2. заголовок, вводная, тексты событий и подписи фрагментов непусты; у
     каждой стадии ≥1 событие, у события ≥1 фрагмент; id событий уникальны;
  3. каждый фрагмент: файл `path` существует; `text` непуст и равен строкам
     `fromLine..toLine` файла; `repoFileUrl(path, { from, to })` начинается с
     `${REPO_URL}/blob/` и содержит `?plain=1#L`;
  4. у каждого события вне стадии `spec` есть фрагмент с путём `docs/plans/…`
     («на сайте нет событий, которых нет в `docs/plans/`»); у события стадии
     `spec` есть фрагмент из `docs/specs/`, а его текст содержит «вручную» и
     «в диалоге с моделью»;
  5. покрытие прогона: для каждого из пяти планов —
     `2026-10-11_1333_public-showcase-3-site-skeleton-pages`,
     `2026-10-11_1356_public-showcase-4-style-pipeline-scheme`,
     `2026-10-11_1425_public-showcase-5-why-device-limits-footer`,
     `2026-10-11_1442_fix-showcase-4-links-aside-hero-h1`,
     `2026-10-11_1453_fix-showcase-5-texts` — среди путей фрагментов есть
     `<план>.md`, `<план>-verify.md` и `<план>-review.md`;
  6. без рекурсии: `SELF_PLAN.path` соответствует
     `^docs/plans/.+_public-showcase-6-.+\.md$` и существует; ни один путь
     фрагмента не начинается с `SELF_PLAN.path` без `.md`;
  7. итоги проверки: у каждого `-verify.md` среди путей фрагментов первая
     непустая строка после `## Итог` начинается с `PASSED` (утверждение
     «FAILED не было»); хотя бы один фрагмент стадии `verifier` содержит
     `PARTIAL`;
  8. ревью: в каждом `-review.md` среди путей фрагментов есть строка
     `## Итог`, за которой строка с `отклонено: 0` (утверждение «в отчётах
     ревью диффа отклонённых замечаний нет»; о ревью планов раздел так не
     утверждает — их вердикты в файлах не сохраняются);
  9. нет `/SDD|Spec-Driven/` ни в одной строке данных, включая тексты
     фрагментов;
  10. цифры: в авторских строках (заголовок, вводная, заголовки и вводные
      стадий, заголовки и тексты событий, подписи фрагментов,
      `SELF_PLAN.label`) после удаления номеров пунктов роадмапа
      (`/пункт[а-яё]*\s+\d+/gi`) нет `/[0-9]/`. Пути и тексты фрагментов —
      оригиналы файлов, под правило не попадают.
- **Референс**: `site/src/pipeline/steps.test.ts:47-62` (сверка фрагмента со
  строками файла и запрет названий), `site/src/sections/content.test.ts:9-14,93-97`
  (корень репозитория, правило цифр).
- **Риск**: тест-файл в `site/src` типизируется `site/tsconfig.node.json`
  (`include` — `src/**/*.test.ts`, «Факты» пункта 4) и тянет `build-story.ts`
  с импортом `virtual:pipeline-fragments`: декларация модуля
  `site/src/pipeline/pipeline-fragments.d.ts` уже в этом `include`.
- **Проверка**: red: `npm --prefix site test` — «Cannot find module
  './build-story.ts'» → green после `build-story-data`.
- **dependsOn**: build-fragment-sources

### Step 3 — build-story-data
- **Цель**: тексты раздела и привязка фрагментов — в модуле данных без DOM.
- **Файл**: `site/src/sections/build-story.ts` (новый)
- **Изменение**: экспорт `BUILD_STORY` и `SELF_PLAN` по контракту шага
  `test-build-story`; фрагменты — `{ ...fragments['<ключ>'], label }` из
  `virtual:pipeline-fragments`, тип фрагмента — `StepFragment` (`import type`
  из `../pipeline/steps.ts`). Заголовок — «Как собран этот сайт». Стадии и
  события (авторский текст — кратко, по-русски, без цифр кроме номеров
  пунктов; факты — только те, что видны во фрагментах):
  - `spec` «Постановка»: событие `spec` — спецификацию автор составил
    вручную в диалоге с моделью, стадии спецификации в конвейере нет;
    роадмап из неё сделала команда /roadmap. Фрагменты: `build-spec-part`,
    `build-spec-backlog`, `roadmap`.
  - `plans` «Планы»: вводная — путь пункта /plan → /implement (внутри —
    verifier) → /code-review → /manual, затем мануал проходил отдельный
    тестировщик. События `plan-3`, `plan-4`, `plan-5` — критерии приёмки и
    «Не делаем»: `build-plan{3,4,5}-criteria`, `build-plan{3,4,5}-notdo`;
    у пунктов 4 и 5 подпись критериев говорит, что фрагмент — начало раздела.
  - `deviations` «Отклонения»: `deviation-3-check` — проверка шага
    исправлена при реализации (`implement`); `deviation-4-plugin` —
    реализация пункта 4 остановилась на решении пользователя: импорт
    документа целиком клал в бандл лишний текст, фрагменты стали вырезаться
    плагином при сборке (`build-plan4-plugin`, `build-fact-raw`);
    `deviation-5-hh` — hh.ru в подвале не показывается вопреки спецификации
    по решению пользователя (`build-plan5-hh`); `deviation-5-port` — другой
    порт приёмки (`build-plan5-port`); `deviation-deferred` — пункты приняты
    без ручных проверок, они отложены человеку по решению пользователя
    (`build-roadmap-deferred`, `build-verify5-deferred`).
  - `verifier` «Отчёты агента проверки»: вводная — итога FAILED не было;
    `verify-3` (`verifier`), `verify-4` — первый verifier дал PARTIAL,
    повторный перезаписал отчёт, след первого — в «Решениях» плана
    (`build-plan4-partial`, `build-verify4-repeat`, `build-verify4-result`),
    `verify-5` (`build-verify5-result`).
  - `review` «Ревью другой моделью»: вводная — замечания Codex к плану
    разбираются в чате, в план попадают только принятые правки, вердикты в
    файлах не сохраняются; в файлах лежат отчёты ревью диффа, и в них
    отклонённых замечаний нет (утверждение только об отчётах `-review.md`). `review-3` —
    два замечания, оба исправлены (`code-review`, `build-review3-total`);
    `review-4`, `review-5` — замечаний нет (`build-review{4,5}-total`).
  - `fixes` «Исправления по итогам ручного тестирования»: вводная —
    тестировщик прошёл мануалы, находки исправлены фикс-планами; в истории
    git их коммиты помечены строкой `Fix-for` с именем плана-виновника.
    `fix-4` (`build-fix4-problem`, `build-fix4-verify`, `build-fix4-review`),
    `fix-5` (`build-fix5-problem`, `build-fix5-verify`, `build-fix5-review`).
  - `result` «Итог»: `accepted` — последний пункт сайта принят по отчёту
    проверки с отложенными ручными пунктами (`build-verify5-result`);
    публикация зафиксирована в «Фактах» роадмапа при пункте 3 (каркас), дальше
    сайт публикуется на каждый push в `main` (`build-fact-published`). Что
    опубликованная версия — итог пунктов 3–5, не утверждается: в документах
    такой записи нет. Повтор фрагмента `build-verify5-result` тест не
    запрещает.
  - `manual` «Что проверялось руками»: `clean-env` — пункт 1: ядро в
    чистом окружении доводит /plan до файла плана, прогон выполнил
    пользователь (`build-roadmap-clean-env`, `build-verify1-clean-env`);
    `human-deferred` — из РФ без VPN, с телефона, вкладка Network на
    опубликованном адресе, тёмная тема — отложены человеку по решению
    пользователя и выполняются по мануалам; отметки о результате в
    документах прогона нет — текст события прямо отделяет «выполнено»
    (`clean-env`) от «отложено» (`build-roadmap-deferred`,
    `build-manual3-access`, `build-manual4-dark`, `build-verify5-deferred`).
  `SELF_PLAN` — `{ label: 'план этого раздела', path:
  'docs/plans/2026-10-11_1503_public-showcase-6-build-story.md' }`.
- **Референс**: `site/src/pipeline/steps.ts:1-7,38` (импорт виртуального
  модуля и `{ ...fragments.x, label }`), `site/src/sections/content.ts:1-13`
  (модуль данных раздела).
- **Риск**: авторский текст утверждает то, чего нет во фрагменте. Защита —
  тест (PASSED, `отклонено: 0`, источник в `docs/plans/`) и правило: каждое
  утверждение события видно в его фрагментах.
- **Проверка**: `npm --prefix site test` — `build-story.test.ts` из шага
  `test-build-story` зелёный; `npm --prefix site run typecheck` — exit 0.
- **dependsOn**: test-build-story

### Step 4 — build-story-component
- **Цель**: показать раздел на странице.
- **Файл**: `site/src/components/BuildStory.tsx` (новый)
- **Изменение**: компонент `BuildStory` рендерит
  `<section id="build" className="section" aria-labelledby="build-title">`
  (литералы `id="build"` и `id="build-title"` — для `scripts/check-links.sh`),
  `h2` и `section-lead` из `BUILD_STORY`; стадии — `h3` с вводной и
  списком событий (`info-item` с `h4` и текстом); каждый фрагмент —
  `<figure className="step-fragment">`: `figcaption` с подписью и ссылкой
  `repoFileUrl(path, { from: fromLine, to: toLine })` с текстом
  «<path>, строки A–B», под ней `<details>` с `<summary>Фрагмент</summary>`
  и `<pre>` текста. В конце — абзац со ссылкой `repoFileUrl(SELF_PLAN.path)`
  и текстом «Этот раздел собран тем же конвейером: <label>».
- **Референс**: `site/src/components/PipelineScheme.tsx:38-53` (разметка
  фрагмента), `site/src/components/InfoSections.tsx:3-14,16-24` (секция и
  карточки).
- **Риск**: `details`/`summary` без стилей выбиваются из стиля — стили в
  шаге `build-story-styles`; длинные строки фрагментов на 360px — `pre`
  уже с `white-space: pre-wrap; overflow-wrap: anywhere`
  (`site/src/components/PipelineScheme.css:149-159`).
- **Проверка**: `npm --prefix site run typecheck` и
  `npm --prefix site run lint` — exit 0.
- **dependsOn**: build-story-data

### Step 5 — build-story-styles
- **Цель**: раздел на существующих токенах и классах.
- **Файл**: `site/src/App.css`
- **Изменение**: правила для стадий (`h3` раздела, вводная), списка событий
  (одна колонка, `info-item` переиспользуется), `summary` (курсор, цвет
  `--teal`; видимый фокус уже даёт глобальное `:focus-visible`
  `site/src/index.css:133-134`), отступ абзаца со ссылкой на
  план этого раздела; только переменные из `site/src/index.css:56-94`.
  Удалить правило `.hero-note` (`site/src/App.css:49-53`) — единственный
  пользователь `site/src/App.tsx:44` убирается в шаге `app-layout`
  (`grep -rn hero-note site/src` — два вхождения).
- **Референс**: `site/src/App.css:55-98` (`.section`, `.info-items`,
  `.info-item`).
- **Риск**: правило для `h3` задевает `h3` других разделов — селекторы
  только внутри `#build`/класса раздела.
- **Проверка**: `npm --prefix site run build` — exit 0; вид — шаг
  `browser-acceptance`.
- **dependsOn**: build-story-component

### Step 6 — app-layout
- **Цель**: заменить строку-заглушку разделом.
- **Файл**: `site/src/App.tsx`
- **Изменение**: удалить `<p className="hero-note">…</p>` (строка 44);
  в `hero-links` между «Ограничения» и «Автор» — ссылка
  `<a href="#build">Как собран этот сайт</a>`; `<BuildStory />` — после
  `<LimitsSection />` внутри `main`.
- **Референс**: `site/src/App.tsx:18-44,58-59`.
- **Риск**: якорь без цели — ловит `scripts/check-links.sh` (литералы
  `href="#…"`/`id="…"`).
- **Проверка**: `npm --prefix site run build` — exit 0;
  `scripts/check-links.sh` — 0 нарушений; `grep -c 'в работе' site/src/App.tsx` → 0.
- **dependsOn**: build-story-styles

### Step 7 — repo-checks
- **Цель**: прогнать проверки репозитория и бандла.
- **Файл**: — (проверка, правок нет)
- **Изменение**: команды из корневого `CLAUDE.md` и проверки бандла.
- **Референс**: `CLAUDE.md` («Проверки»).
- **Риск**: фрагмент принёс в бандл запретные слова или утечку.
- **Проверка**: `npm --prefix site run typecheck`, `lint`, `test`, `build` —
  exit 0; `scripts/check-leaks.sh` — 0 совпадений;
  `scripts/check-harness-refs.sh`, `scripts/check-links.sh` — 0 нарушений;
  `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → `0`;
  `grep -c 'Отклонение при /implement' site/dist/assets/*.js` → `0`
  (документ плана пункта 4 в бандл целиком не попал).
- **dependsOn**: app-layout

### Step 8 — browser-acceptance
- **Цель**: принять раздел в браузере.
- **Файл**: — (проверка, правок нет)
- **Изменение**: `npm --prefix site run build`,
  `npm --prefix site run preview -- --port 4177 --strictPort` в фоне;
  `http://localhost:4177/claude-code-harness/` через Chrome-расширение.
- **Референс**: шаг `browser-acceptance` плана
  `docs/plans/2026-10-11_1425_public-showcase-5-why-device-limits-footer.md`;
  сниппет iframe — §7 мануала
  `docs/manual/2026-10-11_1421_public-showcase-4-style-pipeline-scheme.md`.
- **Риск**: клавиши без клика в страницу не доходят; окно не сужается — iframe.
- **Проверка**:
  1. строки «в работе» в шапке нет; ссылка «Как собран этот сайт» ведёт к
     `#build` (клик → `location.hash`, раздел в видимой области);
  2. порядок `h2`: «Зачем», «Конвейер», «Устройство», «Ограничения», «Как
     собран этот сайт», подвал «Автор» последним;
  3. в разделе восемь `h3` в порядке стадий; число `figure` равно числу
     фрагментов в данных; каждая ссылка `figcaption` содержит
     `/blob/main/` и `?plain=1#L`; ссылка на план этого раздела есть;
  4. клавиатура: после клика в страницу Tab доходит до `summary`, Enter
     раскрывает фрагмент, фокус виден; клик тоже раскрывает;
  5. iframe 360px с раскрытыми всеми `details` и iframe 1280px:
     `documentElement.scrollWidth <= innerWidth`; скриншоты раздела;
  6. `read_network_requests` — только `localhost:4177`; ошибок в консоли нет;
  7. визуально — палитра и шрифты как у остальных разделов; тёмная тема —
     человеком по мануалу.
  Без Chrome-расширения — ⏸️ DEFERRED «нужен браузер».
- **dependsOn**: repo-checks

## Граф зависимостей
```
build-fragment-sources → test-build-story → build-story-data
  → build-story-component → build-story-styles → app-layout
  → repo-checks → browser-acceptance
```

## Параллельные группы
— (цепочка последовательная)

## Финальный проход
- repo-checks, browser-acceptance.

## Критерии приёмки
- На странице после «Ограничений» идёт раздел «Как собран этот сайт» со
  стадиями постановка → планы → отклонения → отчёты проверки → ревью другой
  моделью → исправления → итог и отдельной стадией «Что проверялось руками»;
  строки-заглушки нет, якорь шапки ведёт к разделу (шаги `app-layout`,
  `browser-acceptance`).
- Каждый фрагмент вырезан из файла при сборке, совпадает со строками
  исходника и имеет ссылку на строки файла; у каждого события есть источник в
  `docs/plans/`; планы, отчёты verify и review пунктов 3–5 и двух фикс-планов
  показаны (шаги `test-build-story`, `build-story-data`).
- Раздел не показывает того, чего нет в документах: итоги verify — PASSED,
  PARTIAL пункта 4 — по «Решениям» плана, отклонённых замечаний в отчётах
  ревью диффа — ноль, отложенные ручные проверки не выданы за выполненные,
  STOP и FAILED не придуманы; собственный прогон пункта 6 — только ссылка на
  план (шаг `test-build-story`).
- На сайте нет «Spec-Driven Development»/«SDD» (тест и grep бандла),
  проверка запрещённых строк, ссылок и самодостаточности `harness/` даёт 0
  нарушений, typecheck/lint/test/build проходят (шаг `repo-checks`).
- На 360px и 1280px нет горизонтальной прокрутки, фрагменты раскрываются
  мышью и с клавиатуры, запросы только к своему адресу (шаг
  `browser-acceptance`); тёмная тема и опубликованный адрес — человеком по
  мануалу.

## Не делаем
- Показ прогона пунктов 1–2 (кроме ручной проверки пункта 1 в «Что
  проверялось руками»), события пункта 6 и пересказ таблиц кросс-ревью планов:
  в файлах их нет.
- Цифры статистики (подсчёт событий, замечаний, тестов) в авторских текстах.
- Рефакторинг `PipelineScheme` под общий компонент фрагмента: разметка
  фрагмента в разделе повторяет его без изменения схемы.
- Ссылки на тег и дату снимка — пункт 7 (`REPO_REF` остаётся `main`).
- Ссылки на коммиты и вывод `git log` на сайте: история git не файл
  `docs/plans/`; о trailer `Fix-for` — одна фраза без ссылки.
- Правки текстов «Зачем», «Устройство», «Ограничения» и их теста.
- Подсветку синтаксиса во фрагментах, переключатель темы.

## Решения
- Подпись `SELF_PLAN.label` при /implement — со строчной буквы («план этого
  раздела»): она стоит в середине фразы «Этот раздел собран тем же
  конвейером: …» (замечание verifier, косметика).

## Допущения
- Правило цифр для нового раздела: тест `content.test.ts` (`/[0-9]/` для
  `WHY`/`DEVICE`/`LIMITS`) не трогается; для авторских строк раздела «Как
  собран этот сайт» новый тест разрешает только номер пункта роадмапа
  («пункт 4»): без него не назвать, о каком плане речь. Пути, номера строк и
  тексты фрагментов — оригиналы файлов, цифр статистики в них автор не
  вносит.
- Фрагменты, где запретные слова стоят рядом с нужным текстом (критерии
  пунктов 4 и 5, отклонение пункта 4), показываются частично — до строки с
  запретом; подпись это говорит, ссылка ведёт на точный диапазон строк.
- Отклонение пункта 4 сопровождается записью «Фактов» роадмапа о `?raw`:
  в самом плане абзац начинается со строки с запретными словами.
- Таблицы вердиктов кросс-ревью планов живут только в чате («Факты»
  пункта 2), поэтому стадия ревью показывает отчёты `-review.md` по диффу;
  о кросс-ревью плана — одна фраза во вводной стадии.
- Стадия `spec` — источник, а не событие: её фрагменты из `docs/specs/` и
  `docs/roadmaps/`; правило «источник в `docs/plans/`» к ней не применяется.
- Фрагменты свёрнуты в `details`: раздел длинный, подпись и ссылка видны
  без раскрытия.
- Раздел ставится после «Ограничений», перед подвалом: спецификация места
  не задаёт, а рассказ о прогоне логично идёт после описания конвейера.
- Тест и модуль данных — в `site/src/sections/` рядом с `content.ts`.
