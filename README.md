# claude-plugins

Claude Code plugin marketplace. Plugins:

- **doubt** — Claude Code mod (a hooks module, not a skill). Turned on for one conversation with `/doubt`, it asks Claude your own doubt once before each answer is handed back and before each question to you, so Claude re-examines its work without you typing it.
- **graph** — The Graph Blueprint: split a goal into pieces, fan out parallel worker agents with different angles, verify their output with a fresh-context verifier, merge what survives, and return one clear actionable report.
- **what-how** — Split a request into the outcome wanted (WHAT) and the method it prescribes (HOW), clarify the WHAT, then choose whether the HOW is weighed, kept as a non-binding advisory, or dropped.

## Layout

```
.claude-plugin/marketplace.json          marketplace manifest
plugins/doubt/
  .claude-plugin/plugin.json             manifest and the `question` setting
  hooks/register.ts                      hooks module: the /doubt command and the two doubts
  types/index.d.ts                       $.state contract
  tests/doubt.test.ts                    claude plugin test suite
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
claude plugin install doubt@rkmax-claude-plugins
claude plugin install graph@rkmax-claude-plugins
claude plugin install what-how@rkmax-claude-plugins
```

## Usage

```
/doubt [on|off]
/graph <question or investigation>
/what-how [--weighed | --advisory | --what] <request>
```

The graph skill scales the fan-out to the goal: only the angles the question needs are launched. The verifier is mandatory whenever the report drives a decision. The skill only produces reports; it never edits files.

## Doubt

`/doubt` toggles the mode for the current conversation; `/clear` turns it off, and other conversations are never affected. While it is on:

- When Claude is about to end a turn, the turn is kept open once and Claude reads your doubt as Stop hook feedback. Its first answer is already on screen; the re-examination follows it without you doing anything.
- When Claude is about to ask you a question, the question is refused once with the same text. The next question in the turn goes through.
- Subagents are not doubted, and neither is a stop that only waits for background work.

The doubt carries no information beyond its text, and it is asked every time, also when the answer was right. Set the text with the `question` setting (`/config`, default in `plugins/doubt/.claude-plugin/plugin.json`).
