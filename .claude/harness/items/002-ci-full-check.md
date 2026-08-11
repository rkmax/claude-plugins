---
id: 002
slug: ci-full-check
status: in-progress
branch: 002-ci-full-check
---

## Request

> vamos agregar gh actions

Source: user request via `/harness intake` (2026-08-11), following the
suggestion recorded at item 001 acceptance: add a GitHub Actions workflow so
the repo has a remote CI gate. Interpreted scope: a workflow that runs
`.claude/harness/full-check.sh` on every pull request targeting `main`, so
the `/harness accept` remote-CI clause ("if the repo additionally has CI on
a remote, require that green too") has something to require.

Item type: requirement (missing infrastructure), not a bug.

## Reproduction

Validated current behavior on `main` (b24b71e), remote `rkmax/The-Graph-Skill`:

```
$ ls -la .github/workflows
".github/workflows": No such file or directory (os error 2)
$ gh api repos/rkmax/The-Graph-Skill/actions/workflows --jq '.total_count'
0
$ gh pr view 1 --json statusCheckRollup --jq '.statusCheckRollup'
[]
```

PR #1 merged with zero status checks: nothing on GitHub runs the full check,
so a PR violating the repo rules would merge with no automated gate.

## Verification criteria

- [ ] Command: `bash .claude/harness/full-check.sh` exits 0 on the item
      branch (the workflow must run this exact script, not a copy of its
      logic).
- [ ] Command: after pushing the item branch and opening its PR,
      `gh pr checks <pr#> --watch` exits 0 and lists the new workflow check
      as passing.
- [ ] Flow (negative case): push a scratch branch from the item branch with
      a rule violation injected (`model: haiku` added to
      `agents/graph-verifier.md` frontmatter), open a draft PR; the same
      workflow check reports failure on that PR (`gh pr checks` exits
      nonzero). Close the draft PR and delete the scratch branch afterwards.
- [ ] Command: `gh api repos/rkmax/The-Graph-Skill/actions/workflows --jq '.total_count'`
      returns >= 1 after merge (checkable on the PR branch via the workflow
      file existing under `.github/workflows/` and the checks above).

## Handoff

- 2026-08-11: Item filed at intake. Current behavior validated: no workflows
  locally or on GitHub, PR #1 merged with zero checks. Criteria are
  executable via `gh`. No implementation started.
