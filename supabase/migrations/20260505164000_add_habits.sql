-- =============================================================================
-- Habits and habit check-ins
-- =============================================================================

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_habits_profile_id_created_at
  on public.habits (profile_id, created_at);

create table if not exists public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists idx_habit_checkins_profile_id_date
  on public.habit_checkins (profile_id, date);

create index if not exists idx_habit_checkins_habit_id_date
  on public.habit_checkins (habit_id, date);

alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;

create policy "Users can read own habits"
  on public.habits for select
  using (auth.uid() = profile_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = profile_id);

create policy "Users can read own habit checkins"
  on public.habit_checkins for select
  using (auth.uid() = profile_id);

create policy "Users can insert own habit checkins"
  on public.habit_checkins for insert
  with check (auth.uid() = profile_id);

create policy "Users can delete own habit checkins"
  on public.habit_checkins for delete
  using (auth.uid() = profile_id);
