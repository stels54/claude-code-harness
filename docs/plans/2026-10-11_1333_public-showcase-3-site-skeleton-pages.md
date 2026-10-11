# Plan: Каркас сайта и публикация на GitHub Pages

## Контекст
Роадмап: docs/roadmaps/2026-10-11_1236_public-showcase.md, пункт 3

Пункты 1–2 положили в репозиторий снимок ядра `harness/`, проверки
`scripts/check-leaks.sh` и `scripts/check-harness-refs.sh` и README. Теперь
нужен каркас сайта: проект Vite + React + TypeScript в `site/` со
страницей-заглушкой, `base` под адрес https://stels54.github.io/claude-code-harness/,
все ресурсы локально; публикация через GitHub Actions на push в `main`;
корневой `CLAUDE.md` с командами проверки для `/verify`; скрипт проверки
ссылок в `scripts/`; версионируемый pre-push хук с проверкой запрещённых строк.
Push, включение Pages и проверки опубликованного адреса делает человек:
репозиторий сейчас приватный, публичным его делает тимлид.

## Окружение
- Node.js 22 и npm 10 (локально v22.18.0 / 10.9.3), сеть до registry.npmjs.org
  для `npm install`.
- `scripts/check-leaks.sh` со списком запрещённых строк в
  `~/.config/harness-publish/denylist.txt` (вне git; его строки не выводятся
  и не записываются в репозиторий).
- Браузер (Chrome-расширение) для локальной приёмки заглушки через
  `npm run preview`; нет расширения — шаг `local-preview-network` ⏸️ DEFERRED.
- GitHub: push в `main`, настройки Pages и видимость репозитория — действие
  пользователя (шаги `user-push-enable-pages`, `user-manual-access-check`).

## Шаги

### Step 1 — scaffold-vite-site
- **Цель**: завести проект сайта стандартным шаблоном Vite с ESLint.
- **Файл**: `site/**` (новый каталог), `site/package-lock.json`
- **Изменение**: из корня репозитория `npx -y create-vite@9.2.1 site
  --template react-ts --eslint --no-interactive`, затем `npm install` в
  `site/` (появляется `site/package-lock.json`). Удалить шаблонный
  `site/README.md` (англоязычный текст шаблона со ссылками на сторонние
  сайты; описание сайта живёт в корневом README и `CLAUDE.md`). Остальные
  файлы шаблона в этом шаге не трогать.
- **Референс**: пробный прогон этой же команды в scratchpad при
  планировании: шаблон кладёт `.gitignore` (строки `node_modules`, `dist`,
  `dist-ssr`, `*.local`), `eslint.config.js` (`globalIgnores(['dist'])`,
  typescript-eslint, react-hooks, react-refresh), `tsconfig.json` со ссылками
  на `tsconfig.app.json` (`include: ["src"]`) и `tsconfig.node.json`
  (`include: ["vite.config.ts"]`, `module: nodenext`), скрипты `dev`,
  `build: tsc -b && vite build`, `lint: eslint .`, `preview`. Без `--eslint`
  create-vite 9 ставит oxlint (`create-vite --help`: «--eslint use ESLint
  instead of Oxlint»).
- **Риск**: create-vite при отсутствии флага `--no-interactive` уходит в
  интерактивный режим; `npm install` может упасть внутренней ошибкой npm
  (при планировании `npm i -D vitest@4` упал `Cannot read properties of null
  (reading 'edgesOut')`, повтор без версии прошёл) — повторить установку.
- **Проверка**: `ls site/package.json site/package-lock.json
  site/eslint.config.js` — файлы есть; `test ! -e site/README.md`;
  `npm --prefix site run lint` → exit 0; `npm --prefix site run build` →
  exit 0; `git check-ignore site/node_modules site/dist` → выводит оба пути, exit 0;
  `git status --short -uall | grep -c -E 'node_modules|/dist/'` → 0.
- **dependsOn**: —

