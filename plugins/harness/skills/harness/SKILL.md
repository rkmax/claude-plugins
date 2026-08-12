---
name: harness
description: Verifier-first loop for a live product. init wires the fast check, the full check and the stop hook, intake turns raw requests into verifiable work items stored in the repo, default mode runs one bounded session per item, accept gates the item branch adversarially. No external tracker required.
disable-model-invocation: true
---

# Harness

Verifier-first working loop for an existing product where new requirements and
bugs arrive daily. Based on Anthropic's documented harness practices
(long-running agent harnesses, Claude Code best practices, agent evals).

## Fixed rules (apply in every mode)

1. No executable verification criteria, no work. A work item is eligible only
   if "done" is defined as commands and flows that can be checked.
2. The generating agent never approves its own work. Verdicts come from a
   fresh-context reviewer plus the repo's defined full check
   (`.claude/harness/full-check.sh`).
3. Never weaken or delete existing tests. Every bug fix starts from a failing
   test.
4. One item per session, one branch per item. The item file carries the
   handoff between sessions.
5. Success requires evidence in the conversation (test output, executed
   command, screenshot), never assertion.

## Routing

Route on the arguments (`$ARGUMENTS`):

- `init` → read and follow `references/init.md` exactly.
- `intake <ref>` → read and follow `references/intake.md` exactly. `<ref>` is
  the raw request: a pasted report, a description, a URL, an external issue
  reference — anything.
- `accept <item#>` → read and follow `references/accept.md` exactly.
- `<item#>` (a number) → read and follow `references/work.md` exactly.
- Empty or anything else → stop and ask the user for an item number. Do not
  pick from the backlog on your own.

Work items live in the repo at `.claude/harness/items/<NNN>-<slug>.md`; no
external tracker is required, and no mode hard-depends on `gh`: the work
mode's close step uses it to open the pull request when a remote exists,
and reports the missing PR as a pending human action when it is
unavailable.

Read only the reference file for the requested mode. Do not load the others.
