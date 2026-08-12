---
id: 005
slug: work-close-opens-pr
status: ready
branch: 005-work-close-opens-pr
---

## Request

Verbatim, from `/harness intake` on 2026-08-11 (Spanish):

> work mode debe cerrar al abrir PR contra main para que acept pueda gatear
> CI

Context from the same conversation: the user reported that for the last
three items the PR was only opened manually after acceptance. The accept
mode requires remote CI green when the repo has CI, but this repo's CI
triggers only on `pull_request`, so without an open PR the accept gate has
nothing to evaluate. The fix belongs in the harness skill source in this
repo (`plugins/harness/skills/harness/`), which is byte-identical to the
installed copy at `~/.claude/skills/harness`; syncing that installed copy
is part of the delivery.

## Reproduction

Current behavior, validated on main cd83440:

- `plugins/harness/skills/harness/references/work.md:19-20` — the close
  step says "commit with a conventional message (push if a remote exists)";
  nothing opens a PR.
- `plugins/harness/skills/harness/references/accept.md:21-23` — accept
  requires remote CI green when the repo has CI, and the local full check
  never replaces it.
- `.github/workflows/full-check.yml` — CI triggers only on
  `pull_request: branches: [main]`.
- Live gap: the work session for item 004 closed "in a mergeable state"
  (branch `004-public-release-prep` pushed), yet
  `gh pr list --head 004-public-release-prep --state all --json number --jq length`
  returns `0` — no PR, so the CI gate accept depends on never ran.
- PRs #1, #2, #4 for items 001-003 exist and were opened manually by the
  user after the fact.
- `diff -r ~/.claude/skills/harness plugins/harness/skills/harness` is
  clean, confirming the repo plugin is the source of truth for the
  installed skill.

## Agreed scope

Amend the work-mode close step in the plugin source so a work session ends
by opening a PR from the item branch against the default branch when a
remote exists (ensuring one exists is enough; an already-open PR for the
branch counts). Keep the no-hard-dependency property: the routing text
(`plugins/harness/skills/harness/SKILL.md:41`, "none of the modes depend
on `gh`") must stay accurate or be reworded so PR opening is conditional
on a remote and a usable `gh`, mirroring "push if a remote exists". Sync
the installed copy at `~/.claude/skills/harness`. Out of scope: changing
the accept gate logic, retrofitting PRs for items 001-004.

## Verification criteria

- [ ] Command: `grep -qiE "open(ing)? (a |the )?(pull request|PR)" plugins/harness/skills/harness/references/work.md`
      exits 0, and the match sits in the session-close step, conditional on
      a remote existing, targeting the default branch.
- [ ] Command: `diff -r plugins/harness/skills/harness "$HOME/.claude/skills/harness"`
      exits 0 (installed copy synced with the amended source).
- [ ] Command: `bash .claude/harness/check.sh` and `claude plugin validate .`
      both exit 0.
- [ ] Flow: the work session for this item itself follows the amended rule:
      it closes with a PR open from `005-work-close-opens-pr` to `main`
      (`gh pr list --head 005-work-close-opens-pr --json number --jq length`
      returns 1) and the `full-check` CI run for that PR exists, so
      `/harness accept 005` can gate on it.

## Handoff

- 2026-08-11: Intake. Validated on main cd83440: work.md close step pushes
  but never opens a PR; accept requires remote CI green; CI only triggers
  on `pull_request`; item 004's branch closed with zero PRs as live
  evidence. Installed skill copy verified byte-identical to the repo
  plugin source. Wording of the SKILL.md "none of the modes depend on
  `gh`" line is a work-session decision; the property to preserve is
  conditional use, not a hard dependency.
