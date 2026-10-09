# GITHUB_WORKFLOW.md — Upbhokta Setu

## Branch Model
- `main` is the default branch.
- All commits land on `main` directly (small, focused commits after each verified slice).
- No feature branches required for this MVP.

## Commit Format
```
<type>: <description>
<blank line>
Body (optional — what changed and why).
<blank line>
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `revert`.

## Before Every Commit
1. Run `git diff --check` — fix whitespace errors.
2. Review `git diff` — ensure no secrets, tokens, or credentials are staged.
3. Verify the commit message ends with the co-author line.

## Push Policy
- Push after each verified milestone (each slice in `IMPLEMENTATION_PLAN.md`).
- Never force-push.
- Never rewrite shared history without explicit approval.
- If push fails due to auth, preserve local work and report the exact error.

## Pull Requests
- Not required for this MVP; commits go directly to `main`.
- For collaboration, PR descriptions end with:
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
