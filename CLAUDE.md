# The Graph Skill

Markdown-only repo: one Claude Code skill (`skills/graph/`) and its worker
agents (`agents/`). No build, no test suite.

## Check

- `.claude/harness/check.sh` — validates YAML frontmatter of every agent and
  SKILL.md file and cross-checks that agents referenced in SKILL.md exist.
  Run it after any change; it must pass before ending a turn.

## Rules

- Agent frontmatter `name` must match the filename; skill `name` must match
  its directory name.
- Worker models are pinned in each agent's frontmatter on purpose: concrete
  nodes run on `sonnet`, judgment nodes inherit the session model. Do not
  add `model` to judgment agents or override models at call time.
