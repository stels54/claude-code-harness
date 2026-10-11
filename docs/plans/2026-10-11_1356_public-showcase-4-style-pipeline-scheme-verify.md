# Verify: Визуальный стиль и кликабельная схема конвейера
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1356_public-showcase-4-style-pipeline-scheme.md

Повторная проверка после правок по первому verify (PARTIAL: подпись «Что делает», поле `human` агента `verifier`).

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 tsconfig-src-tests | `node:fs` в тестах `src` без типов Node в браузерном коде | ✅ | `tsconfig.app.json`: `exclude: ["src/**/*.test.ts"]`; `tsconfig.node.json`: `types: ["node", "vite/client"]`, `include` += `src/**/*.test.ts`. typecheck exit 0, тесты зелёные |
| 2 test-repo-links | Контракт базы ссылок | ✅ | `site/src/repo.test.ts` зелёный. Red-фаза по конечному состоянию не проверяется |
| 3 repo-links | Одна точка базы ссылок | ✅ | `site/src/repo.ts`. grep `'main'` вне тестов → одна строка `site/src/repo.ts:2` |
| 4 test-fragment-extract | Контракт вырезания по маркерам | ✅ | `site/src/pipeline/fragment.test.ts` зелёный |
| 5 fragment-extract | `extractFragment` | ✅ | `site/src/pipeline/fragment.ts`, без DOM-API, ошибки содержат маркер |
| 6 test-fragments-plugin | Контракт плагина | ✅ | `site/fragments-plugin.test.ts` зелёный; файл добавлен в `include` `tsconfig.node.json` |
| 7 fragments-plugin | Фрагменты вырезаются при сборке | ✅ | Чтение файлов только в `load`, есть `addWatchFile`. Негатив: `### Пункт 33` → build exit 1, «Фрагмент «roadmap» из docs/roadmaps/2026-10-11_1236_public-showcase.md: Маркер начала не найден: ### Пункт 33»; правка откачена (cmp идентичен), build exit 0 |
| 8 test-pipeline-steps | Тест данных схемы | ✅ | `site/src/pipeline/steps.test.ts`: проверки 1–7 зелёные |
| 9 pipeline-steps-data | Данные схемы по «Фактам» пункта 2 | ✅ | 9 шагов, маркеры по таблице, `virtual:pipeline-fragments`; grep `?raw\|extractFragment` → пусто. `verifier.human` = «Своих точек решения у агента нет: отчёт возвращается в вызвавшую команду — /implement или /code-review.»: соответствует записи «Фактов» для `verifier` (вызывается из `/implement` и `/code-review`), записано в «Решения» плана. Остальные шаги — без утверждений сверх своих записей |
| 10 local-fonts | Локальные OFL-шрифты | ✅ | 6 woff2, 3 OFL с текстом «SIL Open Font License»; check-leaks → 0 совпадений |
| 11 theme-tokens | Палитра, типографика, фокус | ✅ | Все `url(` в dist CSS начинаются с `/claude-code-harness/fonts/`; контраст ≥ 4.5 (см. «Тесты») |
| 12 hero-line-art | SVG линейная графика | ✅ | `site/src/components/HeroArt.tsx` 2974 байт ≤ 12000; typecheck/lint 0 |
| 13 pipeline-scheme | Кликабельная схема | ✅ | В `StepDetails` есть `<dt>Что делает</dt>`; в браузере подписи панели: Что делает, Вход, Выход, Решение за человеком, Модель |
| 14 app-layout | Шапка + «Конвейер» | ✅ | grep SDD/Spec-Driven/repoUrl по `site/src` вне тестов → пусто; в dist JS → 0; «Пункт 5 — Разделы» в dist → 0; check-links → 0 нарушений |
| 15 static-external-check | Нет сторонних доменов в статике | ✅ | HTML/CSS: внешних ссылок нет (rc=1). JS: `www.w3.org` (XML-namespace), `react.dev/errors`, константа репозитория, `…/blob/main/README.md\`` и `http://localhost:4173/claude-code-harness/\`` (с экранированным бэктиком — внутри фрагмента мануала). PNG/wallpaper нет; `du -sh site/dist` → 504K |
| 16 browser-acceptance | Клавиатура, 360px, сеть | ✅ | Chrome-расширение, см. «Браузерная приёмка». Тёмная тема — по плану проверяется человеком по мануалу |

## Тесты
- [x] Typecheck: `npm --prefix site run typecheck` — `> tsc -b`, typecheck exit=0
- [x] Lint: `npm --prefix site run lint` — `> eslint .`, lint exit=0
- [x] Unit: `npm --prefix site test` —
  ```
   Test Files  5 passed (5)
        Tests  70 passed (70)
  ```
  test exit=0
