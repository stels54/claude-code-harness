# Мануал: публичный снимок ядра и проверка на утечки

План: `docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot.md`
Верификация: `docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot-verify.md`
Ревью: `docs/plans/2026-10-11_1303_public-showcase-1-harness-snapshot-review.md`

## 1. Назначение

В `harness/` лежит очищенная копия ядра конвейера: 8 команд (`plan`,
`implement`, `verify`, `code-review`, `plan-fix`, `fix-tests`, `manual`,
`roadmap`), агент `verifier`, хуки `notify.sh` и `pipeline-clock.sh`,
`CLAUDE.md` и `settings-hooks.json` (только ключ `hooks`). Ссылки на журнал
lessons вырезаны. Два скрипта:

- `scripts/check-leaks.sh [корень]` — проверяет все отслеживаемые и новые
  неигнорируемые текстовые файлы git-репозитория по трём категориям:
  `denylist` (строки локального списка), `key` (шаблоны ключей), `home-path`
  (`/Users/<имя>`, `/home/<имя>`). Печатает только `<файл>:<строка>: <категория>`
  и итог `check-leaks: N совпадений`. Выход: `0` — чисто, `1` — есть
  совпадения, `2` — нет списка, список пуст, ошибка чтения файлов или не
  git-репозиторий. Путь к списку — `$HARNESS_DENYLIST`, по умолчанию
  `~/.config/harness-publish/denylist.txt`.
- `scripts/check-harness-refs.sh [корень]` — проверяет `<корень>/harness`:
  категории `lessons`, `command` (`/<имя>` без `harness/commands/<имя>.md`),
  `path` (`~/.claude/…` или `$HOME/.claude/…` без файла в `harness/` либо с
  `..`; исключение — `pipeline-clock.jsonl`), `agent` (`` субагент… `<имя>` ``
  без `harness/agents/<имя>.md`), `skill` (`скилл <имя>` без
  `harness/skills/<имя>/`). Печатает `<файл>:<строка>: <категория>: <токен>` и
  итог `check-harness-refs: N нарушений`. Выход `0`/`1`, `2` — нет `harness/`.

Главная ручная приёмка — раздел 4.1: `harness/`, скопированный в чистое
окружение, доводит `/plan` до файла плана. Автоматически её проверить нельзя,
в verify она стоит ⏸️ DEFERRED.

## 2. Чек-лист

- [ ] 3 — окружение готово, рабочий `~/.claude` не трогаем
- [ ] 4.1 — `/plan` в чистом `CLAUDE_CONFIG_DIR` создаёт файл плана (**главное**)
- [ ] 4.2 — `check-leaks` на репозитории: 0 совпадений
- [ ] 4.3 — `check-harness-refs` на репозитории: 0 нарушений
- [ ] 4.4 — состав `harness/` и отличия от рабочего `~/.claude`
- [ ] 5.1–5.3 — `check-leaks` находит каждую категорию и не печатает найденное
- [ ] 5.4–5.8 — `check-harness-refs` находит каждую категорию нарушений
- [ ] 6 — ошибочные ветки: нет списка, пустой список, нечитаемый файл, нет `harness/`
- [ ] 8 — cleanup

## 3. Pre-requisites

1. Рабочий каталог — корень репозитория `claude-code-harness`, коммит с
   trailer `Plan: 2026-10-11_1303_public-showcase-1-harness-snapshot.md`
   (`git log -1 --format=%B | sed '/^$/d' | tail -1`).
2. Установлен Claude Code (`claude --version`), есть аккаунт для входа.
   `codex` не обязателен: без него `/plan` выводит «Кросс-ревью: ⏭️ (codex не
   установлен)», это не ошибка.
3. Список запрещённых строк существует: `test -f ~/.config/harness-publish/denylist.txt && echo ok`
   → `ok`. **Содержимое списка не выводить и никуда не копировать.**
4. Рабочий `~/.claude` в сценариях только читается. Зафиксируйте его состояние,
   чтобы в cleanup убедиться, что он не менялся:
   `ls -la ~/.claude/pipeline-clock.jsonl 2>/dev/null; ls -la ~/.claude/commands`
   — сохраните вывод.

## 4. Happy path

### 4.1 `/plan` в чистом окружении (ручная приёмка шага 10 плана)

Чистое окружение — отдельный каталог конфигурации Claude Code через
`CLAUDE_CONFIG_DIR`. Рабочий `~/.claude` при этом не читается и не пишется.

**Действие 1 — каталог конфигурации.** В новом терминале из корня репозитория:

