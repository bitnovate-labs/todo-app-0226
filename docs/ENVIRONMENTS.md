# Production & Sandbox Environments

Common practice for running **Production** and **Sandbox** (staging/preview) using **Git**, **GitHub**, and **Vercel**.

---

## 1. Branch strategy

| Branch   | Purpose              | Deploys to      |
|----------|----------------------|-----------------|
| `main`   | Production-ready code| **Production**  |
| `develop`| Sandbox / staging    | **Preview** (sandbox) |

**Workflow:** Develop and test on `develop` → when ready, merge into `main` to release to production.

---

## 2. Git & GitHub setup

### 2.1 Initialize Git (if not already)

```bash
cd "/Users/apple/Desktop/Todo PWA"
git init
```

### 2.2 Create branches

```bash
# Commit your current work first
git add .
git commit -m "Initial commit"

# Create and switch to develop (sandbox branch)
git checkout -b develop
```

### 2.3 Add GitHub remote

1. Create a **new repository** on GitHub (e.g. `todo-pwa`).
2. Add it as `origin`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 2.4 Push both branches

```bash
# Push main (production branch)
git checkout main
git push -u origin main

# Push develop (sandbox branch)
git checkout develop
git push -u origin develop
```

### 2.5 Default branch on GitHub

- In GitHub: **Settings → General → Default branch**  
  - You can keep `main` as default so new clones and PRs target production.
- Use **Pull Requests** from `develop` → `main` when promoting sandbox to production.

---

## 3. Vercel setup (Production + Preview)

Vercel gives you:

- **Production:** deploys from `main` (one production URL).
- **Preview (sandbox):** deploys from every other branch (e.g. `develop`) and every PR, with unique URLs.

### 3.1 Connect the project

1. Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub”).
2. **Add New Project** → **Import** your GitHub repo.
3. Configure:
   - **Framework Preset:** Next.js (auto-detected).
   - **Root Directory:** `./` (or your app root).
   - **Build Command:** `next build` (default).
   - **Output Directory:** `.next` (default).

### 3.2 Production vs Preview

- **Production deployment**
  - **Branch:** set to `main`.
  - **Domain:** your main domain (e.g. `yourapp.vercel.app` or custom).
- **Preview deployments**
  - Every push to `develop` (or any non-production branch) and every Pull Request gets a **Preview** URL, e.g. `yourapp-xxx-develop.vercel.app`.
  - Use the `develop` preview as your **sandbox** URL.

No extra “sandbox project” is required unless you want a separate Vercel project; one project with `main` = Production and `develop` = Preview is the common approach.

### 3.3 Optional: assign a stable Preview URL for sandbox

- In Vercel: **Project → Settings → Git**:
  - Under **Preview Branches**, you can set a branch (e.g. `develop`) to get a consistent preview URL pattern.
- Or use **Deployments** and bookmark the latest `develop` preview URL as “sandbox”.

---

## 4. Supabase projects (separate for each environment)

**Yes, 2 separate Supabase projects are recommended and common practice.**

### Why separate projects?

- **Complete isolation:** No risk of accidentally affecting production data
- **Safe testing:** Test migrations, schema changes, and features without risk
- **Different quotas:** Can use different Supabase tiers/plans per environment
- **Independent scaling:** Production and sandbox can scale independently
- **Official recommendation:** Supabase's [official documentation](https://supabase.com/docs/guides/deployment/managing-environments) recommends separate projects for staging and production

### Setup

