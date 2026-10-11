# Verify: подача сайта — ценность на первом экране, кейс ревью, связка с постановкой задачи
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_2044_site-hero-value-review-case.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 hero-content-test | тест текстов первого экрана и опоры на `harness/` | ✅ | `content.test.ts`: тесты (а)–(г), `HERO_FACTS`/`HERO_TEXT`, `heroStrings()` добавлены в «нет запрещённых названий» и «спецификация…», отдельный тест «нет цифр»; зелёные |
| 2 hero-content | `HERO` в `content.ts` | ✅ | Тексты совпадают посимвольно с разделом «Тексты» (сверка скриптом: все строки найдены) |
| 3 hero-render | абзац и свойства под строкой-цепочкой | ✅ | `App.tsx`: `.hero-value` и `ul.info-items.hero-props` с `<strong>`/`<p>` между `.hero-lead` и `HeroArt`; стили в `App.css` только на токенах |
| 4 why-bridge-test | тест фразы-связки | ✅ | Тест «Зачем: связка…» + `WHY_BRIDGE` в проверках названий, спецификации и цифр |
| 5 why-bridge | фраза в «Зачем» | ✅ | `WHY_BRIDGE` дословно; `<p className="section-note">` после `SectionItems`; `.section-note` по плану |
| 6 case-source | источники фрагментов кейса | ✅ | `build-review3-table` и `build-review3-recheck` в `fragment-sources.ts`; `code-review` не тронут |
| 7 case-test | тест кейса | ✅ | Тест «кейс одного ревью до хронологии»: заголовок, фразы, пути, строки 6–9 и 15–22, `| 1 |`/`| 2 |`, claim `{ rejected: 0 }`; highlight в общих проверках |
| 8 case-data | данные кейса | ✅ | `highlight: StoryEvent` в `BuildStory`, `id: 'review-case'`, тексты дословно, стадии не изменены |
| 9 case-render | кейс до хронологии | ✅ | `BuildStory.tsx`: `.build-highlight` с `h3`, `p`, `StoryFragment` до `stages.map`; CSS по плану |
| 10 browser-acceptance | приёмка в браузере | ✅ | См. «Браузерная приёмка» |

## Тесты
- [x] Unit: `npm --prefix site test` — `Test Files  7 passed (7)`, `Tests  87 passed (87)`
- [x] Typecheck: `npm --prefix site run typecheck` — `tsc -b`, exit 0
- [x] Lint: `npm --prefix site run lint` — `eslint .`, exit 0
- [x] Build: `npm --prefix site run build` — `✓ built in 211ms`
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit 0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit 0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit 0
- [x] `grep -rE 'SDD|Spec-Driven' site/dist` — совпадений нет
- [x] `git diff v1 -- docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md` — 0 строк

## Браузерная приёмка
Стенд: `npm --prefix site run preview`, `http://localhost:4173/claude-code-harness/`, новая вкладка Chrome, проверка через JS по DOM.

| Шаг | URL | Действие | Результат |
|-----|-----|----------|-----------|
| hero-render | /claude-code-harness/ | порядок `.hero-lead` → `.hero-value` → `.hero-props` → `.hero-art` | порядок верный; свойства: «Изолированная проверка», «Codex только читает», «Решения за человеком»; абзац начинается с «Собственный харнес для Claude Code — кон…» |
| why-bridge | #why | позиция `.section-note` | после списка из 3 пунктов, текст «Разработка начинается с постановки задач…» |
| case-render | #build | позиция `.build-highlight` | до первой стадии «Постановка», заголовок «Кейс: что нашло одно ревью» |
| case-render | #build | ссылки кейса | обе ведут на `blob/v1/docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md?plain=1`, якоря `#L6-L9` и `#L15-L22` |
| 360px | iframe 360px | `scrollWidth` vs `clientWidth` | 345 = 345, горизонтальной прокрутки нет |
| тёмная тема | — | проверка токенами | блок `@media (prefers-color-scheme: dark)` переопределяет `--ink`, `--ink-soft`, `--teal`, `--ochre`, `--line-faint`; новые стили используют только эти токены (светлый текст `#f1e2cc`/`#cdb8a8`/`#7fbab2` на `#1d1720`) |
| сеть | — | `performance.getEntriesByType('resource')` | внешних хостов нет, только `localhost:4173` |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| Под строкой-цепочкой абзац и три свойства с согласованными текстами; опора на `harness/` | ✅ | DOM-порядок в браузере; посимвольная сверка текстов; тест «свойства первого экрана опираются на файлы harness/» зелёный в `87 passed` |
| Кейс до хронологии, ссылки на `blob/v1` `#L6-L9` и `#L15-L22`, строки совпадают с тегом | ✅ | браузер: `.build-highlight` до «Постановка», ссылки с точной базой и якорями; `git diff v1` по отчёту — 0 строк; тест кейса проверяет fromLine/toLine |
| Фраза в «Зачем» после трёх проблем; нет SDD/Spec-Driven в данных и бандле | ✅ | браузер: `.section-note` после 3 пунктов; тест «нет запрещённых названий»; `grep` по `site/dist` пуст |
| 360px без прокрутки, тёмная тема читаема, нет сторонних запросов | ✅ | iframe 345/345; тёмные токены из CSS бандла; ресурсы только с `localhost:4173` |
| Все проверки репозитория и сайта зелёные | ✅ | typecheck/lint exit 0, 87 тестов, build, три `scripts/check-*.sh` exit 0 |

## Итог
PASSED

## Что требует внимания
- Тёмная тема проверена по токенам, а не визуальной эмуляцией `prefers-color-scheme` (план это допускает).