### Step 2 — vitest-and-scripts
- **Цель**: дать проекту раннер тестов и отдельную команду typecheck.
- **Файл**: `site/package.json`, `site/package-lock.json`,
  `site/tsconfig.node.json`
- **Изменение**: `npm install -D vitest` в `site/` (мажор 5, совместим с
  `vite ^8`: peerDependencies `vite: ^6.4.0 || ^7.0.0 || ^8.0.0`). В
  `scripts` добавить `"typecheck": "tsc -b"` и `"test": "vitest run"`.
  В `tsconfig.node.json` расширить `include` до
  `["vite.config.ts", "vite.config.test.ts"]`, чтобы тест конфига шага 3
  проходил typecheck.
- **Референс**: `site/package.json` после шага 1 (секция `scripts`),
  `site/tsconfig.node.json` после шага 1 (`include`).
- **Риск**: `vitest run` без тест-файлов завершается с кодом 1 («No test
  files found») — до шага 3 `npm test` красный, это ожидаемо.
- **Проверка**: `npm --prefix site run typecheck` → exit 0;
  `grep -c '"vitest"' site/package.json` → 1.
- **dependsOn**: scaffold-vite-site

### Step 3 — test-vite-base
- **Цель**: закрепить тестом адрес публикации, под который собирается сайт.
- **Файл**: `site/vite.config.test.ts`
- **Изменение**: тест vitest: импортирует конфиг по умолчанию из
  `./vite.config.ts` (с расширением — `module: nodenext` в
  `tsconfig.node.json` без него падает TS2307, проверено при планировании) и
  проверяет, что `config.base` строго равно `'/claude-code-harness/'`.
  Вход — объект, возвращаемый `defineConfig`; точка вызова — `npm test`.
  Проверять через `import.meta.env.BASE_URL` нельзя: vitest подменяет base
  на `/` (при планировании тест с `BASE_URL` давал `Received: "/"` и с
  выставленным `base`).
- **Референс**: — (тестов в репозитории ещё нет)
- **Риск**: тест сверяет литерал конфига, а не собранный `dist`; адрес в
  собранном HTML дополнительно проверяется в шаге `local-preview-network`.
- **Проверка**: red: `npm --prefix site test` — `expected undefined to be
  '/claude-code-harness/'` → green после `vite-base`; `npm --prefix site run
  typecheck` → exit 0; `npm --prefix site run lint` → exit 0.
- **dependsOn**: vitest-and-scripts

### Step 4 — vite-base
- **Цель**: собирать сайт под адрес GitHub Pages проекта.
- **Файл**: `site/vite.config.ts`
- **Изменение**: добавить `base: '/claude-code-harness/'` в объект
  `defineConfig`.
- **Референс**: `site/vite.config.ts` после шага 1 (`defineConfig({ plugins:
  [react()] })`).
- **Риск**: —
- **Проверка**: тест шага `test-vite-base` зелёный (`npm --prefix site test`
  → `1 passed`); после `npm --prefix site run build`
  `grep -c '/claude-code-harness/assets/' site/dist/index.html` ≥ 1.
- **dependsOn**: test-vite-base

### Step 5 — stub-page
- **Цель**: заменить демо-страницу шаблона на русскую заглушку без сторонних
  ресурсов.
- **Файл**: `site/index.html`, `site/src/App.tsx`, `site/src/App.css`,
  `site/src/index.css`, удаление `site/src/assets/hero.png`,
  `site/src/assets/react.svg`, `site/src/assets/vite.svg`,
  `site/public/icons.svg`
- **Изменение**: `index.html` — `lang="ru"`, `<title>` «Конвейер разработки
  с ИИ-агентами», `meta name="description"` одной фразой; фавикон
  `public/favicon.svg` шаблона остаётся (локальный файл). `App.tsx` —
  заголовок «Конвейер разработки с ИИ-агентами», абзац с названием по факту
  «план → реализация → изолированная проверка → ревью другой моделью» и
  пометкой «сайт в разработке», ссылки на репозиторий
  `https://github.com/stels54/claude-code-harness` и на README
  `https://github.com/stels54/claude-code-harness/blob/main/README.md`; без
  счётчика, без картинок шаблона. `App.css`/`index.css` — минимальная
  вёрстка: системный стек шрифтов (`system-ui, -apple-system, "Segoe UI",
  Roboto, sans-serif`), без `@import`/`url()` на внешние адреса, без
  горизонтальной прокрутки на 360px (`max-width` контента, `padding`,
  `overflow-wrap: anywhere` для ссылок). Удалить ставшие неиспользуемыми
  ассеты шаблона.
