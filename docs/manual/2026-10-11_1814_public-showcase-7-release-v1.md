# Мануал: Выпуск v1 — тег и постоянные ссылки

План: `docs/plans/2026-10-11_1556_public-showcase-7-release-v1.md`
Верификация: `docs/plans/2026-10-11_1556_public-showcase-7-release-v1-verify.md`
Ревью: `docs/plans/2026-10-11_1556_public-showcase-7-release-v1-review.md`

## 1. Назначение

Пункт 7 роадмапа `docs/roadmaps/2026-10-11_1236_public-showcase.md` выпускает
первую версию: ссылки сайта на файлы репозитория ведут на тег `v1`, а не на
`main`, в подвале видна дата снимка.

- **Ref ссылок** — `REPO_REF = 'v1'` в `site/src/repo.ts`. Все ссылки на
  файлы собирает `repoFileUrl()`: шаги схемы «Конвейер» (файл команды и
  фрагмент), все фрагменты раздела «Как собран этот сайт» и ссылка «план
  этого раздела», ссылка «README» в шапке. Вид ссылки:
  `https://github.com/stels54/claude-code-harness/blob/v1/<путь>`, у
  фрагментов из `.md` — с `?plain=1#LA-LB` (одна строка — `#LN`).
- **Подвал** — `SNAPSHOT` в `site/src/sections/content.ts`: `label` «Снимок
  ядра конвейера», `date` `2026-10-11`, `ref` = `REPO_REF`, `href` —
  `https://github.com/stels54/claude-code-harness/tree/v1`. Разметка — абзац в
  `site/src/components/SiteFooter.tsx` после списка ссылок автора:
  «Снимок ядра конвейера от 2026-10-11, тег v1», где «тег v1» — ссылка.
  Ссылка «Репозиторий конвейера» (корень репозитория) осталась.
- **README** не менялся: в нём нет ссылок `blob/main/`, дата снимка
  (`- Дата снимка: 2026-10-11.`), ссылки на сайт и на репозиторий уже были.
- **Тег** `v1` — лёгкий, на коммите `426fbd4`
  (`426fbd429d6a2bb0a072563910ffdd307fc4288e`). Этот коммит содержит код,
  роадмап, план, `-verify.md` и `-review.md` пункта 7. Мануал и итог проверки
  тега легли следующим коммитом.
- **Порядок после тега** (решение 1b плана): в роадмапе меняется только
  строка статуса пункта 7 (замена в той же строке) и дописывается запись в
  самый конец «Решений». Причина: фрагменты `build-*` раздела «Как собран этот
  сайт» вырезаются по строкам текущего файла, а ссылки ведут на `v1`. Сдвиг
  строк выше фрагментов увёл бы номера строк в ссылках.

## 2. Чек-лист

- [ ] 4.1 Подвал: строка снимка и ссылка на тег
- [ ] 4.2 Ссылки схемы ведут на `blob/v1/`
- [ ] 4.3 Ссылки раздела «Как собран этот сайт» и README в шапке ведут на `blob/v1/`
- [ ] 4.4 Ссылка на строки открывает в `v1` те же строки, что показаны во фрагменте
- [ ] 4.5 Тег на GitHub и на коммите пункта 7
- [ ] 4.6 Опубликованный сайт собран из `v1`
- [ ] 4.7 Ширина 360px, тёмная тема, Network
- [ ] 5.1–5.4 Тесты и `check-links` ловят расхождения
- [ ] 6 Сравнение `dist` из `v1` и HEAD
- [ ] 8 Автотесты и проверки

## 3. Pre-requisites

1. Корень репозитория, ветка `main`, дерево чистое (`git status --short`
   пуст), тег есть локально: `git fetch --tags origin`, затем
   `git rev-parse 'v1^{commit}'` →
   `426fbd429d6a2bb0a072563910ffdd307fc4288e`.
2. Зависимости: `npm --prefix site ci` (lock — `site/package-lock.json`).
3. Сборка и preview:
   `npm --prefix site run build`, затем
   `npm --prefix site run preview -- --port 4180 --strictPort`. Адрес
   `http://localhost:4180/claude-code-harness/`. Порт `4173` может держать
   preview другой сессии, поэтому нужен свой порт с `--strictPort`.
