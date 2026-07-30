# The Graph Skill

Claude Code skill implementing The Graph Blueprint: split a goal into pieces, fan out parallel worker agents with different angles, verify their output with a fresh-context verifier, merge what survives, and return one clear actionable report.

```
Goal → Split → [research | compare | check | find gaps] → Verify → Merge → Final answer
                     fan out: many agents, angles          reduce: fresh context
```

Nodes do the work. Edges carry the results.

## Layout

```
skills/graph/SKILL.md      orchestration pipeline, invoked as /graph
agents/graph-researcher.md gather facts and sources            (sonnet)
agents/graph-comparator.md weigh options against criteria      (session model)
agents/graph-checker.md    validate concrete claims            (sonnet)
agents/graph-gap-finder.md find what the framing misses        (session model)
agents/graph-verifier.md   refute worker claims, fresh context (session model)
```

Concrete, well-specified nodes run on a cheaper model pinned in their frontmatter; judgment nodes omit `model` and inherit the session model.

## Install

Symlink into the Claude Code user config:

```sh
ln -s "$(pwd)/skills/graph" ~/.claude/skills/graph
for f in agents/graph-*.md; do ln -s "$(pwd)/$f" ~/.claude/agents/; done
```

## Usage

```
/graph <question or investigation>
```

The skill scales the fan-out to the goal: only the angles the question needs are launched. The verifier is mandatory whenever the report drives a decision. The skill only produces reports; it never edits files.
