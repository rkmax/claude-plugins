# Mode: init (once per repository)

Wire the fast check, the full check, and the stop hook into the current
repository. This mode creates no product code.

1. Identify the project's real commands by reading the repo (package scripts,
   Makefile, CI config): lint, typecheck, the way to run only tests affected
   by a diff, and the complete suite that defines "green" for the repo. Do
   not guess; read the config files.
2. Confirm the detected commands with the user before writing anything. This
   is the only interaction point of the skill.
3. Write `.claude/harness/check.sh` in the project: lint + typecheck + tests
   affected by the current diff. It must exit 0 on pass, non-zero on fail, and
   finish in seconds to a few minutes. Never include the full suite; that
   belongs to `full-check.sh`.
4. Write `.claude/harness/full-check.sh`: the complete gate that defines
   "green" for the repo — the full suite plus whatever else the repo's CI
   runs, mirrored locally. If the repo has no suite beyond the fast check,
   `full-check.sh` may just exec `check.sh`, but the file must exist so
   accept has a defined gate.
5. Copy `templates/stop-hook.sh` from this skill into the project as
   `.claude/harness/stop-hook.sh` and make all three scripts executable.
6. Register the stop hook in the project's `.claude/settings.json` (merge,
   do not overwrite existing hooks):

   ```json
   {
     "hooks": {
       "Stop": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "$CLAUDE_PROJECT_DIR/.claude/harness/stop-hook.sh"
             }
           ]
         }
       ]
     }
   }
   ```

7. Verify the harness paths are not gitignored: run `git check-ignore` on
   `.claude/harness/check.sh`, `.claude/settings.json`, and `CLAUDE.md`. If a
   global ignore rule excludes them, re-include them with negation patterns
   in the repo's `.gitignore` (keep `.claude/settings.local.json` ignored).
8. Ensure the project `CLAUDE.md` lists both check commands and only rules
   that cannot be deduced from the code. If it already exists, trim instead
   of growing it.
9. Run both check scripts once and show the results as evidence.
10. Commit the harness files with a conventional commit message
    (`chore: add harness check and stop hook`).
