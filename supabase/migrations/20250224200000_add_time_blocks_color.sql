-- =============================================================================
-- Add color to time_blocks (user-selected block color)
-- =============================================================================

alter table public.time_blocks
  add column if not exists color text not null default 'blue';

comment on column public.time_blocks.color is 'User-selected color key: blue, emerald, amber, violet, rose, slate';
