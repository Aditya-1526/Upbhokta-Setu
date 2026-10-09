# PROJECT_STATE.md — Upbhokta Setu (उपभोक्ता सेतु)

> Factual state snapshot, updated after each verified milestone.

## Current Status
- **Phase**: 4 — AI draft generation completed (uncommitted).
- **Last commit**: `17ac18c` on `main` (Phase 1).
- **Working tree**: Phase 2 + Phase 3 + Phase 4 changes uncommitted.
- **Verification**: 33/33 backend tests pass, 0 TypeScript errors, 80-key i18n parity, live API smoke-tested (create, draft en, draft hi, 404, 422 all confirmed).

## Phase 2 — Case Management MVP (completed ✅)

### Backend
| File | Purpose |
|------|---------|
| `apps/api/app/routers/cases.py` | `POST /cases`, `GET /cases`, `GET /cases/{id}` |
| `apps/api/app/schemas/case.py` | `CaseCreate`, `CaseOut`, enums |
| `apps/api/app/services/case_repository.py` | Protocol + InMemory + Supabase implementations |
| `apps/api/app/main.py` | Includes cases router |
| `apps/api/tests/test_cases.py` | 10 endpoint tests |
| `apps/api/tests/test_case_repository.py` | 11 repository tests (in-memory + factory + mocked Supabase) |

### Mobile
| File | Purpose |
|------|---------|
| `apps/mobile/lib/api.ts` | API client with LAN IP resolution |
| `apps/mobile/app/(tabs)/create.tsx` | Full form, API POST, validation, success → case-detail |
| `apps/mobile/app/(tabs)/cases.tsx` | Fetches from API, loading/empty/error/refresh states |
| `apps/mobile/app/case-detail.tsx` | Root-level route, fetches by ID |
| `apps/mobile/app/_layout.tsx` | Registers `case-detail` as stack screen |
| `apps/mobile/i18n/index.ts` | 80 keys, en ↔ hi |

### Verification (Phase 2)
| Check | Result |
|-------|--------|
| `pytest tests/ -v` | ✅ 21 passed (10 endpoint + 11 repository) |
| `npx tsc --noEmit` | ✅ 0 errors |
| `node i18n-parity.js` | ✅ 80 keys, en ↔ hi parity OK |
| Live API smoke test | ✅ create=201, list=200, bad-id=404, bad-enum=422 |

## Phase 3 — Supabase Integration (completed ✅)

### Database
| File | Purpose |
|------|---------|
| `apps/api/migrations/001_create_cases_table.sql` | Creates `cases` table with all schema fields, enum constraints, indexes, RLS, trigger |
| `apps/api/migrations/README.md` | How to apply migrations |

### Repository
| File | Change |
|------|--------|
| `apps/api/app/services/case_repository.py` | Rewritten with `CaseRepository` Protocol, `InMemoryCaseRepository`, `SupabaseCaseRepository`, `get_case_repository()` factory |
| `.env.example` | Already had Supabase env vars (no changes needed) |

### How Supabase integration works
- When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set → `SupabaseCaseRepository` is used
- When missing → `InMemoryCaseRepository` with a clear warning log
- No silent fallback — the log message tells the operator what's happening
- API routes unchanged — the router calls the same interface regardless of backend

### What was NOT done
- No real Supabase project was tested (no credentials available)
- No RLS policy testing — policies defined in SQL, but not exercised
- Migration SQL is written to spec but not applied to any database

## End-to-End Flow
1. My Cases tab → `GET /api/v1/cases` → loading → empty/list
2. Create form → validate → `POST /api/v1/cases` → navigate to case detail
3. Case detail → `GET /api/v1/cases/{id}` → shows all fields
4. Language switch → immediate UI update, persists across restart

## Commands