- **Референс**: `site/src/App.tsx` шаблона после шага 1 (внешние ссылки на
  vite.dev, react.dev, github.com/vitejs, chat.vite.dev, x.com, bsky.app и
  `<use href="/icons.svg#…">` — всё это уходит); `site/index.html` шаблона
  (`lang="en"`, `<title>site</title>`).
- **Риск**: оставленный импорт удалённого ассета ломает сборку — ловится
  `build`; абсолютный `/favicon.svg` в `index.html` Vite переписывает с учётом
  `base` — проверяется по `dist/index.html`.
- **Проверка**: `npm --prefix site run typecheck && npm --prefix site run lint
  && npm --prefix site test && npm --prefix site run build` → все exit 0;
  `grep -rn -E 'vite\.dev|react\.dev|x\.com|bsky\.app|icons\.svg|hero\.png'
  site/src site/index.html` → пусто; ссылки на внешние ресурсы в собранных
  HTML/CSS: `grep -rhoE '(src|href)="[^"]*"|url\([^)]*\)' site/dist
  --include='*.html' --include='*.css' | grep -E 'https?://|//'` → пусто
  (все `src`/`href`/`url()` начинаются с `/claude-code-harness/` или
  относительные).
- **dependsOn**: vite-base

### Step 6 — pages-workflow
- **Цель**: собирать и публиковать сайт на каждый push в `main`.
- **Файл**: `.github/workflows/pages.yml`
- **Изменение**: workflow «Pages»: триггеры `push` в `main` и
  `workflow_dispatch`; `permissions: contents: read, pages: write,
  id-token: write`; `concurrency: group: pages, cancel-in-progress: false`.
  Job `build` (ubuntu-latest, `defaults.run.working-directory: site`):
  `actions/checkout@v7`, `actions/setup-node@v7` (`node-version: 22`,
  `cache: npm`, `cache-dependency-path: site/package-lock.json`), `npm ci`,
  `npm run lint`, `npm test`, `npm run build`,
  `actions/upload-pages-artifact@v5` с `path: site/dist`. Job `deploy`
  (`needs: build`, `environment: name: github-pages, url:
  ${{ steps.deployment.outputs.page_url }}`): `actions/deploy-pages@v5`
  с `id: deployment`.
- **Референс**: — (workflow в репозитории нет: `ls .github` → No such file);
  последние релизы на 2026-10-11 по `gh api repos/<action>/releases/latest`:
  checkout v7.0.1, setup-node v7.1.0, upload-pages-artifact v5.0.0,
  deploy-pages v5.0.1.
- **Риск**: на приватном репозитории без платного тарифа Pages недоступен —
  деплой упадёт до того, как тимлид сделает репозиторий публичным; это
  проверяется в шаге `user-push-enable-pages`, локально не воспроизводится.
  Проверка запрещённых строк в CI не запускается: списка там нет, а
  `check-leaks.sh` без списка выходит с кодом 2.
- **Проверка**: YAML разбирается: `ruby -ryaml -e 'y=YAML.load_file(".github/workflows/pages.yml"); puts y["jobs"].keys.join(",")'`
  → `build,deploy`; `grep -c 'site/package-lock.json\|path: site/dist'
  .github/workflows/pages.yml` → 2; фактический прогон — шаг
  `user-push-enable-pages`.
- **dependsOn**: stub-page

