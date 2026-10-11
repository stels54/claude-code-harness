#!/usr/bin/env bash
# Проверка репозитория на утечки: список запрещённых строк, шаблоны ключей,
# абсолютные пути домашней папки. Печатает только файл, строку и категорию.
# Использование: scripts/check-leaks.sh [корень-репозитория]
# Выход: 0 — совпадений нет, 1 — есть совпадения, 2 — ошибка настройки.
set -u

denylist="${HARNESS_DENYLIST:-$HOME/.config/harness-publish/denylist.txt}"
shown_denylist="${denylist/#$HOME/~}"

root="${1:-$(git rev-parse --show-toplevel 2>/dev/null)}"
if [ -z "$root" ] || ! git -C "$root" rev-parse --git-dir >/dev/null 2>&1; then
  echo "check-leaks: не git-репозиторий: ${root:-<текущий каталог>}" >&2
  exit 2
fi

if [ ! -f "$denylist" ]; then
  echo "check-leaks: нет списка запрещённых строк: $shown_denylist" >&2
  exit 2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

tr -d '\r' < "$denylist" | grep -v -E '^[[:space:]]*(#|$)' > "$tmp/patterns"
if [ ! -s "$tmp/patterns" ]; then
  echo "check-leaks: список запрещённых строк пуст: $shown_denylist" >&2
  exit 2
fi

cd "$root" || exit 2

if ! git ls-files -z --cached --others --exclude-standard > "$tmp/listed"; then
  echo "check-leaks: не удалось получить список файлов" >&2
  exit 2
fi
while IFS= read -r -d '' f; do
  [ -f "$f" ] && printf '%s\0' "$f"
done < "$tmp/listed" > "$tmp/files"

scan() {
  local category="$1"; shift
  xargs -0 grep -n -H -I "$@" -- /dev/null < "$tmp/files" 2>> "$tmp/errors" |
    cut -d: -f1,2 |
    sed "s/\$/: $category/" >> "$tmp/hits"
}

: > "$tmp/hits"
scan denylist -i -F -f "$tmp/patterns"
scan key -E \
  -e 'AKIA[0-9A-Z]{16}' \
  -e 'gh[pousr]_[A-Za-z0-9]{36,}' \
  -e 'github_pat_[A-Za-z0-9_]{22,}' \
  -e '(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}' \
  -e 'xox[abprs]-[A-Za-z0-9-]{10,}' \
  -e 'AIza[0-9A-Za-z_-]{35}' \
  -e 'lin_api_[A-Za-z0-9]{20,}' \
  -e '-----BEGIN ([A-Z]+ )*PRIVATE KEY-----'
scan home-path -E \
  -e '/Users/[A-Za-z0-9_][A-Za-z0-9_.-]*' \
  -e '/home/[A-Za-z0-9_][A-Za-z0-9_.-]*'

if [ -s "$tmp/errors" ]; then
  cat "$tmp/errors" >&2
  echo "check-leaks: ошибка чтения файлов, проверка неполна" >&2
  exit 2
fi

sort "$tmp/hits"
count="$(wc -l < "$tmp/hits" | tr -d ' ')"
echo "check-leaks: $count совпадений"
[ "$count" -eq 0 ]
