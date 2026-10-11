#!/usr/bin/env bash
# Таймклок пайплайна: одна jsonl-строка на событие хука.
# Никогда не блокирует работу: любой сбой -> exit 0.
LOG="$HOME/.claude/pipeline-clock.jsonl"

command -v jq >/dev/null 2>&1 || exit 0

jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '{
  ts: $ts,
  event: .hook_event_name,
  session: .session_id,
  cwd: .cwd,
  detail: (
    if .hook_event_name == "UserPromptSubmit"
      then ((.prompt // "") | split("\n")[0] | .[0:200])
    elif .hook_event_name == "PreToolUse" or .hook_event_name == "PostToolUse"
      then ((.tool_input.prompt // .tool_input.description // "") | split("\n")[0] | .[0:200])
    else "" end
  )
}' >> "$LOG" 2>/dev/null

exit 0
