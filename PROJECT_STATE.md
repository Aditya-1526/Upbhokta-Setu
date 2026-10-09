# PROJECT_STATE.md — Upbhokta Setu (उपभोक्ता सेतु)

> Factual audit snapshot. Updated after each verified milestone.

## 1. Repository Identity
- **Name**: Upbhokta Setu (उपभोक्ता सेतु) — "Your consumer grievance, connected."
- **Purpose**: AI-assisted Indian consumer grievance preparation and case-management application.
- **Remote**: `https://github.com/Aditya-1526/Upbhokta-Setu.git`
- **Branch**: `main` (tracking `origin/main`)
- **Tagline per CLAUDE.md.txt**: "Your consumer grievance, connected."

## 2. Working Tree State
- Tracked files: `.gitignore`, `CLAUDE.md`, `TASKS.md`
- Untracked files: `CLAUDE.md.txt`, `idea.md` (preserved, not yet committed)
- Working tree: dirty (untracked items only — no modifications to tracked files)
- Last commit: `aa16f34` — `chore: bootstrap project with .gitignore, CLAUDE.md, and TASKS.md`
- `git diff --check`: clean (no whitespace errors)

## 3. Required Documentation Files
The audit asked me to read these — most **do not exist** in the repository:

| File | Status |
|------|--------|
| `PROJECT_SPEC.md` | ❌ Missing |
| `IMPLEMENTATION_PLAN.md` | ❌ Missing |
| `ARCHITECTURE.md` | ❌ Missing |
| `LOCALIZATION.md` | ❌ Missing |
| `GITHUB_WORKFLOW.md` | ❌ Missing |
| `TESTING.md` | ❌ Missing |
| `PROJECT_STATE.md` | ❌ Missing (this file is being created now) |
| `README.md` | ❌ Missing |
| `CLAUDE.md` | ✅ Present (high-level stub) |
| `CLAUDE.md.txt` | ✅ Present (full project instructions — **note**: real file is `.txt`, not `.md`) |

**Critical finding**: A near-complete project specification exists at `CLAUDE.md.txt` in the working directory but is not tracked in Git and not present at the repo's published `.md` location. This is the most important document in the repo. It must be adopted as the source of truth going forward and committed.

## 4. Repository Structure
- `D:\NLH2026` is a **brand-new repository** with **no application code**.
- No mobile app, no Expo config, no `package.json`, no `app.json`.
- No FastAPI entry point, no `pyproject.toml`, no `requirements.txt`.
- No Supabase config, no migrations, no database schema.
- No localization resources (English/Hindi) implemented.
- No tests, no scripts beyond what the bootstrap committed.
- Only files: `.gitignore`, `CLAUDE.md`, `TASKS.md`, plus untracked `CLAUDE.md.txt` and `idea.md`.

## 5. Tooling Environment
Verified via `which`/`--version`:
- **Node.js**: `v24.14.0` ✅
- **npm**: `11.9.0` ✅
- **Python**: `3.14.7` ✅
- **pip**: `26.2.1` ✅
- **gh CLI**: ❌ not installed
- **expo CLI**: ❌ not installed (will use `npx expo`)
- **docker**: ❌ not installed
- **redis-cli**: ❌ not installed
- **supabase CLI**: ❌ not installed
- **uvicorn / fastapi**: ❌ not installed (will install via pip when backend work begins)

## 6. Stack Mandate (from CLAUDE.md.txt)
- **Mobile**: React Native, Expo, TypeScript, Expo Router
- **Forms**: React Hook Form + Zod
- **API state**: TanStack Query
- **Backend**: Python, FastAPI, Pydantic, HTTPX, pytest
- **Data**: Supabase PostgreSQL + private Supabase Storage
- **AI**: Gemini API, called only from FastAPI
- **Optional**: Redis, Docker Compose

## 7. Bilingual Mandate (from CLAUDE.md.txt)
- English / हिन्दी (Hindi)
- User-switchable from app UI, immediate UI update, persisted locally
- English is first-launch default
- All user-facing strings must come from i18n resources — no scattered hardcoded text
- AI responses: pass `response_language` explicitly; validate generated text is in the requested language
- Official titles, statute names, organization names, citations, URLs may remain in original form

