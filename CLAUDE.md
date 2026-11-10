# claude-plugins

Mostly Markdown: a Claude Code plugin marketplace
(`.claude-plugin/marketplace.json`). Each plugin lives in
`plugins/<name>/` with its manifest in `.claude-plugin/plugin.json`, skills
in `skills/<skill>/SKILL.md` and optional agents in `agents/`. `doubt` is a
TypeScript hooks module (`plugins/doubt/hooks/`) and the only plugin with
tests.

## Check

- `.claude/harness/check.sh` — fast check: validates YAML frontmatter of
  every agent and SKILL.md file and cross-checks that agents referenced in
  SKILL.md exist, and that marketplace.json lists exactly the plugins under
  `plugins/`, each by its plugin.json name. Run it after any change; it must
  pass before ending a turn.
- `.claude/harness/full-check.sh` — full gate for `/harness accept`; in this
  repo it is the same structural check.
- For `plugins/doubt/`, run `claude plugin validate plugins/doubt` and
  `claude plugin test plugins/doubt`. CI does not run them.
- `tsc -p plugins/doubt` works once Claude Code has loaded the mod once: its
  `tsconfig.json` extends `.claude-plugin/types/tsconfig.json`, which the
  engine writes on load and git ignores.

## Rules

- Any change under `plugins/<name>/` bumps `version` in its
  `.claude-plugin/plugin.json`: a pinned version keeps installed copies on
  the cached files until it changes. `check.sh` fails otherwise.
- Agent frontmatter `name` must match the filename; skill `name` must match
  its directory name.
- Worker models are pinned in each agent's frontmatter on purpose: Worker
  tier nodes run on `sonnet` (effort `medium`), Decision tier nodes on `opus`
  (effort `max`). Do not remove `model` from agents or override models at
  call time (the dotfiles `agents-tier-gate` may downgrade model/effort when
  the plan's quota is low).
