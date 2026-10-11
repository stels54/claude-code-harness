# Verify: Разделы «Зачем», «Устройство», «Ограничения» и подвал
**Дата**: 2026-10-11 14:35
**План**: docs/plans/2026-10-11_1425_public-showcase-5-why-device-limits-footer.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 test-sections-content | контракт текстов разделов | ✅ | `site/src/sections/content.test.ts` покрывает п. 1–6: id и порядок, таблица якорей `DEVICE_FACTS` с нормализацией «Фактов», запрет `SDD`/`Spec-Driven`, цифр, `спецификац` вне `no-spec-stage`, адреса `AUTHOR` и `hh.`. 11 тестов файла зелёные. Red-фаза по конечному состоянию не проверяется |
| 2 sections-content | тексты в модуле данных | ✅ | `site/src/sections/content.ts`: типы `SectionItem`, `Section`, `AuthorLink`, константы `WHY`, `DEVICE`, `LIMITS`, `AUTHOR`, без DOM-API; тест зелёный, typecheck exit 0. Утверждения `DEVICE` сверх якорей сверены с «Фактами» (Codex в двух местах, хуки `notify.sh`/`pipeline-clock.sh`); «ставится копированием в ~/.claude» предписано самим планом и подтверждено `README.md` (`cp harness/... ~/.claude/...`) |
| 3 sections-components | разметка трёх разделов | ✅ | `site/src/components/InfoSections.tsx`: `WhySection`, `DeviceSection`, `LimitsSection` с литеральными `id="why|device|limits"` и `id="…-title"`, `section`/`section-lead`, `<ul>` с `<h3>` и `<p>`; файл экспортирует только компоненты (`SectionItems` не экспортируется). typecheck и lint exit 0 |
| 4 site-footer | подвал «Автор» | ✅ | `site/src/components/SiteFooter.tsx`: `<footer id="author" className="site-footer">`, заголовок «Автор», `AUTHOR.name`, ссылки с `rel="noreferrer"`, без фото и биографии. typecheck и lint exit 0 |
| 5 sections-styles | стиль пунктов и подвала | ✅ | `site/src/App.css`: `.info-items` — `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))`, `.info-item` с `min-width: 0`, заголовок пункта — `h3` (глобально `--font-display`, `site/src/index.css:112-115`), `.site-footer` — `max-width: 64rem`, `margin: 0 auto`, `padding … 1rem`, как у `.page`, `border-top` `--line`, `.footer-links` — flex-wrap. Только существующие токены. lint и build exit 0 |
| 6 app-layout | сборка страницы | ✅ | `site/src/App.tsx`: шапка → `WhySection` → «Конвейер» (без изменений) → `DeviceSection` → `LimitsSection`; `SiteFooter` после `</main>` во фрагменте; якоря `#why`, `#pipeline`, `#device`, `#limits`, `#author` литералами; пометка «Раздел «Как собран этот сайт» в работе.». Все проверки шага пройдены (см. «Тесты») |
| 7 repo-checks | проверки репозитория | ✅ | check-leaks, check-harness-refs, check-links — exit 0; внешних адресов в html/css нет; новые адреса в JS — только из `AUTHOR` |
| 8 browser-acceptance | приёмка в браузере | ✅ | Chrome-расширение, `http://localhost:4174/claude-code-harness/` (порт 4174 — по «Решениям» плана; preview отдаёт текущую сборку `index-Bu276Ag4.js`). Подп. 7 «тёмная тема» отнесена планом к человеку по мануалу — см. критерии |

## Тесты
- [x] Unit: `npm --prefix site test` — `Test Files  6 passed (6)` / `Tests  81 passed (81)`, exit=0; в verbose — 11 тестов `src/sections/content.test.ts` с ✓
- [x] Typecheck: `npm --prefix site run typecheck` (`tsc -b`) — exit=0
- [x] Lint: `npm --prefix site run lint` (`eslint .`) — exit=0
- [x] Build: `npm --prefix site run build` — `dist/assets/index-Bu276Ag4.js 249.53 kB`, `✓ built in 197ms`, exit=0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit=0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit=0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit=0
- [x] `grep -rn -E 'SDD|Spec-Driven' site/src --exclude='*.test.ts'` — пусто, exit=1
- [x] `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` — `0`
- [x] `grep -c 'Пункт 6 — Раздел' site/dist/assets/*.js` — `0`
- [x] grep внешних адресов в `site/dist` html/css — пусто, exit=1
- [x] `grep -rhoE 'https?://…' site/dist --include='*.js' | sort -u` — кроме w3.org-неймспейсов, `react.dev/errors`, адресов репозитория/README и `http://localhost:4173/claude-code-harness/` (текст фрагмента плана пункта 3 из `FRAGMENT_SOURCES`, был и в пункте 4) новые только `https://t.me/stels54`, `https://github.com/stels54`, `https://www.linkedin.com/in/kirill-zhirkin/` — ссылки `AUTHOR`