## 8. Implementation Status
- **Mobile app**: 0% — not started
- **Backend API**: 0% — not started
- **Database / migrations**: 0% — not configured
- **Localization system**: 0% — not implemented
- **AI integration**: 0% — not started
- **Tests**: 0% — not started
- **Documentation**: ~5% — only `CLAUDE.md` (stub) committed

## 9. Architecture / Dependency Risks
- **Python 3.14 is brand new.** Some packages (FastAPI, Pydantic, HTTPX) may not have prebuilt wheels yet for 3.14; if wheels are missing, build from source may be needed. Recommend checking compatibility on first `pip install`.
- **No Supabase project provisioned** — backend work will need credentials. Local-only `supabase start` not available (no Supabase CLI installed).
- **No `gh` CLI** — all remote/GitHub work must be done via `git` + HTTPS push. Auth is currently working (the bootstrap push succeeded).
- **No Docker / Redis** — defer to optional path; backend will run directly via `uvicorn`.
- **Git auth uses a placeholder email** (`noreply@anthropic.com`) and a local-only identity — this works for pushes but is not a real identity. Acceptable for hackathon.

## 10. Can Things Start Right Now?
| Component | Can start? | Why / Why not |
|-----------|-----------|---------------|
| Mobile (Expo) | ✅ Yes | Node 24 + npm present; `npx create-expo-app` will work. |
| Backend (FastAPI) | ✅ Yes (with caveat) | Python 3.14 present; FastAPI can be installed. Verify wheel availability on first install. |
| Database | ⚠️ Partial | Can write migrations + a local SQLite/Postgres target; real Supabase requires credentials. |
| AI integration | ❌ No | Requires `GEMINI_API_KEY` from the user before Gemini calls. |
| i18n | ✅ Yes | No external dependency — pure RN + state. |

## 11. GitHub Configuration
- Remote: configured and authenticated (push of commit `aa16f34` succeeded in Phase 00).
- Branch: `main`, tracking `origin/main`.
- Commit attribution rule: end commit messages with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## 12. Checks Actually Run (Phase 0 audit)
- ✅ `ls -la` — directory listing
- ✅ `git status --short` — tracked/untracked review
- ✅ `git branch -a`, `git remote -v`, `git log --oneline` — repo metadata
- ✅ `git diff --check` — whitespace audit
- ✅ `node --version`, `npm --version`, `python --version`, `pip --version` — toolchain
- ✅ `which` for `expo`, `docker`, `redis-cli`, `supabase`, `uvicorn`, `fastapi`, `gh`
- ✅ `WebFetch` against GitHub — verified repo contents match local
- ✅ Read all existing files: `CLAUDE.md`, `CLAUDE.md.txt`, `TASKS.md`, `.gitignore`, `.git/config`
- ❌ Did NOT run `npm install`, `pip install`, `npm run dev`, `uvicorn`, migrations, tests, or push anything new — per audit-only scope.

## 13. Known Blockers / Open Decisions
- **`CLAUDE.md.txt` must be promoted to `CLAUDE.md` or formally renamed.** Currently two instruction files coexist. The full spec is in the `.txt`; the `.md` is a stub. Recommend adopting the `.txt` content as the canonical `CLAUDE.md` in Phase 0.5.
- **`PROJECT_SPEC.md` / `IMPLEMENTATION_PLAN.md` / etc. do not exist** — they will need to be authored from the spec in `CLAUDE.md.txt`, or that file should be split into the required documents. This is a Phase 0.5/1 task.
- **No Supabase / Gemini credentials yet** — must be supplied by the user.
- **No app concept in `idea.md`** — the file is empty.

## 14. Next Three Recommended Tasks
1. **Adopt the canonical project spec**: rename `CLAUDE.md.txt` → `CLAUDE.md` (overwriting the stub) and author `PROJECT_SPEC.md`, `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `LOCALIZATION.md`, `GITHUB_WORKFLOW.md`, `TESTING.md`, and `README.md` from its content. Commit + push.
2. **Scaffold the Expo + TypeScript mobile app** (`apps/mobile/`) with Expo Router, an English/Hindi i18n provider, and a working splash + language switcher as the first vertical slice. This validates the bilingual mandate early.
3. **Scaffold the FastAPI backend** (`apps/api/`) with a health endpoint, Pydantic settings, dependency-injected config, and a tests folder. Validate Python 3.14 wheel availability for FastAPI / Pydantic / HTTPX on first install. Commit + push.