4. Для разделов 4.5–4.6 и 6 нужны сеть, `curl`, `gh` с доступом к
   репозиторию.
5. Для `scripts/check-leaks.sh` нужен непустой список запрещённых строк
   (`~/.config/harness-publish/denylist.txt` или `HARNESS_DENYLIST`).

## 4. Happy path

### 4.1. Подвал

**Действие**: открыть preview, прокрутить до подвала «Автор».
**Ожидание**: под ссылками автора (`stels54@gmail.com`, «Telegram @stels54»,
«GitHub», «LinkedIn», «Репозиторий конвейера») есть строка «Снимок ядра
конвейера от 2026-10-11, тег v1». «тег v1» ведёт на
`https://github.com/stels54/claude-code-harness/tree/v1`, «Репозиторий
конвейера» — на `https://github.com/stels54/claude-code-harness`. Строка
оформлена как остальной текст подвала, новых стилей нет.

### 4.2. Схема «Конвейер»

**Действие**: по очереди раскрыть все девять шагов схемы. Одновременно
открыт один шаг, ссылки остальных исчезают из DOM. У каждого шага навести на
ссылку файла команды и на ссылку фрагмента.
**Ожидание**: ссылка на файл команды —
`https://github.com/stels54/claude-code-harness/blob/v1/harness/commands/<команда>.md`
(у агента проверки — `harness/agents/verifier.md`). Ссылка фрагмента —
`…/blob/v1/docs/…?plain=1#L…`. Ни одной ссылки с `/main/`.

Быстрая проверка в консоли DevTools (накапливает ссылки при раскрытии):

```js
const R = 'https://github.com/stels54/claude-code-harness/'
const all = new Set()
const collect = () => document.querySelectorAll(`a[href^="${R}"]`).forEach((a) => all.add(a.href))
for (const b of document.querySelectorAll('#pipeline button, [class*="pipeline"] button')) { b.click(); await Promise.resolve(); collect() }
collect()
;[all.size, [...all].filter((h) => !h.includes('/blob/v1/') && !h.includes('/tree/v1'))]
```

**Ожидание**: второй элемент — пустой массив. При приёмке ссылок было 51 без
корня репозитория: 15 у схемы, 41 в разделе «Как собран этот сайт», часть
ссылок совпадает.

### 4.3. «Как собран этот сайт» и шапка

**Действие**: в разделе `#build` навести на ссылки в подписях фрагментов и на
«план этого раздела»; в шапке — на «README».
**Ожидание**: подписи — `…/blob/v1/<путь>?plain=1#LA-LB`. «План этого
раздела» ведёт на
`…/blob/v1/docs/plans/2026-10-11_1503_public-showcase-6-build-story.md` без
якоря. «README» ведёт на `…/blob/v1/README.md`.

### 4.4. Строки по ссылке совпадают с фрагментом

**Действие**: в разделе «Как собран этот сайт» открыть по ссылке два-три
фрагмента. Обязательно взять один из «Решений» роадмапа («Роадмап:
«Решения»», файл `docs/roadmaps/2026-10-11_1236_public-showcase.md`) и один из
`docs/plans/`. Сравнить подсвеченные строки на GitHub с текстом в раскрытом
«Фрагмент».
**Ожидание**: GitHub открывает файл на теге `v1` (переключатель веток
показывает `v1`). Подсвечены ровно те строки, что во фрагменте.

### 4.5. Тег

**Действие**:
```bash
git rev-parse 'v1^{commit}' main
git ls-remote origin refs/tags/v1 'refs/tags/v1^{}' refs/heads/main
git cat-file -t v1
```
**Ожидание**: `v1^{commit}` — `426fbd429d6a2bb0a072563910ffdd307fc4288e`.
На `origin` `refs/tags/v1` и `refs/heads/main` указывали на тот же хеш в
момент выпуска. Позже `main` уходит вперёд коммитом с этим мануалом — это
ожидаемо. `git cat-file -t v1` → `commit` (лёгкий тег, строки `v1^{}` нет).
`git show --stat v1` содержит план, `-verify.md` и `-review.md` пункта 7.

