-- =============================================================================
-- Todo PWA – Supabase schema and RLS (REFERENCE)
-- Authoritative schema is in supabase/migrations/. Use migrations to keep
-- sandbox and production in sync. See docs/DATABASE_MIGRATIONS.md.
-- You can still run this in SQL Editor for a one-off setup if needed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES TABLE (single source of identity + roles identifier)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- access control layer
  role text not null default 'user' check (role in ('user', 'admin')),
  -- shared identity fields
  display_name text,
  phone_number text,
  profile_image_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- SELECT: user can read own profile
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- UPDATE: user can update own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: only the user can insert their own profile (id = auth.uid())
-- Trigger also inserts via security definer, so profile row is created on sign-up
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- APP_USERS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.app_users (
  profile_id uuid primary key references public.profiles (id) on delete cascade,

  -- app-specific fields
  birthdate date,
  referral_code text unique,
  referred_by_profile_id uuid references public.profiles (id) on delete set null,

  -- gamification & points
  points_balance integer default 0 check (points_balance >= 0),
  total_points_earned integer default 0,

  -- lifecycle status
  status text default 'active'
    check (status in ('active', 'suspended', 'deleted')),
  deletion_reason text,
  deletion_reason_other text,
  deleted_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.app_users enable row level security;

-- SELECT: user can read own app_user row
create policy "Users can read own app_user"
  on public.app_users
  for select
  using (auth.uid() = profile_id);

-- UPDATE: user can update own app_user row
create policy "Users can update own app_user"
  on public.app_users
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- INSERT: user can insert own app_user row (e.g. when completing onboarding)
create policy "Users can insert own app_user"
  on public.app_users
  for insert
  with check (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- Trigger: create/upsert profile on auth.users insert
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 1. Create or update profile
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'user',
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, profiles.display_name),
    updated_at = now();

  -- 2. Create app_user row for this profile (idempotent)
  insert into public.app_users (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: backfill existing users (run once if you had users before this schema)
-- insert into public.profiles (id, role, display_name)
-- select id, 'user', coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1))
-- from auth.users
-- on conflict (id) do update set display_name = excluded.display_name, updated_at = now();
-- insert into public.app_users (profile_id)
-- select id from auth.users
-- on conflict (profile_id) do nothing;

-- -----------------------------------------------------------------------------
-- FEEDBACKS TABLE (early app feedback, optional)
-- Run this block if you use the profile feedback form. Or use migration 20250221120000_add_feedbacks.sql.
-- -----------------------------------------------------------------------------
-- create table if not exists public.feedbacks (
--   id uuid primary key default gen_random_uuid(),
--   profile_id uuid not null references public.profiles (id) on delete cascade,
--   rating int check (rating between 1 and 5),
--   friendly_score int check (friendly_score between 1 and 5),
--   retention_intent int check (retention_intent between 1 and 5),
--   pricing_score int check (pricing_score between 0 and 4),
--   category text not null default 'general'
--     check (category in ('bug', 'uiux', 'feature_request', 'performance', 'pricing', 'general')),
--   message text,
--   page text, event text, app_version text,
--   platform text check (platform in ('web','ios','android')),
--   meta jsonb not null default '{}'::jsonb,
--   image_urls text[],
--   created_at timestamptz default now()
-- );
-- alter table public.feedbacks enable row level security;
-- create policy "Users can insert own feedback" on public.feedbacks for insert with check (auth.uid() = profile_id);
-- create policy "Users can read own feedback" on public.feedbacks for select using (auth.uid() = profile_id);
