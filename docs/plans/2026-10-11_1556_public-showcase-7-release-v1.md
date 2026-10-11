# Plan: Выпуск v1 — тег и постоянные ссылки

## Контекст
Роадмап: docs/roadmaps/2026-10-11_1236_public-showcase.md, пункт 7

Ссылки сайта на файлы репозитория сейчас ведут на `main`: их собирает
`repoFileUrl()` из `REPO_REF = 'main'` (`site/src/repo.ts:2`, `:10`). Через
неё идут схема «Конвейер» (`site/src/components/PipelineScheme.tsx:34`, `:43`),
раздел «Как собран этот сайт» (`site/src/components/BuildStory.tsx:15`, `:60`)
и ссылка на README в шапке (`site/src/App.tsx:27`). Пункт 7 переводит их на тег
`v1` и выводит на сайт дату снимка. Дата уже есть в README
(`README.md:166`, «Дата снимка: 2026-10-11.»). README ссылается на сайт
(`README.md:167`), подвал сайта — на репозиторий (`AUTHOR`,
`site/src/sections/content.ts:113`). Тег можно поставить только на коммит,
в котором ссылки уже переведены на `v1`, поэтому выпуск идёт так: (1) коммит
с переводом ссылок, вместе с роадмапом, этим планом, `-verify.md` и
`-review.md`; (2) тимлид ставит тег `v1` на этот коммит и пушит `main` и тег;
(3) после push ссылки проверяются на тег — локально по git и по curl на
GitHub, и проверяется, что Pages собрал коммит с тегом. Мануал пункта 7 и
итог проверки тега ложатся отдельным коммитом после тега, не сдвигая строки,
из которых сайт вырезает фрагменты.

## Окружение
- Node/npm по `site/package-lock.json`; команды проверки — корневой `CLAUDE.md`.
- Chrome-расширение для браузерной приёмки;
  `npm --prefix site run preview -- --port 4180 --strictPort`.
- Для шагов после тега: доступ к GitHub (curl, `gh`), тег `v1` в локальном
  клоне и на `origin`; тег ставит тимлид.
- Список запрещённых строк для `scripts/check-leaks.sh` (готовит человек).

## Шаги

### Step 1 — test-repo-ref-v1
- **Цель**: зафиксировать тестом, что ссылки на репозиторий ведут на тег `v1`.
- **Файл**: `site/src/repo.test.ts`
- **Изменение**: контракт `repoFileUrl(path, lines?)` →
  `https://github.com/stels54/claude-code-harness/blob/v1/<path>` (для `.md`
  со строками — `?plain=1#L…`, остальное как сейчас); `REPO_REF === 'v1'`.
  Константа `blob` (`site/src/repo.test.ts:4`) → `…/blob/v1` без завершающего
  пути. Полный литерал из `site/src/repo.test.ts:13` переписывается шаблонной
  строкой `${blob}/harness/commands/plan.md`: `scripts/check-links.sh` видит
  только литералы `(blob|tree)/<ref>/<путь>` (`scripts/check-links.sh:46`),
  а литерал с `v1` до появления тега давал бы нарушение в коммите, на который
  тег ставится.
- **Референс**: `site/src/repo.test.ts:6-31`; регулярка `repo_re` —
  `scripts/check-links.sh:46`, разрешение ref — `scripts/check-links.sh:53`.
- **Риск**: литерал с `blob/v1/<путь>` в любом отслеживаемом файле роняет
  `check-links` до тега.
- **Проверка**: red: `npm --prefix site test -- src/repo.test.ts` —
  `expect(REPO_REF).toBe('v1')` получает `'main'`, остальные три теста ссылок
  тоже красные → green после `repo-ref-v1`. `grep -c 'claude-code-harness/blob/v1/' site/src/repo.test.ts` → `0`.
- **dependsOn**: —

### Step 2 — test-snapshot-footer
- **Цель**: зафиксировать тестом данные строки о снимке в подвале.
- **Файл**: `site/src/sections/content.test.ts`
- **Изменение**: новый тест «снимок в подвале» на новый экспорт `SNAPSHOT`
  из `site/src/sections/content.ts`. Контракт: `SNAPSHOT.date` равна дате из
  README: строка вида `- Дата снимка: <ГГГГ-ММ-ДД>.`, разбор регуляркой по
  `README.md`, читается так же, как роадмап в
  `site/src/sections/content.test.ts:9-14`; README при этом не меняется.
  `SNAPSHOT.ref === REPO_REF`; `SNAPSHOT.href === `${REPO_URL}/tree/v1``;
  `SNAPSHOT.label` непустая и не содержит `SDD|Spec-Driven`. Тест «нет цифр»
  (`site/src/sections/content.test.ts:95-99`) покрывает только WHY, DEVICE и
  LIMITS. Подвал и `SNAPSHOT` он не трогает, исключение для даты не нужно.
