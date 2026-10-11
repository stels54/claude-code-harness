# Verify: Выпуск v1 — тег и постоянные ссылки
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1556_public-showcase-7-release-v1.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 test-repo-ref-v1 | Тест: ссылки ведут на тег `v1` | ✅ | `site/src/repo.test.ts`: `blob` → `…/blob/v1`, `REPO_REF` → `'v1'`, литерал заменён на `${blob}/harness/commands/plan.md`; `grep -c 'claude-code-harness/blob/v1/' site/src/repo.test.ts` → `0`; тесты зелёные. Red-фаза по конечному состоянию не проверяется |
| 2 test-snapshot-footer | Тест строки снимка | ✅ | Тест «снимок в подвале» в `site/src/sections/content.test.ts`: дата из README регуляркой `^- Дата снимка: (\d{4}-\d{2}-\d{2})\.$`, `ref === REPO_REF`, `href === ${REPO_URL}/tree/v1`, label непустой и без `SDD/Spec-Driven`; зелёный |
| 3 repo-ref-v1 | Перевести ссылки на тег | ✅ | `site/src/repo.ts:2` — `REPO_REF = 'v1'`; grep по `site/src` (без тестов) — других ref нет, только `repo.ts:2`, `:10` и импорт/использование в `content.ts` |
| 4 snapshot-content | Данные строки снимка | ✅ | `SNAPSHOT` в `site/src/sections/content.ts:117-122`: label «Снимок ядра конвейера», date `2026-10-11`, ref `REPO_REF`, href `${REPO_URL}/tree/${REPO_REF}`; импорт `REPO_REF` в строке 1 |
| 5 footer-snapshot | Показать снимок в подвале | ✅ | `site/src/components/SiteFooter.tsx`: абзац «{label} от {date}, тег {ref}» под списком, новых классов нет; typecheck и lint — exit 0 |
| 6 roadmap-decisions | Порядок выпуска в «Решения» | ✅ | Роадмап: строка добавлена в конец «Решений» (после строки 334, перед «Допущения»); выше изменены только строки статуса (`📝`) и «План» пункта 7 заменой на месте — сдвига нет. `test -- src/sections` и `build` зелёные |
| 7 repo-checks | Проверки до коммита с тегом | ✅ | Все команды — exit 0 / 0 нарушений, `SDD/Spec-Driven` в бандле — 0, тега `v1` нет (см. «Тесты») |
| 8 browser-acceptance | Ссылки и подвал в браузере | ✅ | См. «Браузерная приёмка»; список href (52 шт.) сохранён в scratchpad сессии как `v1-hrefs.txt` |
| 9 tag-v1-push | Тег `v1` и push | ⏸️ DEFERRED | Действие тимлида после коммита пункта 7; тега нет (`git rev-parse -q --verify 'v1^{commit}'` пуст, rc=1) |
| 10 post-tag-links | Ссылки живые на теге, Pages собран из тега | ⏸️ DEFERRED | Зависит от шага 9: нужен тег в локальном клоне и на `origin`, доступ к GitHub (curl, `gh`). Предварительно: все 51 путь из списка href есть в `HEAD` (`git cat-file -t HEAD:<путь>` = `blob`) |
| 11 post-tag-roadmap | Закрыть пункт без сдвига строк | ⏸️ DEFERRED | Выполняется после шага 10 отдельным коммитом |

