-- Add NPS (Net Promoter Score) column for standard "would you recommend?" metric (0-10).
-- Optional: null when not collected.
alter table public.feedbacks
  add column if not exists nps_score int check (nps_score between 0 and 10);
