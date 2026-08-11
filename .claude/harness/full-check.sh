#!/usr/bin/env bash
# Full gate for /harness accept. This repo has no suite beyond the
# structural check, so the full check is the fast check.
exec "$(dirname "$0")/check.sh"
