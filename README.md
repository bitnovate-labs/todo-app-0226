# Todo PWA

A simple todo list PWA: add tasks, view by today or week, and track what's done. Install on your phone or use in the browser. Built with **Next.js 16** (App Router), **Supabase Auth**, and **PWA** support (offline shell, install prompt). Sessions are cookie-based; the server verifies every request.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** Auth + Postgres (`@supabase/ssr` + `@supabase/supabase-js`)
- **Auth**: HTTP-only cookie session, Server Actions, proxy session refresh
- **PWA**: Offline shell, install prompt, service worker

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**, choose org, name, database password, and region.
3. Wait for the project to be ready.

### 2. Get environment variables

1. In the Supabase dashboard, open **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  
     (Supabase is adopting the publishable key; you can find it in the API keys section. Legacy anon key is still supported as fallback if publishable is not set.)
3. Create `.env.local` in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Configure Auth redirect URLs (Supabase Dashboard)

1. **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production URL (e.g. `https://yourdomain.com`) or for local dev use `http://localhost:3000`.
3. Under **Redirect URLs**, add one entry per origin (the `**` wildcard covers all paths and query params):
   - Local: `http://localhost:3000/**`
   - Production: `https://yourdomain.com/**`  
   (For Vercel previews you can add `https://*-.vercel.app/**`; see [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).)

This allows sign-in, email confirmation, and password reset to land on your app.

### 4. Run the database schema

**Option A – One project (quick start):** In Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

**Option B – Sandbox + production (recommended):** Use Supabase CLI migrations so both projects stay in sync. See **[docs/DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)**. Run `npx supabase db push --db-url "<your-db-url>"` for each project, or use the provided GitHub Actions when you push to `develop` / `main`.

### 5. Install and run

When **reusing this codebase** (clone, copy, or use as template), remove the old build output so the app builds fresh for your environment:

```bash
rm -rf .next
npm install
npm run dev
```

If you’re already in a clean clone and haven’t run the app before, `npm install` and `npm run dev` are enough.

The default `dev` script uses **Webpack** (`next dev --webpack`) so the dev server stays light and won’t stall your machine. If you prefer Turbopack, use `npm run dev:turbo` (may use more CPU/memory).