```bash
export HARNESS_SRC="$PWD/harness"
export CLAUDE_CONFIG_DIR="$(mktemp -d)"
cp -R "$HARNESS_SRC/commands" "$HARNESS_SRC/agents" "$HARNESS_SRC/CLAUDE.md" "$CLAUDE_CONFIG_DIR/"
ls "$CLAUDE_CONFIG_DIR" "$CLAUDE_CONFIG_DIR/commands" "$CLAUDE_CONFIG_DIR/agents"
```

**Ожидание:** в `$CLAUDE_CONFIG_DIR` — `CLAUDE.md`, `agents`, `commands`; в
`commands` — 8 файлов (`code-review.md fix-tests.md implement.md manual.md
plan-fix.md plan.md roadmap.md verify.md`); в `agents` — `verifier.md`.

`hooks/` и `settings-hooks.json` **не копировать** и `settings.json` не
создавать: команды хуков и журнал `pipeline-clock.sh` указывают на
`$HOME/.claude/…` и писали бы в рабочий `~/.claude`; на `/plan` хуки не влияют.

**Действие 2 — пустой git-репозиторий** вне `claude-code-harness` (иначе
Claude Code подхватит проектный `harness/CLAUDE.md`):

```bash
export PLAN_REPO="$(mktemp -d)"
cd "$PLAN_REPO" && git init -q && git commit -q --allow-empty -m init && ls -A
```

**Ожидание:** только `.git`.

**Действие 3 — вход.** В том же терминале (переменная `CLAUDE_CONFIG_DIR`
выставлена) запустить `claude` и войти в аккаунт, если он попросит (`/login`).
Новый каталог конфигурации не видит вход рабочего окружения — это ожидаемо.

**Действие 4 — запуск `/plan`.** Вариант А, интерактивно — в сессии `claude`:

```
/plan Добавить в корень файл hello.txt со строкой hello --no-codex
```

На вопросы о разрешениях (`date`, запись в `docs/plans/`) — разрешить. Если
`/plan` задаёт уточняющие вопросы — ответить коротко («на твоё усмотрение»).

Вариант Б, без интерактива:

```bash
claude -p "/plan Добавить в корень файл hello.txt со строкой hello --no-codex" \
  --permission-mode acceptEdits --allowedTools "Bash(date:*)" "Bash(ls:*)" "Bash(git status:*)"
```

`--no-codex` выключает кросс-ревью, чтобы проверка шла только по файлам
`harness/`. Дополнительно можно повторить без флага: при установленном `codex`
выполнится кросс-ревью, без него — строка «Кросс-ревью: ⏭️ (codex не
установлен)».

**Ожидание (успех)** — все пункты:
- `/plan` распознан как команда, ответ модели идёт по структуре плана из
  `harness/commands/plan.md`;
- `ls "$PLAN_REPO/docs/plans"` показывает ровно один файл вида
  `ГГГГ-ММ-ДД_ЧЧММ_<kebab-slug>.md`, префикс совпадает с моментом запуска
  (`date +%Y-%m-%d_%H%M` ± минуты);
- в файле есть разделы `## Контекст`, `## Окружение`, `## Шаги` (хотя бы
  один `### Step`), `## Критерии приёмки`, `## Не делаем`, `## Допущения`;
- в выводе сессии нет сообщений о недостающих файлах, командах, агентах или
  скиллах (например «Unknown command», «not found», «No such file», упоминаний
  `lessons`);
- в рабочем `~/.claude` ничего не изменилось (сравнить с выводом из п. 4
  раздела 3).

**Провал** — любое из:
- `/plan` не распознан (`Unknown command` или модель отвечает на текст как на
  обычный вопрос) — значит, `commands/` не попал в `$CLAUDE_CONFIG_DIR`
  (перепроверить действие 1);
- файл плана не создан, или создан не в `docs/plans/`, или без дата-префикса;
- модель ссылается на файл, команду, агента или скилл, которого нет в
  `harness/` (зафиксировать дословно — это дефект снимка);
- изменился рабочий `~/.claude`.

**Итог** (путь созданного файла или дословный текст ошибки) записать в
отчёт тестировщика; при провале — это дефект пункта 1 роадмапа, правка
отдельным `/plan-fix` с trailer `Fix-for: 2026-10-11_1303_public-showcase-1-harness-snapshot.md`.

### 4.2 Проверка на утечки по репозиторию

**Действие:** из корня репозитория `scripts/check-leaks.sh; echo "exit=$?"`
**Ожидание:** `check-leaks: 0 совпадений`, `exit=0`, других строк нет.

### 4.3 Самодостаточность `harness/`

**Действие:** `scripts/check-harness-refs.sh; echo "exit=$?"`
**Ожидание:** `check-harness-refs: 0 нарушений`, `exit=0`.
Дополнительно `grep -rn -i lesson harness | wc -l` → `0`.

