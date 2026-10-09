# PROJECT_STATE.md — Upbhokta Setu (उपभोक्ता सेतु)

> Factual state snapshot, updated after each verified milestone.

## Current Status
- **Phase**: 1 — Working foundation complete and verified.
- **Last commit**: `17ac18c` on `main`, pushed to GitHub.
- **Working tree**: clean (untracked: `idea.md`).
- **Both mobile and backend are runnable** (verified start + tests).

## Repository Structure
```
NLH2026/
├── apps/
│   ├── mobile/                  # Expo + TypeScript + Expo Router
│   │   ├── app/                 # routes (cases, create, evidence, settings, _layout)
│   │   ├── components/          # Screen, EmptyState, LanguageSwitcher
│   │   ├── constants/Colors.ts
│   │   ├── hooks/useLanguage.tsx
│   │   ├── i18n/index.ts        # 47 keys, en + hi
│   │   ├── app.json
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── babel.config.js
│   │   ├── i18n-parity.js       # parity check
│   │   └── .gitignore
│   │
│   └── api/                     # FastAPI + pytest
│       ├── app/
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── routers/         # (empty, ready for cases/grievances)
│       │   ├── schemas/
│       │   ├── services/
│       │   └── integrations/
│       ├── tests/test_health.py
│       ├── pyproject.toml
│       └── .env.example
│
├── docs/                        # all spec files at repo root
│   ├── CLAUDE.md
│   ├── PROJECT_SPEC.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── LOCALIZATION.md
│   ├── GITHUB_WORKFLOW.md
│   ├── TESTING.md
│   └── README.md
└── .gitignore
```

## Tech Stack
- **Mobile**: React Native 0.76 + Expo 52 + Expo Router 4 + TypeScript 5
- **Forms/state**: prepared to add React Hook Form + Zod + TanStack Query (next slice)
- **Backend**: Python 3.14 + FastAPI 0.143 + Pydantic 2.14 + Pydantic Settings + HTTPX + Supabase Python client
- **Data**: Supabase (client wired, awaiting credentials)
- **AI**: Gemini (not yet wired — needs `GEMINI_API_KEY`)
- **Tests**: pytest 9.1 (backend), Node parity script (mobile i18n)

## Environment Variables
Backend (`apps/api/.env` — copy from `.env.example`):
- `APP_ENV`, `APP_NAME`, `APP_VERSION`, `API_PREFIX`, `PORT`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `CORS_ORIGINS` (comma-separated)
- `LOG_LEVEL`

Mobile (`apps/mobile/.env`):
- `EXPO_PUBLIC_API_URL` (default `http://localhost:8000`)

## Commands

### Mobile
```bash
cd apps/mobile
npm install
npx expo start                  # start dev server
npx tsc --noEmit                # type-check
node i18n-parity.js             # en ↔ hi parity check
```

### Backend
```bash
cd apps/api
pip install fastapi 'uvicorn[standard]' pydantic pydantic-settings httpx supabase python-dotenv pytest pytest-asyncio
pytest tests/ -v                # run tests
uvicorn app.main:app --reload   # start dev server
```

## What Was Already Present (Phase 0 audit)
- Empty repo (`.gitignore`, `CLAUDE.md` stub, `TASKS.md`, `idea.md`)
- `CLAUDE.md.txt` containing the full project spec — promoted to `CLAUDE.md`

## What Was Implemented (Phase 1)
| Area | Status |
|------|--------|
| Expo + Expo Router scaffold | ✅ Implemented |
| Bilingual i18n provider (en + hi, 47 keys) | ✅ Implemented |
| Language switcher with persistence | ✅ Implemented (expo-secure-store) |
| Tabs (cases, create, evidence, settings) | ✅ Implemented |
| Empty state, language switcher, screen components | ✅ Implemented |
| i18n parity check script | ✅ Implemented (passes) |
| FastAPI app with `/health` and `/api/v1/health` | ✅ Implemented |
| Pydantic Settings env config | ✅ Implemented |
| CORS for local dev | ✅ Implemented |
| Structured error envelope + logging | ✅ Implemented |
| pytest smoke test (2 tests) | ✅ Implemented (passing) |
| All 7 spec files authored | ✅ Implemented |
| `.env.example` for both apps | ✅ Implemented (placeholders only) |

## Checks Run & Results
- ✅ `pytest tests/test_health.py -v` → **2 passed** (`test_health`, `test_api_health`)
- ✅ `python -c "from app.main import app; print(app.title)"` → import succeeds
- ✅ `uvicorn app.main:app` start → server boots, returns `{"status":"ok",...}` from `/health` and `/api/v1/health`
- ✅ `npx tsc --noEmit` → **0 errors** (TypeScript clean)
- ✅ `node i18n-parity.js` → **47 keys, en ↔ hi parity OK**
- ✅ `pip install ...` → all backend deps install on Python 3.14 (FastAPI, Pydantic, HTTPX, Supabase client)
- ✅ `npm install` → 918 mobile packages installed
- ✅ `git diff --check` → clean (whitespace OK)
- ❌ Did NOT run on a real device/Expo Go (not available in this environment)
- ❌ Did NOT exercise Supabase or Gemini (no credentials)

## Known Blockers
1. **No Supabase project** — backend cannot make real Supabase calls yet.
2. **No `GEMINI_API_KEY`** — AI integration blocked until credential is provided.
3. **No icon/splash PNG assets** — `app.json` references them; Expo falls back to defaults but the look is generic.
4. **No real device for Expo** — mobile UI was type-checked, not visually verified.

## Required User Actions
- [ ] Provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Provide `GEMINI_API_KEY`
- [ ] (Optional) Test mobile in Expo Go on a phone
- [ ] (Optional) Provide a real icon/splash image

## Next Three Recommended Tasks (from IMPLEMENTATION_PLAN.md)
1. **Slice 3 — Data layer**: Define Supabase schema migrations (cases, grievances, evidence, ai_runs, citations) and repository pattern in backend. Add a local-dev fallback when Supabase creds are absent.
2. **Slice 1 continuation — Form plumbing**: Add React Hook Form + Zod to the `create` screen with bilingual validation copy; add TanStack Query for API state once backend endpoints exist.
3. **Slice 4 — AI integration**: Wire `GeminiClient` behind a typed interface in `apps/api/app/integrations/`. Pass `response_language` explicitly; verify generated text is in the requested language.

## Next Incomplete Milestone
**Slice 1 extension** → `Create a Case` form hardening (RHF + Zod, bilingual validation), then **Slice 3** (Supabase data layer).
