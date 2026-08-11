---
id: 003
slug: plugin-marketplace
status: in-review
branch: 003-plugin-marketplace
---

## Request

Verbatim, from conversation on 2026-08-11 (Spanish):

> copiar harness como skill local asi esta disponible

> mejor aun, es posible refactorizar este repo para que sean skills
> instalables? por cualquiera? de manera que volvemos lo que hay hou una
> carpeta y otra para el harness skills?

Agreed scope: convert the repo into a Claude Code plugin marketplace with two
plugins — `graph` (skill + worker agents, currently at the repo root) and
`harness` (skill moved into this repo from the user's dotfiles, where it is
staged but was never committed). The repo and local folder are renamed
`The-Graph-Skill` → `claude-plugins` during intake, independently of this
item's work.

## Reproduction

The current layout is not installable as a plugin or marketplace:

```
$ claude plugin validate .
Validating plugin manifest: /home/rkmax/Development/Personal/The-Graph-Skill
✘ Found 1 error:
  ❯ directory: No manifest found in directory. Expected
    .claude-plugin/marketplace.json or .claude-plugin/plugin.json
✘ Validation failed
exit: 1
```

`skills/graph/` and `agents/` sit at the repo root and install is manual
symlinking per README.md. The harness skill lives outside the repo at
`~/Development/Personal/dotfiles/packages/agents/.claude/skills/harness`
(symlinked as `~/.claude/skills/harness`; staged in dotfiles, never
committed there).

## Verification criteria

- [x] Command: `claude plugin validate .` exits 0 at the repo root.
- [x] Command: `bash .claude/harness/check.sh` exits 0 and reports 5 agents
      and 2 skills validated (globs updated to the `plugins/*/` layout; the
      harness SKILL.md becomes covered by the check).
- [x] Command: `test ! -e skills && test ! -e agents` exits 0 at the repo
      root (old top-level layout removed).
- [x] Command: `diff -r ~/.claude/skills/harness plugins/harness/skills/harness`
      exits 0, run before any symlink is repointed (harness content moved
      intact from dotfiles).
- [x] Flow: on a clean config, `claude plugin marketplace add <repo path>`
      then `claude plugin install graph@rkmax-claude-plugins` and
      `claude plugin install harness@rkmax-claude-plugins` succeed; in a
      fresh session bare `/graph` and `/harness` resolve to the plugin
      skills (clean config has no `~/.claude` symlinks, so bare names do
      not collide). Marketplace name is `rkmax-claude-plugins`, not
      `claude-plugins`: the validator rejects `claude-plugins` as
      impersonating an official Anthropic marketplace (see 2026-08-11
      work handoff).

## Handoff

- 2026-08-11: Intake. Plugin/marketplace format verified against official
  docs (code.claude.com: plugins-reference.md, plugin-marketplaces.md,
  skills.md). Facts the work session can rely on without re-research:
  - Marketplace manifest at `.claude-plugin/marketplace.json` with
    `{name, owner, plugins: [{name, source: "./plugins/<dir>", description}]}`.
  - Each plugin dir carries `.claude-plugin/plugin.json` (only `name`
    required) and bundles `skills/` and `agents/` at the plugin root.
  - Plugin skills/agents are namespaced `plugin:name`, but bare `/graph`
    invocation works when unambiguous (skills.md: "The bare /fancy also
    invokes the skill unless another command already uses that name").
    Model auto-invocation is description-based and unaffected. So plugin
    names `graph` and `harness` cost nothing in UX.
  - Target layout:
    `plugins/graph/{.claude-plugin/plugin.json, skills/graph/SKILL.md, agents/graph-*.md}`
    and
    `plugins/harness/{.claude-plugin/plugin.json, skills/harness/{SKILL.md, references/, templates/}}`.
  Also update in the same branch: check.sh globs, README install section,
  CLAUDE.md paths, and the SKILL.md fan-out wording (agents register as
  `graph:graph-<angle>` when installed as a plugin). After merge, outside
  this repo: repoint `~/.claude` symlinks or install via local marketplace,
  and unstage the harness copy from dotfiles.
- 2026-08-11: Work session. Restructured to the target layout: created
  `.claude-plugin/marketplace.json`, `plugins/graph/` (skills/graph +
  agents moved via `git mv`), `plugins/harness/` (skill copied from
  `~/.claude/skills/harness`, `diff -r` clean before any symlink change).
  Updated check.sh globs (agent cross-refs now resolve per plugin root),
  README (marketplace layout + install), CLAUDE.md paths, and the graph
  SKILL.md fan-out wording (`graph:graph-<angle>` when installed as a
  plugin). Deviation from intake: the CLI validator rejects marketplace
  name `claude-plugins` ("impersonates an official Anthropic/Claude
  marketplace"), so the manifest carries a prefixed name; repo name is
  unaffected. Criterion 5 updated accordingly. Flow verified on a clean
  `CLAUDE_CONFIG_DIR`: marketplace add + both installs succeeded, and in
  fresh headless sessions bare `/harness` and `/graph` resolved to the
  plugin skills (namespaced `harness:harness`). All five criteria pass
  with evidence in the session. Remaining, post-merge and outside this
  repo: remove/repoint the `~/.claude/skills/{graph,harness}` and
  `~/.claude/agents/graph-*.md` symlinks, install via the marketplace,
  and unstage the harness copy from dotfiles.
- 2026-08-11 (later): Renamed the marketplace `rkmax-plugins` →
  `rkmax-claude-plugins` per user request (validator accepts it; only
  bare `claude-plugins` is rejected). Updated README install commands
  and criterion 5; re-ran validate and the clean-config install flow
  plus bare `/graph` and `/harness` resolution under the new name.
  Opened the PR for the branch.
