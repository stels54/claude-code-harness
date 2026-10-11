# Мануал: Каркас сайта и публикация на GitHub Pages

План: `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md`
Верификация: `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-verify.md`
Ревью: `docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages-review.md`

## 1. Назначение

Пункт 3 роадмапа `docs/roadmaps/2026-10-11_1236_public-showcase.md` дал:

- **`site/`** — Vite + React + TypeScript (шаблон `create-vite@9.2.1
  --template react-ts --eslint`), `base: '/claude-code-harness/'`,
  страница-заглушка: заголовок «Конвейер разработки с ИИ-агентами», абзац
  «План → реализация → изолированная проверка → ревью другой моделью. Сайт в
  разработке.», ссылки «Репозиторий на GitHub» и «README». Шрифт — системный
  стек, сторонних ресурсов нет.
- **`.github/workflows/pages.yml`** — workflow «Pages»: на push в `main` и
  вручную (`workflow_dispatch`); job `build` (`npm ci`, `lint`, `test`,
  `build`, выгрузка `site/dist`) и job `deploy` (`actions/deploy-pages@v5`).
- **`scripts/check-links.sh`** — проверка ссылок без сети: категории `md`
  (относительные ссылки в `*.md`), `repo` (ссылки
  `github.com/stels54/claude-code-harness/blob|tree/<ref>/<путь>` по
  локальному git), `anchor` (`href="#…"` в `site/src/*.tsx` против `id="…"`).
  Выход 0 / 1 (нарушения) / 2 (ошибка, «проверка неполна»).
- **`scripts/hooks/pre-push`** — перед push выгружает дерево вершины каждой
  пушимой ветки во временный репозиторий и запускает
  `scripts/check-leaks.sh`. Ставится `git config core.hooksPath scripts/hooks`.
- **Корневой `CLAUDE.md`** — команды проверки для `/verify`; в `README.md` —
  раздел «Работа с репозиторием».

Ручная приёмка нужна для того, что автоматически не проверить: публикация на
GitHub Pages, вкладка Network на опубликованном адресе, доступ из РФ без VPN
с компьютера и с телефона через мобильный интернет.

## 2. Чек-лист

- [ ] 3 — окружение готово
- [ ] 4.1 — локальные проверки сайта и репозитория
- [ ] 4.2 — локальный preview: заглушка, Network, 360px
- [ ] 4.3 — хук установлен, чистый push-прогон
- [ ] 4.4 — push в `main` и workflow «Pages» (**главное**, тимлид)
- [ ] 4.5 — опубликованный сайт: Network только свой домен (**главное**)
- [ ] 4.6 — из РФ без VPN: компьютер и телефон (**главное**)
- [ ] 5 — матрица веток `check-links.sh` и `pre-push`
- [ ] 6 — edge cases
- [ ] 9 — cleanup

## 3. Pre-requisites

- Клон репозитория на коммите «feat: каркас сайта, публикация на GitHub
  Pages, проверка ссылок и pre-push хук» или новее.
- Node.js 22 (проверено на v22.18.0), npm 10. Все команды — из корня
  репозитория в терминале хоста.
- Зависимости сайта: `npm --prefix site ci` → завершается без ошибок, появился
  `site/node_modules/`.
- Непустой список запрещённых строк в
  `~/.config/harness-publish/denylist.txt` (или путь в `HARNESS_DENYLIST`).
  Содержимое не выводить и никуда не копировать.
- Chrome с DevTools; телефон с мобильным интернетом (для 4.6).
- Для 4.4: права администратора репозитория `stels54/claude-code-harness` на
  GitHub. Сейчас репозиторий приватный — Pages на приватном репозитории без
  платного тарифа недоступен.

## 4. Happy path

### 4.1. Локальные проверки

**Действие**:
```bash
npm --prefix site run typecheck
npm --prefix site run lint
npm --prefix site test
npm --prefix site run build
scripts/check-leaks.sh
scripts/check-harness-refs.sh
scripts/check-links.sh
```
**Ожидание**: у всех exit 0; `test` → `Tests  1 passed (1)`; `build` →
`✓ built in …`; последние строки скриптов — `check-leaks: 0 совпадений`,
`check-harness-refs: 0 нарушений`, `check-links: 0 нарушений`.

