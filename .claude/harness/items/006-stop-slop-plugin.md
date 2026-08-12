---
id: 006
slug: stop-slop-plugin
status: ready
branch: 006-stop-slop-plugin
---

## Request

> agreguemos el skill stop slop

Source: user (Julian), via `/harness intake`, 2026-08-12. Interpretation:
add the third-party `stop-slop` skill as a new plugin in this marketplace,
alongside `graph` and `harness`.

Provenance: the skill is not the user's own work. Upstream is
<https://github.com/hardikpandya/stop-slop> (MIT, author Hardik Pandya,
<https://hvpandya.com/stop-slop>). The user has a local snapshot at
`~/.claude/skills/stop-slop/` (files dated 2026-07-20, changelog entries
through 2026-01-13).

## Reproduction

Validated current behavior on `main` (85bbc3f):

- `.claude-plugin/marketplace.json` lists exactly two plugins: `graph` and
  `harness`. No `stop-slop` entry.
- `plugins/` contains only `graph/` and `harness/`; no `plugins/stop-slop/`.
- Baseline check passes: `./.claude/harness/check.sh` →
  `check passed: 5 agents, 2 skills validated`.
- Local source snapshot exists: `~/.claude/skills/stop-slop/` with
  `SKILL.md`, `references/{phrases,structures,examples}.md`, `README.md`,
  `CHANGELOG.md`, `LICENSE` (MIT, Copyright (c) 2025 Hardik Pandya).

## Verification criteria

- [ ] Command: `./.claude/harness/check.sh` exits 0 (reports 3 skills)
- [ ] Command: `jq -e '.plugins[] | select(.name == "stop-slop")'
      .claude-plugin/marketplace.json` exits 0
- [ ] Command: `jq -e '.name == "stop-slop"'
      plugins/stop-slop/.claude-plugin/plugin.json` exits 0
- [ ] Command: `test -f plugins/stop-slop/skills/stop-slop/SKILL.md
      && test -f plugins/stop-slop/skills/stop-slop/references/phrases.md
      && test -f plugins/stop-slop/skills/stop-slop/references/structures.md
      && test -f plugins/stop-slop/skills/stop-slop/references/examples.md`
      exits 0
- [ ] Command: `grep -q "Hardik Pandya" plugins/stop-slop/LICENSE` exits 0
- [ ] Command: with `<commit>` being the upstream commit pinned in Handoff
      at vendoring time:
      `curl -fsSL https://raw.githubusercontent.com/hardikpandya/stop-slop/<commit>/SKILL.md
      | diff - plugins/stop-slop/skills/stop-slop/SKILL.md` exits 0
- [ ] Flow: in a fresh Claude Code session with this marketplace added,
      install the `stop-slop` plugin; the skills list then shows
      `stop-slop`, and invoking `/stop-slop` loads the skill instructions.

Regression test: N/A (feature, not a bug).

## Decisions

- Vendor from upstream `hardikpandya/stop-slop` at a pinned commit recorded
  in Handoff; the local `~/.claude/skills/stop-slop/` copy is only a drift
  reference, not the source.
- Preserve upstream `LICENSE` verbatim under `plugins/stop-slop/` (MIT
  requires license retention) and credit Hardik Pandya as author in
  `plugin.json`, not rkmax.
- Mirror the existing plugin layout:
  `plugins/stop-slop/.claude-plugin/plugin.json` and
  `plugins/stop-slop/skills/stop-slop/SKILL.md` + `references/`.
- Update `metadata.description` in `marketplace.json` to mention the third
  plugin.

## Handoff

- 2026-08-12: intake done; requirement validated against `main`, upstream
  identified and licensing checked. No implementation started. Pending at
  work time: pin the upstream commit here before vendoring.
