#!/usr/bin/env bash
# Проверка самодостаточности harness/: нет упоминаний lessons, нет ссылок на
# slash-команды, агенты, скиллы и пути ~/.claude/…, которых нет в harness/.
# Использование: scripts/check-harness-refs.sh [корень-репозитория]
# Выход: 0 — нарушений нет, 1 — есть нарушения, 2 — нет каталога harness/.
set -u

root="${1:-$(git rev-parse --show-toplevel 2>/dev/null)}"
h="${root:-.}/harness"
if [ ! -d "$h" ]; then
  echo "check-harness-refs: нет каталога harness/ в ${root:-<текущий каталог>}" >&2
  exit 2
fi

cd "$h/.." || exit 2

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
: > "$tmp/hits"

report() {
  printf '%s:%s: %s: %s\n' "$1" "$2" "$3" "$4" >> "$tmp/hits"
}

find harness -type f | sort > "$tmp/all"
grep -E '\.md$' "$tmp/all" > "$tmp/md"

while IFS= read -r f; do
  grep -n -I -i -o 'lesson' "$f" | while IFS=: read -r n m; do
    report "$f" "$n" lessons "$m"
  done
done < "$tmp/all"

while IFS= read -r f; do
  grep -n -o -E '(^|[[:space:](«`"])/[a-z][a-z-]*/?' "$f" |
    while IFS=: read -r n m; do
      case "$m" in */) continue ;; esac
      name="$(printf '%s' "$m" | sed -E 's|^[^/]*/([a-z][a-z-]*)$|\1|')"
      [ -f "harness/commands/$name.md" ] || report "$f" "$n" command "/$name"
    done
done < "$tmp/md"

while IFS= read -r f; do
  grep -n -I -o -E '(~|\$HOME)/\.claude/[A-Za-z0-9_./-]+' "$f" |
    while IFS=: read -r n m; do
      p="$(printf '%s' "$m" | sed -E 's|^[^/]*/\.claude/||; s|\.+$||')"
      [ "$p" = "pipeline-clock.jsonl" ] && continue
      case "/$p/" in */../*) report "$f" "$n" path "$m"; continue ;; esac
      [ -e "harness/$p" ] || report "$f" "$n" path "$m"
    done
done < "$tmp/all"

while IFS= read -r f; do
  grep -n -o -E 'субагент(а|ом)? `[^`]+`' "$f" |
    while IFS=: read -r n m; do
      name="$(printf '%s' "$m" | sed -E 's|^[^`]*`([^`]+)`$|\1|')"
      [ -f "harness/agents/$name.md" ] || report "$f" "$n" agent "$name"
    done
  grep -n -o -E 'скилл `?[A-Za-z0-9_:-]+' "$f" |
    while IFS=: read -r n m; do
      name="$(printf '%s' "$m" | sed -E 's|^скилл `?||')"
      [ -d "harness/skills/$name" ] || report "$f" "$n" skill "$name"
    done
done < "$tmp/md"

cat "$tmp/hits"
count="$(wc -l < "$tmp/hits" | tr -d ' ')"
echo "check-harness-refs: $count нарушений"
[ "$count" -eq 0 ]