**Действие**: `grep -o '/claude-code-harness/[^"]*' site/dist/index.html`
**Ожидание**: три пути — `/claude-code-harness/favicon.svg`,
`/claude-code-harness/assets/index-<хэш>.js`,
`/claude-code-harness/assets/index-<хэш>.css`.

### 4.2. Локальный preview

**Действие**: `npm --prefix site run preview -- --port 4173 --strictPort`,
открыть в Chrome `http://localhost:4173/claude-code-harness/`, DevTools →
Network, перезагрузить страницу.
**Ожидание**:
- вкладка браузера — «Конвейер разработки с ИИ-агентами»;
- на странице заголовок «Конвейер разработки с ИИ-агентами», абзац «План →
  реализация → изолированная проверка → ревью другой моделью. Сайт в
  разработке.», ссылки «Репозиторий на GitHub» и «README»;
- в Network только `localhost:4173`: документ, `index-<хэш>.js`,
  `index-<хэш>.css`, `favicon.svg`; запросов к шрифтовым CDN и другим доменам
  нет.

**Действие**: DevTools → Toggle device toolbar, ширина 360px.
**Ожидание**: горизонтальной прокрутки нет, ссылки переносятся; в консоли
`document.documentElement.scrollWidth <= window.innerWidth` → `true`.

**Действие**: клик по «README».
**Ожидание**: открывается
`https://github.com/stels54/claude-code-harness/blob/main/README.md` (пока
репозиторий приватный — только для залогиненного с доступом, иначе 404).

### 4.3. Хук перед push

**Действие**: `git config core.hooksPath scripts/hooks`, затем
```bash
echo "refs/heads/main $(git rev-parse HEAD) refs/heads/main 0000000000000000000000000000000000000000" | scripts/hooks/pre-push origin x; echo "exit=$?"
```
**Ожидание**: `pre-push: проверка refs/heads/main (<sha>)`,
`check-leaks: 0 совпадений`, `exit=0`.

### 4.4. Push и workflow «Pages» (тимлид)

**Действие**:
1. Сделать репозиторий публичным (Settings → General → Danger Zone → Change
   visibility) — решение тимлида.
2. Settings → Pages → Build and deployment → Source: «GitHub Actions».
3. С хуком из 4.3: `git push origin main`.

**Ожидание**:
- до отправки в терминале — `pre-push: проверка refs/heads/main (<sha>)` и
  `check-leaks: 0 совпадений`;
- во вкладке Actions — прогон workflow «Pages»: job `build` (шаги `npm ci`,
  `npm run lint`, `npm test`, `npm run build`, upload artifact) и job
  `deploy` — зелёные; у `deploy` ссылка
  `https://stels54.github.io/claude-code-harness/`;
- `curl -s -o /dev/null -w '%{http_code}\n' https://stels54.github.io/claude-code-harness/`
  → `200`.

Если первый прогон упал на `deploy` до выбора источника «GitHub Actions» —
после настройки перезапустить: Actions → Pages → Run workflow (`main`).

### 4.5. Опубликованный сайт: Network

**Действие**: открыть `https://stels54.github.io/claude-code-harness/` в
Chrome, DevTools → Network → Disable cache → перезагрузить.
**Ожидание**: заглушка как в 4.2; все запросы к `stels54.github.io` (документ,
JS, CSS, `favicon.svg`), других доменов нет.

### 4.6. Доступ из РФ без VPN

**Действие**: VPN выключен; открыть адрес из 4.5:
1. на компьютере из РФ;
2. на телефоне через мобильный интернет (Wi-Fi выключен), указать оператора.

**Ожидание**: в обоих случаях заглушка открывается целиком, без
горизонтальной прокрутки на телефоне. Итог по каждому пункту (открылось/нет,
оператор, домены в Network) передать для записи в «Факты» роадмапа. Не
открывается — не баг сайта: по допущению роадмапа это повод для отдельного
решения о хостинге.