1. **Production Supabase project**
   - Create in [supabase.com/dashboard](https://supabase.com/dashboard)
   - Use for production environment
   - Get credentials: **Project Settings → API** → Project URL and keys

2. **Sandbox/Staging Supabase project**
   - Create a **second** Supabase project (separate from production)
   - Use for sandbox/preview environment
   - Get credentials: **Project Settings → API** → Project URL and keys

### Configure Supabase redirect URLs

In **both** Supabase projects:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**:
   - **Production project:** your production domain (e.g. `https://yourapp.vercel.app`)
   - **Sandbox project:** your preview/sandbox domain (e.g. `https://yourapp-xxx-develop.vercel.app`)
3. Under **Redirect URLs**, add:
   - Production project: `https://yourapp.vercel.app/**`, `https://yourapp.vercel.app/update-password`
   - Sandbox project: `https://yourapp-xxx-develop.vercel.app/**`, `https://yourapp-xxx-develop.vercel.app/update-password`
   - Also add `http://localhost:3000/**` for local development in both

---

## 5. Environment variables (per environment)

- **Production:** set in Vercel for **Production** (pointing to production Supabase project).
- **Sandbox/Preview:** set in Vercel for **Preview** (pointing to sandbox Supabase project).

### Steps

1. Vercel → your project → **Settings → Environment Variables**.
2. Add each variable and choose:
   - **Production** only (e.g. production Supabase credentials).
   - **Preview** only (e.g. sandbox Supabase credentials).
   - Or both, with different values.

Use the same variable names in code (e.g. `NEXT_PUBLIC_SUPABASE_URL`); Vercel injects the right value per deployment type.

### Example configuration

| Variable                              | Production (main)                    | Preview (develop/sandbox)            |
|---------------------------------------|--------------------------------------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`            | `https://xxx-prod.supabase.co`       | `https://xxx-staging.supabase.co`    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| Production project publishable key    | Sandbox project publishable key      |

**Never commit real secrets;** use Vercel environment variables (and optionally `.env.local` for local dev only; keep it in `.gitignore`).

---

## 6. Day-to-day workflow

### Develop and test in sandbox

```bash
git checkout develop
# ... make changes ...
git add .
git commit -m "feat: add something"
git push origin develop
```

- Vercel builds and deploys a **Preview** from `develop`.
- Open the Preview URL from Vercel dashboard (or your bookmarked sandbox URL) and test.

### Release to production

When sandbox looks good:

**Option A – Merge via GitHub (recommended)**

1. Open a **Pull Request**: `develop` → `main` on GitHub.
2. Review, then merge.
3. Vercel automatically deploys `main` to **Production**.

**Option B – Merge locally**

```bash
git checkout main
git merge develop
git push origin main
```

Again, Vercel deploys `main` to Production.

### Keep develop in sync (after releasing)

```bash
git checkout develop
git merge main
git push origin develop
```

---

## 7. Summary checklist

- [ ] Git repo initialized; `main` and `develop` exist.
- [ ] GitHub repo created; `main` and `develop` pushed; default branch set.
- [ ] Vercel project connected to the GitHub repo.
- [ ] Production deploys from `main`; Preview (sandbox) from `develop` (and other branches/PRs).
- [ ] **Two Supabase projects created:** one for production, one for sandbox.
- [ ] Supabase redirect URLs configured in both projects (production and preview domains).
- [ ] Environment variables set in Vercel for Production and Preview (pointing to respective Supabase projects).
- [ ] **Schema in sync:** use [docs/DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) — migrations in `supabase/migrations/` applied to sandbox first, then production (manually or via GitHub Actions).
- [ ] Workflow: develop on `develop` → test on Preview URL → merge to `main` for production.

---

## 8. Quick reference

| Action              | Command / place                    |
|---------------------|------------------------------------|
| Work on sandbox     | `git checkout develop` → code → push |
| Sandbox URL         | Vercel → Deployments → latest from `develop` |
| Release to prod     | PR `develop` → `main` and merge (or merge locally and push `main`) |
| Production URL      | Vercel Production domain           |
| Supabase projects   | **2 separate projects:** one for production, one for sandbox |
| Env vars            | Vercel → Settings → Environment Variables (Production vs Preview) |
| Schema sync         | **Migrations:** `supabase/migrations/` → apply to sandbox, then production — see [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) |

This follows the common practice: **one repo, two branches (main + develop), one Vercel project with Production (main) and Preview/sandbox (develop and PRs), and two Supabase projects (one per environment)**.