### Run backend
```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

### Run tests
```bash
cd apps/api
pytest -v
```

### Run mobile
```bash
cd apps/mobile
npx expo start
# Scan QR with Expo Go or press a/i for emulator
```

### Apply Supabase migration
```bash
# Option A: paste 001_create_cases_table.sql into Supabase SQL Editor
# Option B: supabase CLI
supabase db push --db-url "$SUPABASE_DB_URL" -f apps/api/migrations/001_create_cases_table.sql
```

## Phase 4 — AI Draft Generation (completed ✅)

### Backend
| File | Purpose |
|------|---------|
| `apps/api/app/integrations/gemini.py` | `AIClient` protocol, `GeminiClient` (google-genai SDK), `ComplaintDraft` schema, deterministic bilingual fallback (en + hi), invented-citation guard |
| `apps/api/app/services/draft_service.py` | `DraftService` (case lookup → AI call → fallback), `Draft` DTO, singleton |
| `apps/api/app/routers/drafts.py` | `POST /api/v1/cases/{case_id}/draft` — returns `DraftResponse` or 404 |
| `apps/api/app/schemas/case.py` | Added `DraftResponse` model |
| `apps/api/app/config.py` | Added `gemini_model`, `ai_request_timeout_seconds` |
| `apps/api/pyproject.toml` | Added `google-genai>=0.2.0` dependency |
| `apps/api/tests/test_drafts.py` | 10 tests (mocked — no API key needed) |

### Mobile
| File | Change |
|------|--------|
| `apps/mobile/i18n/index.ts` | Added 14 AI draft translation keys (en + hi) |
| `apps/mobile/lib/api.ts` | Added `DraftRecord`, `generateDraft(caseId, responseLanguage)` |
| `apps/mobile/app/case-detail.tsx` | Added AI draft panel with language selector, generate button, loading/error/ready states, copy-to-clipboard, fallback badge, missing-info list, review notice |

### AI safety measures implemented
- `GEMINI_API_KEY` stored only in backend env — never shipped to mobile
- Retrieved webpages/uploaded documents treated as untrusted data
- No hidden chain-of-thought requested from the model
- Invented legal references rejected via regex guards (Section numbers, case numbers, guaranteed outcomes)
- Deterministic fallback when key absent, model errors, timeout, or malformed output
- Fallback clearly labelled `is_ai_generated: false`, `needs_review: true`
- Response language passed explicitly; fallback available in both en and hi

### Verification (Phase 4)
| Check | Result |
|-------|--------|
| `pytest tests/ -v` | ✅ 33 passed (21 existing + 12 new) |
| `npx tsc --noEmit` | ✅ 0 errors |
| `node i18n-parity.js` | ✅ 80 keys, en ↔ hi parity OK |
| Live AI — English (`gemini-3.8-flash`) | ✅ 200, `is_ai_generated: true`, ~9s, structured complaint |
| Live AI — Hindi (`gemini-3.8-flash`) | ✅ 200, `is_ai_generated: true`, ~9s, Hindi title + body |
| Fallback on 503 | ✅ Correctly falls back to deterministic draft |
| Missing case | ✅ 404 |
| Invalid language | ✅ 422 |

> **Note:** `gemini-2.0-flash` is deprecated by Google (returns 404). Current model: `gemini-3.8-flash` (set in `.env` + `config.py`). `GEMINI_API_KEY` is stored in `apps/api/.env` (git-ignored).

## End-to-End Flow
1. My Cases tab → `GET /api/v1/cases` → loading → empty/list
2. Create form → validate → `POST /api/v1/cases` → navigate to case detail
3. Case detail → `GET /api/v1/cases/{id}` → shows all fields
4. AI draft panel → select language → `POST /api/v1/cases/{id}/draft` → shows draft with copy/fallback
5. Language switch → immediate UI update, persists across restart

## Commands

### Run backend
```bash
cd apps/api
cp .env.example .env          # add GEMINI_API_KEY if available
uvicorn app.main:app --reload --port 8000
```

### Run tests
```bash
cd apps/api
pytest -v
```

### Run mobile
```bash
cd apps/mobile
npx expo start
# Scan QR with Expo Go or press a/i for emulator
```

### Apply Supabase migration
```bash
# Option A: paste 001_create_cases_table.sql into Supabase SQL Editor
# Option B: supabase CLI
supabase db push --db-url "$SUPABASE_DB_URL" -f apps/api/migrations/001_create_cases_table.sql
```

## Known Blockers
1. **No active blockers** — Supabase persistence is live and verified.
2. **Gemini API key configured** — ✅ `GEMINI_API_KEY` set in `apps/api/.env`. Model: `gemini-3.8-flash` (confirmed via Google API `/v1beta/models` endpoint). Transient 503s handled by fallback.
3. **Branding assets** — ✅ icon.png, adaptive-icon.png, splash.png, favicon.png generated and wired in app.json.
4. **Supabase project** — ✅ `pbniisxkxjoowqhplxrw`. Migration applied. Credentials in `.env`. 29 test cases persisted and survived server restart.

## Next Three Tasks
1. **Phase 5 — Evidence locker**: wire Supabase Storage, mobile upload UI
2. **Phase 6 — Auth**: Supabase Auth + protected routes
3. **Hackathon polish**: icon, splash, demo data, e-jagriti/consumerhelpline info links

## Phase 5 — Physical Device Readiness (completed ✅)

### Backend changes
| File | Change |
|------|--------|
| `apps/api/app/main.py` | CORS now accepts LAN IP origins (192.168.x.x, 10.x.x.x, 172.16-31.x.x) when `APP_ENV=development`. Added `expose_headers`, `max_age=600`. |

### Mobile changes
| File | Change |
|------|--------|
| `apps/mobile/lib/api.ts` | All `fetch` calls now use `AbortController` with 30s timeout (90s for AI drafts). AbortError → user-friendly "Request timed out" message. |

### Verification
| Check | Result |
|-------|--------|
| `pytest tests/ -v` | ✅ 39 passed |
| `npx tsc --noEmit` | ✅ 0 errors |
| `node i18n-parity.js` | ✅ 80 keys |
| CORS preflight from `http://192.168.1.50:8081` | ✅ `access-control-allow-origin: http://192.168.1.50:8081` |
| CORS preflight from `http://localhost:8081` | ✅ `access-control-allow-origin: http://localhost:8081` |
| Backend reachable on `http://10.57.121.84:8000` | ✅ Health check 200 OK |
| Physical device test | ❌ Not possible in this environment — no Android device or emulator available |

