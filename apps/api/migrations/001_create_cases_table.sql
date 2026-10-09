-- migration: 001_create_cases_table
-- description: Create the cases table for Upbhokta Setu.
-- run this in the Supabase SQL Editor or via supabase CLI.
-- Supabase Storage bucket "evidence" should be created separately
-- (not via migration — use supabase storage.createBucket in the dashboard or CLI).

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  product_name text not null check (length(product_name) <= 200),
  seller_name text not null check (length(seller_name) <= 200),
  purchase_date date not null,
  amount_inr numeric(12, 2) not null check (amount_inr >= 0),
  problem_category text not null
    check (problem_category in (
      'defective', 'not_delivered', 'service_quality',
      'refund_issue', 'fraud', 'other'
    )),
  description text not null check (length(description) <= 2000),
  desired_resolution text not null
    check (desired_resolution in (
      'refund', 'replacement', 'repair', 'other'
    )),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cases_created_at on cases (created_at desc);
create index if not exists idx_cases_status on cases (status);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_cases_updated_at
  before update on cases
  for each row execute function set_updated_at();

-- enable Row Level Security (RLS)
alter table cases enable row level;

-- service_role can do anything (backend inserts/selects)
create policy "service_role_full_access"
  on cases for all
  to service_role
  using (true)
  with check (true);

-- anon role has no access (mobile goes through the API)
create policy "anon_no_access"
  on cases for all
  to anon
  using (false);

comment on table cases is 'Consumer grievance cases created through Upbhokta Setu.';
