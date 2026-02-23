-- =============================================================================
-- Full schema reference: profiles + app_users + todos
-- Use this in Supabase SQL Editor for a one-off setup, or follow migrations
-- in supabase/migrations/ for versioned deploys.
-- =============================================================================

-- =================================================================================
-- PROFILES TABLE (single source of identity + roles identifier)
-- =================================================================================

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

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- =================================================================================
-- APP_USERS TABLE
-- =================================================================================

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

create policy "Users can read own app_user"
  on public.app_users for select using (auth.uid() = profile_id);

create policy "Users can update own app_user"
  on public.app_users for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "Users can insert own app_user"
  on public.app_users for insert with check (auth.uid() = profile_id);

-- =================================================================================
-- TODOS TABLE
-- =================================================================================

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,

  title text not null,
  date date not null,
  completed boolean not null default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_todos_profile_id_date
  on public.todos (profile_id, date);

create index if not exists idx_todos_profile_id_completed
  on public.todos (profile_id, completed);

alter table public.todos enable row level security;

create policy "Users can read own todos"
  on public.todos for select using (auth.uid() = profile_id);

create policy "Users can insert own todos"
  on public.todos for insert with check (auth.uid() = profile_id);

create policy "Users can update own todos"
  on public.todos for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "Users can delete own todos"
  on public.todos for delete using (auth.uid() = profile_id);

-- Trigger: set todos.updated_at on update
create or replace function public.set_todos_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at
  before update on public.todos
  for each row execute function public.set_todos_updated_at();

-- =================================================================================
-- TRIGGER: create profile + app_user on sign-up (run after profiles & app_users exist)
-- =================================================================================

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
