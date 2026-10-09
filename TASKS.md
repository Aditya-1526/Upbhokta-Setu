# TASKS.md

## Current Milestone
**Phase 1 — Working foundation complete and verified.**

Mobile and backend are runnable. i18n parity passes. Backend smoke tests pass. Code is committed (`17ac18c`) and pushed.

## Completed
- [x] Phase 0 audit
- [x] All spec docs authored
- [x] Mobile (Expo + bilingual UI)
- [x] Backend (FastAPI + /health + tests)

## Known Blockers
- Awaiting Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Awaiting `GEMINI_API_KEY`
- Mobile not visually verified on a real device (no Expo Go scan available in env)

## Next Actions
1. Wire Supabase repository in `apps/api/app/services/` (Slice 3)
2. Add React Hook Form + Zod to the Create Case screen with bilingual validation (Slice 1 ext.)
3. Wire Gemini client behind a typed interface (Slice 4)