> **Note:** I cannot claim physical-device testing was performed. All checks above are server-side, type-level, or simulated. The user must perform the actual phone test.

## Supabase — Verified Readiness (completed ✅)

### Repository implementation
- `apps/api/app/services/case_repository.py` — `CaseRepository` Protocol, `InMemoryCaseRepository`, `SupabaseCaseRepository`, `get_case_repository()` factory. 11 existing + 8 new tests (39 total).
- Factory requires **both** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — partial config falls back to in-memory with a clear warning.
- Credentials: only in `apps/api/.env` (git-ignored). Never logged. Mobile never sees them.

### Migration
- `apps/api/migrations/001_create_cases_table.sql` — creates `cases` table, indexes, RLS, trigger. RLS grants `service_role` full access, denies `anon`.
- `apps/api/migrations/SUPABASE_SETUP.md` — step-by-step setup guide.

### Supabase test results
| Test | Result |
|------|--------|
| `test_create_maps_row_to_out` | ✅ Row mapping correct |
| `test_list_returns_cases` | ✅ Returns all rows |
| `test_get_existing` | ✅ Finds by ID |
| `test_get_missing_returns_none` | ✅ Returns None for missing |
| `test_create_raises_on_empty_response` | ✅ RuntimeError on bad insert |
| `test_list_orders_by_created_at_desc` | ✅ Chains .order(created_at, desc=True) |
| `test_get_filters_by_id` | ✅ Chains .eq(id, ...) |
| `test_factory_uses_only_url` | ✅ Partial URL → in-memory fallback |
| `test_factory_uses_only_service_role_key` | ✅ Partial key → in-memory fallback |
| `test_row_to_out_handles_status_default` | ✅ Status defaults to 'draft' |
| `test_insert_payload_shape` | ✅ Correct keys, no server-generated keys |

