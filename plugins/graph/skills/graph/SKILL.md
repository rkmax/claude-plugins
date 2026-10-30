---
name: graph
description: Run The Graph Blueprint over a question or investigation — define the goal, split it into independent pieces, fan out parallel worker agents with different angles (research, compare, check, find gaps), verify the results with a fresh-context verifier, merge what survives, and deliver one clear actionable report. Use when the user invokes /graph, asks for a multi-angle or parallel investigation, or a broad question would overload a single linear pass.
metadata:
  trigger: Multi-angle parallel investigation with unbiased verification
  version: 0.2.0
---

# Graph

Nodes do the work, edges carry the results. The main conversation orchestrates and synthesizes; it never does a worker's job itself.

## Pipeline

1. **Goal.** Restate what the final report must answer in one falsifiable sentence, plus the decision it feeds. If the ambiguity would change the split, ask at most one round of clarifying questions (AskUserQuestion); otherwise proceed.
2. **Split.** Break the goal into independent pieces and give each piece exactly one angle. A piece must be answerable without another piece's result; anything sequential stays in the main conversation or becomes a second wave after Verify.
3. **Fan out.** Launch every worker in a single message (parallel Agent calls with `subagent_type: graph-<angle>`; when installed as a plugin the agents register namespaced as `graph:graph-<angle>`). Each prompt carries the goal verbatim, the piece, the angle question, and nothing from this conversation's reasoning. Workers never see each other's output. Models are fixed in each agent's definition; do not override them in the call (the dotfiles `agents-tier-gate` may downgrade model/effort at call time when the plan's quota is low).
4. **Verify.** Pass `graph-verifier` the goal, each worker's piece assignment, and the raw returns; never the orchestrator's reasoning. Fresh context is the point: the verifier must be able to refute a worker without inheriting the orchestrator's assumptions. It returns one verdict per claim: confirmed, refuted, or unverifiable.
5. **Merge.** Keep confirmed claims, drop refuted ones, carry unverifiable ones only with that label. Resolve contradictions between workers by evidence, never by confidence of phrasing. This happens in the main conversation.
6. **Final answer.** One report: the answer first, then the evidence that survived verification, then open gaps. No process transcript, no per-agent narration.

## Angles

| Agent | Angle | Tier |
|---|---|---|
| `graph-researcher` | gather facts and sources for a piece | Worker |
| `graph-comparator` | weigh options and trade-offs against explicit criteria | Decision |
| `graph-checker` | validate concrete claims by reading code or running read-only commands | Worker |
| `graph-gap-finder` | find what the goal and the obvious approach miss | Worker |
| `graph-verifier` | refute worker claims from fresh context (reduce step, not a worker) | Decision |

Model economy follows the /task convention: Worker tier nodes run on `sonnet` and Decision tier nodes on `opus` at max effort (both set in the agent definition).

## Rules

- Scale the graph to the goal: a two-angle question gets two workers; a single-piece goal degrades to one worker plus the verifier. Never fan out all four angles by reflex.
- Every edge is a structured return; never tell an agent "as discussed" or "see above".
- The verifier is mandatory when the report will drive a decision or contains claims about external state. Skip it only for a purely exploratory brainstorm, and say so in the report.
- If a worker returns nothing usable, re-run it once with a sharper piece; after that, record the gap in the final report instead of looping.
- If the verifier fails or returns nothing usable, re-run it once; if it still fails, deliver the report labeled unverified — never merge silently. If the verifier refutes every claim, the report says exactly that.
- If AskUserQuestion is unavailable (headless or delegated run), proceed with the most conservative interpretation and declare the assumption in the report.
- The read-only constraint on Bash for `graph-researcher`, `graph-checker`, and `graph-verifier` is instruction-level, mediated by the user's permission system — no frontmatter field restricts which commands Bash executes.
- This skill produces a report; it never edits files or executes mutable actions. When the report calls for changes, hand off through /flow: the report enters as an evidence report feeding /price-check or /spec.
