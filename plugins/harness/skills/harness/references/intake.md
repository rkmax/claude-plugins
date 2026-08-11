# Mode: intake (each new requirement or bug)

Convert a raw request into a work item that is eligible for the loop. Do not
implement the fix here.

Input: `<ref>` — anything: a pasted report, a description, a URL, an external
issue reference. If it points to an external tracker or page, fetch it
read-only and quote the relevant parts into the item file; the item file is
the source of truth regardless of where the request came from.

1. Reproduce the problem against the real code, or validate the requirement
   against the current behavior. Show the reproduction as evidence. If it
   cannot be reproduced or validated, stop and report that instead of filing
   guesswork.
2. Create the item file `.claude/harness/items/<NNN>-<slug>.md` following
   `templates/item.md`, where `<NNN>` is the next free number in that
   directory (start at `001`). Fill in the request verbatim, the reproduction
   evidence, and the verification criteria: executable commands and
   user-visible flows that define "done". Commit it on the default branch.
3. If the item is a bug, write the failing test now and commit it to the
   item's branch (`<NNN>-<slug>`), created from the default branch; push only
   if a remote exists. The test must fail for the reason the bug describes;
   show the failing output as evidence.
4. If no executable criteria can be written, set `status: needs-definition`
   and stop; the item is not eligible for `/harness <item#>` and must not be
   worked on. Otherwise set `status: ready`.

Do not prioritize, schedule, or assign the item. That is a human or
planning-flow decision, not this skill's.
