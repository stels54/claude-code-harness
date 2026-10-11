# Verify: Публичный снимок ядра и проверка на утечки
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 snapshot-copy-core | Снимок ядра 1:1 | ✅ | `cmp` без расхождений для 9 нетронутых файлов; `plan.md`, `implement.md`, `CLAUDE.md` на месте; `find harness -type f` — 13 файлов (12 + `settings-hooks.json`); оба хука исполняемые |
| 2 clean-plan-lessons | Убрать lessons из `/plan` | ✅ | `grep -c -i lesson` → `0`; diff затрагивает только строки 50–51, 56, 74–75, 78, 82, 99, 103–104, 111–112, 161, 165, 170, 184, 241, 285–286; `( *)`: 2 = 2; двойные пробелы: 0 против 0 в источнике |
| 3 clean-implement-lessons | Убрать lessons из `/implement` | ✅ | `grep -c` → `0`; diff: `72,74d71` (абзац + пустая строка) |
| 4 clean-claude-md-harness-section | Убрать раздел «Харнес» | ✅ | `grep -c -i -E 'lesson\|журнал\|## Харнес'` → `0`; diff: `43,46d42` |
| 5 settings-hooks-fragment | Фрагмент с хуками | ✅ | `jq -e 'keys == ["hooks"]'` → `true`; diff `.hooks` с источником пуст |
| 6 license-mit | LICENSE | ✅ | `head -1` → `MIT License`; `grep -c 'Copyright (c) 2026'` → `1` (строка `Copyright (c) 2026 Kirill Zhirkin`) |
| 7 leak-check-script | `scripts/check-leaks.sh` | ✅ | Фикстура во временном репо, прогон под bash 3.2.57 (`/bin/bash`) и bash 5.3: выход `1`, ровно 3 совпадения `key`/`home-path`/`denylist`, в выводе 0 вхождений пробных строк; несуществующий список → `2`; список из пустой строки и `#x` → `2`. Временные каталоги удалены |
| 8 harness-refs-check-script | `scripts/check-harness-refs.sh` | ✅ | Фикстура по плану, bash 3.2 и 5.3: выход `1`, ровно 4 нарушения `lessons`/`command: /review`/`path: ~/.claude/commands/git-report.md`/`skill: foo`; допустимые строки не сработали; без `harness/` → `2`. Временные каталоги удалены |
| 9 run-checks-repo | Чистота репозитория | ✅ | См. «Тесты» |
| 10 manual-clean-env-plan | Ручная приёмка `/plan` в чистом `CLAUDE_CONFIG_DIR` | ⏸️ DEFERRED | Нужна ручная приёмка пользователем (вход в аккаунт в отдельном каталоге конфигурации) |

## Тесты
В проекте нет Makefile, package.json, CI-конфига — тестовых suite, typecheck и lint нет. Проверки — скрипты плана.
- [x] Leak check: `scripts/check-leaks.sh`
  ```
  check-leaks: 0 совпадений
  exit=0
  ```
- [x] Harness refs: `scripts/check-harness-refs.sh`
  ```
  check-harness-refs: 0 нарушений
  exit=0
  ```
- [x] `grep -rn -i lesson harness | wc -l` → `0`
- [x] Фикстура check-leaks (`/bin/bash`, 3.2.57):
  ```
  exit=1
  f.txt:1: key
  f.txt:2: home-path
  f.txt:3: denylist
  check-leaks: 3 совпадений
  0            # вхождений пробных строк в выводе
  exit=2       # несуществующий список
  exit=2       # список из пустой строки и комментария
  ```
- [x] Фикстура check-harness-refs (`/bin/bash`, 3.2.57):
  ```
  harness/commands/demo.md:8: lessons: lesson
  harness/commands/demo.md:5: command: /review
  harness/commands/demo.md:6: path: ~/.claude/commands/git-report.md
  harness/commands/demo.md:7: skill: foo
  check-harness-refs: 4 нарушений
  exit=1
  exit=2       # нет каталога harness/
  ```

## Браузерная приёмка
Неприменимо: изменения не затрагивают UI.

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| 1. check-leaks: 0 на репо, находит подложенные утечки без печати текста, без списка — ошибка | ✅ | `check-leaks: 0 совпадений`, exit 0; фикстура: 3 категории, 0 вхождений пробных строк в выводе; выход `2` без списка и с пустым списком |
| 2. check-harness-refs: 0 нарушений, находит подложенные | ✅ | `check-harness-refs: 0 нарушений`, exit 0; фикстура: 4 нарушения нужных категорий, exit 1 |
| 3. `harness/` — ровно ядро, отличия только в удалённых lessons | ✅ | `find harness -type f` — 13 файлов по списку; `cmp` для 9 файлов без вывода; diff трёх очищенных файлов — только строки с lessons; `jq keys == ["hooks"]` → true, diff `.hooks` пуст |
| 4. `LICENSE` с MIT | ✅ | `head -1 LICENSE` → `MIT License`, строка копирайта на месте |
| 5. Ручная проверка `/plan` в чистом `CLAUDE_CONFIG_DIR` | ⏸️ DEFERRED | Нужна ручная приёмка пользователем |

## Итог
PASSED (с DEFERRED по шагу 10 / критерию 5)

Шаг manual-clean-env-plan и критерий 5 ждут подтверждения пользователя. Пока его нет, коммит не делать.

## Что требует внимания
- Шаг 10 / критерий 5: нужна ручная приёмка по сценарию из плана.
- В разделе «Решения» плана две поправки исполнителя ждут подтверждения пользователя: ожидание `grep -c '( *)'` (шаг 2) и левая граница шаблона `sk-…` в `scripts/check-leaks.sh` (шаг 7). Обе поправки в файлах есть и проверены.
- Небольшое расхождение со спецификацией шага 8 в `scripts/check-harness-refs.sh`: правило «после токена не буква» реализовано жадным `-o`-совпадением по `[a-z-]*`, поэтому токен с последующей заглавной латинской буквой, цифрой или кириллицей (например, `/planX`) будет обрезан до `/plan`, а не пропущен. На текущем `harness/` срабатываний нет, на результат не влияет.