### 4.4 Состав и отличия снимка

| Действие | Ожидание |
|---|---|
| `find harness -type f \| sort \| wc -l` | `13` |
| `for f in commands/{verify,code-review,plan-fix,fix-tests,manual,roadmap}.md agents/verifier.md hooks/notify.sh hooks/pipeline-clock.sh; do cmp ~/.claude/$f harness/$f; done` | пустой вывод (только чтение `~/.claude`) |
| `diff ~/.claude/commands/implement.md harness/commands/implement.md` | `72,74d71` — удалён абзац про скилл lessons |
| `diff ~/.claude/CLAUDE.md harness/CLAUDE.md` | `43,46d42` — удалён раздел `## Харнес` |
| `diff ~/.claude/commands/plan.md harness/commands/plan.md` | только удаление 13 ссылок `(lessons: …)` и блока из двух предложений в п. 6 кросс-ревью (о системном пробеле и «подключи скилл lessons») |
| `jq -e 'keys == ["hooks"]' harness/settings-hooks.json` | `true` |
| `test -x harness/hooks/notify.sh && test -x harness/hooks/pipeline-clock.sh && echo ok` | `ok` |
| `head -1 LICENSE; grep -c 'Copyright (c) 2026' LICENSE` | `MIT License`, `1` |

Если рабочий `~/.claude` уже изменился после снимка, расхождения в `cmp`/`diff`
ожидаемы: снимок отстаёт от рабочей версии (решение 6 спецификации).

## 5. Матрица веток

Временные строки-утечки **генерируются при запуске** и в файлы репозитория не
пишутся. Заготовка (выполнять из корня репозитория, в одном терминале):

```bash
export L="$PWD/scripts/check-leaks.sh" H="$PWD/scripts/check-harness-refs.sh"
export T="$(mktemp -d)"
mkdir "$T/repo" && git -C "$T/repo" init -q
export K="AKIA$(printf 'A%.0s' {1..16})" U="/Users/""probeuser/x" P="zz""leakprobe"
printf '%s\n\n#x\n' "$P" > "$T/dl"
```

### check-leaks.sh

| № | Действие | Ожидание |
|---|---|---|
| 5.1 | `printf 'a %s\n' "$K" > "$T/repo/f.txt"; HARNESS_DENYLIST="$T/dl" "$L" "$T/repo"; echo "exit=$?"` | `f.txt:1: key`, `check-leaks: 1 совпадений`, `exit=1` |
| 5.2 | `printf 'b %s\n' "$U" > "$T/repo/f.txt"; HARNESS_DENYLIST="$T/dl" "$L" "$T/repo"; echo "exit=$?"` | `f.txt:1: home-path`, `exit=1`; строки `probeuser` в выводе нет |
| 5.3 | `printf 'c %s\n' "$P" > "$T/repo/f.txt"; HARNESS_DENYLIST="$T/dl" "$L" "$T/repo"; echo "exit=$?"` | `f.txt:1: denylist`, `exit=1`; строки `zzleakprobe` в выводе нет |
| 5.3а | `printf '%s\n%s\n%s\nclean\n' "$K" "$U" "$P" > "$T/repo/f.txt"` и запуск как в 5.1 | ровно 3 строки (`key`, `home-path`, `denylist`), `check-leaks: 3 совпадений`, `exit=1` |
| 5.3б | `printf 'risk-%s\n' "$(printf 'a%.0s' {1..25})" > "$T/repo/f.txt"` и запуск как в 5.1 | `check-leaks: 0 совпадений`, `exit=0` — левая граница шаблона `sk-` |
| 5.3в | `printf 'см. `/Users/...`\n' > "$T/repo/f.txt"` и запуск как в 5.1 | `0 совпадений`: путь с точкой после `/Users/` не считается личным |

### check-harness-refs.sh

Фикстура:

```bash
mkdir -p "$T/h/harness/commands" "$T/h/harness/agents" "$T/h/harness/hooks"
echo x > "$T/h/harness/commands/plan.md"; echo x > "$T/h/harness/agents/verifier.md"; echo x > "$T/h/harness/hooks/notify.sh"
```

Для каждой строки ниже: `printf '%s\n' '<строка>' > "$T/h/harness/commands/demo.md"; "$H" "$T/h"; echo "exit=$?"`.

