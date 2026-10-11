# Соглашения репозитория claude-code-harness

## Структура
- `harness/` — публикуемый снимок ядра конвейера. Это не конфигурация
  Claude Code для этого репозитория: команды отсюда не подключаются.
- `site/` — сайт (Vite + React + TypeScript), публикуется на GitHub Pages
  по адресу https://stels54.github.io/claude-code-harness/.
- `scripts/` — проверки репозитория и git-хуки (`scripts/hooks/`).
- `docs/` — спецификация, роадмап, планы, отчёты и мануалы прогона. Они
  публичны.

## Пакетный менеджер
- npm, lock-файл `site/package-lock.json`. Команды запускаются из корня
  через `npm --prefix site …` или из каталога `site/`.

## Проверки
Сайт:
- Typecheck: `npm --prefix site run typecheck`
- Линтер: `npm --prefix site run lint`
- Тесты: `npm --prefix site test`
- Сборка: `npm --prefix site run build`

Репозиторий:
- Запрещённые строки, ключи, домашние пути: `scripts/check-leaks.sh`
- Самодостаточность `harness/`: `scripts/check-harness-refs.sh`
- Ссылки: `scripts/check-links.sh`

Все проверки обходят только файлы из `git ls-files` (отслеживаемые и
неигнорируемые), `node_modules` и `dist` не проверяются.

## Локальная приёмка
- `npm --prefix site run build`, затем `npm --prefix site run preview`;
  адрес `http://localhost:4173/claude-code-harness/`.
- Страница не делает запросов к сторонним доменам: шрифты и ресурсы только
  локальные.

## Перед push
- Хук ставится один раз: `git config core.hooksPath scripts/hooks`. Он
  запускает `scripts/check-leaks.sh` по вершине каждой пушимой ветки.
- Предпосылка — непустой список запрещённых строк в
  `~/.config/harness-publish/denylist.txt` или по пути из `HARNESS_DENYLIST`;
  без него push отменяется.
- Строки списка запрещённых строк не записываются ни в один файл
  репозитория, включая планы.