## 5. Матрица веток

Временные файлы создаются в корне репозитория и удаляются в п. 9.
`U` — URL несуществующего файла репозитория:
```bash
U='https://github.com/stels54/claude-code-harness/blob/main/no-such-file.md'
```

### 5.1. `scripts/check-links.sh`

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `printf 'x [a](no-such-file.md)\n' > zz-a.md` → скрипт | `zz-a.md:1: md: no-such-file.md`, exit 1 |
| 2 | `printf 'y %s\n' "$U" > zz-b.md` → скрипт | `zz-b.md:1: repo: <U>`, exit 1 |
| 3 | `printf '%s\n' "$U" > zz-c.txt` → скрипт | `zz-c.txt:1: repo: <U>`, exit 1 |
| 4 | в `zz-d.md` обе ссылки из 1–2, каждая в обратных кавычках | для `zz-d.md` строк нет |
| 5 | `printf 'export const T = () => <a href="#no-anchor">x</a>\n' > site/src/Tmp.tsx` → скрипт | `site/src/Tmp.tsx:1: anchor: #no-anchor`, exit 1 |
| 6 | `zz-e.txt` с `…/claude-code-harness/blob/main/harness` (каталог через `blob`) | строка `repo` (для каталога нужен `tree`) |
| 7 | `zz-f.txt` с `…/claude-code-harness/tree/main/harness` и `…/blob/main/README.md` | нарушений для `zz-f.txt` нет |
| 8 | `zz-g.txt` с `…/blob/no-such-ref/README.md` | строка `repo` (ref не разрешается локально) |
| 9 | удалить все `zz-*` и `site/src/Tmp.tsx` → скрипт | `check-links: 0 нарушений`, exit 0 |

### 5.2. `scripts/hooks/pre-push`

Во временном клоне, с безвредным токеном во временном списке:
```bash
W=$(mktemp -d); H="$PWD/scripts/hooks/pre-push"
git clone -q . "$W/repo"; cd "$W/repo"
echo zqxprobetoken > "$W/deny.txt"; export HARNESS_DENYLIST="$W/deny.txt"
push() { echo "refs/heads/main $1 refs/heads/main 0" | "$H" origin x; echo "exit=$?"; }
```

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `echo zqxprobetoken > probe.txt; git add probe.txt; git commit -qm a; push $(git rev-parse HEAD)` | `probe.txt:1: denylist`, `pre-push: check-leaks вернул 1 …, push отменён`, `exit=1` |
| 2 | `git rm -q probe.txt; printf 'p.txt export-ignore\n' > .gitattributes; echo zqxprobetoken > p.txt; git add .gitattributes p.txt; git commit -qm b; push $(git rev-parse HEAD)` | `p.txt:1: denylist`, `exit=1` |
| 3 | `git rm -q p.txt .gitattributes; mkdir -p site; printf 'x.local\n' > site/.gitignore; echo zqxprobetoken > site/x.local; git add site/.gitignore; git add -f site/x.local; git commit -qm c; push $(git rev-parse HEAD)` | `site/x.local:1: denylist`, `exit=1` |
| 4 | `push 1111111111111111111111111111111111111111` | `pre-push: нет коммита 1111… (refs/heads/main), push отменён`, `exit=2`, сканер не запускается |
| 5 | `HARNESS_DENYLIST=/нет/файла push $(git rev-parse HEAD)` | `check-leaks: нет списка запрещённых строк: /нет/файла`, `exit=2` |
| 6 | stdin — строка удаления ветки: `echo "(delete) 0000000000000000000000000000000000000000 refs/heads/x 0" \| "$H" origin x` | ничего не проверяется, exit 0 |

После: `cd -; rm -rf "$W"; unset HARNESS_DENYLIST`.

## 6. Edge cases