- **Референс**: тест «подвал «Автор»» — `site/src/sections/content.test.ts:166-181`.
- **Риск**: импорт ещё не существующего экспорта роняет `tsc -b`
  (Факт пункта 6), поэтому между этим шагом и `snapshot-content` typecheck и
  build не запускаются.
- **Проверка**: red: `npm --prefix site test -- src/sections/content.test.ts` —
  тест «снимок в подвале» падает на `SNAPSHOT` = `undefined` (TypeError при
  чтении `date`), остальные тесты файла зелёные → green после
  `snapshot-content`.
- **dependsOn**: —

### Step 3 — repo-ref-v1
- **Цель**: перевести все ссылки сайта на тег.
- **Файл**: `site/src/repo.ts`
- **Изменение**: `REPO_REF` → `'v1'`. Других мест с ref нет:
  `grep -rn -E "REPO_REF|blob/" site/src --include='*.ts' --include='*.tsx'`
  (без тестов) даёт только `site/src/repo.ts:2` и `:10`. Все потребители
  (`PipelineScheme.tsx`, `BuildStory.tsx`, `App.tsx`) идут через
  `repoFileUrl`.
- **Референс**: `site/src/repo.ts:1-16`.
- **Риск**: тесты `site/src/pipeline/steps.test.ts` и
  `site/src/sections/build-story.test.ts:63` проверяют только префикс
  `${REPO_URL}/blob/` — смена ref их не ломает.
- **Проверка**: `npm --prefix site test -- src/repo.test.ts
  src/pipeline/steps.test.ts src/sections/build-story.test.ts` — зелёные
  (тест «снимок в подвале» красный до `snapshot-content`, полный прогон
  здесь не критерий).
- **dependsOn**: test-repo-ref-v1

### Step 4 — snapshot-content
- **Цель**: завести данные строки о снимке.
- **Файл**: `site/src/sections/content.ts`
- **Изменение**: экспорт `SNAPSHOT: { label, date, ref, href }`. `date` —
  `'2026-10-11'` (как в README), `ref` — `REPO_REF`,
  `href` — `${REPO_URL}/tree/${REPO_REF}`, `label` — текст вида «Снимок ядра
  конвейера». Импорт `REPO_REF` рядом с `REPO_URL`
  (`site/src/sections/content.ts:1`).
- **Референс**: `AUTHOR` — `site/src/sections/content.ts:106-115`.
- **Риск**: дата разойдётся с README — ловит тест `test-snapshot-footer`.
- **Проверка**: тест `test-snapshot-footer` зелёный.
- **dependsOn**: test-snapshot-footer, repo-ref-v1

### Step 5 — footer-snapshot
- **Цель**: показать дату снимка и тег на сайте.
- **Файл**: `site/src/components/SiteFooter.tsx`
- **Изменение**: под списком ссылок абзац: `SNAPSHOT.label`, дата
  `SNAPSHOT.date`, ссылка на `SNAPSHOT.href` с текстом «тег <ref>». Стили —
  существующие `.site-footer` (`site/src/App.css:131-158`), новых классов нет.
- **Референс**: `site/src/components/SiteFooter.tsx:1-20`.
- **Риск**: на 360px строка не переносится — проверяется в
  `browser-acceptance`.
- **Проверка**: `npm --prefix site run typecheck` и `npm --prefix site run lint`
  — exit 0.
- **dependsOn**: snapshot-content

### Step 6 — roadmap-decisions
- **Цель**: записать в роадмап порядок выпуска до тега.
- **Файл**: `docs/roadmaps/2026-10-11_1236_public-showcase.md`
- **Изменение**: в конец «Решений» — строка о порядке выпуска v1. Роадмап,
  план, `-verify.md` и `-review.md` пункта 7 коммитятся до тега, в тот коммит,
  на который тег ставится, чтобы `v1` содержал весь след. Мануал пункта 7 и
  итог проверки тега идут отдельным коммитом после тега. В этом коммите в
  роадмапе меняется только строка статуса пункта 7 (замена в той же строке) и
  дописывается строка в самый конец «Решений». Причина: фрагменты
  `build-roadmap-*` и `build-fact-*`
  (`site/src/pipeline/fragment-sources.ts:107-126`) вырезаются по строкам
  текущего файла, ссылки ведут на `v1`, а сдвиг строк выше фрагментов уводит
  номера. Факты пункта 7, известные до тега, синхронизирует `/implement` в
  этом же коммите.