| № | Строка в `demo.md` | Ожидание |
|---|---|---|
| 5.4 | `Запусти /plan по задаче.` | `0 нарушений`, `exit=0` |
| 5.5 | `Нарушения: /review дальше.` | `command: /review`, `exit=1` |
| 5.5а | `см. /plan /missing` | `command: /missing` (вторая команда в строке тоже проверяется) |
| 5.5б | `` Пути вида `/home/...` и `docs/plans/` `` | `0 нарушений` |
| 5.6 | `См. ~/.claude/commands/git-report.md` | `path: ~/.claude/commands/git-report.md` |
| 5.6а | `Хук: $HOME/.claude/hooks/notify.sh` | `0 нарушений` (файл есть в фикстуре) |
| 5.6б | `Лог: ~/.claude/pipeline-clock.jsonl` | `0 нарушений` (исключение: лог хука) |
| 5.6в | `и ~/.claude/../LICENSE` (предварительно `touch "$T/h/LICENSE"`) | `path: ~/.claude/../LICENSE` — выход за `harness/` |
| 5.7 | ``Затем субагентом `verifier` проверь.`` | `0 нарушений` |
| 5.7а | ``запусти субагента `ghost` сейчас`` | `agent: ghost` |
| 5.8 | `подключи скилл foo` | `skill: foo` |
| 5.8а | `читай lessons` | `lessons: lesson` |

## 6. Edge cases и fail-safe

| № | Действие | Ожидание |
|---|---|---|
| 6.1 | `HARNESS_DENYLIST="$T/nope" "$L" "$T/repo"; echo "exit=$?"` | stderr `check-leaks: нет списка запрещённых строк: …`, `exit=2` — проверка не пропускается |
| 6.2 | `printf '\n#x\n' > "$T/empty"; HARNESS_DENYLIST="$T/empty" "$L" "$T/repo"; echo "exit=$?"` | `check-leaks: список запрещённых строк пуст: …`, `exit=2` (пустая строка не превращается в «совпадает всё») |
| 6.3 | `chmod 000 "$T/repo/f.txt"; HARNESS_DENYLIST="$T/dl" "$L" "$T/repo"; echo "exit=$?"; chmod 644 "$T/repo/f.txt"` | `check-leaks: ошибка чтения файлов, проверка неполна`, `exit=2` |
| 6.4 | `"$L" "$T"; echo "exit=$?"` (каталог не git) | `check-leaks: не git-репозиторий: …`, `exit=2` |
| 6.5 | `mkdir "$T/e"; "$H" "$T/e"; echo "exit=$?"` | `check-harness-refs: нет каталога harness/ в …`, `exit=2` |
| 6.6 | Повторить 5.1–5.3 системным `/bin/bash "$L" …` (bash 3.2) | те же результаты |
| 6.7 | Бинарный файл в репозитории (`docs/linkedInwallpaper.png`) | не сканируется (`grep -I`), багом не считать — «Не делаем» плана |

## 7. Известные ограничения (багом не считать)

- Токен вида `/planX` (после имени заглавная буква, цифра или кириллица)
  обрезается до `/plan` и принимается как существующая команда. В текущем
  `harness/` таких токенов нет (замечание верификатора).
- `check-harness-refs` не проверяет ссылки на файлы целевого проекта
  (`docs/plans/`, `package.json`, `docker-compose.yml`, `PROJECT_LOG.md`) —
  это файлы проекта, где работает конвейер.
- Хуки в чистом окружении не проверяются: они пишут по путям `$HOME/.claude/…`.
- История git не сканируется — только рабочее дерево.
- `harness/commands/code-review.md` при ревью незакоммиченных изменений
  смотрит `git diff HEAD` и не видит новые неотслеживаемые файлы — это
  поведение рабочей команды, снимок его повторяет (отклонённое замечание
  ревью; правится в рабочем харнесе).

## 8. Cleanup

```bash
rm -rf "$T" "$PLAN_REPO" "$CLAUDE_CONFIG_DIR"
unset T L H K U P PLAN_REPO CLAUDE_CONFIG_DIR HARNESS_SRC
git -C <корень claude-code-harness> status --short
```

**Ожидание:** `git status` пуст — сценарии ничего не записали в репозиторий;
вывод `ls -la ~/.claude/commands` совпадает с сохранённым в разделе 3.
Размер и mtime `pipeline-clock.jsonl` могут измениться, если тестирование
шло из сессии Claude Code с хуками рабочего `~/.claude`: журнал пишет сама
сессия, багом не считать. Записей с путями временных каталогов в нём быть
не должно.

## 9. Приложение: карта выходных кодов

| Скрипт | 0 | 1 | 2 |
|---|---|---|---|
| `check-leaks.sh` | совпадений нет | есть совпадения (`denylist` / `key` / `home-path`) | нет списка; список пуст после отбрасывания пустых строк и `#`-комментариев; ошибка `git ls-files` или чтения файла; не git-репозиторий |
| `check-harness-refs.sh` | нарушений нет | есть нарушения (`lessons` / `command` / `path` / `agent` / `skill`) | нет каталога `harness/` |
