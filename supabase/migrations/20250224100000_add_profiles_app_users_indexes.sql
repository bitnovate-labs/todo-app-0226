-- =============================================================================
-- Indexes for profiles and app_users
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES
-- id: already indexed (primary key)
-- -----------------------------------------------------------------------------

-- Filter by role (e.g. list admins, role-based dashboards)
create index if not exists idx_profiles_role
  on public.profiles (role);

-- Lookup by phone (login, search, deduplication)
create index if not exists idx_profiles_phone_number
  on public.profiles (phone_number)
  where phone_number is not null;

-- Ordering / recent signups / analytics
create index if not exists idx_profiles_created_at
  on public.profiles (created_at desc);

-- -----------------------------------------------------------------------------
-- APP_USERS
-- profile_id: already indexed (primary key)
-- referral_code: already has unique constraint (unique index)
-- -----------------------------------------------------------------------------

-- Find users referred by a given profile (JOINs, referral trees)
create index if not exists idx_app_users_referred_by_profile_id
  on public.app_users (referred_by_profile_id)
  where referred_by_profile_id is not null;

-- Filter by status (active / suspended / deleted)
create index if not exists idx_app_users_status
  on public.app_users (status);

-- Ordering / recent signups / reports
create index if not exists idx_app_users_created_at
  on public.app_users (created_at desc);

-- Optional: composite for "active users ordered by created_at" (common list)
create index if not exists idx_app_users_status_created_at
  on public.app_users (status, created_at desc);
