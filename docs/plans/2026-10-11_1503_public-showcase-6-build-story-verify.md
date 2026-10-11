# Verify: Раздел «Как собран этот сайт»
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1503_public-showcase-6-build-story.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 build-fragment-sources | вырезать фрагменты прогона плагином | ✅ | `end: string \| null`; все 32 ключа из таблицы плана с маркерами плана в `site/src/pipeline/fragment-sources.ts`; typecheck/build exit 0; `test -- steps fragments` — 2 файла, 60 тестов зелёные |
| 2 test-build-story | контракт данных раздела | ✅ | `site/src/sections/build-story.test.ts` — 11 тестов, покрывают проверки 1–10 плана (проверка 4 разбита на два теста); зелёные. Red-фаза не проверяется |
| 3 build-story-data | тексты и привязка фрагментов | ✅ | `site/src/sections/build-story.ts`: 8 стадий, события и ключи фрагментов по плану. Отличие: `SELF_PLAN.label` — «план этого раздела» (в плане «План этого раздела»), стоит в середине фразы |
| 4 build-story-component | показать раздел | ✅ | `site/src/components/BuildStory.tsx`: `section#build`, `h2#build-title`, `h3`/`info-item`/`h4`, `figure.step-fragment` с `figcaption`+ссылкой и `details/summary`/`pre`, абзац со ссылкой на план; typecheck/lint exit 0 |
| 5 build-story-styles | стили на существующих токенах | ✅ | `site/src/App.css`: правила `.build-stage`, `.build-stage-lead`, `.build-events`, `.build-self` (селекторы только классами раздела); `.hero-note` удалено; `grep -rn hero-note site/src` — пусто; build exit 0 |
| 6 app-layout | заменить заглушку разделом | ✅ | `site/src/App.tsx`: заглушка удалена, ссылка `#build` между «Ограничения» и «Автор», `<BuildStory />` после `<LimitsSection />`; `grep -c 'в работе' site/src/App.tsx` → 0; check-links — 0 нарушений |
| 7 repo-checks | проверки репозитория и бандла | ✅ | все команды — см. «Тесты» |
| 8 browser-acceptance | приёмка в браузере | ✅ | сценарии 1–6 выполнены (см. «Браузерная приёмка»); пункт 7 — палитра/шрифты визуально ок, тёмная тема по плану — человеку |

