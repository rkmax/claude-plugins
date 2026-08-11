---
id: 001
slug: check-model-rule
status: accepted
branch: 001-check-model-rule
---

## Request

> check.sh debe validar la regla de modelos: graph-researcher y graph-checker
> con model sonnet, agentes de juicio sin model

Source: user request via `/harness intake` (2026-08-11). This is the model
rule already documented in `CLAUDE.md` ("Worker models are pinned in each
agent's frontmatter on purpose: concrete nodes run on `sonnet`, judgment
nodes inherit the session model."), currently unenforced by the check.

Behavioral definition: `agents/graph-researcher.md` and
`agents/graph-checker.md` must declare exactly `model: sonnet`; every other
agent file under `agents/` must not declare a `model` key at all.

Item type: requirement (missing validation), not a bug — `check.sh` performs
its documented scope (frontmatter validity, name/filename match, skill
cross-references) correctly; the model rule was never part of it.

## Reproduction

Baseline on the clean repo (compliant frontmatter, check passes):

```
$ bash .claude/harness/check.sh
check passed: 5 agents, 1 skills validated
$ grep -n "model" .claude/harness/check.sh
(no matches, exit 1)
```

Gap demonstrated on a scratch copy of the repo with two rule violations
injected — `model: sonnet` removed from `agents/graph-researcher.md` and
`model: haiku` added to `agents/graph-verifier.md`:

```
$ bash .claude/harness/check.sh
check passed: 5 agents, 1 skills validated
exit code: 0
```

The check accepts both violations, so the rule in `CLAUDE.md` is not
enforced by the gate.

## Verification criteria

All temp-copy commands below are self-contained; each `! bash ...` line must
exit 0 (i.e., the check itself must fail) and the check output must name the
offending agent file and the model rule.

- [x] Command: `bash .claude/harness/check.sh` exits 0 on the compliant repo.
- [x] Command (concrete node missing model): for each F in
      `graph-researcher` `graph-checker`:
      `t=$(mktemp -d) && cp -r . "$t/r" && sed -i "/^model: sonnet$/d" "$t/r/agents/$F.md" && ! bash "$t/r/.claude/harness/check.sh"`
      exits 0 and the check output names `agents/$F.md`.
- [x] Command (concrete node wrong model):
      `t=$(mktemp -d) && cp -r . "$t/r" && sed -i "s/^model: sonnet$/model: haiku/" "$t/r/agents/graph-checker.md" && ! bash "$t/r/.claude/harness/check.sh"`
      exits 0 and the check output names `agents/graph-checker.md`.
- [x] Command (judgment node with model): for each F in `graph-comparator`
      `graph-gap-finder` `graph-verifier`:
      `t=$(mktemp -d) && cp -r . "$t/r" && sed -i "/^name: $F$/a model: sonnet" "$t/r/agents/$F.md" && ! bash "$t/r/.claude/harness/check.sh"`
      exits 0 and the check output names `agents/$F.md`.
- [x] Command: `bash .claude/harness/full-check.sh` exits 0 on the compliant
      repo and inherits the new rule (it must fail on any of the temp-copy
      violations above when run from the same copy).

## Handoff

- 2026-08-11: Item filed at intake. Gap reproduced on a scratch copy (both
  violation classes pass the current check). No implementation started.
- 2026-08-11: Implemented on branch `001-check-model-rule`: `check.sh` now
  enforces the model rule inside the existing agent loop (`PINNED_SONNET`
  set for the two concrete nodes; any other agent declaring `model` fails).
  All five verification criteria executed and passing: compliant repo passes,
  every injected violation (missing model, wrong model, model on each of the
  three judgment nodes) fails the check naming the offending file, and
  `full-check.sh` inherits the rule via `exec check.sh`. Nothing remains; no
  dead ends. Ready for `/harness accept 001`.
- 2026-08-11: Accepted. Fresh-context reviewer (diff + criteria only)
  reported zero correctness or scope findings; all five verification
  criteria re-executed green in the accept session; `full-check.sh` green
  on the branch. No remote CI exists. No review failures, so no new
  regression tests were required. Merge left to the human.
