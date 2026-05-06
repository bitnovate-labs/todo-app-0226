-- Manual ordering for habits (same idea as todos.position).
alter table public.habits
  add column if not exists position integer;

with ranked as (
  select
    id,
    (row_number() over (partition by profile_id order by created_at asc) - 1)::integer as pos
  from public.habits
)
update public.habits h
set position = ranked.pos
from ranked
where h.id = ranked.id;

alter table public.habits alter column position set not null;
alter table public.habits alter column position set default 0;

create index if not exists idx_habits_profile_id_position
  on public.habits (profile_id, position);