- **Референс**: «Решения» роадмапа, строки 295-334.
- **Риск**: запись выше фрагментов `build-roadmap-*` в коммите после тега
  сдвигает строки; это ловит сравнение `dist` в `post-tag-roadmap`.
- **Проверка**: `npm --prefix site test -- src/sections` зелёный (срез
  «Фактов» и фрагменты не задеты); `npm --prefix site run build` exit 0
  (маркеры фрагментов на месте).
- **dependsOn**: snapshot-content

### Step 7 — repo-checks
- **Цель**: прогнать проверки до коммита, на который ставится тег.
- **Файл**: — (проверка, правок нет)
- **Изменение**: команды из корневого `CLAUDE.md` и проверки бандла.
- **Референс**: `CLAUDE.md` («Проверки»).
- **Риск**: URL с `blob/v1/<путь>` вне inline-кода в этом плане, в `-verify.md`
  или в `-review.md` роняет `check-links` до тега: в документах пункта 7 такие
  URL пишутся только в обратных кавычках.
- **Проверка**: `npm --prefix site run typecheck`, `lint`, `test`, `build` —
  exit 0; `scripts/check-leaks.sh` — 0 совпадений;
  `scripts/check-harness-refs.sh`, `scripts/check-links.sh` — 0 нарушений;
  `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → `0`;
  `git rev-parse -q --verify 'v1^{commit}'` пуст (тега ещё нет).
- **dependsOn**: footer-snapshot, roadmap-decisions

### Step 8 — browser-acceptance
- **Цель**: принять ссылки и подвал в браузере.
- **Файл**: — (проверка, правок нет)
- **Изменение**: `npm --prefix site run build`,
  `npm --prefix site run preview -- --port 4180 --strictPort` в фоне;
  `http://localhost:4180/claude-code-harness/` через Chrome-расширение.
- **Референс**: шаг `browser-acceptance` плана
  `docs/plans/2026-10-11_1503_public-showcase-6-build-story.md`.
- **Риск**: окно не сужается — 360px проверяется в iframe (Факт пункта 3).
- **Проверка**:
  1. все `a[href^="https://github.com/stels54/claude-code-harness/"]`,
     кроме корня репозитория, содержат `/blob/v1/` или `/tree/v1`, ни одна —
     `/main/`; отдельно: ссылки шагов схемы (после раскрытия) и все ссылки
     раздела «Как собран этот сайт» (`figcaption`, план раздела) —
     `/blob/v1/`. Ссылки схемы накапливаются при последовательном раскрытии
     шагов: открыт один шаг за раз, ссылки остальных из DOM удаляются
     (`site/src/components/PipelineScheme.tsx:77`, `:84`). Список путей
     сохраняется в scratchpad для `post-tag-links`;
  2. подвал: строка снимка с датой `2026-10-11` и ссылкой «тег v1» на
     `/tree/v1`; ссылка на репозиторий на месте;
  3. iframe 360px — `documentElement.scrollWidth <= innerWidth`;
  4. `read_network_requests` — только `localhost:4180`, ошибок в консоли нет.
  Без Chrome-расширения — ⏸️ DEFERRED «нужен браузер».
- **dependsOn**: repo-checks

### Step 9 — tag-v1-push
- **Цель**: выпустить тег на коммит с переведёнными ссылками.
- **Файл**: — (действие тимлида)
- **Изменение**: после коммита пункта 7 (код, роадмап, план, `-verify.md`,
  `-review.md`) тимлид ставит тег `v1` на этот коммит и пушит `main` и тег
  (`git rev-parse main` равен `<хеш>`; `git tag v1 <хеш>`;
  `git push --atomic origin main v1` — ветка и тег публикуются вместе или
  никак; pre-push хук гоняет `check-leaks`). Исполнитель тег не ставит и не пушит — останавливается и
  передаёт хеш.
