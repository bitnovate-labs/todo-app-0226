-- Allow todos without a date (Box / unscheduled). Existing rows keep their date.
alter table public.todos
  alter column date drop not null;

comment on column public.todos.date is 'Date in YYYY-MM-DD; null means unscheduled (Box)';
