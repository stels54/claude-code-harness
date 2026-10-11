# Plan: убрать из публичного снимка команды вне основной цепочки

## Контекст
Самостоятельный план, не пункт роадмапа: роадмап
`docs/roadmaps/2026-10-11_1236_public-showcase.md` закрыт и не меняется.
Публичный снимок сводим к основной цепочке: команды `/verify`, `/plan-fix`,
`/fix-tests` удаляются из `harness/commands/`, со схемы конвейера на сайте
пропадает ряд «Вне цепочки», из README — раздел «Вне основной цепочки».
Упоминание этих команд остаётся одной строкой в README, в разделе «Что не
вошло». Ссылки сайта по-прежнему ведут на `blob/v1` (`REPO_REF = 'v1'`
в `site/src/repo.ts:2`): в теге v1 удаляемые файлы есть, и ссылки остаются
рабочими. Бандл сайта после правки перестанет совпадать с v1, это ожидаемо.

## Окружение
Node и npm (`site/package-lock.json`), Codex CLI для `/code-review`,
Chrome-расширение для приёмки на `npm --prefix site run preview`
(`http://localhost:4173/claude-code-harness/`).

## Шаги

### Step 1 — steps-test-chain-only
- **Цель**: тест состава схемы фиксирует только шесть шагов основной цепочки.
- **Файл**: `site/src/pipeline/steps.test.ts`
- **Изменение**: удалить хелпер `ids(kind)` (строки 9–10). Тест «состав и
  порядок шагов» сверяет `PIPELINE_STEPS.map(step => step.id)` с
  `['roadmap','plan','implement','verifier','code-review','manual']`; ожидание
  длины — 6. Тест «фрагмент есть только у шагов цепочки» (строки 43–45)
  переименовать во «фрагмент есть у каждого шага»: он ожидает
  `step.fragment !== undefined` равным `true`. Поле `kind` тест не использует.
- **Референс**: `site/src/pipeline/steps.test.ts:12-23`, `:43-45`
- **Риск**: описания из `describe.each` для удалённых шагов пропадут вместе
  с данными, и это нормально.
- **Проверка**: red: `expect(ids).toEqual([...6])` падает, потому что в
  массиве 9 id с `verify`, `plan-fix`, `fix-tests`; `toHaveLength(6)`
  получает 9; для `verify`, `plan-fix` и `fix-tests` падает «фрагмент есть у
  каждого шага» → green после steps-drop-aside.
- **dependsOn**: —

### Step 2 — content-test-commands-chain
- **Цель**: тест текста «Команды» опирается на цепочку и запрещает имена
  удалённых команд.
- **Файл**: `site/src/sections/content.test.ts`
- **Изменение**: в тесте «„Команды“ определяют основную цепочку по схеме»
  (строки 137–143) убрать фильтры по `kind` и `aside`. Ожидания: текст пункта
  `commands` содержит `title` первого и последнего элементов `PIPELINE_STEPS`
  и не содержит `/verify`, `/plan-fix`, `/fix-tests`
  (`not.toMatch(/\/verify|\/plan-fix|\/fix-tests/)`).
- **Референс**: `site/src/sections/content.test.ts:137-143`, текст
  `site/src/sections/content.ts:49`
- **Риск**: пока шаги не удалены, последний элемент — `/fix-tests`, и его
  `title` в тексте есть. Поэтому red даёт только новое `not.toMatch`.
- **Проверка**: red: `not.toMatch(/\/verify|\/plan-fix|\/fix-tests/)` падает
  на фразе «/verify, /plan-fix и /fix-tests вне цепочки» → green после
  content-commands-text и steps-drop-aside (последним станет `/manual`).
- **dependsOn**: —

### Step 3 — steps-drop-aside
- **Цель**: убрать aside-шаги и тип `kind` из данных схемы и из компонента.
  Это смена контракта `PipelineStep` вместе с потребителем, поэтому один шаг.
- **Файл**: `site/src/pipeline/steps.ts`, `site/src/components/PipelineScheme.tsx`
- **Изменение**: в `steps.ts` удалить поле `kind` из интерфейса (строка 11),
  строки `kind: 'chain'` из шести записей и записи `verify`, `plan-fix`,
  `fix-tests` (строки 125–161). В `PipelineScheme.tsx` класс `li` —
  `step step-chain` с прежним условным суффиксом ` is-open` (стили от 960px
  держатся на `.step-chain`, `PipelineScheme.css:209-238`; подсветка
  раскрытого шага — на `.step.is-open`, `PipelineScheme.css:62-66`). Удалить фильтры `chain` и `aside`
  (строки 86–87), перебирать прямо `PIPELINE_STEPS`, удалить `h3`
  «Вне цепочки» и список `ul.scheme-aside` (строки 102–112).
