# ARCHITECTURE.md — Upbhokta Setu

## High-level Architecture

```
┌──────────────────────────────────────────────┐
│                  Mobile App                   │
│          (Expo / React Native)                │
│  Expo Router · TypeScript · i18n (EN/HI)     │
│                                              │
│  Never calls Gemini directly.                │
│  Never holds service-role credentials.        │
└──────────────┬───────────────────────────────┘
               │ HTTPS (TanStack Query)
               │
┌──────────────▼───────────────────────────────┐
│               FastAPI Backend                 │
│   Pydantic · HTTPX · Structured logging       │
│                                              │
│  /health · /api/v1/...                       │
│  Calls Gemini from here only.                │
│  Stores evidence in Supabase Storage.         │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│              Supabase (PostgreSQL)             │
│   RLS · pgvector (future) · Storage           │
│   Schema: cases, grievances, evidence,        │
│           ai_runs, citations                  │
└──────────────────────────────────────────────┘
```

## Repository Structure

```
NLH2026/
├── apps/
│   ├── mobile/          # Expo + Expo Router
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── constants/
│   │   └── package.json
│   │
│   └── api/             # FastAPI
│       ├── app/
│       │   ├── routers/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── integrations/
│       │   ├── config.py
│       │   └── main.py
│       ├── tests/
│       ├── pyproject.toml
│       └── .env.example
│
├── LOCATION.md          # Curated official references
├── PROJECT_SPEC.md
├── PROJECT_STATE.md
├── IMPLEMENTATION_PLAN.md
├── CLAUDE.md            # Master instructions
├── README.md
└── .gitignore
```

## Key Principles
- **Modular monolith**: Single deployable unit per tier. No microservices.
- **No AI from mobile**: Mobile calls backend; backend mediates Gemini.
- **No service-role on mobile**: Supabase anon key only (read-only public data). Service role is backend-only.
- **TypeScript + Pydantic**: Shared validation discipline at both boundaries.
- **UTC timestamps**: All storage uses UTC; UI converts for display.
