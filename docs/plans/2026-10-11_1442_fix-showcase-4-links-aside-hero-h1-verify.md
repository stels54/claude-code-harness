# Verify: Fix: дефекты ручного тестирования пункта 4 — ссылки на строки, «Вне цепочки», иллюстрация, заголовок, мануал
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1442_fix-showcase-4-links-aside-hero-h1.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 test-repo-plain | Контракт `?plain=1` в `repo.test.ts` | ✅ | Два ожидания изменены на `?plain=1#L…`, добавлен тест не-markdown файла, тест «без строк» не тронут. `npm --prefix site test -- src/repo.test.ts` → `Tests  5 passed (5)` (red-фаза по конечному состоянию не проверяется) |
| 2 repo-plain | `?plain=1` только для `.md` со строками | ✅ | `site/src/repo.ts`: `base = path.endsWith('.md') ? url?plain=1 : url`. Браузер: href документа `/plan` = `…/blob/main/docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md?plain=1#L95-L106`, «Файл команды» = `…/blob/main/harness/commands/plan.md` |
| 3 aside-row-order | Кнопки «Вне цепочки» в ряд, панель под рядом | ✅ | CSS заменён по плану. iframe 1100px, при раскрытии каждого из трёх шагов: кнопки top=1617, left 18/372/726 (`/verify`, `/plan-fix`, `/fix-tests`), ширина 341 (≈1049/3); панель top=1686 > низа кнопок 1664, ширина 1049 = ширине `.scheme-aside`. iframe 360px: кнопки столбцом, панель `/plan-fix` (2453–3124) между кнопкой `/plan-fix` (низ 2444) и `/fix-tests` (верх 3147), `scrollWidth <= innerWidth` → true |
| 4 hero-art-inside-arch | Звезда и тарелка внутри арки | ✅ | Координаты как в плане, clipPath не изменён (`M110 300 V140 A210 120 0 0 1 530 140 V300 Z`). iframe 1280px, getBBox: звезда y=74 > дуги 63.6; тарелка y=87 > 68.8; купол y=85 > 65. Скриншот: звезда и тарелка с куполом целиком под дугой, у края ничего не торчит |
| 5 h1-nowrap | «ИИ-агентами» без разрыва | ✅ | span с `whiteSpace: 'nowrap'`, `textContent` h1 = «Конвейер разработки с ИИ-агентами». iframe 1200px: span rects=1, высота h1 121px при line-height 60.48px (2 строки). iframe 360px: span rects=1, h1 переносится по словам, без горизонтального скролла. `npm --prefix site test` зелёный |
| 6 manual-fixes | Правки мануала пункта 4 | ✅ | §1 без «растягивается» (единственное вхождение в §5.3 — «не растягивается»), §4.1 — 304/favicon, §4.5 — три Shift+Tab, §4.7 — `?plain=1` в таблице и тексте (строки 179–190), §5.1 — числа, §5.3 — порядок и нерастягивание, §7 — сниппет. Сниппет §7 выполнен в консоли стенда: появились iframe 360 и 1280 (innerWidth 360/1280, h1 загружен). Сценарий §5.1 прогнан: `Test Files  1 failed \| 5 passed (6)`, `Tests  27 passed (27)` — совпадает с мануалом; маркер возвращён, `git status --short site/src/pipeline/fragment-sources.ts` пуст. check-links / check-leaks — 0 |

## Тесты
- [x] Unit: `npm --prefix site test` — `Test Files  6 passed (6)` / `Tests  82 passed (82)`, exit 0
- [x] Typecheck: `npm --prefix site run typecheck` — exit 0
- [x] Lint: `npm --prefix site run lint` — exit 0
- [x] Build: `npm --prefix site run build` — `✓ built in 156ms`, exit 0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit 0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit 0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit 0

## Браузерная приёмка
Стенд: `http://localhost:4176/claude-code-harness/` (preview на 4176 уже был запущен и отдавал текущий `site/dist`: `index-DKmSq5J0.js`, `index-Vx3Nh0th.css` — те же хэши, что у свежей сборки).

| Шаг | URL | Действие | Результат |
|---|---|---|---|
| 2 | стенд, окно 1440px | раскрыть `/plan`, прочитать href | документ `…?plain=1#L95-L106`, файл команды без `?plain=1` |
| 3 | iframe 1100px | раскрыть по очереди `/plan-fix`, `/verify`, `/fix-tests` | кнопки на одном top, порядок verify → plan-fix → fix-tests, ширина ≈ трети; панель на всю ширину ряда под кнопками |
| 3 | iframe 360px | раскрыть `/plan-fix` | столбец, панель между `/plan-fix` и `/fix-tests`, без горизонтального скролла |
| 4 | iframe 1280px | скриншот шапки + getBBox | звезда и вторая тарелка внутри арки |
| 5 | iframe 1200px / 360px | getClientRects span, высота h1 | 1 rect; 2 строки на 1200px; перенос по словам на 360px, без горизонтального скролла |
| 6 | стенд | сниппет §7 мануала в консоли | iframe 360 и 1280 появляются |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| typecheck, lint, test, build — exit 0 | ✅ | вывод команд выше (82 passed, exit 0 у всех) |
| check-leaks, check-harness-refs, check-links — 0 нарушений | ✅ | `0 совпадений` / `0 нарушений` / `0 нарушений`, exit 0 |
| Браузерные проверки шагов 2–5 (1100, 1200, 1280, 360px) | ✅ | таблица браузерной приёмки: замеры getBoundingClientRect/getBBox/getClientRects и скриншот 1280px |
| Ссылка на документ из `/plan` содержит `?plain=1#L95-L106` | ✅ | href из DOM стенда: `…/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md?plain=1#L95-L106` |

## Итог
PASSED

## Что требует внимания
- Не дефект: фактическое открытие ссылки на GitHub (подсветка строк в режиме `?plain=1`) не проверялось; проверен только href. Ссылки ведут на `main`, до push строки там могут не совпадать.