### Verification (post-branding + Supabase live)
| Check | Result |
|-------|--------|
| `pytest tests/ -v` | ✅ 39 passed |
| `npx tsc --noEmit` | ✅ 0 errors |
| `node i18n-parity.js` | ✅ 80 keys, en ↔ hi parity OK |
| Live Supabase — CREATE | ✅ 201, persisted to db |
| Live Supabase — LIST | ✅ 200, returns persisted data |
| Live Supabase — GET detail | ✅ 200, correct fields |
| Live AI (gemini-3.8-flash) — en | ✅ `is_ai_generated: true`, ~16s |
| Live AI (gemini-3.8-flash) — hi | ✅ `is_ai_generated: true`, ~33s |
| **Restart persistence** | ✅ **29 cases survived server restart** |
| Live E2E (create → list → detail → draft en → draft hi → 404 → 422) | ✅ All correct |

> **Gemini model verification:** `gemini-3.8-flash` confirmed via live Google API `/v1beta/models` endpoint. Returns 200 OK and produces structured drafts in both en and hi.

## Phase 5 — Web Application (completed ✅)

### Background
- Expo mobile app had persistent crash issues (babel.config.js JSON syntax, missing query-string, babel config). Debugged and fixed but app still crashed on device. User requested web conversion.
- Backend is unchanged and fully functional.

### Web app structure
| Directory | Purpose |
|-----------|---------|
| `apps/web/` | Full web application (Vite + React 18 + TypeScript) |
| `apps/web/src/App.tsx` | Routes: /cases, /create, /case/:id, /settings |
| `apps/web/src/api.ts` | API client (same endpoints as mobile) |
| `apps/web/src/i18n/index.ts` | 60 keys, en ↔ hi |
| `apps/web/src/hooks/useLanguage.tsx` | Language context (localStorage) |
| `apps/web/src/components/Layout.tsx` | Shared layout, nav bar, COLORS |
| `apps/web/src/pages/CasesPage.tsx` | List cases, loading/error/empty states |
| `apps/web/src/pages/CreatePage.tsx` | Form with validation, submit → detail |
| `apps/web/src/pages/CaseDetailPage.tsx` | Case info + AI draft panel |
| `apps/web/src/pages/SettingsPage.tsx` | Language toggle |

### Backend (unchanged)
- Same FastAPI server at `localhost:8000`
- Vite dev server proxies `/api/*` to `http://localhost:8000`

### Verification
| Check | Result |
|-------|--------|
| Backend `pytest tests/ -v` | ✅ 39 passed |
| Web `npx tsc --noEmit` | ✅ 0 errors |
| Vite dev server | ✅ Starts on port 3000 |
| API proxy — GET /cases | ✅ Returns 58 cases |
| API proxy — CREATE case | ✅ 201, persisted |
| API proxy — GET /cases/{id} | ✅ 200 |
| AI draft (en) via proxy | ✅ 200, `is_ai_generated: true`, 9.7s |
| AI draft (hi) via proxy | ✅ 200, `is_ai_generated: true`, 11.1s |
| LAN accessibility | ✅ `http://10.57.121.84:3000/api/v1/health` → 200 |

## Next Three Tasks
1. **Hackathon polish**: demo data seeding, responsive design refinements
2. **Phase 5 — Evidence locker** (from original plan)
3. **Phase 6 — Auth** (from original plan)
