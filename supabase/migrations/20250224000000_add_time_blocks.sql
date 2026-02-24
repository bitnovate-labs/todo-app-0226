-- =============================================================================
-- Time blocks table: stores time blocks per profile (auth user) and date.
-- Links to profiles(id) = auth.users(id). Run after profiles exist.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TIME_BLOCKS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,

  date date not null,
  start_time text not null,
  end_time text not null,
  label text not null default '',

  created_at timestamptz default now()
);

-- Index for common query: blocks by profile and date
create index if not exists idx_time_blocks_profile_id_date
  on public.time_blocks (profile_id, date);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.time_blocks enable row level security;

create policy "Users can read own time blocks"
  on public.time_blocks for select
  using (auth.uid() = profile_id);

create policy "Users can insert own time blocks"
  on public.time_blocks for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own time blocks"
  on public.time_blocks for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can delete own time blocks"
  on public.time_blocks for delete
  using (auth.uid() = profile_id);
