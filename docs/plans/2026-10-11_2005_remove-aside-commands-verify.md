# Verify: убрать из публичного снимка команды вне основной цепочки
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_2005_remove-aside-commands.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 steps-test-chain-only | Тест схемы фиксирует 6 шагов цепочки | ✅ | Хелпер `ids` удалён, сверка `PIPELINE_STEPS.map(id)` с 6 id, `toHaveLength(6)`, тест переименован в «фрагмент есть у каждого шага». Green: `npm --prefix site test` — 81 passed |
| 2 content-test-commands-chain | Тест «Команды» без `kind`, запрет имён удалённых команд | ✅ | Проверяются `title` первого и последнего шага, добавлен `not.toMatch(/\/verify\|\/plan-fix\|\/fix-tests/)`; тест зелёный |
| 3 steps-drop-aside | Удалить aside-шаги и `kind` | ✅ | `kind` удалён из интерфейса и записей, 3 записи удалены; в `PipelineScheme.tsx` класс `step step-chain${open ? ' is-open' : ''}` (строка 64), фильтры, `h3` «Вне цепочки» и `ul.scheme-aside` удалены. `grep -rn "\.kind\|kind:" site/src` пусто; typecheck exit=0 |
| 4 scheme-css-drop-aside | Удалить стили aside | ✅ | `grep -n aside site/src/components/PipelineScheme.css` пусто (exit=1); `.step-facts` в media-блоке на месте; lint exit=0, build exit=0 |
| 5 content-commands-text | Убрать фразу об aside-командах | ✅ | Предложение удалено из `content.ts:49`, фраза с `STOP` осталась; тесты content зелёные |
| 6 harness-delete-aside-commands | Удалить 3 файла команд, правка `code-review.md:60` | ✅ | `git status`: `D` для `verify.md`, `plan-fix.md`, `fix-tests.md` (в индексе); `code-review.md:60` — «реализуется отдельным /plan, не в обход.»; `check-harness-refs: 0 нарушений` |
| 7 readme-drop-aside-section | README без раздела «Вне основной цепочки» | ✅ | Блок удалён, между пунктом 6 и абзацем «Ревью другой моделью…» одна пустая строка; «Что не вошло» перечисляет `verify`, `plan-fix`, `fix-tests`. `git grep -n -E "plan-fix\|fix-tests\|/verify" README.md` → только `README.md:123` (строка «Что не вошло»); `check-links: 0 нарушений` |

## Тесты
- [x] Typecheck: `npm --prefix site run typecheck` — `> tsc -b`, exit=0
- [x] Lint: `npm --prefix site run lint` — `> eslint .`, exit=0
- [x] Unit: `npm --prefix site test` — `Test Files  7 passed (7)`, `Tests  81 passed (81)`, exit=0
- [x] Build: `npm --prefix site run build` — `✓ built in 192ms`, exit=0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, exit=0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, exit=0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, exit=0
- [x] `grep -rE "SDD|Spec-Driven" site/dist` — пусто, exit=1

## Браузерная приёмка

Стенд: `npm --prefix site run preview`, новая вкладка Chrome.

| Шаг | URL | Действие | Результат |
|-----|-----|----------|-----------|
| Финальный проход: состав схемы | http://localhost:4173/claude-code-harness/ | Подсчёт `.scheme .step-button`, поиск `h3` «Вне цепочки» и `.scheme-aside`/`.step-aside` | 6 кнопок: /roadmap, /plan, /implement, verifier, /code-review, /manual; заголовка «Вне цепочки» и aside-элементов нет; в тексте страницы нет `/verify`, `/plan-fix`, `/fix-tests` |
| Финальный проход: 360px | та же страница в iframe шириной 360px | Сравнение `scrollWidth` и `clientWidth` | 345 = 345, горизонтальной прокрутки нет; 6 шагов, `.scheme-aside` нет |
| Финальный проход: подсветка | та же, ширина окна 2048px | Клик по /plan, указатель уведён в сторону | `li` = `step step-chain is-open`, `aria-expanded="true"`, `:hover` false, фон кнопки `rgb(42, 33, 48)` (у остальных прозрачный); на скриншоте /plan в рамке, панель раскрыта |
| Ссылки и сторонние домены | та же | Сбор ссылок `/blob/` и ресурсов с чужих origin | Ссылки ведут на `blob/v1/...`; сторонних ресурсов 0 |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| 1. Шесть шагов от /roadmap до /manual, ряда «Вне цепочки» нет на узкой и широкой ширине, на 360px нет горизонтальной прокрутки | ✅ | Браузер: 6 кнопок, aside нет на 2048px и в iframe 360px; scrollWidth 345 = clientWidth 345 |
| 2. В `harness/commands/` нет трёх файлов; `check-harness-refs.sh` проходит; `cp harness/commands/*.md` копирует только оставшиеся | ✅ | `ls harness/commands` → code-review.md, implement.md, manual.md, plan.md, roadmap.md; `check-harness-refs: 0 нарушений` |
| 3. README и «Устройство» не описывают удалённые команды как часть снимка; в README они в «Что не вошло» | ✅ | Дифф `content.ts:49`; `git grep` по README → только строка 123 «Что не вошло»; в тексте страницы совпадений нет |
| 4. Проверки зелёные, ссылки на `blob/v1` живы, в бандле нет `SDD`/`Spec-Driven` | ✅ | Все 7 команд выше exit=0; `REPO_REF = 'v1'`; `git ls-tree v1 harness/commands/` содержит verify.md, plan-fix.md, fix-tests.md — ссылки в теге рабочие; grep по `site/dist` пуст |

## Итог
PASSED

## Что требует внимания
Ничего.