- **Референс**: — (действие пользователя, образца в коде нет)
- **Риск**: тег поставлен не на тот коммит — ловит `post-tag-links` (п. 1).
- **Проверка**: ⏸️ DEFERRED до ответа тимлида; итог — в «Решения» роадмапа
  в шаге `post-tag-roadmap`.
- **dependsOn**: repo-checks, browser-acceptance

### Step 10 — post-tag-links
- **Цель**: убедиться, что ссылки живые на теге и что Pages собрал коммит с
  тегом.
- **Файл**: — (проверка, правок нет)
- **Изменение**: проверки после ответа тимлида.
- **Референс**: `scripts/check-links.sh:53` (ref разрешается локально,
  тег — тоже commit-ish).
- **Риск**: GitHub отвечает 429 на частые запросы — пауза между curl;
  workflow ещё идёт — ждать завершения.
- **Проверка**:
  1. `git rev-parse 'v1^{commit}'` равен хешу коммита пункта 7;
     `git ls-remote origin refs/tags/v1 'refs/tags/v1^{}'` — для лёгкого
     тега хеш `refs/tags/v1`, для аннотированного — хеш `refs/tags/v1^{}`
     равен тому же хешу;
  2. `scripts/check-links.sh` — 0 нарушений при существующем теге;
  3. для каждого пути из списка `browser-acceptance` (нет списка — собрать
     заново тем же способом на preview коммита `v1`; без списка пункт не
     закрывается): путь без `?plain=1` и
     `#L…` → `git cat-file -t v1:<путь>` = `blob` (для `/tree/v1` —
     `git cat-file -t 'v1^{tree}'` = `tree`); `curl -s -o /dev/null -w
     '%{http_code}'` по URL без якоря → `200`;
  4. `gh run list --workflow Pages --json headSha,conclusion,status` — run с
     `headSha` = хешу `v1`, `conclusion: success`;
     `curl -s -o /dev/null -w '%{http_code}'
     https://stels54.github.io/claude-code-harness/` → `200`; имена
     `assets/index-*.js` и `*.css` в опубликованном HTML совпадают с `dist`,
     собранным из `v1` (сборка в `git worktree`), — опубликован бандл тега.
  Нет доступа к сети или тега нет — ⏸️ DEFERRED.
- **dependsOn**: tag-v1-push

### Step 11 — post-tag-roadmap
- **Цель**: закрыть пункт без сдвига строк, из которых вырезаны фрагменты.
- **Файл**: `docs/roadmaps/2026-10-11_1236_public-showcase.md`
- **Изменение**: строка «**Статус**» пункта 7 → ✅ заменой в той же строке;
  в самый конец «Решений» (ниже фрагментов `build-roadmap-*`) — строка с
  итогом `post-tag-links`: хеш `v1`, ссылки на тег живые по git и curl, run
  Pages. Больше в роадмапе ничего не меняется.
- **Референс**: `site/src/pipeline/fragment-sources.ts:107-126`.
- **Риск**: правка выше фрагментов сдвигает строки, и после следующего push
  сайт расходится с `v1`.
- **Проверка**: `git diff v1 -- docs/roadmaps/2026-10-11_1236_public-showcase.md`
  — одна заменённая строка статуса и добавленные строки после последней
  строки «Решений» в `v1`. `dist` из `v1` (сборка в `git worktree`) и из HEAD
  совпадают побайтно (`diff -r`); результат записывается в мануал пункта 7.
  `npm --prefix site test`, `scripts/check-links.sh`, `scripts/check-leaks.sh` —
  зелёные.
- **dependsOn**: post-tag-links

## Граф зависимостей
```
test-repo-ref-v1 → repo-ref-v1 ─┐
test-snapshot-footer ───────────┴→ snapshot-content → footer-snapshot ─┐
                                   snapshot-content → roadmap-decisions ┴→ repo-checks
repo-checks → browser-acceptance → tag-v1-push → post-tag-links → post-tag-roadmap
```

## Параллельные группы
- Группа A: test-repo-ref-v1, test-snapshot-footer
- Группа B (после snapshot-content): footer-snapshot, roadmap-decisions

## Финальный проход
- repo-checks, browser-acceptance — до коммита, на который ставится тег.
- tag-v1-push, post-tag-links, post-tag-roadmap — после коммита, с действием
  тимлида; мануал пункта 7 — после `post-tag-roadmap`, тем же коммитом.

## Критерии приёмки
- Все ссылки сайта на файлы репозитория (схема, «Как собран этот сайт»,
  README в шапке) ведут на `blob/v1/`, ни одна — на `main`
  (`browser-acceptance`).
