# claude-plugins

Markdown-only repo: a Claude Code plugin marketplace
(`.claude-plugin/marketplace.json`) with two plugins under `plugins/` —
`graph` (skill `plugins/graph/skills/graph/` plus worker agents
`plugins/graph/agents/`) and `harness` (skill
`plugins/harness/skills/harness/`). No build, no test suite.

## Check

- `.claude/harness/check.sh` — fast check: validates YAML frontmatter of
  every agent and SKILL.md file and cross-checks that agents referenced in
  SKILL.md exist. Run it after any change; it must pass before ending a turn.
- `.claude/harness/full-check.sh` — full gate for `/harness accept`; in this
  repo it is the same structural check.

## Rules

- Agent frontmatter `name` must match the filename; skill `name` must match
  its directory name.
- Worker models are pinned in each agent's frontmatter on purpose: Worker
  tier nodes run on `sonnet` (effort `medium`), Decision tier nodes on `opus`
  (effort `max`). Do not remove `model` from agents or override models at
  call time (the dotfiles `agents-tier-gate` may downgrade model/effort when
  the plan's quota is low).
