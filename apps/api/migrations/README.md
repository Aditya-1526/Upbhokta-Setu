# Database Migrations — Upbhokta Setu

This directory contains versioned SQL migrations for the Supabase project that backs the FastAPI backend.

## Layout

```
migrations/
├── 001_create_cases_table.sql   # cases table, indexes, RLS
└── README.md                    # this file
```

Migrations are numbered with a three-digit prefix and applied in lexical order.

## How to apply

### Option A — Supabase dashboard

1. Open your Supabase project at <https://supabase.com/dashboard>.
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the contents of the migration file.
5. Click **Run** (or press Ctrl-Enter).
6. Confirm the success message and the new `cases` table in **Table Editor**.

### Option B — Supabase CLI

```bash
# from the repository root, with the supabase CLI installed and logged in
supabase db push --db-url "$SUPABASE_DB_URL" -f apps/api/migrations/001_create_cases_table.sql
```

The CLI applies the file against the project's database. Confirm the table appears in the Supabase dashboard.

## What 001 does

* Creates a `cases` table with the fields the API schema needs.
* Enforces enum check constraints for `problem_category` and `desired_resolution`.
* Adds indexes on `created_at` and `status`.
* Creates a `set_updated_at` trigger so `updated_at` is refreshed on every UPDATE.
* Enables Row Level Security (RLS) and gives the `service_role` full access. The `anon` role is explicitly denied — the mobile app never talks to Supabase directly.

## Environment configuration

After the migration is applied, set the following in `apps/api/.env`:

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>            # public, not used by backend writes
SUPABASE_SERVICE_ROLE_KEY=<your-service-role> # server-side only, never sent to mobile
```

When both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, the API automatically selects the `SupabaseCaseRepository` at startup. If either is missing, the in-memory fallback is used and a warning is logged.

## Rollback

To roll back the migration, run:

```sql
drop table if exists cases cascade;
drop function if exists set_updated_at();
```

The repository code itself is independent of the database — switching back to the in-memory store is as simple as unsetting the environment variables and restarting the API.
