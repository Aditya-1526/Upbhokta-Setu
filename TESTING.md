# TESTING.md — Upbhokta Setu

## Philosophy
- Write tests that verify behavior, not implementation details.
- Prioritize correctness over coverage percentage.
- Every slice in `IMPLEMENTATION_PLAN.md` ships with a passing smoke test.

## Mobile Tests
- **Unit**: Jest (bundled with Expo).
  - `useLanguage` hook: language read/write, fallback, persistence across mock re-mounts.
  - i18n parity test: every key in `en.json` exists in `hi.json` (and vice versa where required).
- **Component**: React Native Testing Library.
  - Language switcher renders both locale options.
  - Switching language updates visible text.
- **E2E**: Detox (future milestone).
- Run: `cd apps/mobile && npx jest`

## Backend Tests
- **Framework**: pytest + httpx (async client).
- Smoke test: `GET /health` returns 200 with `{"status": "ok"}`.
- Schema validation: test Pydantic schemas reject invalid input.
- AI service: test with mock Gemini client; verify `response_language` is forwarded.
- Run: `cd apps/api && pytest`

## Localization Parity Check
Automated check that every visible string key exists in both `en.json` and `hi.json`.

## CI
- GitHub Actions (future): run mobile lint + backend tests on every push to `main`.
- Lint: ESLint (mobile), ruff (backend).
