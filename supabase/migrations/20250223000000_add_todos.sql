-- =============================================================================
-- Todos table: stores todo items per profile (auth user).
-- Links to profiles(id) = auth.users(id). Run after profiles/app_users exist.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TODOS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,

  title text not null,
  date date not null,
  completed boolean not null default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries: by profile and date (today, week, month)
create index if not exists idx_todos_profile_id_date
  on public.todos (profile_id, date);

create index if not exists idx_todos_profile_id_completed
  on public.todos (profile_id, completed);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.todos enable row level security;

create policy "Users can read own todos"
  on public.todos for select
  using (auth.uid() = profile_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- Trigger: set updated_at on row update
-- -----------------------------------------------------------------------------
create or replace function public.set_todos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at
  before update on public.todos
  for each row execute function public.set_todos_updated_at();

-- Optional: grant usage to authenticated (if using service role from app, skip)
-- grant select, insert, update, delete on public.todos to authenticated;