- **Нечитаемый файл в проверке ссылок**: `printf 'x\n' > zz-u.txt; chmod 000
  zz-u.txt; scripts/check-links.sh` → `check-links: ошибка чтения zz-u.txt,
  проверка неполна`, exit 2. Удалить `rm -f zz-u.txt`.
- **`node_modules` и `dist` не проверяются**: `git check-ignore
  site/node_modules site/dist` → выводит оба пути;
  `git status --short -uall | grep -c -E 'node_modules|/dist/'` → `0`.
- **Порт 4173 занят**: preview с `--strictPort` завершается ошибкой, а не
  уходит на другой порт — запустить с другим `--port`.
- **Push без списка запрещённых строк** на другой машине: push отменяется с
  кодом 2 — ожидаемо, см. раздел «Перед push» в `CLAUDE.md`.

## 7. Фронтенд-нюансы и известные ограничения (багом не считать)

- Заглушка без дизайна: стиль, схема и разделы — пункты 4–5.
- Фавикон — `site/public/favicon.svg` шаблона Vite, заменится в пункте 4.
- Ссылка «README» собрана шаблонной строкой в `site/src/App.tsx`, поэтому
  `check-links.sh` её не видит: проверяются только литеральные URL
  (записано в «Факты» роадмапа).
- Ссылки на файлы ведут на `main`, а не на тег — тег v1 в пункте 7.
- `check-links.sh` не ходит в сеть: внешние ссылки и страницы опубликованного
  сайта не проверяются. Ссылки `blob/main/…` проверяются по локальному
  `main`, а не по `origin/main`.
- В `*.md` ссылки внутри inline-кода и fenced-блоков пропускаются, в других
  файлах (`.txt`, `.tsx`) — проверяются.
- pre-push проверяет только вершину каждой пушимой ветки, не промежуточные
  коммиты; в CI проверки запрещённых строк нет.
- Окно Chrome через расширение не сужается до 360px — при автоматической
  приёмке ширину проверяли в iframe шириной 360px; руками используйте режим
  устройства DevTools.
- `README.md`, «Дата снимка и сайт», до публикации пишет «пока не
  опубликован» — строка меняется после фактической публикации.

## 8. Автотесты

| Команда | Ожидание |
|---------|----------|
| `npm --prefix site test` | `Test Files  1 passed (1)`, `Tests  1 passed (1)` (`site/vite.config.test.ts`: `base` = `/claude-code-harness/`) |
| `npm --prefix site run typecheck` | `> tsc -b`, exit 0 |
| `npm --prefix site run lint` | `> eslint .`, exit 0 |
| `npm --prefix site run build` | `✓ built in …`, exit 0 |
| `scripts/check-leaks.sh` | `check-leaks: 0 совпадений` |
| `scripts/check-harness-refs.sh` | `check-harness-refs: 0 нарушений` |
| `scripts/check-links.sh` | `check-links: 0 нарушений` |

## 9. Cleanup

- Остановить preview (Ctrl+C).
- `rm -f zz-*.md zz-*.txt site/src/Tmp.tsx`; `git status --short` — пусто.
- Временный клон из 5.2 удалён (`rm -rf "$W"`), `HARNESS_DENYLIST` снят.
- `site/dist/` можно оставить: он в `.gitignore`.
- Хук (`core.hooksPath`) оставить установленным.

## 10. Приложения

### Что смотреть в Network

| Где | Допустимые запросы |
|-----|--------------------|
| `http://localhost:4173/claude-code-harness/` | только `localhost:4173`: документ, `assets/index-<хэш>.js`, `assets/index-<хэш>.css`, `favicon.svg` |
| `https://stels54.github.io/claude-code-harness/` | только `stels54.github.io`: те же четыре ресурса |

### Коды выхода

| Скрипт | 0 | 1 | 2 |
|--------|---|---|---|
| `scripts/check-links.sh` | нарушений нет | есть нарушения `md`/`repo`/`anchor` | не git-репозиторий, ошибка чтения |
| `scripts/hooks/pre-push` | утечек нет | `check-leaks` нашёл совпадения | нет коммита, ошибка выгрузки дерева, нет/пустой список |
