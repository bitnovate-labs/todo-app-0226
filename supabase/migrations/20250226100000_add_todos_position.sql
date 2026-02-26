-- Add position column for manual ordering of todos (per profile per date).
-- Lower position = higher in list. Order: date ASC, position ASC, created_at ASC.

alter table public.todos
  add column if not exists position integer not null default 0;

-- Backfill: assign position by created_at order within each (profile_id, date)
with ordered as (
  select id, row_number() over (partition by profile_id, date order by created_at asc) - 1 as rn
  from public.todos
)
update public.todos t
set position = o.rn
from ordered o
where t.id = o.id;

create index if not exists idx_todos_profile_date_position
  on public.todos (profile_id, date, position);
