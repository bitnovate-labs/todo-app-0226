# Keeping Both Supabase Schemas in Sync

Use **version-controlled migrations** as the single source of truth so your **sandbox** and **production** Supabase projects always have matching schemas.

---

## 1. Single source of truth: `supabase/migrations/`

- All schema changes live as **timestamped SQL files** in `supabase/migrations/`.
- The same migration files are applied to **sandbox first**, then **production**.
- Never edit schema directly in the Supabase Dashboard for things you want to keep in sync; use migrations instead.

```
supabase/
  migrations/
    20250219000000_initial_profiles_and_app_users.sql   # initial schema
    20250220120000_add_avatar_url_to_profiles.sql      # example: future change
  schema.sql   # kept as reference; migrations are authoritative
  seed.sql     # optional seed data (e.g. for local/staging)
```

---

## 2. Workflow (order matters)

Always apply migrations in this order:

1. **Local** (optional): test with `supabase start` and `supabase db reset`.
2. **Sandbox**: apply to your staging Supabase project (e.g. when merging to `develop`).
3. **Production**: apply to production only after sandbox is tested (e.g. when merging to `main`).

So: **new migration → sandbox → verify → then production.**

---

## 3. Prerequisites: Supabase CLI

Install the CLI (one of the following):

```bash
# npm (project-local)
npm install -D supabase

# or Homebrew (macOS)
brew install supabase/tap/supabase
```

For CI, the GitHub Action `supabase/setup-cli@v1` installs it automatically.

---

## 4. One-time setup: existing projects already have schema

If you already ran `schema.sql` manually on production (or sandbox), the **migration history** in that project is empty, so the CLI will try to apply all migrations. That’s fine: the initial migration uses `create table if not exists` and `drop trigger if exists`, so it’s safe to run on an existing database. It will create anything missing and leave existing objects unchanged.

- **New projects**: run migrations as usual (see below); the first migration sets everything up.
- **Existing projects**: run `supabase db push` once per project; the initial migration is idempotent.

---

## 5. Applying migrations (manual)

You need the **project ref** (from the dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`) and the **database password** for each project.

### Option A: Push to a specific project (no linking)

Use the database URL so you don’t have to switch links. **Connection string format:**

```
postgresql://postgres.[project-ref]:[YOUR_PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Get the exact URL from: **Supabase Dashboard → Project Settings → Database → Connection string (URI)**. Then:

```bash
# Sandbox (run from repo root)
npx supabase db push --db-url "$STAGING_DB_URL"

# Production (only after sandbox is tested)
npx supabase db push --db-url "$PRODUCTION_DB_URL"
```

Store `STAGING_DB_URL` and `PRODUCTION_DB_URL` in env or a secret manager; never commit them.

### Option B: Link and push (one project at a time)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
# When prompted, enter the database password (or set SUPABASE_DB_PASSWORD)

npx supabase db push
```

To push to the other project, link again with that project’s ref and run `db push` again.

---

## 6. Creating a new migration

After changing schema (e.g. in local Supabase or by writing SQL), add a new migration file:

**Option A – Manual migration file**

```bash
npx supabase migration new add_avatar_url_to_profiles
```

This creates `supabase/migrations/<timestamp>_add_avatar_url_to_profiles.sql`. Edit it with your SQL, e.g.:

```sql
alter table public.profiles add column if not exists avatar_url text;
```

**Option B – From local DB (schema diff)**

If you already applied changes locally (e.g. via Studio or SQL):

```bash
npx supabase db diff -f add_avatar_url_to_profiles
```

Then commit the new file under `supabase/migrations/`.

**Apply locally to test**

```bash
npx supabase start
npx supabase db reset
```

Commit and push the migration file. Then apply to **sandbox** (manual or CI), test, and only then apply to **production**.

---

## 7. Automating with GitHub Actions (recommended)

So both projects stay in sync without manual steps:

- **Push to `develop`** → run migrations against the **sandbox** Supabase project.
- **Push to `main`** → run migrations against the **production** Supabase project.

Add the workflows under [.github/workflows/](.github/workflows/) (see below). Then add these **GitHub secrets**:

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `STAGING_PROJECT_ID` | Sandbox project ref (from dashboard URL) |
| `STAGING_DB_PASSWORD` | Sandbox project database password |
| `PRODUCTION_PROJECT_ID` | Production project ref |
| `PRODUCTION_DB_PASSWORD` | Production project database password |

The workflows use `supabase link` + `supabase db push` so both schemas are always updated from the same migration files.

---

## 8. Summary

| Goal | How |
|------|-----|
| Single source of truth | All schema in `supabase/migrations/` (timestamped SQL). |
| Same schema in both projects | Apply the same migrations to sandbox, then production. |
| Order | Always: local (optional) → sandbox → test → production. |
| New changes | Add a new migration file → push to sandbox → verify → then production. |
| Automation | Use GitHub Actions to run migrations on push to `develop` (sandbox) and `main` (production). |

This keeps both Supabase database schemas constantly updated and matching.