Ссылки на тег живые (список путей — все уникальные файлы из 4.2–4.3,
32 файла):

```bash
R=https://github.com/stels54/claude-code-harness
for f in README.md harness/commands/plan.md docs/roadmaps/2026-10-11_1236_public-showcase.md; do
  echo "$f $(git cat-file -t "v1:$f") $(curl -s -o /dev/null -w '%{http_code}' "$R/blob/v1/$f")"
done
curl -s -o /dev/null -w '%{http_code}\n' "$R/tree/v1"
```
**Ожидание**: у каждого файла `blob 200`, у `tree/v1` — `200`. При приёмке
все 32 пути дали `blob 200`.

### 4.6. Опубликованный сайт из `v1`

**Действие**:
```bash
gh run list --workflow Pages --limit 3 --json databaseId,headSha,conclusion
curl -s -o /dev/null -w '%{http_code}\n' https://stels54.github.io/claude-code-harness/
curl -s https://stels54.github.io/claude-code-harness/ | grep -o 'assets/index-[^"]*' | sort
```
**Ожидание**: run `38150235934` с `headSha`
`426fbd429d6a2bb0a072563910ffdd307fc4288e` и `conclusion: success`. Сайт
отвечает `200`. До push коммита с мануалом опубликованный HTML ссылался на
`assets/index-Dw97_c-y.js` и `assets/index-BEQmJh0w.css` — те же имена, что
у `dist`, собранного из `v1`. После push коммита с мануалом Pages
пересоберёт сайт из `main`. Имена ассетов должны остаться прежними: бандл
не меняется, см. раздел 6.

На опубликованном сайте повторить 4.1–4.3: те же ссылки на `blob/v1/` и
строка снимка в подвале.

### 4.7. Ширина, тема, сеть

**Действие**: в DevTools включить ширину 360px, прокрутить до подвала.
Переключить системную тему на тёмную. Открыть вкладку Network и
перезагрузить страницу.
**Ожидание**: на 360px строка снимка переносится и горизонтальной прокрутки
нет (при приёмке в iframe `scrollWidth` 357 = `innerWidth` 357). В тёмной
теме строка и ссылка читаются, как остальной подвал. В Network только свой
домен (`localhost:4180` или `stels54.github.io`): документ, `index-*.js`,
`index-*.css`, шрифты `fonts/*.woff2`.

## 5. Дополнительные сценарии: тесты и проверки ловят расхождения

Каждый сценарий меняет файл временно. После проверки — `git checkout -- <файл>`.

### 5.1. Ref снова `main`

**Действие**: в `site/src/repo.ts` заменить `'v1'` на `'main'`, затем
`npm --prefix site test -- src/repo.test.ts src/sections/content.test.ts`.
**Ожидание**: падают тесты `repo.test.ts` (`expect(REPO_REF).toBe('v1')` и
ожидания ссылок) и тест «снимок в подвале»: `SNAPSHOT.href` получается
`…/tree/main`, а не `…/tree/v1`.

### 5.2. Дата на сайте разошлась с README

**Действие**: в `README.md` заменить `- Дата снимка: 2026-10-11.` на
`- Дата снимка: 2026-10-12.` и прогнать
`npm --prefix site test -- src/sections/content.test.ts`.
**Ожидание**: падает «снимок в подвале»: `SNAPSHOT.date` `2026-10-11` не
равна `2026-10-12`. Если строку в README удалить совсем, падает
`expect(date).toBeDefined()`.

### 5.3. Литеральная ссылка на несуществующий ref

**Действие**: создать неотслеживаемый файл `zz-v.md` со строкой
`https://github.com/stels54/claude-code-harness/blob/v9/README.md` (без
обратных кавычек) и запустить `scripts/check-links.sh`; затем удалить
`zz-v.md`.
**Ожидание**: `zz-v.md:1: repo: …/blob/v9/README.md`, «check-links: 1
нарушений», код выхода 1. Так же скрипт вёл бы себя со ссылкой на `v1` до
появления тега, поэтому в документах пункта 7 такие URL стоят в inline-коде.

