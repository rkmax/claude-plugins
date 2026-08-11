#!/usr/bin/env bash
# Stop hook: blocks the end of a turn while the project's fast check fails.
# Claude Code ends the turn anyway after 8 consecutive blocks, so this cannot
# loop forever.
set -u

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
CHECK="$PROJECT_DIR/.claude/harness/check.sh"

# Not wired in this repo: allow the turn to end.
[ -x "$CHECK" ] || exit 0

OUTPUT="$("$CHECK" 2>&1)"
STATUS=$?
[ "$STATUS" -eq 0 ] && exit 0

{
  echo "harness check failed (exit $STATUS). Fix it before ending the turn."
  echo "--- last lines of check output ---"
  printf '%s\n' "$OUTPUT" | tail -n 40
} >&2
exit 2
