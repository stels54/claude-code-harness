# Мануал: README и описание шагов конвейера по тексту команд

План: `docs/plans/2026-10-11_1319_public-showcase-2-readme-pipeline-facts.md`
Верификация: `docs/plans/2026-10-11_1319_public-showcase-2-readme-pipeline-facts-verify.md`
Ревью: `docs/plans/2026-10-11_1319_public-showcase-2-readme-pipeline-facts-review.md`

## 1. Назначение

Пункт 2 роадмапа `docs/roadmaps/2026-10-11_1236_public-showcase.md` дал два
результата:

- **«Факты» роадмапа** — 12 записей `[2026-10-11, пункт 2]`: по одной на
  `/roadmap`, `/plan`, `/implement`, `/verify`, агент `verifier`,
  `/code-review`, `/plan-fix`, `/fix-tests`, `/manual` (вход, выход, модель,
  где решение за человеком) и три общие — ревью Codex
  (`codex exec --sandbox read-only`), хуки, зависимость команд от
  `CLAUDE.md`. Сайт (пункты 4–5) берёт описания отсюда.
- **`README.md`** — 7 разделов в порядке: «Что это и для кого», «Шаги
  конвейера», «Установка», «Что нужно для работы», «Что не вошло»,
  «Ограничения», «Дата снимка и сайт».

Ключевые ветки поведения — в блоке установки README:
- `~/.claude/CLAUDE.md` и `~/.claude/settings.json` копируются, только если
  их ещё нет (`[ -e … ] || cp …`);
- команды, `verifier.md` и оба хука копируются всегда, одноимённые файлы
  заменяются;
- хукам ставится бит исполнения.

Ручная приёмка нужна для того, что автоматические проверки не оценивают:
понятность README читателю, точность описаний относительно текста команд,
вид на GitHub.

## 2. Чек-лист

- [ ] 3 — окружение готово, рабочий `~/.claude` не трогаем
- [ ] 4.1 — README отвечает на все вопросы пункта 2 (**главное**)
- [ ] 4.2 — «Факты» совпадают с текстом `harness/` (**главное**)
- [ ] 4.3 — установка в пустой временный HOME
- [ ] 4.4 — установка поверх существующих `settings.json` и `CLAUDE.md`
- [ ] 4.5 — проверки на утечки и ссылки `harness/`
- [ ] 5 — матрица веток установки
- [ ] 6 — edge cases
- [ ] 8 — cleanup

## 3. Pre-requisites

- Клон репозитория на коммите с README (`git log --oneline -1 -- README.md`
  показывает коммит «docs: README и описание шагов конвейера по тексту
  команд»).
- Все команды — из корня репозитория в терминале хоста (macOS или Linux).
- `bash`, `jq`, `cmp`, `git` — установлены.
- Список запрещённых строк `~/.config/harness-publish/denylist.txt` — есть
  (нужен только для 4.5). Его содержимое не выводить.
- **Рабочий `~/.claude` не трогать**: блок установки во всех сценариях
  выполняется с `HOME`, подменённым на временный каталог.
- Подготовить извлечение блока установки (используется в 4.3–6):

  ```bash
  T=$(mktemp -d)
  awk '/^## Установка/{s=1} s&&/^```bash/{f=1;next} f&&/^```/{exit} f' README.md > "$T/install.sh"
  cat "$T/install.sh"
  ```

  **Ожидание**: 7 строк — `mkdir -p …`, три `cp …`, `chmod +x …`, две строки
  `[ -e ~/.claude/… ] || cp …`.

## 4. Happy path

### 4.1 README отвечает на вопросы пункта 2

**Действие**: открыть `README.md` в предпросмотре Markdown (IDE или GitHub
после push) и прочитать целиком.

**Ожидание**:

| Вопрос | Где ответ | Что должно быть |
|---|---|---|
| что это и для кого | «Что это и для кого» | конвейер «план → реализация → изолированная проверка → ревью другой моделью», ссылки на `harness/` и `docs/` |
| шаги конвейера | «Шаги конвейера» | `/roadmap` → `/plan` → `/implement` → агент `verifier` → `/code-review` → `/manual`; вне цепочки `/verify`, `/plan-fix`, `/fix-tests`; у каждого ссылка на файл в `harness/` |
| установка | «Установка» | блок `bash` и четыре пояснения: ручной перенос при существующих файлах, замена одноимённых, журнал `pipeline-clock.jsonl`, `CLAUDE_CONFIG_DIR` без хуков |
| что нужно | «Что нужно для работы» | Claude Code; `model: opus` у `/plan`, `/implement`, `/roadmap`, `verifier`; Codex CLI; `git`; `jq`; `terminal-notifier`/`notify-send`; Chrome-расширение |
| что не вошло | «Что не вошло» | одна строка: `from-linear`, `review`, `git-report`, скилл `lessons` — без описания содержимого |
| ограничения | «Ограничения» | снимок; модель проверяет модель; нет стадии спецификации; `/code-review` и неотслеживаемые файлы (`git add -- <пути>`); русский язык и структура `docs/`; хуки только в `~/.claude` |
| дата снимка, сайт | «Дата снимка и сайт» | `2026-10-11`; `https://stels54.github.io/claude-code-harness/` с пометкой «пока не опубликован»; `https://github.com/stels54/claude-code-harness`; MIT |

Дополнительно: в тексте нет слов «Spec-Driven Development» и «SDD», нет цифр
статистики, стадия спецификации не названа частью конвейера. Читается
человеком без контекста проекта — оценка субъективная, записать замечания.

### 4.2 «Факты» совпадают с текстом команд

**Действие**: вывести записи пункта 2:

```bash
awk '/^## Факты/,/^## Решения/' docs/roadmaps/2026-10-11_1236_public-showcase.md | grep -c '^- \[2026-10-11, пункт 2\]'
grep -n '^model:' harness/commands/*.md harness/agents/*.md
```

**Ожидание**: `12`; `model: opus` только у `roadmap.md`, `plan.md`,
`implement.md`, `verifier.md` — в «Фактах» у них `opus`, у остальных «в
frontmatter не задана».

**Действие**: для 2–3 записей на выбор открыть файл команды и сверить каждое
утверждение «вход / выход / решение за человеком». Опорные места:

| Запись | Где в тексте команды |
|---|---|
| `/roadmap`: три части и меньше → STOP | `harness/commands/roadmap.md`, «Порог» |
| `/plan`: кросс-ревью Codex, `--no-codex` | `harness/commands/plan.md`, «Флаги», «Кросс-ревью плана (Codex)» |
| `/implement`: STOP-точки | `harness/commands/implement.md`, «1а», «1б», «3а», «4» |
| `verifier`: только путь к плану, без контекста реализации | `harness/agents/verifier.md`, вступление и frontmatter `tools` |
| `/code-review`: повторный `verifier` только при существующем `-verify.md` | `harness/commands/code-review.md`, «По завершении» |
| хуки: до 200 символов запроса | `harness/hooks/pipeline-clock.sh`, выражение `.[0:200]` |

**Ожидание**: ни одного утверждения, которого нет в тексте файла.

### 4.3 Установка в пустой HOME

**Действие**:

```bash
mkdir "$T/h1"
HOME="$T/h1" /bin/bash -e "$T/install.sh"; echo "exit=$?"
ls "$T/h1/.claude/commands" | wc -l
ls "$T/h1/.claude/agents"
test -x "$T/h1/.claude/hooks/notify.sh" && test -x "$T/h1/.claude/hooks/pipeline-clock.sh" && echo hooks-exec
jq -e '.hooks | keys' "$T/h1/.claude/settings.json"
cmp harness/CLAUDE.md "$T/h1/.claude/CLAUDE.md" && echo claude-md-equal
```

**Ожидание**: `exit=0`; `8`; `verifier.md`; `hooks-exec`; ключи
`Notification`, `PostToolUse`, `PreToolUse`, `Stop`, `UserPromptSubmit`;
`claude-md-equal`.

### 4.4 Установка поверх существующих файлов

**Действие**:

```bash
mkdir -p "$T/h2/.claude"
echo '{"marker":1}' > "$T/h2/.claude/settings.json"
echo 'MARKER' > "$T/h2/.claude/CLAUDE.md"
cp "$T/h2/.claude/settings.json" "$T/s.bak"; cp "$T/h2/.claude/CLAUDE.md" "$T/c.bak"
HOME="$T/h2" /bin/bash -e "$T/install.sh"; echo "exit=$?"
cmp "$T/s.bak" "$T/h2/.claude/settings.json" && cmp "$T/c.bak" "$T/h2/.claude/CLAUDE.md" && echo existing-unchanged
```