- [x] Build: `npm --prefix site run build` —
  ```
  dist/index.html                   0.77 kB │ gzip:  0.45 kB
  dist/assets/index-BtIG_L8q.css    7.02 kB │ gzip:  2.17 kB
  dist/assets/index-CBF7hPic.js   241.67 kB │ gzip: 76.24 kB
  ✓ built in 296ms
  ```
  build exit=0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, rc=0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, rc=0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, rc=0
- [x] Контраст WCAG (`node -e` по hex-токенам из `site/src/index.css`):
  ```
  light #f4e6d2 ink 12.83, inkSoft 7.00, sunset 5.87, teal 6.57, violet 6.28
  light #ead3b6 ink 10.88, inkSoft 5.93, sunset 4.98, teal 5.57, violet 5.32
  dark #1d1720 ink 13.79, inkSoft 9.21, sunset 7.11, teal 8.00, violet 7.11
  dark #2a2130 ink 12.14, inkSoft 8.11, sunset 6.26, teal 7.04, violet 6.25
  ```
  `--rose`/`--ochre` в CSS для текста не используются (только рамка `PipelineScheme.css:74` и SVG).

## Браузерная приёмка

Стенд: `npm --prefix site run preview -- --port 4173 --strictPort`, загружен новый бандл `index-CBF7hPic.js`.

| Шаг плана | URL | Действие | Результат |
|-----------|-----|----------|-----------|
| 16.1 сеть | http://localhost:4173/claude-code-harness/ | загрузка, `read_network_requests` | только `localhost:4173`: документ, JS, CSS, 6 × `/claude-code-harness/fonts/*.woff2` (плюс `data:`); в консоли ошибок нет |
| 16.2 фокус | то же | клик по вводному тексту раздела, Tab | фокус на «1 /roadmap опционально», `outlineStyle: solid 2px rgb(87,74,133)`, `:focus-visible` true; на скриншоте видна обводка |
| 16.2 Enter | то же | Enter | `aria-expanded="true"`, панель видна; подписи: Что делает, Вход, Выход, Решение за человеком, Модель; ссылка на файл команды, `<pre>` |
| 16.2 Space | то же | Space | `aria-expanded="false"`, панель `hidden` |
| 16.2 один раскрытый | то же | `/roadmap`, затем `/plan` | раскрыт только `/plan` |
| 16.3 360px | iframe 360×800 | исходно и при раскрытых `/code-review`, `/plan`, `/manual`, `/roadmap` | `scrollWidth` 343 ≤ `innerWidth` 358 во всех состояниях; `pre` у `/code-review`: 210/210, `pre-wrap`; скриншот: текст переносится |
| 16.4 ссылки | основная страница | раскрытие всех шагов | файлы команд `…/blob/main/harness/…`; документы: roadmap `#L49-L64`, plan `#L95-L106`, implement `#L451-L454`, verifier `#L73-L76`, code-review `#L6-L13` |
| 16.5 визуально | iframe 1200px (scale 0.41) | скриншот с раскрытым `/plan` | тёплая палитра, линейная SVG-графика (арка, шпили, планета), горизонтальная цепочка; `img`/`picture` 0; scrollWidth 1183 ≤ 1198. Тёмная тема — по мануалу |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| Тест данных схемы: 9 шагов, описание/вход/выход/файл в `harness/`, фрагменты совпадают со строками | ✅ | `npm --prefix site test` → 70 passed; `steps.test.ts`, проверки 1–7 |
| Раздел «Конвейер»: цепочка и шаги вне цепочки, раскрытие мышью и Enter/Space с видимым фокусом, содержимое панели, фрагмент со ссылкой на строки | ✅ | Браузер: кнопки `1 /roadmap опционально … 6 /manual`, `/verify`, `/plan-fix`, `/fix-tests`; Tab/Enter/Space/click; outline solid 2px; подписи панели полные; ссылки `#Lx-Ly` |
| 360px без горизонтальной прокрутки, в т.ч. при раскрытом шаге с самым длинным фрагментом | ✅ | iframe 360: scrollWidth 343 ≤ 358 при раскрытых `/code-review`, `/plan`, `/manual`, `/roadmap` |
| Только ресурсы своего адреса, нет картинки-ориентира, нет SDD/Spec-Driven и цифр статистики | ✅ | `read_network_requests` — только localhost:4173; `find site/dist -name '*.png' -o -name '*wallpaper*'` → пусто; grep SDD/Spec-Driven: `site/src` → пусто, dist → 0; в `App.tsx` цифр статистики нет |
| Описания шагов совпадают с «Фактами» пункта 2; typecheck, lint, test, build и три скрипта проходят | ✅ | Сверка `steps.ts` с записями роадмапа (строки 131–207), включая исправленный `verifier.human`; все команды exit 0 (см. «Тесты») |

## Итог
PASSED

## Что требует внимания
- Не дефект: тёмная тема в браузере не проверялась (эмуляция `prefers-color-scheme` недоступна), по плану — человеком по мануалу.
