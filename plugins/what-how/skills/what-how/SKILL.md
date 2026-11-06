---
name: what-how
description: Split a request into its WHAT (the outcome actually wanted, its scope and how success is seen) and its HOW (the method the request prescribes), clarify the WHAT the HOW was obscuring, then let the user choose how the HOW travels into the work - weighed in the analysis, kept as a non-binding advisory, or dropped. Use when the user invokes /what-how, or asks to separate what they want from how they said to do it.
metadata:
  trigger: The user wants the goal of a request separated from the method it prescribes before the agent acts on it
---

# What / How

A request usually mixes two things: the WHAT (the outcome wanted) and the HOW (a
method for getting it). The HOW often hides the WHAT: its scope, its success
condition, or the fact that it was never stated. This skill separates them,
clarifies the WHAT, and lets the user decide what the agent receives.

The deliverable is the package the user chooses; the agent then attends it. Nothing
is implemented before the user picks a mode.

## Asking the user

Wherever the process asks the user, use the host's question tool and follow its
schema's limits: `AskUserQuestion` in Claude Code; in Codex,
`request_user_input_async` when available, or `request_user_input` only in the
modes where its schema permits it. If no question tool is usable, ask in
conversation and wait for the answer.

## Process

1. **Capture the raw request** from the skill args, verbatim. If there is none, ask
   for it. A leading mode flag (`--what`, `--advisory`, `--weighed`) preselects the
   mode of step 5 and skips that question. The request may come already split, with
   the parts labeled `what:` / `how:` (or `qué:` / `cómo:`), in either order, after
   the flag.
2. **Ground before asking.** When the request refers to a repo, file, system or past
   work, read enough to answer what the context can answer. Read-only; no changes.
3. **Separate.** Sort every phrase of the request. When it came split, every phrase
   under `how:` starts as a HOW item, and the `what:` part is sorted like an
   unsplit request: a method or named tool found there moves to the HOW list,
   marked `(moved from WHAT)`. Either part's methods become constraints only under
   the disguised-constraint rule below, with a stated reason; a split input is not
   that reason.
   - **WHAT**: the outcome, who sees it, where, and what changes for them.
   - **HOW**: each prescribed method, tool, step, structure or implementation detail.
     For each one, name the WHAT it seems to serve ("use a cron job" serves "it runs
     without me remembering").
   - **Constraint disguised as HOW**: a method the goal cannot drop without failing
     (mandated stack, compatibility, deadline, budget, an existing contract). Only the
     request or the grounded context decides this, by giving the reason; without a
     stated reason the item stays in the HOW. Move it to the WHAT as a constraint and
     mark it as moved so the user can contest it.
4. **Clarify the WHAT.** Rewrite it without any method, in the user's language. The
   WHAT holds only what the request says or the grounded context establishes. A
   WHAT item derived from a HOW item ("upload to S3" -> "a copy lives off the
   server") carries `(from HOW: <item>)`. Anything else you would add (alerts,
   restore tests, retention) is an assumption, never part of the WHAT:
   - **Objective**: one sentence, the outcome, no solution words.
   - **Acceptance**: what the user sees or does when it is done, in observable terms.
   - **Scope**: in, and out only for what the HOW implied but the goal does not need.
     Other exclusions you would state are assumptions.
   - **Constraints**: the real ones, with those moved from the HOW marked.
   - **Gaps**: what the HOW was covering up (unstated success condition, unclear
     scope, a goal the HOW does not actually reach). Ask about a gap only when its
     answer changes the objective, acceptance or scope; ask with the host's question
     tool (see Asking the user), at most one round, with concrete options. Gaps that do not
     change those three are listed as assumptions instead.
5. **Present and choose.** Show the WHAT and the HOW list (each HOW item with the
   WHAT it serves), then ask which package the agent attends:
   - **Weighed** (`--weighed`): WHAT plus HOW, and the analysis must weigh each HOW
     item against at least one alternative, adopt or reject it, and say why in one
     line.
   - **Advisory** (`--advisory`): WHAT plus HOW attached as a non-binding note. The
     agent solves for the WHAT on its own and may use the note; it does not owe an
     evaluation of it and does not need to justify ignoring it.
   - **WHAT only** (`--what`): the HOW is dropped. The agent works from the clarified
     WHAT as if the HOW had never been written. Constraints moved to the WHAT stay.

   The three options go after the step-5 block. With no choice made, nothing is
   attended; wait.
6. **Attend.** Restate the chosen package as the request, then work on it in this
   session following the user's and repository's instructions as if the user had
   typed that package. A mode never relaxes those instructions.

## Output of step 5

In the user's language, short:

```
WHAT
  Objective: ...
  Acceptance: ...
  Scope: in ... / out ...
  Constraints: ... (moved from HOW: ...)

ASSUMPTIONS (not part of the WHAT; accept or strike)
  - ...

HOW (as written)
  - <method> -> serves: <what it seems to serve>
```

## Rules

- The WHAT never contains a method word that only one implementation could satisfy,
  except inside a marked constraint.
- The WHAT never grows beyond the request: what you added is listed under
  Assumptions, where the user can accept or strike it.
- Preserve every HOW item verbatim in the list, whatever mode is chosen; dropping it
  from the work is not dropping it from the record.
- Do not judge the HOW in steps 3-5. Judgment happens only in the Weighed mode, during
  the analysis.
- Do not route to other skills from here; after step 6 the normal instructions
  decide that, as they would for the package typed directly.
