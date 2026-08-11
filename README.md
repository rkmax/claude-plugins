# claude-plugins

Claude Code plugin marketplace with two plugins:

- **graph** — The Graph Blueprint: split a goal into pieces, fan out parallel worker agents with different angles, verify their output with a fresh-context verifier, merge what survives, and return one clear actionable report.
- **harness** — Verifier-first working loop for a live product: intake turns raw requests into verifiable work items, one bounded session per item, adversarial acceptance gate.

## Layout

```
.claude-plugin/marketplace.json          marketplace manifest
plugins/graph/
  .claude-plugin/plugin.json
  skills/graph/SKILL.md                  orchestration pipeline, invoked as /graph
  agents/graph-researcher.md             gather facts and sources            (sonnet)
  agents/graph-comparator.md             weigh options against criteria      (session model)
  agents/graph-checker.md                validate concrete claims            (sonnet)
  agents/graph-gap-finder.md             find what the framing misses        (session model)
  agents/graph-verifier.md               refute worker claims, fresh context (session model)
plugins/harness/
  .claude-plugin/plugin.json
  skills/harness/SKILL.md                verifier-first loop, invoked as /harness
```

In the graph plugin, concrete well-specified nodes run on a cheaper model pinned in their frontmatter; judgment nodes omit `model` and inherit the session model.

## Install

Add the marketplace and install the plugins:

```sh
claude plugin marketplace add rkmax/claude-plugins   # or a local checkout path
claude plugin install graph@rkmax-plugins
claude plugin install harness@rkmax-plugins
```

## Usage

```
/graph <question or investigation>
/harness init | intake <ref> | <item#> | accept <item#>
```

The graph skill scales the fan-out to the goal: only the angles the question needs are launched. The verifier is mandatory whenever the report drives a decision. The skill only produces reports; it never edits files.
