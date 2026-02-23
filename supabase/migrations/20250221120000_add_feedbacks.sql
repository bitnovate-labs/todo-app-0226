-- =============================================================================
-- Feedbacks table: user feedback for early app versions (objective, low-friction)
-- RLS: users can insert and read their own feedback only.
-- =============================================================================

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,

  -- Quick quant signals (1-5 unless noted)
  rating int check (rating between 1 and 5),
  friendly_score int check (friendly_score between 1 and 5),
  retention_intent int check (retention_intent between 1 and 5),
  pricing_score int check (pricing_score between 0 and 4),

  category text not null default 'general'
    check (category in ('bug', 'uiux', 'feature_request', 'performance', 'pricing', 'general')),

  message text,

  page text,
  event text,
  app_version text,
  platform text check (platform in ('web', 'ios', 'android')),

  meta jsonb not null default '{}'::jsonb,
  image_urls text[],

  created_at timestamptz default now()
);

alter table public.feedbacks enable row level security;

create policy "Users can insert own feedback"
  on public.feedbacks for insert
  with check (auth.uid() = profile_id);

create policy "Users can read own feedback"
  on public.feedbacks for select
  using (auth.uid() = profile_id);

-- Optional: no update/delete so feedback stays immutable for analysis
