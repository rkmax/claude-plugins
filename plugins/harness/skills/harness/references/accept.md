# Mode: accept (gate before merge)

Input: `<item#>` — the work item to gate. Refuse to start without one.

1. Locate the item file and its branch (`<item#>-<slug>`). The diff under
   review is `git diff <default-branch>...<branch>`.
2. Launch a fresh-context subagent as reviewer. Give it only: the diff, the
   item's verification criteria, and this exact instruction:

   > Review this diff against the verification criteria. Report only gaps in
   > correctness or in the stated requirements, and any change outside the
   > item's scope. Ignore style, naming, and hypothetical improvements. For
   > each finding, state the failure scenario concretely.

   The reviewer must not see the reasoning or conversation that produced the
   change.
3. Apply the findings that affect correctness or scope, then re-run the
   reviewer once on the updated diff. Treat everything else as optional and
   say so.
4. Require `.claude/harness/full-check.sh` green on the item branch. Do not
   substitute the fast check for it. If the repo additionally has CI on a
   remote, require that green too; the local full check never replaces an
   existing CI gate.
5. Convert every real failure found during review into a permanent regression
   test on the same branch.
6. Report the verdict with evidence: reviewer findings and their resolution,
   the full check output, and the regression tests added. On a passing
   verdict set `status: accepted` in the item file. Do not merge; merging is
   a human action.
