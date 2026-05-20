-- Optional scheduled time for todos (local HH:mm; null = no specific time).
alter table public.todos
  add column if not exists time text;

comment on column public.todos.time is 'Optional local time HH:mm; null when unset.';
