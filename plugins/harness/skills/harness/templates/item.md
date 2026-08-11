# Work item file format

Create as `.claude/harness/items/<NNN>-<slug>.md` with the next free `<NNN>`
(start at `001`). An item without the criteria block completed is not
eligible for `/harness <item#>`.

```markdown
---
id: <NNN>
slug: <short-slug>
status: needs-definition | ready | in-progress | in-review | accepted
branch: <NNN>-<short-slug>
---

## Request

<the raw request, verbatim, with its source if it came from elsewhere>

## Reproduction

<commands run and their output, or the validated current behavior>

## Verification criteria

- [ ] Command: `<command>` exits 0
- [ ] Flow: <user-visible flow described step by step, with the expected
      observable result>
- [ ] Regression test: `<test id or file>` fails before the change and passes
      after it

## Handoff

- <date>: <what was done, what remains, dead ends hit>
```

Rules:

- Every criterion must be checkable by running something or observing the
  product. "Code looks correct" is not a criterion.
- For bugs, the regression test criterion is mandatory.
- Keep criteria scoped to this item; anything broader belongs in a separate
  item.
