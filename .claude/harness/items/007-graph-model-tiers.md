---
id: 007
slug: graph-model-tiers
status: in-review
branch: feat/graph-model-tiers
---

## Request

Replace the graph plugin's "concrete nodes on sonnet, judgment nodes inherit
the session model" rule with two pinned tiers: Worker (`graph-researcher`,
`graph-checker`, `graph-gap-finder`) on `model: sonnet` + `effort: medium`,
Decision (`graph-verifier`, `graph-comparator`) on `model: opus` +
`effort: max`. `check.sh` must enforce both tiers. This supersedes the rule
that item 001 enforced.

## Reproduction

On `main`, `graph-gap-finder` carries no `model` and the check rejects any
`model` on it; the Decision agents carry no `model` or `effort`.

## Verification criteria

Each negative command runs on a scratch copy and must make the check fail
naming the agent file.

- [ ] Command: `bash .claude/harness/check.sh` exits 0 on the compliant repo.
- [ ] Command: remove `effort: max` from `graph-verifier.md`; check fails.
- [ ] Command: set `model: opus` in `graph-gap-finder.md`; check fails.
- [ ] Command: remove `effort: medium` from `graph-checker.md`; check fails.
- [ ] Command: add an agent file not listed in either tier; check fails with
      "agent is in no tier".

## Handoff

- 2026-10-29: Implemented on `feat/graph-model-tiers`; first four criteria
  executed green. Docs (`CLAUDE.md`, `README.md`, graph `SKILL.md`) note that
  the dotfiles `agents-tier-gate` may downgrade model/effort at call time
  when quota is low.
