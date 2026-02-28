-- Add priority flag to todos. Priority todos are shown first and with highlight styling.

alter table public.todos
  add column if not exists priority boolean not null default false;

comment on column public.todos.priority is 'When true, todo is shown at top with highlight background';