## Тесты
- [x] Typecheck: `npm --prefix site run typecheck` — `typecheck exit=0`
- [x] Lint: `npm --prefix site run lint` — `lint exit=0`
- [x] Unit: `npm --prefix site test` — `Test Files  7 passed (7)` / `Tests  95 passed (95)`, `test exit=0`
- [x] Unit (шаг 3): `npm --prefix site test -- build-story` — `Test Files  1 passed (1)` / `Tests  11 passed (11)`
- [x] Unit (шаг 1): `npm --prefix site test -- steps fragments` — `Test Files  2 passed (2)` / `Tests  60 passed (60)`
- [x] Build: `npm --prefix site run build` — `✓ built in 262ms`, `dist/assets/index-BKv-yPFw.js 289.35 kB`, `build exit=0`
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit 0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit 0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit 0 (скрипт обходит и неотслеживаемые файлы: `git ls-files --cached --others --exclude-standard`)
- [x] `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → `0`
- [x] `grep -c 'Отклонение при /implement' site/dist/assets/*.js` → `0`

## Браузерная приёмка
Стенд: `http://localhost:4177/claude-code-harness/` (порт 4177 уже держал `vite preview --port 4177 --strictPort` из `site/` этого репозитория; отдаёт текущий `dist` — тот же бандл `index-BKv-yPFw.js`, что и свежая сборка).

| Шаг | URL | Действие | Результат |
|-----|-----|----------|-----------|
| 1 | `/claude-code-harness/` | поиск «в работе» в `body.innerText`; клик по ссылке «Как собран этот сайт» в шапке | строки нет (`wip:false`); `location.hash = #build`, `#build.getBoundingClientRect().top = 0.44` — раздел вверху экрана |
| 2 | то же | список `h2` | Зачем, Конвейер, Устройство, Ограничения, Как собран этот сайт, Автор (в `footer`, последний) |
| 3 | то же | `h3` в `#build`, `figure`, ссылки `figcaption`, ссылка на план | 8 `h3` по порядку стадий; 39 `figure` = 39 фрагментов в данных; ссылок без `/blob/main/` или `?plain=1#L` — 0; ссылка `…/blob/main/docs/plans/2026-10-11_1503_public-showcase-6-build-story.md` есть |
| 4 | `/#build` | клик в страницу, фокус на первой ссылке `figcaption`, Tab, Enter; затем клик мышью по второму `summary` | Tab → `SUMMARY`, `:focus-visible`, outline `solid 2px` (виден на скриншоте); Enter → `details.open = true`; клик → второй `details.open = true` |
| 5 | iframe 360px и 1280px | раскрыть все 39 `details` | 360: `scrollWidth 345 <= innerWidth 360`, элементов за правым краем — 0; 1280: `scrollWidth 1265 <= 1280`; скриншоты сняты |
| 6 | то же | `read_network_requests`, консоль | 31 запрос — все `http://localhost:4177/...` или `data:`; ошибок консоли сайта нет (единственная ошибка — со страницы github.com, куда вкладка случайно перешла по Enter на ссылке README при подборе фокуса) |
| 7 | то же | визуально | палитра и шрифты как у остальных разделов, `summary` бирюзовые; тёмная тема — ⏸️ DEFERRED, человеку по мануалу (так задано планом) |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| Раздел после «Ограничений» со стадиями по порядку и «Что проверялось руками»; заглушки нет; якорь шапки ведёт к разделу | ✅ | браузер: порядок `h2`, 8 `h3`, `wip:false`, клик → `#build` в видимой области; `grep -c 'в работе'` → 0 |
| Фрагменты вырезаны при сборке, совпадают со строками, имеют ссылку; источник в `docs/plans/`; планы/verify/review пунктов 3–5 и двух фиксов показаны | ✅ | тесты «фрагменты совпадают со строками файлов и имеют ссылку», «у каждого события есть источник в docs/plans/», «показан прогон пунктов сайта и фикс-планов» — зелёные; build exit 0 (все маркеры найдены); 39 ссылок с `?plain=1#L` в браузере |
| Нет выдуманного: verify — PASSED, PARTIAL по «Решениям», `отклонено: 0`, отложенное не выдано за выполненное, собственный прогон — только ссылка | ✅ | тесты «итоги проверки — PASSED, PARTIAL показан», «в отчётах ревью диффа нет отклонённых замечаний», «собственный прогон — только ссылкой» — зелёные; текст `human-deferred` в `build-story.ts`: «Отметки о результате в документах прогона нет» |
| Нет SDD/Spec-Driven; leaks/links/harness-refs — 0; typecheck/lint/test/build проходят | ✅ | тест «нет запрещённых названий»; `grep -c` бандла → 0; вывод скриптов и exit 0 — раздел «Тесты» |
| 360/1280 без горизонтальной прокрутки, раскрытие мышью и клавиатурой, запросы только к своему адресу | ✅ | браузер, шаги 4–6 |
| Тёмная тема и опубликованный адрес — человеком по мануалу | ⏸️ DEFERRED | нужен человек: расширение не эмулирует `prefers-color-scheme`, опубликованный адрес до push не содержит раздела |

## Итог
PASSED (с DEFERRED: тёмная тема и опубликованный адрес — человеку по мануалу, как задано планом).

DEFERRED-пункты пользователем не подтверждены — коммит не делать до подтверждения.

## Что требует внимания
- `site/src/sections/build-story.ts`, шаг build-story-data: `SELF_PLAN.label` — «план этого раздела», в плане — «План этого раздела». Стоит в середине фразы «Этот раздел собран тем же конвейером: …», расхождение косметическое.
- Шаг browser-acceptance: preview на 4177 не запускался заново — порт держал уже запущенный `vite preview` этого же `site/`, отдающий текущий `dist`.