## Тесты
- [x] Typecheck: `npm --prefix site run typecheck` — `> tsc -b`, exit=0
- [x] Lint: `npm --prefix site run lint` — `> eslint .`, exit=0
- [x] Unit: `npm --prefix site test` — `Test Files  7 passed (7)`, `Tests  99 passed (99)`, exit=0
- [x] Unit (срез): `npm --prefix site test -- src/repo.test.ts src/sections` — `Test Files  3 passed (3)`, `Tests  33 passed (33)`
- [x] Build: `npm --prefix site run build` — `dist/assets/index-ZQu-aqtT.js 292.39 kB`, `✓ built in 304ms`, exit=0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений` (скрипт обходит и неотслеживаемые файлы, план пункта 7 включён)
- [x] `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` — `0`
- [x] `git rev-parse -q --verify 'v1^{commit}'` — пусто, rc=1

## Браузерная приёмка

Стенд: `npm --prefix site run preview -- --port 4180 --strictPort`, Chrome-расширение.

| Шаг | URL | Действие | Результат |
|-----|-----|----------|-----------|
| 8.1 | `http://localhost:4180/claude-code-harness/` | Клик по всем 9 кнопкам схемы, сбор всех `a[href^="https://github.com/stels54/claude-code-harness"]` | 52 уникальных href; кроме корня репозитория все содержат `/blob/v1/` или `/tree/v1`; с `/main/` — 0. Ссылки шагов схемы (15) — все `/blob/v1/`; ссылки `#build` (41) — все `/blob/v1/`; README в шапке — `…/blob/v1/README.md` |
| 8.2 | то же | Чтение `footer` | Абзац «Снимок ядра конвейера от 2026-10-11, тег v1»; ссылка «тег v1» → `…/tree/v1`; «Репозиторий конвейера» → корень репозитория на месте |
| 8.3 | то же | iframe шириной 360px | `scrollWidth` 357 = `innerWidth` 357 (ширина за вычетом рамки), горизонтального переполнения нет |
| 8.4 | то же (после перезагрузки) | `read_network_requests`, `read_console_messages` | 9 запросов, все `localhost:4180` (200/304); ошибок в консоли нет |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| Все ссылки сайта на файлы репозитория ведут на `blob/v1/`, ни одна — на `main` | ✅ | Браузер 8.1: 52 href, нарушений 0, `/main/` — 0; `repo.test.ts` зелёный |
| В подвале дата снимка = README и ссылка на тег; README → сайт, сайт → репозиторий | ✅ | Браузер 8.2; тест «снимок в подвале» сверяет дату с `README.md` («- Дата снимка: 2026-10-11.»); `README.md:167-168` — ссылки на сайт и репозиторий; в подвале ссылка «Репозиторий конвейера» |
| Тег `v1` на коммите с переведёнными ссылками и содержит роадмап, план, `-verify.md`, `-review.md` | ⏸️ DEFERRED | Тега нет, коммит пункта 7 ещё не сделан; ставит тимлид |
| Ссылки на тег живые: `check-links` 0, путь есть в `v1` по git, 200 на GitHub | ⏸️ DEFERRED | Нужен тег и сеть. До тега: `check-links` 0 нарушений, все пути из списка href есть в `HEAD` |
| Опубликованный сайт собран из коммита с тегом; `dist` из `v1` и HEAD совпадают | ⏸️ DEFERRED | Нужны тег, push, run Pages и коммит после тега |

## Итог
PASSED — с DEFERRED по шагам 9–11 и критериям 3–5.

Часть до тега (шаги 1–8, критерии 1–2) выполнена полностью. Шаги 9–11 по плану
выполняются после коммита пункта 7 и действия тимлида. По правилу DEFERRED без
подтверждения пользователя коммит не делать: нужен ответ тимлида. По плану
коммит пункта 7 — как раз тот, на который ставится тег.

## Что требует внимания
- Шаг 6, роадмап: план просит «синхронизировать факты пункта 7, известные до тега»
  в этом же коммите. Новых записей в «Фактах» нет. Если факты есть, их нужно
  дописать до коммита без сдвига строк выше фрагментов `build-fact-*`/`build-roadmap-*`
  (`site/src/pipeline/fragment-sources.ts:107-126`).
- Шаги 9–11: после тега прогнать `post-tag-links` по списку href из 8.1 (52 шт.,
  корень и `/tree/v1` включены).
