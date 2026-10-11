# Verify: Fix: тексты «Устройства» и «Ограничений» по ручному тестированию пункта 5, мануалы
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1453_fix-showcase-5-texts.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 test-device-text-names-facts | тест: пункты «Устройства» называют свои факты, «Команды» определяют цепочку по схеме | ✅ | В `DEVICE_FACTS` добавлены все якоря из плана; есть таблица `DEVICE_TEXT`, тесты «пункты «Устройства» называют свои факты» и «Команды» определяют основную цепочку по схеме» (импорт `PIPELINE_STEPS`, фильтр по `kind`). Green: `content.test.ts` — 13 passed. Red-фаза не проверялась (по конечному состоянию её не проверить) |
| 2 device-limits-texts | тексты точны и опираются на «Факты» | ✅ | Тексты `commands`, `cross-review`, `hooks`, `thin-layer`, `auto-vs-human`, `price` переписаны по плану; id, заголовки и порядок не менялись. `grep -c 'Network\|тёмная тема'` → 1 (строка 81, `auto-vs-human`, фраза «Для этого сайта руками проверялись»); grep старых фраз → пусто (exit 1); в `price` 0 вхождений « — » |
| 3 manual-5-fixes | правки мануала пункта 5 | ✅ | §1, §4.2, §4.3, §4.4, §4.8, §5, §5.5, §8 (84 теста, 13 в `content.test.ts`), §9 обновлены. check-links/check-leaks → 0. Grep из плана находит строки в §4.3, §5, §5.5; в §4.4 и §4.8 не находит из-за формы записи: «предыдущему / якорю» перенесено на две строки, а в заголовке §4.8 «ручной пункт» со строчной буквы. Чтение файла показывает, что содержание на месте (строки 127–128 и 156). Утверждение §5.5 сверено с тестом: `toEqual` идёт раньше проверки `hh.` (`content.test.ts:168`) |
| 4 manual-4-test-count | число тестов в §8 мануала пункта 4 | ✅ | `Test Files 6 passed, Tests 84 passed` совпадает с прогоном; в список добавлен `site/src/sections/content.test.ts`; check-links → 0 |

## Тесты
- [x] Unit: `npm --prefix site test` — `Test Files  6 passed (6)` / `Tests  84 passed (84)`, exit 0
- [x] Unit (файл): `npm --prefix site test -- src/sections/content.test.ts` — `Test Files  1 passed (1)` / `Tests  13 passed (13)`
- [x] Typecheck: `npm --prefix site run typecheck` — exit 0
- [x] Lint: `npm --prefix site run lint` — exit 0
- [x] Build: `npm --prefix site run build` — `✓ built in 287ms`, exit 0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit 0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit 0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit 0

## Браузерная приёмка
Неприменимо: по плану меняются только строки данных, разметка и стили не меняются.

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| typecheck, lint, test, build — exit 0 | ✅ | Вывод команд выше: exit 0 у всех четырёх, 84/84 тестов |
| check-leaks, check-harness-refs, check-links — 0 нарушений | ✅ | `0 совпадений`, `0 нарушений`, `0 нарушений`; exit 0 у всех трёх |
| `grep -c -E 'SDD\|Spec-Driven' site/dist/assets/*.js` → 0 | ✅ | Вывод: `0` |
| `git diff --stat` — роадмап не изменён | ✅ | `git diff --stat -- docs/roadmaps/` пуст; общий `git diff --stat` — 4 файла: два мануала, `content.ts`, `content.test.ts` |

## Итог
PASSED

## Что требует внимания
- Шаг 3, `docs/manual/2026-10-11_1438_public-showcase-5-why-device-limits-footer.md`: grep-проверка из плана в буквальном виде не находит строки в §4.4 (перенос внутри «предыдущему якорю») и §4.8 (`Ручной пункт` против «ручной пункт»). Содержание на месте, на результат это не влияет.
