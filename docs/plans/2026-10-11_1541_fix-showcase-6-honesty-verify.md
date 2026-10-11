# Verify: Fix: точность раздела «Как собран этот сайт» по ручному тестированию пункта 6
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1541_fix-showcase-6-honesty.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 fragment-review1-rejected | фрагмент строки 9 отчёта ревью пункта 1 | ✅ | ключ `build-review1-rejected` в `site/src/pipeline/fragment-sources.ts`, путь строкой, маркеры `'| 2 | \`/code-review\` не видит'` / `'| 3 |'`; в файле строка 9 — замечание 2 с вердиктом «отклонено», итог «отклонено: 1»; на стенде подпись «…-review.md, строка 9» |
| 2 test-build-story-claims | тест сверяет заявленный статус с файлом | ✅ | старые тесты «итоги проверки — PASSED…» и «…нет отклонённых замечаний» удалены; добавлены 4 теста из плана и пятый сверх плана: «итоговый статус в заголовке события — последний названный»; `PARTIAL_NOTE` добавлен в оба текстовых теста. Red-фазу по конечному состоянию не проверить; green: build-story `Tests  14 passed (14)` |
| 3 build-story-texts | точные тексты, claim, partial | ✅ | `ReportClaim`, `StoryFragment`, `PARTIAL_NOTE`, `frag(..., extra)`; `partial: true` у трёх фрагментов; `claim` у всех фрагментов из `-verify`/`-review`; переписаны review.lead (+ событие `review-1` первым), fixes.lead, verify-4.text, result.lead, `accepted` |
| 4 build-story-caption | «строка N» и пометка обрезанных | ✅ | `site/src/components/BuildStory.tsx`: ветка `fromLine === toLine`, `; {PARTIAL_NOTE}` в figcaption; typecheck/lint/build exit 0; `grep -c 'показано не целиком'` по бандлу → `1` |
| 5 browser-acceptance | приёмка на стенде | ✅ | см. «Браузерная приёмка»; порт 4179 освобождён (`lsof` → пусто, exit 1) |
| 6 manual-6-fixes | правки мануала пункта 6 | ✅ | §3 — временный клон, свободный порт с `lsof`; §4.3/§4.4 — «строка 9», «не целиком», строка про пункт 1, шапка отчёта пункта 4; §4.8 — favicon и `data:`; §4.9 — докрутка; §5.3 — правка по `id`; §6 — подмена статуса; §7 — обрезанные фрагменты; §8 — grep по бандлу в code-блоке, `\|` только в поясняющем тексте (строка 331). Числа: 40 фрагментов, 33 ключа `build-*`, 14 тестов в файле, 98 всего — совпадают с прогоном |

## Тесты
- [x] Unit: `npm --prefix site test` — `Test Files  7 passed (7)`, `Tests  98 passed (98)`, exit 0
- [x] build-story: `npx vitest run build-story` — `Tests  14 passed (14)`
- [x] Typecheck: `npm --prefix site run typecheck` — exit 0
- [x] Lint: `npm --prefix site run lint` — exit 0
- [x] Build: `npm --prefix site run build` — `✓ built in 211ms`, exit 0
- [x] `grep -c 'показано не целиком' site/dist/assets/*.js` → `1`
- [x] `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → `0`
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit 0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit 0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit 0

## Браузерная приёмка
Стенд: `npm --prefix site run preview -- --port 4179 --strictPort`, Chrome-расширение.

| Пункт | URL | Действие | Результат |
|-------|-----|----------|-----------|
| 1 | http://localhost:4179/claude-code-harness/#build | подпись `build-review1-rejected` | «…-1-harness-snapshot-review.md, строка 9»; href содержит `plain=1`, якорь `#L9`; подписей «строки N–N» с одинаковыми N — 0; многострочных «строки A–B» — 34 |
| 2 | то же | figcaption с «не целиком» | 3 |
| 3 | то же | заголовки | после «Итог» — «Пункты сайта приняты, роадмап не завершён»; первое событие в «Ревью другой моделью» — «Пункт 1: одно замечание отклонено» |
| 4 | то же | `#build figure` | 40 |
| 5 | то же, после перезагрузки | консоль, Network | ошибок в консоли нет; 10 запросов, все к `localhost:4179` (страница, js, css, 6 шрифтов, favicon.svg) |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| typecheck, lint, test, build — exit 0 | ✅ | exit-коды 0/0/0/0; `Tests  98 passed (98)` |
| check-leaks, check-harness-refs, check-links — 0 нарушений | ✅ | `0 совпадений`, `0 нарушений`, `0 нарушений`, exit 0 |
| `grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js` → 0 | ✅ | вывод `0` |
| роадмап не изменён | ✅ | `git diff --stat HEAD -- docs/roadmaps` — пусто |

## Итог
PASSED

## Что требует внимания
- `site/src/sections/build-story.test.ts`, шаг 2: тест «итоговый статус в заголовке события — последний названный» в плане не указан. Он зелёный и укладывается в цель шага, но это отступление от плана.