## Браузерная приёмка

| Подп. шага 8 | URL | Действие | Результат |
|---|---|---|---|
| 1 порядок и подвал | http://localhost:4174/claude-code-harness/ | JS: `h2`, последний элемент `#root`, `footer a` | `h2`: Зачем, Конвейер, Устройство, Ограничения, Автор; последний — `FOOTER#author`; 5 `href` ровно по плану; `hh.` в DOM нет; `img` в подвале нет |
| 2 «Зачем» на один экран | тот же, iframe 1280×800 | окно расширения не растягивается (`resize_window` 1440×900 не изменил viewport 400×570), измерено в iframe | `#why.offsetHeight` 353 ≤ `innerHeight` 798 |
| 3 якоря шапки | тот же | клик по каждой из 5 ссылок | `location.hash` = `#why`/`#pipeline`/`#device`/`#limits`/`#author`, раздел в видимой области (top 0; у подвала — 487, конец страницы) |
| 4 клавиатура | тот же | клик в пустое место, Tab | порядок: GitHub, README, 5 якорей, 9 кнопок схемы, 5 ссылок подвала, затем по кругу; у каждого `:focus-visible`, outline `solid 2px`. Enter на «2 /plan» → `aria-expanded="true"`, панель «Что делает… Составляет план реализации, кода не пишет…» |
| 5 360px | тот же, `<iframe src="/claude-code-harness/" width="360" height="800">` | замер, скриншоты «Зачем», «Устройство», подвала | `scrollWidth` 346 ≤ `innerWidth` 358; на скриншотах карточки в одну колонку, подвал переносит ссылки, горизонтальной прокрутки нет |
| 6 сеть и консоль | тот же, после перезагрузки | `read_network_requests`, `read_console_messages` | 9 запросов, все `http://localhost:4174/claude-code-harness/…` (html, js, css, 6 шрифтов); ошибок консоли нет |
| 7 визуально | тот же | скриншоты | палитра и шрифты как у шапки и схемы (Unbounded-заголовки, охристая кромка карточек). Тёмная тема — ⏸️ DEFERRED, человеком по мануалу (так в плане) |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| Порядок «Зачем» → «Конвейер» → «Устройство» → «Ограничения» → подвал; якоря шапки ведут к ним; схема работает как прежде | ✅ | браузер: список `h2`, `FOOTER#author` последним, 5 кликов меняют hash и показывают раздел; Enter раскрывает шаг схемы |
| Каждый пункт «Устройства» привязан к «Фактам», тест падает при пропаже якоря/непривязанном пункте | ✅ | тест «каждый пункт «Устройства» привязан к «Фактам»» ✓: сравнение ключей `DEVICE_FACTS` с id и `toContain` каждого якоря в нормализованных «Фактах» |
| Нет «Spec-Driven Development»/«SDD», нет цифр в текстах разделов, спецификация только как отсутствующая стадия | ✅ | тесты «нет цифр» ×3, «нет запрещённых названий», «спецификация упомянута только как отсутствующая стадия» ✓; grep по `site/src` пуст, grep по бандлу — 0 |
| Подвал: имя, почта, Telegram, GitHub, LinkedIn, репозиторий; без hh.ru, фото, биографии | ✅ | тест «подвал «Автор»» ✓; браузер: 5 `href` по порядку, `hh.` нет, `img` в подвале нет |
| Критерии пункта 3: typecheck, линтер, тесты, сборка, ссылки, утечки, `harness/` — проходят | ✅ | exit 0 у всех семи команд (см. «Тесты») |
| Запросы только к своему адресу | ✅ | `read_network_requests`: 9 запросов, все на `localhost:4174` |
| На 360px нет горизонтальной прокрутки | ✅ | iframe 360: `scrollWidth` 346 ≤ `innerWidth` 358 |
| Тёмная тема, Network на опубликованном адресе, доступ из РФ | ⏸️ DEFERRED | по плану — человеком по мануалу; нужен ручной прогон на опубликованном сайте |

## Итог
PASSED

Есть DEFERRED (тёмная тема, Network на опубликованном адресе, доступ из РФ) — по плану это ручная приёмка. Коммит не делать до подтверждения пользователя по этим пунктам.

## Что требует внимания
- Шаг 8, подп. 2: окно браузера расширения не меняет размер (viewport 400×570 после `resize_window` 1440×900), «один экран» измерен в iframe 1280×800. На реальном широком окне перепроверить при ручном прогоне.
- Шаг 8, подп. 7 и последний критерий: тёмная тема, Network на опубликованном адресе и доступ из РФ — ручной прогон по мануалу.