- **Референс**: потребители `kind` по дереву:
  `grep -rn "\.kind\|kind:" site/src` → `steps.ts` (интерфейс и 9 записей),
  `PipelineScheme.tsx:64,86,87`, `steps.test.ts:9-10,44` (step 1),
  `content.test.ts:139-140` (step 2). Других нет.
- **Риск**: `tsc -b` проверяет и тесты (`site/tsconfig.node.json:22`
  включает `src/**/*.test.ts`), поэтому шаги 1 и 2 обязательно выполняются
  до этого, иначе typecheck упадёт.
- **Проверка**: `npm --prefix site test -- steps` зелёный (тест из step 1),
  `npm --prefix site run typecheck` зелёный; `grep -n "is-open" site/src/components/PipelineScheme.tsx`
  находит условный суффикс класса `li`.
- **dependsOn**: steps-test-chain-only, content-test-commands-chain

### Step 4 — scheme-css-drop-aside
- **Цель**: удалить стили ряда «Вне цепочки».
- **Файл**: `site/src/components/PipelineScheme.css`
- **Изменение**: из группового селектора в строке 1–2 убрать `.scheme-aside`.
  Удалить правила `.scheme-aside` (23–26), `.scheme-aside-title` (28–32),
  `.step-aside .step-button` (57–60), `.step-aside .step-panel` (104–106),
  а в `@media (min-width: 720px)` — `.scheme-aside`, `.scheme-aside > .step`,
  `.step-aside .step-button`, `.step-aside .step-panel` (170–186).
- **Референс**: `grep -n aside site/src/components/PipelineScheme.css` →
  строки 2, 23, 28, 57, 104, 170, 175, 179, 183 (полный список)
- **Риск**: задеть соседние правила `.step-facts` внутри того же media-блока.
- **Проверка**: `grep -n aside site/src/components/PipelineScheme.css` пусто;
  `npm --prefix site run lint`, `npm --prefix site run build` зелёные.
- **dependsOn**: steps-drop-aside

### Step 5 — content-commands-text
- **Цель**: текст «Команды» в «Устройстве» больше не говорит о командах вне
  цепочки.
- **Файл**: `site/src/sections/content.ts`
- **Изменение**: в `text` пункта `commands` (строка 49) удалить предложение
  «/verify, /plan-fix и /fix-tests вне цепочки, их запускают отдельно.».
  Остальной текст не меняется.
- **Референс**: `site/src/sections/content.ts:49`
- **Риск**: фраза `STOP` нужна тесту `DEVICE_TEXT`
  (`content.test.ts:60`). Она в другом предложении и остаётся.
- **Проверка**: `npm --prefix site test -- content` зелёный (тест из step 2).
- **dependsOn**: content-test-commands-chain, steps-drop-aside

### Step 6 — harness-delete-aside-commands
- **Цель**: удалить файлы команд из снимка и входящую ссылку внутри `harness/`.
- **Файл**: `harness/commands/verify.md`, `harness/commands/plan-fix.md`,
  `harness/commands/fix-tests.md` (удалить), `harness/commands/code-review.md`
- **Изменение**: `git rm` трёх файлов. В `code-review.md:60`
  «реализуется отдельным /plan-fix или /plan, не в обход.» →
  «реализуется отдельным /plan, не в обход.».
- **Референс**: входящие ссылки по дереву вне `docs/`:
  `git grep -n -E "commands/(verify|plan-fix|fix-tests)\.md|/plan-fix|/fix-tests|/verify\b" -- . ':!docs'`
  → `README.md:71,75,77` (step 7), `harness/commands/code-review.md:60`
  (этот шаг), `site/src/pipeline/steps.ts` (step 3), `site/src/sections/content.ts:49`
  (step 5). В `docs/` упоминания только текстовые, ссылок markdown нет.
  Исходящие ссылки из удаляемых файлов значения не имеют.
  `scripts/check-harness-refs.sh:39` требует `harness/commands/<имя>.md`
  для каждой `/команды` в `harness/`.
- **Риск**: если оставить `/plan-fix` в `code-review.md`, упадёт
  `check-harness-refs.sh`. Тест `steps.test.ts` «файл команды существует»
  падает, если удалить файлы раньше step 3.
- **Проверка**: `scripts/check-harness-refs.sh` → 0 нарушений;
  `npm --prefix site test` зелёный.
- **dependsOn**: steps-drop-aside, content-commands-text

### Step 7 — readme-drop-aside-section
- **Цель**: README описывает только основную цепочку, удалённые команды
  упомянуты в «Что не вошло».