Open [http://localhost:3000](http://localhost:3000). The home page `/` shows the **welcome** experience when signed out and the **home** content when signed in. Sign up, sign in, then open `/profile` to test the protected flow. Use **Reset password** and the email link to test reset → `/update-password`.

**Why do I see the previous user’s “Home” instead of the welcome page?**  
Session is stored in **cookies** for `localhost:3000`. When you reuse this repo or run `npm run dev` again, the browser still sends those cookies, so the server thinks you’re signed in and renders Home. To see the welcome page again: **sign out** from the app, or open the site in an **incognito/private** window, or **clear site data** for localhost:3000 (DevTools → Application → Storage → Clear site data).

---

## Project structure

Components are grouped by **domain** for maintainability as the app grows. See **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** for conventions and where to add new features. For a **full walkthrough** of every file and component (boilerplate or teaching), see **[docs/COMPREHENSIVE_GUIDE.md](docs/COMPREHENSIVE_GUIDE.md)**.

```
/app
  /(auth)           # sign-in, sign-up, reset-password, update-password
  /api              # for future API routes (webhooks, external API)
  layout.tsx, page.tsx, globals.css
  manifest.ts       # PWA manifest
/app/actions
  auth.ts           # Server Actions: signIn, signUp, signOut, resetPassword, updatePassword, getMe
/components
  /auth             # AuthForm, PasswordResetForm, UpdatePasswordForm, PasswordInput, session handlers
  /layout           # Navbar, NavbarTitle, BottomNav
  /welcome          # WelcomePage, WelcomeSlides
  /pwa              # PWAInstallPrompt, ServiceWorkerRegister
  /ui               # Shared primitives (e.g. ScrollToTop)
/lib
  supabase/
    browser.ts      # createBrowserClient (Client Components only when needed)
    server.ts       # createClient() for Server Components / Actions / API
    middleware.ts   # updateSession() for proxy
  auth.ts           # requireUser(), getUserOrNull(), logAuthEvent()
  constants.ts
proxy.ts            # Session refresh + protect /profile
/public
  sw.js             # service worker (offline shell)
  /icons            # add icon-192.png, icon-512.png for PWA
/supabase
  schema.sql        # profiles + RLS + trigger
  seed.sql          # optional
```

---

## Auth flows (summary)

| Flow                | How it works                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sign up**         | Form → Server Action → `supabase.auth.signUp`. If email confirmation is on, “check your email” is shown; trigger creates `profiles` row on insert into `auth.users`. |
| **Sign in**         | Form → Server Action → `supabase.auth.signInWithPassword` → redirect to `/` (home). Session stored in cookies.                                                       |
| **Sign out**        | Server Action → `supabase.auth.signOut` → redirect to `/`.                                                                                                           |
| **Reset password**  | Form → Server Action → `supabase.auth.resetPasswordForEmail` with `redirectTo: /auth/callback?next=/update-password`. User clicks link in email → `/auth/callback?code=...` → server exchanges code (cookies only), redirects to `/update-password`. |
| **Update password** | Form (on `/update-password`) → Server Action → `supabase.auth.updateUser({ password })` (recovery session in httpOnly cookies from callback).                                                                                              |
| **Protected route** | `/profile` uses `requireUser()`; no session → redirect to `/sign-in`. The home route `/` is the same URL for both guests (welcome) and signed-in users (home).       |
| **Current user (client)** | `getMe()` Server Action returns user + profile; used e.g. by analytics after sign-in/sign-up. Add API routes under `app/api/` when needed (webhooks, external clients). |

---

## Security checklist

How this app meets the stated security goals:

| Requirement                                  | Implementation                                                                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No tokens in localStorage/sessionStorage** | `@supabase/ssr` stores session in **cookies** only. Browser client uses the same cookie storage; no manual token storage.                                                                     |
| **HTTP-only, Secure cookies where possible** | Supabase SSR cookie options can be set for production (e.g. in middleware/server cookie options: `httpOnly`, `secure`, `sameSite`). In production, use HTTPS so cookies are sent with Secure. |
| **Privileged operations server-side**        | Sign-in, sign-up, sign-out, reset, update-password are **Server Actions** or server-side only. Credentials never handled in client JS.                                                        |
| **Server-side auth for data**                | `getMe()` and other Server Actions use `createClient()` and `supabase.auth.getUser()`. No client JWTs; session from cookies, validated with Supabase. Future API routes under `app/api/` should do the same. |
| **401/403 enforcement**                      | Unauthenticated requests → 401. RLS and server checks enforce authorization; mismatched access → 403.                                                                                         |
| **Password reset SSR-compatible and secure** | Reset link uses `redirectTo: /auth/callback?next=/update-password`. Callback exchanges code on the server and sets session in httpOnly cookies, then redirects to `/update-password`; no client storage. User sets new password via Server Action. |
| **Auth event logging**                       | `logAuthEvent()` in `lib/auth.ts` logs sign-in, sign-out, sign-up, reset, errors. Extend to persist to a table if needed.                                                                     |
| **HTTPS in production**                      | Assume HTTPS for production. Set `NEXT_PUBLIC_SITE_URL` to your `https://` URL so redirects and cookies are correct.                                                                          |

---

## Production deployment notes

For **Production vs Sandbox** (Git branches, GitHub, Vercel), see **[docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)**.

- Set **Site URL** and **Redirect URLs** in Supabase to your production domain.
- Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` so password reset and redirects use HTTPS.
- Ensure the app is served over **HTTPS** so cookies can be marked `Secure`.
- Optional: **Rate limiting** on auth endpoints (e.g. sign-in, sign-up, reset) — e.g. in middleware or with a provider (Upstash, Vercel KV).
- **CSP**: Add a Content-Security-Policy header (e.g. in `next.config.js` headers or middleware) to restrict script and connection sources. Start with report-only and tighten as needed.

---

## PWA

- **Manifest**: `app/manifest.ts` → served at `/manifest.webmanifest`.
- **Service worker**: `public/sw.js` caches the app shell for offline; registered from the client.
- **Install prompt**: `PWAInstallPrompt` shows when the browser supports `beforeinstallprompt`.
- **Icons**: Add `public/icons/icon-192.png` and `icon-512.png` (see `public/icons/README.txt`).

---

## Optional: auth event table

To persist auth events, add a table and call it from `logAuthEvent`:

```sql
create table if not exists public.auth_events (
  id bigserial primary key,
  event text not null,
  detail text,
  created_at timestamptz default now()
);

-- Restrict insert to service role or a server-side function only;
-- do not expose to anon.
```

Then in `lib/auth.ts`, optionally insert into `auth_events` using the server Supabase client (e.g. with service role if you need to log regardless of user).

---

## License

MIT.
