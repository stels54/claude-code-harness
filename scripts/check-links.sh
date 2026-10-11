#!/usr/bin/env bash
# Проверка ссылок: относительные ссылки в markdown, ссылки на файлы этого
# репозитория на GitHub (blob/tree по локальному git) и якоря href="#…" в
# site/src. Сетевых запросов нет; node_modules и dist не обходятся.
# Использование: scripts/check-links.sh [корень-репозитория]
# Выход: 0 — нарушений нет, 1 — есть нарушения, 2 — ошибка настройки.
set -u

root="${1:-$(git rev-parse --show-toplevel 2>/dev/null)}"
if [ -z "$root" ] || ! git -C "$root" rev-parse --git-dir >/dev/null 2>&1; then
  echo "check-links: не git-репозиторий: ${root:-<текущий каталог>}" >&2
  exit 2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$root" || exit 2

if ! git ls-files -z --cached --others --exclude-standard > "$tmp/listed"; then
  echo "check-links: не удалось получить список файлов" >&2
  exit 2
fi
while IFS= read -r -d '' f; do
  [ -f "$f" ] && printf '%s\n' "$f"
done < "$tmp/listed" > "$tmp/files"

: > "$tmp/hits"
report() {
  printf '%s:%s: %s: %s\n' "$1" "$2" "$3" "$4" >> "$tmp/hits"
}

fail() {
  echo "check-links: $1, проверка неполна" >&2
  exit 2
}

strip_code() {
  awk '
    /^[[:space:]]*(```|~~~)/ { fence = !fence; print ""; next }
    fence { print ""; next }
    { gsub(/`[^`]*`/, ""); print }
  ' "$1"
}

repo_re='https://github\.com/stels54/claude-code-harness/(blob|tree)/[A-Za-z0-9._-]+/[A-Za-z0-9._/-]+'

check_repo() {
  local f="$1" n="$2" url="$3" kind ref path want
  kind="$(printf '%s' "$url" | sed -E 's|^https://github\.com/[^/]+/[^/]+/([a-z]+)/.*|\1|')"
  ref="$(printf '%s' "$url" | sed -E 's|^https://github\.com/[^/]+/[^/]+/[a-z]+/([^/]+)/.*|\1|')"
  path="$(printf '%s' "$url" | sed -E 's|^https://github\.com/[^/]+/[^/]+/[a-z]+/[^/]+/||; s|[./]+$||')"
  if ! git rev-parse --verify -q "$ref^{commit}" >/dev/null; then
    report "$f" "$n" repo "$url"
    return
  fi
  want=blob
  [ "$kind" = tree ] && want=tree
  [ "$(git cat-file -t "$ref:$path" 2>/dev/null)" = "$want" ] ||
    report "$f" "$n" repo "$url"
}

while IFS= read -r f; do
  case "$f" in
    *.md)
      strip_code "$f" > "$tmp/text" || fail "ошибка чтения $f"
      ;;
    *)
      grep -q -I '' "$f"
      case $? in
        0) cp "$f" "$tmp/text" || fail "ошибка чтения $f" ;;
        1) continue ;;
        *) fail "ошибка чтения $f" ;;
      esac
      ;;
  esac

  if [ "${f%.md}" != "$f" ]; then
    dir="$(dirname "$f")"
    grep -n -o -E '\]\([^)[:space:]]+' "$tmp/text" | while IFS=: read -r n m; do
      target="${m#](}"
      case "$target" in
        '#'*|'<'*) continue ;;
      esac
      printf '%s' "$target" | grep -q -E '^[A-Za-z][A-Za-z0-9+.-]*:' && continue
      target="${target%%#*}"
      target="${target%%\?*}"
      [ -n "$target" ] || continue
      case "$target" in
        /*) p="${target#/}" ;;
        *) p="$dir/$target" ;;
      esac
      [ -e "$p" ] || report "$f" "$n" md "$target"
    done
  fi

  grep -n -o -E "$repo_re" "$tmp/text" | while IFS= read -r line; do
    check_repo "$f" "${line%%:*}" "${line#*:}"
  done
done < "$tmp/files"

grep -E '^site/src/' "$tmp/files" > "$tmp/site" || true
if [ -s "$tmp/site" ]; then
  while IFS= read -r f; do
    grep -o -E 'id="[^"]+"' "$f" | sed -E 's/^id="(.*)"$/\1/'
  done < "$tmp/site" | sort -u > "$tmp/ids"
  grep -E '\.tsx$' "$tmp/site" | while IFS= read -r f; do
    grep -n -o -E 'href="#[^"]+"' "$f" | while IFS=: read -r n m; do
      a="$(printf '%s' "$m" | sed -E 's/^href="#(.*)"$/\1/')"
      grep -q -x -F -- "$a" "$tmp/ids" || report "$f" "$n" anchor "#$a"
    done
  done
fi

cat "$tmp/hits"
count="$(wc -l < "$tmp/hits" | tr -d ' ')"
echo "check-links: $count нарушений"
[ "$count" -eq 0 ]