### Step 7 — check-links-script
- **Цель**: ловить битые ссылки на файлы репозитория и внутренние якоря.
- **Файл**: `scripts/check-links.sh`
- **Изменение**: bash-скрипт в стиле `scripts/check-leaks.sh`
  (`set -u`, корень из аргумента или `git rev-parse --show-toplevel`, список
  файлов `git ls-files -z --cached --others --exclude-standard` — так
  `node_modules` и `dist` не обходятся, временный каталог с `trap`, вывод
  `файл:строка: категория: ссылка`, итоговая строка «check-links: N
  нарушений», выход 0 — нарушений нет, 1 — есть, 2 — ошибка настройки).
  Три проверки:
  1. `md` — во всех файлах `*.md` относительные ссылки `](цель)` (без схемы
     `xxx:`, не начинающиеся с `#`); фрагмент `#…` отбрасывается, путь
     разрешается от каталога файла и должен существовать. Содержимое
     fenced-блоков (```` ``` ````) и inline-кода в обратных кавычках не
     проверяется — в планах такие ссылки служат примерами
     (`docs/plans/2026-10-11_1319_public-showcase-2-readme-pipeline-facts.md:188`).
  2. `repo` — во всех текстовых файлах ссылки
     `https://github.com/stels54/claude-code-harness/(blob|tree)/<ref>/<путь>`
     с `<ref>` из `[A-Za-z0-9._-]` и путём из `[A-Za-z0-9._/-]`: `<ref>`
     должен разрешаться в коммит локально (`git rev-parse --verify -q
     "<ref>^{commit}"`), путь — существовать в нём (`git cat-file -e
     "<ref>:<путь>"`; для `tree` — каталог). Ссылка на корень репозитория
     без `blob|tree` не проверяется. В файлах `*.md` ссылки внутри
     fenced-блоков и inline-кода пропускаются так же, как в проверке `md`
     (примеры в планах).
  3. `anchor` — в `site/src/**/*.tsx` каждый литерал `href="#x"` имеет
     литерал `id="x"` где-либо в `site/src`.
  Ошибка чтения файла (нечитаемый файл, сбой `grep`/`awk`) — выход 2 «проверка
  неполна», а не пропуск файла. Сетевые запросы скрипт не делает.
- **Референс**: `scripts/check-leaks.sh:11-15` (корень и проверка
  git-репозитория), `:33-39` (листинг файлов), `:22-23` (`mktemp`/`trap`),
  `:69-72` (итог и код выхода); `scripts/check-harness-refs.sh:21-23`
  (формат строки нарушения).
- **Риск**: ложные срабатывания на markdown-ссылках в длинных inline-кодах,
  разорванных переносом строки; ссылки `blob/main/…` проверяются по
  локальному `main`, а не по `origin/main` — файл, не запушенный на GitHub,
  пройдёт проверку.
- **Проверка**: `scripts/check-links.sh` по репозиторию → exit 0, «0
  нарушений»; негативные сценарии во временных неотслеживаемых файлах (после
  проверки удалить): `.md` в корне со ссылкой `](нет-такого-файла.md)` →
  exit 1, строка с категорией `md`; тот же `.md` со ссылкой вне кода на
  `blob/main/no-such-file.md` этого репозитория (полный URL по контракту
  выше, ASCII-путь) → строка `repo`; `.txt` с тем же URL → строка `repo`;
  те же ссылки в обратных кавычках → не срабатывают; `site/src/Tmp.tsx` с `href="#нет-якоря"` → строка `anchor`; нечитаемый
  (`chmod 000`) временный `.txt` → exit 2;
  после удаления временных файлов → exit 0. `bash -n scripts/check-links.sh`
  → exit 0.
- **dependsOn**: stub-page

### Step 8 — pre-push-hook
- **Цель**: запускать проверку запрещённых строк перед каждым push без
  сторонних зависимостей.
- **Файл**: `scripts/hooks/pre-push`
- **Изменение**: исполняемый bash-хук. Читает со stdin строки
  `<local ref> <local sha> <remote ref> <remote sha>`; для каждой строки, где
  `local sha` не нулевой (не удаление ветки), выгружает дерево этого коммита
  во временный каталог через временный индекс (`GIT_INDEX_FILE=… git
  read-tree <sha>` и `git checkout-index -a --prefix=…`; не `git archive`,
  который пропускает файлы с атрибутом `export-ignore`), делает там `git init -q` и
  `git add -A -f .` — файлы коммита попадают в индекс независимо от
  `.gitignore` (иначе `check-leaks.sh:33` с `--exclude-standard` пропустит
  принудительно закоммиченный игнорируемый файл), — и запускает `scripts/check-leaks.sh <временный каталог>` из рабочего дерева
  (список берётся по обычному пути или `HARNESS_DENYLIST`). Любой выход
  `check-leaks.sh`, кроме 0, — хук завершается с тем же кодом и push
  отменяется; любая ошибка подготовки (`mktemp`, `git read-tree`,
  `git checkout-index`, `git init`, `git add`) — выход 2 с сообщением, push отменяется, сканер не
  запускается; вывод скрипта (файл, строка, категория) идёт в stderr.
  Установка — `git config core.hooksPath scripts/hooks` (описывается в шагах
  9–10); в этом репозитории выполнить её локально.
- **Референс**: `scripts/check-leaks.sh:11-15` (принимает корень
  git-репозитория аргументом), `:33` (`git ls-files --cached --others
  --exclude-standard` — во временном репозитории все выгруженные файлы
  попадают как неотслеживаемые).
- **Риск**: проверяется только вершина каждой пушимой ветки, а не каждый
  промежуточный коммит (см. «Не делаем»); выгрузка дерева коммита не
  захватывает неотслеживаемые файлы — так и задумано, проверяется то, что уходит.
- **Проверка**: `git config core.hooksPath` → `scripts/hooks`; `test -x
  scripts/hooks/pre-push`; чистый прогон: `echo "refs/heads/main $(git
  rev-parse HEAD) refs/heads/main 0000000000000000000000000000000000000000" |
  scripts/hooks/pre-push origin x` → exit 0; негатив: временный список
  `HARNESS_DENYLIST=<tmp>/deny.txt` с безвредным токеном, токен в файле
  временного коммита во временном клоне репозитория → хук exit 1 с
  категорией `denylist`; тот же токен в файле, подпадающем под
  `site/.gitignore` (`site/x.local`), добавленном `git add -f` во временном
  коммите → exit 1; тот же токен в файле с атрибутом `export-ignore` в
  `.gitattributes` временного коммита → exit 1; несуществующий sha в stdin → exit 2 до запуска
  сканера; без списка (`HARNESS_DENYLIST=/нет/файла`) → exit 2.
  Временные клон и список удалить.
- **dependsOn**: —

### Step 9 — root-claude-md
- **Цель**: дать `/verify` и `/implement` команды проверки этого репозитория.
- **Файл**: `CLAUDE.md` (корень, новый)
- **Изменение**: только соглашения этого репозитория: структура (`harness/` —
  публикуемый снимок, не конфигурация проекта; `site/` — сайт; `scripts/` —
  проверки; `docs/` — след прогона, публичен); пакетный менеджер — npm,
  lock-файл `site/package-lock.json`; команды проверки сайта —
  `npm --prefix site run typecheck`, `npm --prefix site run lint`,
  `npm --prefix site run build`, `npm --prefix site test`; проверки
  репозитория — `scripts/check-leaks.sh`, `scripts/check-harness-refs.sh`,
  `scripts/check-links.sh`; локальная приёмка — `npm --prefix site run
  preview`, адрес `http://localhost:4173/claude-code-harness/`; установка
  pre-push хука — `git config core.hooksPath scripts/hooks`, предпосылка —
  непустой список запрещённых строк по пути по умолчанию или в
  `HARNESS_DENYLIST` (без него push отменяется); строки списка
  запрещённых строк никуда не записываются. Глобальные правила не копировать.
- **Референс**: `harness/commands/verify.md:38-41` (команды берутся из
  проекта); `README.md:113-129` («Ограничения» — формат списков).
- **Риск**: `harness/CLAUDE.md` при работе с файлами `harness/` подхватывается
  поверх корневого (допущение роадмапа) — корневой не должен ему
  противоречить.
- **Проверка**: каждая команда из `CLAUDE.md` выполняется и даёт exit 0
  (`grep -o -E '`(npm --prefix site [a-z ]+|scripts/[a-z-]+\.sh)`' CLAUDE.md`
  → прогнать каждую, кроме `preview`); `scripts/check-links.sh` → 0
  нарушений; `grep -c '/Users/\|/home/' CLAUDE.md` → 0.
- **dependsOn**: vitest-and-scripts, check-links-script, pre-push-hook

### Step 10 — readme-dev-section
- **Цель**: показать в README, как работать с репозиторием и где сайт.
- **Файл**: `README.md`
- **Изменение**: новый раздел «Работа с репозиторием» перед «Дата снимка и
  сайт»: исходники сайта в `site/`, команды проверки — в `CLAUDE.md`
  (markdown-ссылкой на `CLAUDE.md` в корне), установка pre-push хука
  `git config core.hooksPath scripts/hooks` (хук запускает
  `scripts/check-leaks.sh` по пушимым коммитам; нужен непустой список
  запрещённых строк по пути `~/.config/harness-publish/denylist.txt` или в
  `HARNESS_DENYLIST`, без него push отменяется с кодом 2), публикация — GitHub Actions
  `.github/workflows/pages.yml` на push в `main`. Строку «Сайт будет по
  адресу … — пока не опубликован» не трогать до фактической публикации.
- **Референс**: `README.md:131-137` (раздел «Дата снимка и сайт»).
- **Риск**: —
- **Проверка**: `scripts/check-links.sh` → 0 нарушений (ссылка на
  `CLAUDE.md` живая); `grep -c 'core.hooksPath scripts/hooks' README.md` → 1.
- **dependsOn**: root-claude-md

### Step 11 — local-preview-network
- **Цель**: убедиться локально, что заглушка открывается под `base` и грузит
  только свои ресурсы.
- **Файл**: — (проверка, правок нет)
- **Изменение**: `npm --prefix site run build`, затем `npm --prefix site run
  preview -- --port 4173 --strictPort` в фоне; открыть
  `http://localhost:4173/claude-code-harness/` в браузере.
- **Референс**: `harness/agents/verifier.md:30-35` (браузерная приёмка).
- **Риск**: занят порт 4173 — `--strictPort` упадёт явно, выбрать другой.
- **Проверка**: `curl -s -o /dev/null -w '%{http_code}'
  http://localhost:4173/claude-code-harness/` → 200; в браузере виден
  заголовок «Конвейер разработки с ИИ-агентами»; список сетевых запросов
  страницы содержит только `localhost:4173`; на ширине окна 360px
  `document.documentElement.scrollWidth <= window.innerWidth`. Без
  Chrome-расширения — ⏸️ DEFERRED «нужен браузер», curl-проверка остаётся.
- **dependsOn**: stub-page

### Step 12 — user-push-enable-pages
- **Цель**: опубликовать сайт на GitHub Pages.
- **Файл**: — (действие пользователя/тимлида)
- **Изменение**: после коммита плана тимлид: делает репозиторий публичным
  (или иначе обеспечивает доступность Pages); в Settings → Pages → Source
  выбирает «GitHub Actions»; на машине, откуда идёт push, кладёт непустой
  список запрещённых строк в `~/.config/harness-publish/denylist.txt` (или
  задаёт `HARNESS_DENYLIST`), ставит хук (`git config core.hooksPath
  scripts/hooks`) и делает push `main`. Присылает: ссылку на прогон workflow
  «Pages» и его статус, HTTP-код `curl -s -o /dev/null -w '%{http_code}'
  https://stels54.github.io/claude-code-harness/`.
- **Референс**: —
- **Риск**: Pages на приватном репозитории без платного тарифа недоступен;
  первый прогон workflow до выбора источника «GitHub Actions» падает на
  `deploy-pages` — после настройки перезапустить через `workflow_dispatch`.
- **Проверка**: job `build` и `deploy` зелёные; curl → 200; страница
  показывает заголовок заглушки. До ответа — ⏸️ DEFERRED «нужен push и
  включение Pages тимлидом».
- **dependsOn**: pages-workflow, pre-push-hook, local-preview-network

### Step 13 — user-manual-access-check
- **Цель**: подтвердить доступность опубликованного сайта для читателей из РФ
  и отсутствие сторонних запросов.
- **Файл**: — (ручная проверка человеком)
- **Изменение**: человек открывает https://stels54.github.io/claude-code-harness/:
  (1) в браузере компьютера с DevTools → Network при перезагрузке — все
  запросы к `stels54.github.io`; (2) из РФ без VPN с компьютера; (3) с
  телефона через мобильный интернет (Wi-Fi выключен). Присылает итог по
  каждому пункту (открылось/нет, домены в Network). Итог записывается в
  «Факты» роадмапа; не открывается из РФ — переезд хостинга отдельным
  решением (допущение роадмапа).
- **Референс**: —
- **Риск**: доступность github.io зависит от оператора — проверка у одного
  оператора не гарантирует остальных.
- **Проверка**: три пункта подтверждены человеком. До ответа — ⏸️ DEFERRED
  «ручная проверка человеком».
- **dependsOn**: user-push-enable-pages

## Граф зависимостей
```
scaffold-vite-site → vitest-and-scripts → test-vite-base → vite-base → stub-page
stub-page → pages-workflow
stub-page → check-links-script
stub-page → local-preview-network
pre-push-hook (—)
vitest-and-scripts, check-links-script, pre-push-hook → root-claude-md → readme-dev-section
pages-workflow, pre-push-hook, local-preview-network → user-push-enable-pages → user-manual-access-check
```

## Параллельные группы
- Группа A (можно одновременно): pre-push-hook, scaffold-vite-site
- Группа B (после stub-page): pages-workflow, check-links-script,
  local-preview-network

## Финальный проход
- root-claude-md, readme-dev-section — после того как все команды
  проверки существуют.
- Перед коммитом: `scripts/check-leaks.sh`, `scripts/check-harness-refs.sh`,
  `scripts/check-links.sh` → 0.
- user-push-enable-pages, user-manual-access-check — после коммита, руками
  тимлида и человека.

## Критерии приёмки
- Локально `npm --prefix site run typecheck`, `lint`, `test`, `build`
  проходят; собранная заглушка открывается по
  `http://localhost:4173/claude-code-harness/` и грузит только свои ресурсы
  (шаги vite-base, stub-page, local-preview-network).
- `scripts/check-links.sh`, `scripts/check-leaks.sh`,
  `scripts/check-harness-refs.sh` по репозиторию дают 0 нарушений, ни один
  скрипт не обходит `node_modules` и `dist` (шаги scaffold-vite-site,
  check-links-script).
- Push с утечкой в пушимом коммите отменяется хуком из
  `scripts/hooks/pre-push`, установленным одной командой `git config
  core.hooksPath scripts/hooks` (шаг pre-push-hook).
- Корневой `CLAUDE.md` перечисляет команды проверки, и каждая выполняется
  (шаг root-claude-md).
- После push в `main` workflow публикует заглушку по
  https://stels54.github.io/claude-code-harness/; в Network только
  `stels54.github.io`; сайт открывается из РФ без VPN с компьютера и с
  телефона через мобильный интернет (шаги user-push-enable-pages,
  user-manual-access-check — действие человека).

## Не делаем
- Дизайн, схему конвейера и разделы сайта — пункты 4–5; заглушка без стиля
  сверх читаемости на 360px.
- Шрифтовые файлы: системный стек; CDN-шрифты и запросы к сторонним доменам
  запрещены.
- Проверку внешних ссылок по сети (кроме ссылок на файлы этого репозитория,
  которые проверяются локально через git) и ссылок на страницы
  опубликованного сайта.
- Проверку промежуточных коммитов в pre-push: только вершина каждой пушимой
  ветки; историю, уже лежащую на remote, хук не перепроверяет.
- Проверку запрещённых строк в CI (списка там нет).
- husky, lint-staged и прочие зависимости для хуков; prettier и другие
  инструменты сверх шаблона Vite и vitest.
- Тег v1 и ссылки на тег — пункт 7; ссылки заглушки ведут на `main`.
- Правку строки README «сайт пока не опубликован» — после фактической
  публикации.
- Свой домен, 404-страницу и роутинг (одна страница).

## Решения
- Стек → Vite + React + TypeScript, пакетный менеджер npm, lock-файл
  `site/package-lock.json`; линтер и typecheck — стандартные для шаблона Vite
  (eslint, tsc); тесты — vitest. Новых инструментов сверх этого не заводить.
- Шаблон create-vite 9 по умолчанию ставит oxlint → использовать флаг
  `--eslint`: решение пользователя называет eslint, флаг входит в
  стандартный шаблон.
- Адрес сайта → https://stels54.github.io/claude-code-harness/,
  `base: '/claude-code-harness/'`; деплой — GitHub Actions на push в `main`
  через `actions/deploy-pages`.
- Ресурсы и шрифты → только локально, никаких запросов к сторонним доменам;
  CDN-шрифты не подключать; шрифт — только файл в репозитории с лицензией
  OFL или системный стек.
- Корневой `CLAUDE.md` → команды проверки сайта (typecheck, lint, build,
  test) и проверки `scripts/check-leaks.sh`, `scripts/check-harness-refs.sh`,
  новый скрипт проверки ссылок; только соглашения этого репозитория.
- Проверка запрещённых строк перед push → версионируемый хук
  `scripts/hooks/pre-push` и установка `git config core.hooksPath` в
  README/CLAUDE.md, без husky и прочих зависимостей.
- Push, включение Pages, проверка опубликованного адреса → действие
  пользователя/тимлида: репозиторий приватный, публичным его делает тимлид;
  при реализации дойти до этих шагов, локально проверить `build` и `preview`
  и остановиться с вопросом; verify по этим шагам — DEFERRED, это ожидаемо.
- Проверки «из РФ без VPN» и «с телефона» → ручные шаги человека.
- Проверка шага scaffold-vite-site `git check-ignore -q` с двумя путями
  невалидна (git: «--quiet is only valid with a single pathname») → при
  /implement заменена на `git check-ignore` без `-q` с выводом обоих путей;
  смысл проверки не меняется.
- Code review (Codex) по шагам pre-push-hook и check-links-script →
  хук выгружает дерево коммита через `read-tree`/`checkout-index` вместо
  `git archive` (тот пропускает `export-ignore`); `check-links.sh` при ошибке
  чтения файла выходит с кодом 2, а не пропускает файл. Шаги 7–8 обновлены,
  отчёт — `-review.md` плана.

## Допущения
- Шаблон фиксируется версией `create-vite@9.2.1` (релиз 2026-09-10);
  зависимости — те версии, что шаблон и `npm install` запишут в lock-файл.
- Тест данных этого пункта — только `base` в конфиге: рендер-тест заглушки
  потребовал бы jsdom или testing-library, это новые инструменты.
- Фавикон шаблона `public/favicon.svg` остаётся до пункта 4 (дизайн).
- Node 22 в CI — как локально; `engines` в `package.json` не задаётся.
- Корневой `.gitignore` не меняется: `node_modules` и `dist` сайта
  исключает `site/.gitignore` шаблона; проверяется `git check-ignore`.
- Скрипт ссылок проверяет якоря только литералами `href="#…"`/`id="…"` в
  `site/src`; вычисляемые якоря (пункт 4) расширят проверку там.
- pre-push хук запускает только `check-leaks.sh`: роадмап требует перед push
  проверку запрещённых строк; остальные проверки — в `CLAUDE.md` и CI.