**Ожидание**: `exit=0`; `existing-unchanged`; команды, агент и хуки при этом
скопированы (`ls "$T/h2/.claude/commands" | wc -l` → `8`).

### 4.5 Проверки репозитория

**Действие**:

```bash
scripts/check-leaks.sh; echo "exit=$?"
scripts/check-harness-refs.sh; echo "exit=$?"
```

**Ожидание**: `check-leaks: 0 совпадений`, `exit=0`;
`check-harness-refs: 0 нарушений`, `exit=0`.

## 5. Матрица веток установки

| `settings.json` до | `CLAUDE.md` до | Ожидание после блока установки |
|---|---|---|
| нет | нет | оба созданы из `harness/` (4.3) |
| есть | есть | оба без изменений (4.4) |
| есть | нет | `settings.json` без изменений, `CLAUDE.md` = `harness/CLAUDE.md` |
| нет | есть | `settings.json` = `harness/settings-hooks.json`, `CLAUDE.md` без изменений |

**Действие** для двух смешанных строк — как в 4.4, но создать только один
файл-метку (`$T/h3` — только `settings.json`, `$T/h4` — только `CLAUDE.md`),
затем `cmp` с меткой и с файлом из `harness/`.

| Одноимённый файл до | Ожидание |
|---|---|
| `~/.claude/commands/plan.md` с текстом `OLD` | заменён на `harness/commands/plan.md` (`cmp` совпадает) |
| `~/.claude/hooks/notify.sh` с текстом `OLD` | заменён, исполняемый |
| посторонняя команда `~/.claude/commands/other.md` | не тронута |

## 6. Edge cases

| Действие | Ожидание |
|---|---|
| выполнить `$T/install.sh` не из корня репозитория: `(cd "$T" && HOME="$T/h5" /bin/bash "$T/install.sh")` | `cp` пишет «No such file or directory» про `harness/…`; в `$T/h5/.claude` только пустые `commands/`, `agents/`, `hooks/` |
| выполнить блок дважды подряд с одним HOME | второй прогон `exit=0`, содержимое не меняется |
| вставить блок построчно в `zsh` (интерактивно, с `HOME="$T/h6"` через `export`) | результат как в 4.3 |

## 7. Известные ограничения (багом не считать)

- Сайт по адресу `https://stels54.github.io/claude-code-harness/` ещё не
  опубликован — так и написано в README; ссылка заработает после пункта 3.
- Внешние ссылки README (документация Claude Code, Codex CLI) скриптами не
  проверяются; проверяются только относительные ссылки на файлы
  репозитория.
- При существующих `settings.json`/`CLAUDE.md` установка не сливает их с
  ядром — перенос ключа `hooks` и разделов делается вручную (решение плана).
- Одноимённые команды, агент и хуки в `~/.claude` перезаписываются без
  вопроса; README предупреждает о резервной копии.
- Без git-диапазона `/code-review` не видит неотслеживаемые файлы — свойство
  текущего снимка, описано в README и «Фактах», не исправлялось.
- В «Фактах» дальнейших пунктов «затрагивает» стоит `4, 5` у записей команд и
  `5` у хуков и `CLAUDE.md` — допущение плана.
- Ссылки README на файлы ведут на `main`, не на тег: постоянные ссылки —
  пункт 7 роадмапа.

## 8. Cleanup

```bash
rm -rf "$T"
git status --short
```

**Ожидание**: временный каталог удалён, `git status --short` пуст — ручная
проверка в репозитории ничего не меняет.

## 9. Приложение: что где описано

| Вопрос | Источник истины |
|---|---|
| вход/выход/модель/STOP шага | «Факты» роадмапа → текст `harness/commands/*.md`, `harness/agents/verifier.md` |
| как устроено ревью другой моделью | «Факты», запись про Codex → `harness/commands/plan.md`, `harness/commands/code-review.md` |
| что пишут хуки | `harness/settings-hooks.json`, `harness/hooks/*.sh` |
| как ставить | `README.md`, «Установка» |
