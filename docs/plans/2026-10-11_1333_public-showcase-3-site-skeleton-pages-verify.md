# Verify: Каркас сайта и публикация на GitHub Pages
**Дата**: 2026-10-11
**План**: docs/plans/2026-10-11_1333_public-showcase-3-site-skeleton-pages.md

## Результат по шагам

| Step | Цель | Статус | Комментарий |
|------|------|--------|-------------|
| 1 scaffold-vite-site | Проект Vite + ESLint в `site/` | ✅ | `package.json`, `package-lock.json`, `eslint.config.js` есть; `test ! -e site/README.md` прошла; lint/build exit 0; `git check-ignore site/node_modules site/dist` выводит оба пути, rc=0; `git status --short -uall \| grep -c -E 'node_modules\|/dist/'` → 0 |
| 2 vitest-and-scripts | vitest, скрипты typecheck/test | ✅ | `vitest ^5.0.3`, `typecheck: tsc -b`, `test: vitest run`; в `tsconfig.node.json` `include` = `["vite.config.ts", "vite.config.test.ts"]`; typecheck exit 0; `grep -c '"vitest"'` → 1 |
| 3 test-vite-base | Тест `base` | ✅ | `site/vite.config.test.ts` импортирует `./vite.config.ts`, `toBe('/claude-code-harness/')`; тест зелёный (red-фаза по конечному состоянию не проверяется) |
| 4 vite-base | `base` в конфиге | ✅ | `base: '/claude-code-harness/'`; `Tests 1 passed (1)`; `grep -c '/claude-code-harness/assets/' site/dist/index.html` → 2 |
| 5 stub-page | Русская заглушка без сторонних ресурсов | ✅ | `lang="ru"`, title, description; App.tsx — заголовок, абзац с пометкой «Сайт в разработке», ссылки на репозиторий и `blob/main/README.md`; системный стек шрифтов, `max-width`, `padding`, `overflow-wrap: anywhere`; `site/src/assets/` и `site/public/icons.svg` удалены; grep шаблонных ссылок по `site/src site/index.html` → пусто (rc=1); grep внешних src/href/url() в `site/dist` → пусто (rc=1) |
| 6 pages-workflow | Workflow GitHub Pages | ✅ | Триггеры, permissions, concurrency, job `build`/`deploy`, actions checkout@v7, setup-node@v7, upload-pages-artifact@v5, deploy-pages@v5 — как в плане; ruby YAML → `build,deploy`; grep → 2. Фактический прогон — шаг 12 |
| 7 check-links-script | Скрипт проверки ссылок | ✅ | `bash -n` rc=0; по репозиторию 0 нарушений; все негативные сценарии, включая `chmod 000` → exit 2, отработали (см. ниже) |
| 8 pre-push-hook | pre-push с check-leaks | ✅ | `core.hooksPath` = `scripts/hooks`; файл исполняемый; чистый прогон rc=0; утечка, игнорируемый `site/x.local` через `add -f` и файл с `export-ignore` → rc=1 `denylist`; несуществующий sha → rc=2 до сканера; без списка → rc=2 |
| 9 root-claude-md | Корневой CLAUDE.md | ✅ | Структура, npm/lock-файл, 4 команды сайта, 3 скрипта, preview и адрес, установка хука и предпосылка; все 7 команд (кроме preview) rc=0; `grep -c '/Users/\|/home/' CLAUDE.md` → 0 |
| 10 readme-dev-section | Раздел README | ✅ | «Работа с репозиторием» стоит перед «Дата снимка и сайт», ссылка `[CLAUDE.md](CLAUDE.md)`, хук, `HARNESS_DENYLIST`, код 2, workflow; строка «пока не опубликован» не тронута; grep `core.hooksPath scripts/hooks` → 1; check-links 0 |
| 11 local-preview-network | Локальная приёмка | ✅ | curl → 200; в браузере виден заголовок, запросы только к `localhost:4173`; на 360px `scrollWidth 360 <= innerWidth 360` (см. «Браузерная приёмка») |
| 12 user-push-enable-pages | Публикация на Pages | ⏸️ DEFERRED | нужен push и включение Pages тимлидом |
| 13 user-manual-access-check | Доступность из РФ / с телефона | ⏸️ DEFERRED | ручная проверка человеком |

Негативные сценарии шага 7 (временные файлы удалены, `git status` чистый):
```
zz-v.md:1: md: нет-такого-файла.md                                    rc=1
zz-v.md:1: repo: https://github.com/stels54/claude-code-harness/blob/main/no-such-file.md   rc=1
zz-v.txt:1: repo: …/blob/main/no-such-file.md                         rc=1
.md с теми же ссылками в обратных кавычках — не срабатывает (в .txt пропуск кода не предусмотрен контрактом)
site/src/Tmp.tsx:1: anchor: #нет-якоря                                rc=1
chmod 000 zz-v.txt: check-links: ошибка чтения zz-v.txt, проверка неполна   rc=2
после удаления: check-links: 0 нарушений                              rc=0
```

