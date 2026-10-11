#!/usr/bin/env bash
# Уведомление рабочего стола из хуков: macOS (terminal-notifier) или Linux (notify-send).
# Использование: notify.sh 'Текст' [ping|glass]
# Никогда не блокирует работу: любой сбой -> exit 0.
MSG="${1:-Claude Code}"
SOUND="${2:-ping}"

if command -v terminal-notifier >/dev/null 2>&1; then
  case "$SOUND" in
    glass) MAC_SOUND=Glass ;;
    *)     MAC_SOUND=Ping ;;
  esac
  terminal-notifier -title 'Claude Code' -message "$MSG" -sound "$MAC_SOUND" >/dev/null 2>&1
elif command -v notify-send >/dev/null 2>&1; then
  notify-send --app-name='Claude Code' 'Claude Code' "$MSG" >/dev/null 2>&1
  case "$SOUND" in
    glass) XDG_SOUND=complete ;;
    *)     XDG_SOUND=message-new-instant ;;
  esac
  if command -v canberra-gtk-play >/dev/null 2>&1; then
    canberra-gtk-play -i "$XDG_SOUND" >/dev/null 2>&1 &
  fi
fi

exit 0
