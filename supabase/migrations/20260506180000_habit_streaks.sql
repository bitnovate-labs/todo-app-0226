-- Cached streak metrics (recomputed from habit_checkins in app code; kept in sync on read/write).
alter table public.habits
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0;

comment on column public.habits.current_streak is 'Consecutive check-in days ending today (server-maintained)';
comment on column public.habits.longest_streak is 'Best consecutive-day run in history (server-maintained)';
