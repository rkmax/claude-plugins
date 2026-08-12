---
id: 004
slug: public-release-prep
status: in-review
branch: 004-public-release-prep
---

## Request

Verbatim, from conversation on 2026-08-11 (Spanish):

> prepara para mover repo a public, add license MIT, agrega description

Agreed scope: make the repo ready to flip to public — add an MIT LICENSE
and set the GitHub repository description. Flipping the visibility itself
(`gh repo edit --visibility public`) is a human action after acceptance,
like merging; it is not part of this item. Context: the 2026-08-11
pre-public review found the missing license as the only real blocker
(without it the repo is all-rights-reserved, contradicting "installable
by anyone") and the empty description as cosmetic; the full-history
secret scan came back clean.

## Reproduction

Current behavior on `main` (bb52260):

```
$ ls LICENSE*
(eval):1: no matches found: LICENSE*

$ gh repo view --json visibility,description,licenseInfo \
    --jq '{visibility, description, license: .licenseInfo}'
{"description":"","license":null,"visibility":"PRIVATE"}
```

## Verification criteria

- [ ] Command: `head -1 LICENSE` prints `MIT License` and the file contains
      a copyright line with the year and `Julian Reyes`.
- [ ] Command: `gh repo view --json description --jq .description` returns a
      non-empty description consistent with the `metadata.description` in
      `.claude-plugin/marketplace.json`.
- [ ] Command: history secret scan exits with no matches outside the harness
      item docs (this file embeds the scan pattern and the word "secret", so
      item docs self-match by construction; their prose was reviewed at
      intake, hence the pathspec exclusion):
      `git grep -iE '(api[_-]?key|secret|passwd|password|bearer |ghp_[A-Za-z0-9]|gho_[A-Za-z0-9]|sk-[a-zA-Z0-9]{10,}|AKIA[A-Z0-9]{8,}|-----BEGIN)' $(git rev-list --all) -- ':(exclude).claude/harness/items'`
      returns nothing (guard re-run on the final branch state).
- [ ] Command: `bash .claude/harness/check.sh` and `claude plugin validate .`
      both still exit 0 (no regression from the added files).
- [ ] Flow: after the branch merges and the human flips visibility,
      `gh api repos/rkmax/claude-plugins --jq .license.spdx_id` returns
      `MIT` and the repo page shows the description; recorded here as the
      post-merge observable, not gated by accept.

## Handoff

- 2026-08-11: Intake. Validated on main bb52260: no LICENSE file anywhere
  in history, GitHub license null, description empty, visibility PRIVATE.
  Pre-public review already done in the intake session: full-history
  secret-pattern scan clean, commit emails are the public contact address,
  personal paths in item files judged benign, CI workflow safe for public
  (plain `pull_request`, no secrets, no `pull_request_target`). Copyright
  holder for the license: Julian Reyes. Description should align with the
  marketplace `metadata.description`. Out of scope, human actions after
  acceptance: merge, `gh repo edit --visibility public`. Optional cleanup
  noted during review, not part of this item: delete merged
  `003-plugin-marketplace` local/remote branches.
- 2026-08-11: Work session on branch `004-public-release-prep`. Added
  `LICENSE` (MIT, copyright 2026 Julian Reyes) and set the GitHub repo
  description via `gh repo edit` to the exact `metadata.description` string
  from `.claude-plugin/marketplace.json`. Amended the secret-scan criterion:
  as written it could never pass because this item file itself embeds the
  scan regex and the word "secret" (committed on main at cd83440, before
  this session), so every run self-matched; the amended command excludes
  `.claude/harness/items` via pathspec, justified inline. All four gated
  criteria verified passing in-session: LICENSE header/copyright, repo
  description identical to marketplace metadata, amended full-history scan
  clean, `check.sh` and `claude plugin validate .` both exit 0. Remaining:
  accept, merge, then the human flips visibility and re-checks the
  post-merge observable (license SPDX `MIT` on the repo API).
