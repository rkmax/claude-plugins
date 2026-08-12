# Mode: work (one session = one item)

Input: `<item#>` — the work item number. Refuse to start without one.

1. Get bearings: read `.claude/harness/items/<item#>-*.md` and its
   verification criteria. Refuse items with `status: needs-definition`. If
   the item's branch exists, check it out and read the item's Handoff section
   for notes from previous sessions. If not, create branch `<item#>-<slug>`
   from the default branch and set `status: in-progress`.
2. Run `.claude/harness/check.sh`. If it fails, repair that first; never start
   an item on a broken base. If the script does not exist, stop and tell the
   user to run `/harness init`.
3. Confirm the item's failing test exists and fails for the described reason
   (for bugs). If it is missing, write it now before any fix.
4. Implement against the failing test with the minimal diff that resolves the
   item. Do not refactor, rename, or clean up beyond what the item needs.
5. Verify end-to-end as a real user would (running app, real CLI, browser
   flow), not only with unit tests. Show the evidence in the conversation.
6. Close the session in a mergeable state: commit with a conventional message
   (push if a remote exists) and append a dated entry to the item's Handoff
   section: what was done, what remains, and any dead ends hit. Set
   `status: in-review` if every criterion passes; leave `in-progress`
   otherwise.
7. Tell the user the session is closed and that the next step is either
   another `/harness <item#>` session or `/harness accept <item#>`. Recommend
   `/clear` before the next item.

The stop hook will block the end of any turn while `check.sh` fails. Fix the
check, do not work around it.
