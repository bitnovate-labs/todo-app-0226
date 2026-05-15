-- Optional short note per habit (user-editable in app).
alter table public.habits
  add column if not exists notes text;

comment on column public.habits.notes is 'Optional user note for the habit; null when empty.';