Сценарии шага 8 (временный клон и список в scratchpad, удалены):
```
clean (рабочий репозиторий): check-leaks: 0 совпадений                rc=0
clean (клон):                check-leaks: 0 совпадений                rc=0
leak:          leak.txt:1: denylist / check-leaks: 1 совпадений       rc=1
ignored:       site/x.local:1: denylist                               rc=1
export-ignore: eio.txt:1: denylist                                    rc=1
badsha:        pre-push: нет коммита 1234…7890 (refs/heads/main), push отменён   rc=2
nolist:        check-leaks: нет списка запрещённых строк: /нет/файла  rc=2
```

## Тесты
- [x] Typecheck: `npm --prefix site run typecheck` — `> tsc -b`, rc=0
- [x] Lint: `npm --prefix site run lint` — `> eslint .`, rc=0
- [x] Unit: `npm --prefix site test` — `Test Files  1 passed (1)` / `Tests  1 passed (1)`, rc=0
- [x] Build: `npm --prefix site run build` — `dist/index.html 0.77 kB`, `✓ built in 177ms`, rc=0
- [x] `scripts/check-leaks.sh` — `check-leaks: 0 совпадений`, rc=0
- [x] `scripts/check-harness-refs.sh` — `check-harness-refs: 0 нарушений`, rc=0
- [x] `scripts/check-links.sh` — `check-links: 0 нарушений`, rc=0
- [x] Workflow: `ruby -ryaml …` — `build,deploy`

## Браузерная приёмка

| Шаг | URL | Действие | Результат |
|-----|-----|----------|-----------|
| 11 | http://localhost:4173/claude-code-harness/ | `npm --prefix site run preview -- --port 4173 --strictPort`, `curl -w '%{http_code}'` | `200` |
| 11 | http://localhost:4173/claude-code-harness/ | открыть в Chrome, прочитать `h1` | «Конвейер разработки с ИИ-агентами» |
| 11 | http://localhost:4173/claude-code-harness/ | перезагрузка с включённым отслеживанием сети | 3 запроса: `/claude-code-harness/` (200), `…/assets/index-BFN3bgix.js` (304), `…/assets/index-BvXfUsNt.css` (304) — все к `localhost:4173` |
| 11 | http://localhost:4173/claude-code-harness/ | страница в iframe шириной 360px, `scrollWidth`/`innerWidth` | `360` / `360` — горизонтальной прокрутки нет |

## Критерии приёмки
| Критерий | Статус | Чем подтверждён |
|----------|--------|-----------------|
| typecheck, lint, test, build проходят; заглушка открывается по `localhost:4173/claude-code-harness/` и грузит только свои ресурсы | ✅ | rc=0 у всех четырёх команд; curl 200; в браузере сетевые запросы только к `localhost:4173` |
| check-links, check-leaks, check-harness-refs дают 0 нарушений и не обходят `node_modules`/`dist` | ✅ | вывод 0/0/0, rc=0; check-links берёт файлы через `git ls-files --exclude-standard`, `site/node_modules` и `site/dist` игнорируются (`git check-ignore` выводит оба пути) |
| Push с утечкой отменяется хуком, который ставится одной командой `core.hooksPath` | ✅ | `git config core.hooksPath` → `scripts/hooks`; сценарии leak/ignored/export-ignore → rc=1 с `denylist` |
| В корневом `CLAUDE.md` есть команды проверки, и каждая выполняется | ✅ | 7 команд (все, кроме preview) дают rc=0; preview запущен и проверен в шаге 11 |
| Workflow публикует сайт на stels54.github.io; в Network только этот домен; сайт открывается из РФ с компьютера и с телефона | ⏸️ DEFERRED | нужен push и включение Pages тимлидом, затем ручная проверка человеком |

## Итог
PASSED. Шаги 12–13 и последний критерий в статусе DEFERRED, как и задумано планом.

Пользователь ещё не подтвердил DEFERRED-пункты, поэтому коммит пока не делать. Шаги 12–13 выполняются после коммита, так что для коммита нужно явное согласие пользователя на эти DEFERRED.

## Что требует внимания
- Шаги 12–13 (`user-push-enable-pages`, `user-manual-access-check`) ждут действий тимлида и человека.
- В рабочем дереве изменён `docs/roadmaps/2026-10-11_1236_public-showcase.md` (+20/−2), хотя план его не упоминает. Перед коммитом нужно решить, входит ли он в коммит.