### 5.4. Литеральная ссылка на `v1` после тега

**Действие**: тот же `zz-v.md`, но с `…/blob/v1/README.md`, затем
`scripts/check-links.sh`, затем удалить `zz-v.md`.
**Ожидание**: «check-links: 0 нарушений». Скрипт разрешает тег локально
через `git rev-parse "v1^{commit}"`.

## 6. Edge cases: бандл после тега равен бандлу тега

**Действие**: собрать сайт из `v1` в отдельном рабочем дереве и сравнить с
HEAD:
```bash
WT="$(mktemp -d)/wt-v1"
git worktree add --detach "$WT" v1
ln -s "$PWD/site/node_modules" "$WT/site/node_modules"
npm --prefix "$WT/site" run build
npm --prefix site run build
diff -r site/dist "$WT/site/dist" && echo "dist identical"
```
**Ожидание**: «dist identical». Результат приёмки до коммита с мануалом:
`diff -r` пуст. Рабочее дерево с изменённым роадмапом (статус ✅ и запись в
конце «Решений») даёт тот же бандл, что и `v1`. Проверка
`git diff v1 -- docs/roadmaps/2026-10-11_1236_public-showcase.md | grep '^@@'`
показывает два ханка: замену строки статуса (`@@ -118,7 +118,7 @@`) и
добавление в конец «Решений» (`@@ -352,6 +352,14 @@`). Оба ниже фрагментов
`build-*` или не сдвигают строки.

Обратный случай для понимания (не делать в `main`): запись в «Факты» после
тега сдвинула бы «Решения». Номера строк у фрагментов `build-roadmap-*`
изменились бы, `diff -r` показал бы разницу в `index-*.js`, а ссылки на строки
`v1` стали бы неточными.

## 7. Известные ограничения (багом не считать)

- `scripts/check-links.sh` не видит ссылки, собранные `repoFileUrl()`.
  Ссылки сайта на тег проверялись через `git cat-file` по `v1` и `curl` на
  GitHub (4.5). Сам скрипт проверяет только литеральные URL.
- «Опубликованный сайт собран из коммита с тегом» строго выполнялось до push
  коммита с мануалом (run `38150235934`). После него Pages собирает `main`.
  Критерий держится на побайтном совпадении бандла с `v1` (раздел 6), а не на
  происхождении из того же коммита. Это принятое решение плана.
- Ссылки в документах прошлых пунктов (`docs/plans/`, `docs/manual/`) остались
  на `blob/main/`: это след прогона, их не меняли.
- Ссылка «Репозиторий конвейера» в подвале ведёт на корень репозитория (ветка
  по умолчанию), а не на тег. На тег ведёт «тег v1».
- Тёмная тема, вкладка Network на опубликованном адресе и доступ из РФ без
  VPN проверяются человеком. Chrome-расширение тему не эмулирует.
- В песочнице ревьюера Codex тесты не запускались (`EPERM`); локально тесты
  зелёные (раздел 8).

## 8. Автотесты и проверки

```bash
npm --prefix site run typecheck
npm --prefix site run lint
npm --prefix site test
npm --prefix site run build
scripts/check-leaks.sh
scripts/check-harness-refs.sh
scripts/check-links.sh
grep -c -E 'SDD|Spec-Driven' site/dist/assets/*.js
```
**Ожидание**: typecheck, lint и build — exit 0; тесты — «Test Files 7
passed (7)», «Tests 99 passed (99)»; «check-leaks: 0 совпадений»,
«check-harness-refs: 0 нарушений», «check-links: 0 нарушений»; grep — `0`.

## 9. Cleanup

- Остановить preview (Ctrl+C в его терминале).
- Удалить временные файлы сценариев 5.x и вернуть изменённые:
  `git checkout -- site/src/repo.ts README.md`, `rm -f zz-v.md`.
- Убрать рабочее дерево раздела 6: `git worktree remove --force "$WT"`.
- `git status --short` пуст.
