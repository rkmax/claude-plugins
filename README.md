# claude-plugins

Claude Code plugin marketplace. Plugins:

- **graph** — The Graph Blueprint: split a goal into pieces, fan out parallel worker agents with different angles, verify their output with a fresh-context verifier, merge what survives, and return one clear actionable report.
- **what-how** — Split a request into the outcome wanted (WHAT) and the method it prescribes (HOW), clarify the WHAT, then choose whether the HOW is weighed, kept as a non-binding advisory, or dropped.

## Layout

```
.claude-plugin/marketplace.json          marketplace manifest
plugins/graph/
  .claude-plugin/plugin.json
  skills/graph/SKILL.md                  orchestration pipeline, invoked as /graph
  agents/graph-researcher.md             gather facts and sources            (Worker tier)
  agents/graph-comparator.md             weigh options against criteria      (Decision tier)
  agents/graph-checker.md                validate concrete claims            (Worker tier)
  agents/graph-gap-finder.md             find what the framing misses        (Worker tier)
  agents/graph-verifier.md               refute worker claims, fresh context (Decision tier)
plugins/what-how/
  .claude-plugin/plugin.json
  skills/what-how/SKILL.md               request splitter, invoked as /what-how
```

In the graph plugin, Worker tier nodes run on `sonnet` and Decision tier nodes on `opus` at max effort, both pinned in their frontmatter.

## Install

Add the marketplace and install the plugins:

```sh
claude plugin marketplace add rkmax/claude-plugins   # or a local checkout path
claude plugin install graph@rkmax-claude-plugins
claude plugin install what-how@rkmax-claude-plugins
```

## Usage

```
/graph <question or investigation>
/what-how [--weighed | --advisory | --what] <request>
```

The graph skill scales the fan-out to the goal: only the angles the question needs are launched. The verifier is mandatory whenever the report drives a decision. The skill only produces reports; it never edits files.
