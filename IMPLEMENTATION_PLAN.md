# IMPLEMENTATION_PLAN.md — Upbhokta Setu

> Living plan, ordered by vertical slices. Each slice must be **small, coherent, verified, and bilingual** before moving on.
> Until the canonical spec is committed (see `PROJECT_STATE.md` §14), this plan is provisional.

## Provisional Plan
Because the canonical `PROJECT_SPEC.md` does not yet exist, this plan is derived from `CLAUDE.md.txt`. Once `PROJECT_SPEC.md` is authored, this file will be reconciled with it.

### Slice 0 — Repository baseline (current)
- [x] Phase 00: git init, remote, bootstrap commit pushed.
- [ ] Phase 0 audit: this document + `PROJECT_STATE.md` exist.
- [ ] Promote `CLAUDE.md.txt` → `CLAUDE.md`; author the missing spec files (`PROJECT_SPEC.md`, `ARCHITECTURE.md`, `LOCALIZATION.md`, `GITHUB_WORKFLOW.md`, `TESTING.md`, `README.md`).

### Slice 1 — Mobile foundation (Expo + bilingual UI)
- [ ] Scaffold `apps/mobile/` with `create-expo-app`, TypeScript, Expo Router.
- [ ] Add a language provider (English / हिन्दी) with persistent storage (`AsyncStorage` or `expo-secure-store`).
- [ ] Build minimal UI: splash, language switcher, navigation skeleton, empty-state copy in both languages.
- [ ] Verify in Expo Go: language switch updates UI immediately; selection persists across restart.

### Slice 2 — Backend foundation (FastAPI)
- [ ] Scaffold `apps/api/` with FastAPI, Pydantic settings, HTTPX, pytest.
- [ ] `/health` endpoint with version + uptime.
- [ ] `.env.example` (no real secrets), structured logging, error envelope.
- [ ] `pytest` smoke test for the health endpoint.

### Slice 3 — Data layer (Supabase)
- [ ] Define schema migrations (cases, grievances, evidence metadata, AI runs, citations).
- [ ] Repository pattern in backend; RLS-aware access.
- [ ] Local-only fallback for development when Supabase creds are absent.

### Slice 4 — AI integration (Gemini, server-side only)
- [ ] `GeminiClient` behind a typed interface; explicit `response_language` param.
- [ ] Validation that generated explanation is in the requested language; retry policy.
- [ ] Quota / timeout / deterministic fallback path.
- [ ] Citation handling; never invent statute names or deadlines.

### Slice 5 — Grievance preparation flow
- [ ] Complaint intake form (React Hook Form + Zod) with Hindi validation copy.
- [ ] AI-assisted draft generation in the selected language.
- [ ] Review/edit/export flow with explicit "AI-generated" labeling.

### Slice 6 — Case management
- [ ] Case list, detail, status timeline, evidence index.
- [ ] Document upload to private Supabase Storage with size/type validation.

### Slice 7 — Sources & grounding
- [ ] Curated reference dataset for National Consumer Helpline / e-Jagriti / DoCA acts.
- [ ] When Gemini Search Grounding or URL Context is enabled, surface source links + retrieval date.
- [ ] Honest fallback when grounding is unavailable.

### Slice 8 — Hardening
- [ ] Auth (Supabase) + server-side ownership checks.
- [ ] Rate limiting + quota handling.
- [ ] Accessibility + Hindi typography QA.
- [ ] End-to-end smoke test on a real device via Expo Go + deployed backend.

## Deviation Log
- 2026-01 (Phase 0 audit): The repo was missing the entire spec document set. A complete `CLAUDE.md.txt` was discovered in the working tree and is being adopted as the source of truth. The plan above will be replaced/expanded once `PROJECT_SPEC.md` is authored.