- В подвале сайта видна дата снимка, та же, что в README, и ссылка на тег;
  README ссылается на сайт, сайт — на репозиторий (`test-snapshot-footer`,
  `browser-acceptance`).
- Тег `v1` стоит на коммите с переведёнными ссылками и содержит роадмап,
  план, `-verify.md` и `-review.md` пункта 7 (`tag-v1-push`,
  `post-tag-links` п. 1).
- Ссылки на тег живые: `scripts/check-links.sh` — 0 нарушений, каждый путь
  есть в `v1` по git и отвечает 200 на GitHub (`post-tag-links`).
- Опубликованный сайт собран из коммита с тегом: run Pages с `headSha` = `v1`
  и опубликованный бандл совпадает с `dist` из `v1` (`post-tag-links` п. 4).
  После push коммита с мануалом сайт пересобирается из `main`: критерий
  тогда держится на идентичности артефакта — `dist` из `v1` и HEAD
  совпадают побайтно (`post-tag-roadmap`), а не на происхождении из того же
  коммита.

## Не делаем
- Не трогаем ссылки `blob/main/…` в документах прогона (`docs/plans/`,
  `docs/manual/`): это след прошлых пунктов, сайт вырезает из них фрагменты.
- README не меняем: в нём нет ссылок `blob/main/`, дата снимка, ссылка на
  сайт и на репозиторий уже есть (`README.md:164-169`).
- Не меняем `scripts/check-links.sh`: теги он уже разрешает через
  `git rev-parse "$ref^{commit}"`; ссылки, собранные `repoFileUrl`, он не
  видит (Факт пункта 3), их проверяют `post-tag-links` и тесты путей.
- Не меняем workflow Pages (публикация по тегам — отклонённый вариант).
- Не пушим и не ставим тег — это действие тимлида.
- Цифры статистики на сайт не добавляем; дата снимка — не статистика.

## Решения
- Роадмап и фрагменты сайта после тега: если дописать «Факты» после тега и
  запушить коммит, сайт пересобирается из `main`, ссылки на строки «Решений»
  уезжают относительно `v1`, а опубликованный сайт собран не из коммита с
  тегом. Выбран вариант: все факты, известные до тега, — в коммит с тегом.
  После тега в роадмапе меняется только строка статуса пункта 7 (замена в
  той же строке, без сдвига) и дописывается в самый конец «Решений», ниже
  всех фрагментов, итог проверки тега (curl, run workflow). Перед коммитом
  после тега `dist` из `v1` (git worktree) сравнивается с `dist` из HEAD
  побайтно, результат записывается в мануал или отчёт. (Ответ тимлида: 1b.)
- Роадмап, план, `-verify.md` и `-review.md` пункта 7 коммитятся до тега, в
  тот коммит, на который ставится тег, чтобы `v1` содержал весь след; мануал
  пункта 7 ложится после тега отдельным коммитом (постановка тимлида).
- Кросс-ревью плана (Codex) → отложено: лимит Codex до 18:04. План уходит в
  `/implement` сразу, кросс-ревью прогоняется после снятия лимита, до
  `/code-review`; принятые правки вносятся в план и код (ответ тимлида 1c).
- Кросс-ревью плана (Codex, после снятия лимита) → приняты все шесть
  замечаний правкой плана, код не менялся: проверка `repo-ref-v1` сужена до
  своих тестов, `roadmap-decisions` зависит от `snapshot-content`;
  `--atomic` и сверка `main` с хешем в `tag-v1-push`; запрос
  `refs/tags/v1^{}` и явный HTTP-код в `post-tag-links`; накопление ссылок
  схемы и повторный сбор списка; сверка опубликованного бандла с `dist` из
  `v1`; критерий «собран из тега» после коммита с мануалом держится на
  идентичности артефакта (в рамках ответа тимлида 1b).

## Допущения
- Дата снимка выводится в подвале, а не в пункте «Снимок, а не рабочая
  версия» раздела «Ограничения»: там действует тест «нет цифр», а подвал под
  него не попадает, исключение для даты не нужно.
- Ссылка «тег v1» в подвале ведёт на `/tree/v1` — корень репозитория на теге.
- Тег лёгкий или аннотированный — на усмотрение тимлида; проверки
  разыменовывают его через `^{commit}`.
- Новые стили для строки снимка не нужны — хватает `.site-footer`.