- **Файл**: `README.md`
- **Изменение**: удалить блок «Вне основной цепочки:» вместе со списком
  (строки 70–78) и одну пустую строку за ним, чтобы между пунктом 6 и абзацем
  «Ревью другой моделью…» осталась одна пустая строка. Строка 132 →
  «Не публикуются: команды `from-linear`, `review`, `git-report`, `verify`,
  `plan-fix`, `fix-tests` и скилл `lessons`.». Строка 33 («У `/plan` есть
  флаг…») и описание verifier с `-verify.md` (строка 57) остаются: это флаги
  и отчёт агента, а не удаляемые команды. Блок установки
  `cp harness/commands/*.md` (строка 96) остаётся рабочим.
- **Референс**: `README.md:70-78`, `:132`
- **Риск**: ссылки на удалённые файлы, если они останутся, ловит `check-links.sh`.
- **Проверка**: `scripts/check-links.sh` → 0 нарушений;
  `git grep -n -E "plan-fix|fix-tests|/verify" README.md` — только строка
  «Что не вошло».
- **dependsOn**: harness-delete-aside-commands

## Граф зависимостей
- steps-drop-aside ← steps-test-chain-only, content-test-commands-chain
- scheme-css-drop-aside ← steps-drop-aside
- content-commands-text ← content-test-commands-chain, steps-drop-aside
- harness-delete-aside-commands ← steps-drop-aside, content-commands-text
- readme-drop-aside-section ← harness-delete-aside-commands

## Параллельные группы
- Группа A: steps-test-chain-only, content-test-commands-chain
- Группа B (после steps-drop-aside): scheme-css-drop-aside, content-commands-text

## Финальный проход
- `npm --prefix site run typecheck`, `lint`, `test`, `build`.
- `scripts/check-leaks.sh`, `scripts/check-harness-refs.sh`, `scripts/check-links.sh`.
- `grep -rE "SDD|Spec-Driven" site/dist` — пусто.
- Браузерная приёмка на preview в новой вкладке: в схеме «Конвейер» 6 кнопок
  шагов, заголовка «Вне цепочки» нет; на ширине 360px (через iframe)
  горизонтальной прокрутки нет; раскрытый шаг подсвечен (`li.is-open`) и
  остаётся подсвеченным после того, как указатель уведён с кнопки.

## Критерии приёмки
1. В схеме конвейера на сайте шесть шагов от /roadmap до /manual, ряда
   «Вне цепочки» нет ни на узкой, ни на широкой ширине, на 360px нет
   горизонтальной прокрутки.
2. В `harness/commands/` нет `verify.md`, `plan-fix.md`, `fix-tests.md`;
   `scripts/check-harness-refs.sh` проходит; установка
   `cp harness/commands/*.md` копирует только оставшиеся команды.
3. README и текст «Устройство» на сайте не описывают удалённые команды как
   часть снимка; в README они названы в «Что не вошло».
4. Все проверки сайта и репозитория зелёные, ссылки на `blob/v1` живы, в
   бандле нет `SDD` и `Spec-Driven`.

## Не делаем
- Роадмап `docs/roadmaps/2026-10-11_1236_public-showcase.md`, спецификацию,
  мануалы и старые планы/отчёты в `docs/` не правим: в них упоминания
  удалённых команд — история прогона.
- Текст «ряд „Вне цепочки“» в `site/src/sections/build-story.ts:225` остаётся,
  это история сборки.
- `REPO_REF` не меняем, ссылки остаются на `v1`.
- Мёртвый после правки код не трогаем: опциональные `fragment?` в
  `PipelineStep` и `index?` в `StepProps`, ветку «Документа этой команды в
  репозитории нет» в `PipelineScheme.tsx`, стиль `.step-nodoc`. Убрать их —
  отдельное предложение.
- Селекторы `.step-chain` в CSS не переименовываем.
- Рабочий `~/.claude` не меняем.

## Решения
- Как переформулировать `harness/commands/code-review.md:60` → «…реализуется
  отдельным /plan, не в обход.»
- Что делать с фразой «/verify, /plan-fix и /fix-tests вне цепочки, их
  запускают отдельно.» в `site/src/sections/content.ts:49` → удалить фразу;
  тест переписать: в тексте упоминаются первый и последний шаг цепочки
  (/roadmap, /manual), без aside.
- Мёртвый код (`fragment?`, `index?`, ветка «Документа этой команды в
  репозитории нет», `.step-nodoc`) не убирать, оставить в «Не делаем» как
  отдельное предложение.

## Допущения
- Тип `kind` удаляется. Класс `step-chain` в `PipelineScheme.tsx` остаётся
  литералом, селекторы CSS не трогаем.
- Строка в «Что не вошло» README: «Не публикуются: команды `from-linear`,
  `review`, `git-report`, `verify`, `plan-fix`, `fix-tests` и скилл `lessons`.»
