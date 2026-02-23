-- =============================================================================
-- Next.js Auth PWA – Initial schema: profiles, app_users, RLS, trigger
-- Applied by Supabase CLI (supabase db push) to keep all environments in sync.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES TABLE (single source of identity + roles identifier)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  display_name text,
  phone_number text,
  profile_image_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- APP_USERS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.app_users (
  profile_id uuid primary key references public.profiles (id) on delete cascade,

  birthdate date,
  referral_code text unique,
  referred_by_profile_id uuid references public.profiles (id) on delete set null,

  points_balance integer default 0 check (points_balance >= 0),
  total_points_earned integer default 0,

  status text default 'active'
    check (status in ('active', 'suspended', 'deleted')),
  deletion_reason text,
  deletion_reason_other text,
  deleted_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.app_users enable row level security;

create policy "Users can read own app_user"
  on public.app_users for select using (auth.uid() = profile_id);

create policy "Users can update own app_user"
  on public.app_users for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "Users can insert own app_user"
  on public.app_users for insert with check (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- Trigger: create/upsert profile on auth.users insert
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
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
