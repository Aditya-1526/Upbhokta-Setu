# Supabase Setup — Upbhokta Setu

This guide walks through creating a Supabase project, applying the
database migration, and configuring the FastAPI backend to use it.

The backend works without Supabase (in-memory fallback). Persistence
across restarts requires these steps.

## 1. Create a Supabase project

1. Sign in or sign up at <https://supabase.com/dashboard>.
2. Click **New project**.
3. Pick a project name (e.g. `upbhokta-setu-dev`), a strong database
   password, and a region close to your users.
4. Wait for the project to provision (1–2 minutes).
5. Once ready, copy the **Project URL** and the **service_role** key
   from **Project Settings → API**. The service_role key bypasses
   Row Level Security — it must **only** be used on the backend.

> **Never** put the service_role key in the mobile app, in client-side
> code, or in public repositories. It grants full table access.

## 2. Apply the database migration

Open the SQL Editor in the Supabase dashboard:

1. In the left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open `apps/api/migrations/001_create_cases_table.sql` from this
   repository, copy the entire contents, and paste into the editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. Confirm the success banner. The new `cases` table should appear
   under **Table Editor**.

The migration creates:

| Object | Purpose |
|--------|---------|
| `cases` table | Stores grievance cases with the same fields the API uses |
| Indexes on `created_at` and `status` | Faster lookups and ordering |
| `set_updated_at()` trigger | Refreshes `updated_at` on every UPDATE |
| Row Level Security policies | `service_role` has full access; `anon` is denied |

## 3. Verify the table

Run this in the SQL Editor to confirm the table is in place:

```sql
select column_name, data_type
from information_schema.columns
where table_name = 'cases'
order by ordinal_position;
```

You should see the columns: `id`, `product_name`, `seller_name`,
`purchase_date`, `amount_inr`, `problem_category`, `description`,
`desired_resolution`, `status`, `created_at`, `updated_at`.

## 4. Configure the backend environment

Edit `apps/api/.env` (create it from `.env.example` if it does not
exist). This file is git-ignored — keep it that way.

```bash
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>             # public; not used by backend writes
SUPABASE_SERVICE_ROLE_KEY=<your-service-role> # server-side only
```

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required for the
  backend to use Supabase.
- `SUPABASE_ANON_KEY` is reserved for future use (e.g. mobile direct
  reads). The backend never sends it to the mobile app.

## 5. Restart the backend

```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

On startup, the API logs either:

- `Using SupabaseCaseRepository at https://<your-project>.supabase.co` →
  persistence is active.
- `Supabase not configured — using InMemoryCaseRepository ...` →
  credentials are missing or empty. Check the `.env` file.

## 6. Smoke test

```bash
# Create a case
curl -X POST http://localhost:8000/api/v1/cases \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Test Product",
    "seller_name": "Test Seller",
    "purchase_date": "2025-06-01",
    "amount_inr": 100.0,
    "problem_category": "defective",
    "description": "Does not work.",
    "desired_resolution": "refund"
  }'

# List cases
curl http://localhost:8000/api/v1/cases
```

Open the Supabase dashboard → **Table Editor → cases** and confirm
the row appears. Restart the API and re-run `GET /api/v1/cases` —
the case should still be there.

## 7. Disable persistence (optional)

To switch back to the in-memory store, clear the two Supabase
variables in `.env` (or comment them out) and restart the API. The
code base does not change — the factory reads from environment at
startup.

## Rollback

To drop the table and trigger:

```sql
drop table if exists cases cascade;
drop function if exists set_updated_at();
```

## Security notes

- The service_role key is intentionally used for backend writes so the
  API can write without impersonating a logged-in user. It must stay
  server-side.
- The migration enables RLS and grants no access to the `anon` role.
  The mobile app never calls Supabase directly — it goes through the
  FastAPI backend, which owns authorization.
- See `apps/api/CLAUDE.md` and the repository `CLAUDE.md` for the
  full security and privacy rules.
