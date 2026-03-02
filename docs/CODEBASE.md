# Todo PWA – Codebase Documentation

This document describes the full codebase: structure, libraries, components, and key files. For a **comprehensive walkthrough** (every file, code-level explanations, flows, and teaching notes for using the repo as a boilerplate or teaching material), see **[COMPREHENSIVE_GUIDE.md](COMPREHENSIVE_GUIDE.md)**. For setup and auth flows see [README.md](../README.md). For project conventions see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

---

## Table of contents

1. [Tech stack & libraries](#tech-stack--libraries)
2. [Directory overview](#directory-overview)
3. [App (routes & pages)](#app-routes--pages)
4. [Server Actions](#server-actions)
5. [Components](#components)
6. [Hooks](#hooks)
7. [Lib (utilities & clients)](#lib-utilities--clients)
8. [Supabase & database](#supabase--database)
9. [Configuration files](#configuration-files)
10. [Public assets](#public-assets)
11. [Documentation & CI](#documentation--ci)

---

## Tech stack & libraries

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 3 |
| **Backend / Auth** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) – Auth + Postgres |
| **Data fetching** | TanStack React Query v5 |
| **Forms / validation** | Zod v4 |
| **Date picker** | react-day-picker v9 |
| **Drag and drop** | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| **Analytics** | PostHog (posthog-js), consent-gated |

**Scripts (package.json):**

- `npm run dev` – Next dev with Webpack
- `npm run dev:turbo` – Next dev with Turbopack
- `npm run build` – Production build
- `npm run start` – Production server
- `npm run lint` – Next lint

---

## Directory overview

```
Todo PWA/
├── app/                    # Next.js App Router: routes, layouts, actions
├── components/              # React components by domain
│   ├── analytics/           # PostHog consent, events, identify
│   ├── auth/                # Sign-in/up, password reset/update, session handlers
│   ├── feedback/            # Feedback drawer and form
│   ├── layout/              # Shell, nav, auth boundary, user context
│   ├── providers/           # QueryProvider, TodosPrefetcher
│   ├── pwa/                 # Install prompt, service worker, splash, orientation
│   ├── settings/            # Week start, lock rotation
│   ├── todos/               # Today list, week view, history, create form, time blocks
│   ├── ui/                  # Shared primitives (ScrollToTop, PreventSwipeBack)
│   └── welcome/             # Landing and onboarding slides
├── hooks/                   # useTodos, useTimeBlocks, useWeekStartsOn
├── lib/                     # Shared code: Supabase clients, auth, queries, analytics
├── public/                  # Static assets, PWA icons, service worker
├── supabase/                # Schema reference and migrations
├── docs/                    # Project documentation
├── .github/workflows/       # Supabase migration workflows (staging/production)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## App (routes & pages)

### Root

| File | Purpose |
|------|---------|
| **app/layout.tsx** | Root layout: metadata, viewport, PWA splash, PostHog, AnalyticsConsentGate, OrientationGate, AuthBoundary, ScrollToTop, PreventSwipeBack, PWAInstallPrompt, ServiceWorkerRegister, LockOrientation. Wraps content in a max-width shell. |
| **app/page.tsx** | Home: server-rendered. If user exists → `TodayTodoList`; else → `WelcomePage`. Wraps in `EmailConfirmationHandler`. |
| **app/providers.tsx** | Client provider: PostHog init, consent cookie, `PostHogPageView` (pageviews, time-on-page, session_end). Exports `acceptAnalyticsConsent`, `declineAnalyticsConsent`. |
| **app/error.tsx** | Next.js error boundary UI. |
| **app/globals.css** | Global styles, Tailwind, safe-area, create-todo calendar, loading animations. |
| **app/manifest.ts** | PWA manifest: name, start_url, display standalone, icons, theme/background, orientation portrait. |

### Auth routes (group `(auth)` – no segment in URL)

| Route | File | Purpose |
|-------|------|---------|
| **/sign-in** | app/(auth)/sign-in/page.tsx | Sign-in form (AuthForm). |
| **/sign-up** | app/(auth)/sign-up/page.tsx | Sign-up form (AuthForm). |
| **/reset-password** | app/(auth)/reset-password/page.tsx | Request password reset (PasswordResetForm). |
| **/update-password** | app/(auth)/update-password/page.tsx | Set new password after reset link. If URL has `?code=`, exchanges on the server (cookies only); then checks session (getUserOrNull) and renders UpdatePasswordForm or “request new link” error. |

### Auth callback

| Route | File | Purpose |
|-------|------|---------|
| **/auth/callback** | app/auth/callback/route.ts | PKCE callback for email confirmation and password reset; exchanges `?code=` for session on the server, sets httpOnly cookies on `NextResponse.redirect()` (so cookies are sent), then redirects to `?next=` path (e.g. `/update-password`). |

### Dashboard & feature routes

| Route | File | Purpose |
|-------|------|---------|
| **/week** | app/week/page.tsx | Week view of todos (rendered via DashboardContent when shell is used). |
| **/history** | app/history/page.tsx | History of completed todos (DashboardContent). |
| **/timeblock** | app/timeblock/page.tsx | Time blocks for the day (DashboardContent). |
| **/todo/new** | app/todo/new/page.tsx | New todo form; redirects unauthenticated to sign-in. Uses layout app/todo/new/layout.tsx. |
| **/settings** | app/settings/page.tsx | Settings (week start, lock rotation, etc.); uses app/settings/layout.tsx. |
| **/profile** | app/profile/page.tsx | Protected profile page (requireUser). |
| **/privacy** | app/privacy/page.tsx | Privacy policy / info page. |

---

## Server Actions

All under **app/actions/**.

| File | Exports | Purpose |
|------|---------|---------|
| **auth.ts** | signIn, signUp, signOut, resetPassword, updatePassword, getMe | Auth: credentials, reset flow, update password, get current user + profile. |
| **todos.ts** | addTodoAction, toggleTodoAction, updateTodoDateAction, updateTodoTitleAction, deleteTodoAction, reorderTodosAction | CRUD and reorder todos; use server Supabase client. |
| **time-blocks.ts** | Server actions for time blocks (CRUD). | Create, read, update, delete time blocks. |
| **feedback.ts** | Submit feedback (and optional NPS) to `feedbacks` table; optional image upload. | In-app feedback and NPS. |

---

## Components

### analytics/

| Component | Purpose |
|-----------|---------|
| **AnalyticsConsentGate** | Renders consent banner or PostHog pageview/session logic after consent; wraps app when consent is handled. |
| **AuthEventTracker** | Tracks sign-in/sign-up (e.g. identify, analytics events) after auth. |
| **ConsentBanner** | UI for accept/decline analytics consent; calls accept/decline from providers. |
| **IdentifyUser** | Identifies user to PostHog when signed in (e.g. after getMe). |

### auth/

| Component | Purpose |
|-----------|---------|
| **AuthForm** | Sign-in / sign-up form (email + password); uses Server Actions. |
| **EmailConfirmationHandler** | Handles “confirm your email” state and resend. |
| **PasswordInput** | Reusable password input with show/hide toggle. |
| **PasswordResetForm** | “Send reset link” form; calls resetPassword action. |
| **RecoverySessionHandler** | Handles recovery session: hash/query token flows (setSession, verifyOtp); defers `?code=` to server (full-page load to `/update-password?code=...`). Accepts `hasSessionFromServer` when session was already verified server-side (httpOnly cookies). |
| **SignOutForm** | Sign-out button; calls signOut action. |
| **UpdatePasswordForm** | Form on /update-password to set new password. |

### feedback/

| Component | Purpose |
|-----------|---------|
| **FeedbackDrawer** | Drawer that opens feedback form (e.g. from nav). |
| **FeedbackForm** | Rating, NPS, category, message, optional images; submits via feedback action. |

### layout/

| Component | Purpose |
|-----------|---------|
| **AuthBoundary** | Resolves user server-side; if signed in wraps with InitialDataFetcher + QueryProvider (with prefetched todos/time blocks); if not, minimal shell + QueryProvider for guests. |
| **BottomNav** | Bottom navigation (Home, Week, History, Time, Add, Settings); uses DashboardPathnameContext for instant tab switch. |
| **BottomNavLinks** | Link list for bottom nav items (icons + labels). |
| **BottomNavShell** | Shell layout for dashboard: Navbar, MainContent, BottomNav. Used when user is signed in. |
| **DashboardContent** | Renders TodayTodoList, WeekView, HistoryView, or TimeBlockView based on pathname (from DashboardPathnameContext). |
| **DashboardPathnameContext** | Client context for “dashboard pathname” so tab switches don’t require a server round-trip; provides pathname and setPathname. |
| **InitialDataFetcher** | Fetches initial todos and today’s time blocks on server, passes to QueryProvider and UserContext. |
| **Navbar** | Top bar with back/title; uses NavbarTitle. |
| **NavbarTitle** | Title text per route (e.g. “Home”, “Week”, “New todo”). |
| **ShellFallback** | Loading fallback for Suspense (matches shell layout). |
| **UserContext** | React context for current user (from InitialDataFetcher); provides user object to children. |

### providers/

| Component | Purpose |
|-----------|---------|
| **QueryProvider** | TanStack Query client; accepts initialTodos, initialTimeBlocks, initialTimeBlocksDate, userId to seed cache and avoid loading flashes. |
| **TodosPrefetcher** | Prefetches todo query on navigation where useful (e.g. link hover). |

### pwa/

| Component | Purpose |
|-----------|---------|
| **LockOrientation** | Applies lock-orientation (portrait) when enabled in settings. |
| **OrientationGate** | Wraps app content; can show a gate or message if orientation is wrong (e.g. “rotate to portrait”). |
| **PWAInstallPrompt** | Listens for beforeinstallprompt; shows install prompt UI when available. |
| **ServiceWorkerRegister** | Registers public/sw.js for offline shell. |
| **SplashScreen** | SplashHideTrigger: hides the static splash (#app-splash) after mount + short delay. |

### settings/

| Component | Purpose |
|-----------|---------|
| **LockRotationSetting** | Toggle for locking screen rotation (portrait). |
| **WeekStartSetting** | Setting for week start (Sunday/Monday); uses useWeekStartsOn. |

### todos/

| Component | Purpose |
|-----------|---------|
| **CreateTodoForm** | Form to add a todo: title, “today” vs “select date”, DayPicker; submit calls addTodo and redirects to /. |
| **HistoryView** | List of completed todos; re-add to a date or undo complete. |
| **TimeBlockView** | Day view of time blocks; add/edit/delete blocks, color picker. |
| **TodayTodoList** | Today’s todos: list, toggle complete, delete, reorder (dnd-kit), edit title; “Add todo” link. |
| **WeekView** | Week agenda: todos by day; move between days, toggle complete. |

### ui/

| Component | Purpose |
|-----------|---------|
| **PreventSwipeBack** | Prevents iOS swipe-back gesture where it would break UX. |
| **ScrollToTop** | Scrolls to top on route change (e.g. for nav). |

### welcome/

| Component | Purpose |
|-----------|---------|
| **WelcomePage** | Landing when signed out: slides + sign-in/sign-up entry. |
| **WelcomeSlides** | Onboarding slides content and description. |

---

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| **useTodos** | hooks/useTodos.ts | Todo list from React Query; mutations: addTodo, toggleTodo, deleteTodo, updateTodoDate, updateTodoTitle, reorderTodos; getByDate; mounted, loading, error. Uses todosQueryKey and fetchTodos from lib. |
| **useTimeBlocks** | hooks/useTimeBlocks.ts | Time blocks for a given date; mutations for add/update/delete block; loading and per-mutation pending flags. |
| **useWeekStartsOn** | hooks/useWeekStartsOn.ts | Week start preference (e.g. Sunday/Monday); persisted; returns [value, setValue, mounted]. |

---

## Lib (utilities & clients)

### Supabase

| File | Purpose |
|------|---------|
| **lib/supabase/server.ts** | createClient() for Server Components, Server Actions, API routes; reads cookies. |
| **lib/supabase/browser.ts** | createBrowserClient() for Client Components that need Supabase. |
| **lib/supabase/middleware.ts** | updateSession() for middleware: refresh session and protect routes (e.g. /profile). |

### Auth & app config

| File | Purpose |
|------|---------|
| **lib/auth.ts** | getUserOrNull(), requireUser(), logAuthEvent(); uses cached server client. |
| **lib/constants.ts** | APP_NAME, SITE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_VERSION. |
| **lib/validations.ts** | Zod schemas for forms (e.g. sign-in, sign-up, password). |

### Data types & queries

| File | Purpose |
|------|---------|
| **lib/todos.ts** | Todo type; dateKey(), todayKey(), addDaysToDateKey(); formatDateDDMMMFromDate, dayNameFromDate; week helpers (getCurrentWeekStart, weekDatesForWeek); WeekStartsOn. |
| **lib/todos-query.ts** | todosQueryKey(), fetchTodos (calls server/DB); used by useTodos and prefetcher. |
| **lib/time-blocks.ts** | TimeBlock type; TIME_BLOCK_COLOR_KEYS; isValidTimeBlockColor. |
| **lib/time-blocks-query.ts** | timeBlocksQueryKey(), fetch logic for time blocks. |
| **lib/query-client.ts** | makeQueryClient() for TanStack Query (stale time, etc.). |

### Analytics

| File | Purpose |
|------|---------|
| **lib/analytics/consent.ts** | getConsentFromCookie(), setConsentCookie(), hasConsentAnswer(). |
| **lib/analytics/events.ts** | ANALYTICS_EVENTS (e.g. SESSION_START, HOME_VIEWED, SESSION_END). |
| **lib/analytics/track.ts** | trackEvent() – sends to PostHog when consented. |

### Other

| File | Purpose |
|------|---------|
| **lib/orientation.ts** | Helpers for screen orientation (lock/unlock, portrait check). |

---

## Supabase & database

### Schema (reference)

- **supabase/schema.sql** – Profiles, app_users, RLS, trigger (handle_new_user). Optional commented feedbacks block.
- **supabase/schema_todos_full.sql** – Full reference including todos table and RLS.

### Migrations (supabase/migrations/)

Applied in order by timestamp; use with Supabase CLI or GitHub Actions (see docs/DATABASE_MIGRATIONS.md and docs/ENVIRONMENTS.md).

| Migration | Purpose |
|-----------|---------|
| 20250219000000_initial_profiles_and_app_users.sql | profiles, app_users, RLS, handle_new_user trigger. |
| 20250221120000_add_feedbacks.sql | feedbacks table. |
| 20250221140000_add_feedbacks_nps.sql | NPS/feedback extensions. |
| 20250221150000_storage_feedback_images.sql | Storage for feedback images. |
| 20250223000000_add_todos.sql | todos table + RLS. |
| 20250224000000_add_time_blocks.sql | time_blocks table. |
| 20250224100000_add_profiles_app_users_indexes.sql | Indexes on profiles/app_users. |
| 20250224200000_add_time_blocks_color.sql | time blocks color support. |
| 20250226100000_add_todos_position.sql | position column on todos for ordering. |

### Other

- **supabase/seed.sql** – Optional seed data.

---

## Configuration files

| File | Purpose |
|------|---------|
| **next.config.js** | reactStrictMode; turbopack root; headers for /sw.js and /manifest.webmanifest. |
| **tsconfig.json** | Strict TypeScript; path alias `@/*` → project root; Next plugin. |
| **tailwind.config.ts** | Tailwind theme, content paths. |
| **postcss.config.js** | PostCSS with Tailwind and autoprefixer. |
| **.gitignore** | Standard Next/Node ignore. |

---

## Public assets

| Path | Purpose |
|------|---------|
| **public/icon-192.png** | PWA icon 192×192. |
| **public/icon-512.png** | PWA icon 512×512. |
| **public/icons/** | Extra icons; README.txt. |
| **public/sw.js** | Service worker: caches app shell for offline. |

---

## Documentation & CI

### Docs (docs/)

| Document | Purpose |
|----------|---------|
| **CODEBASE.md** | This file – codebase, components, libs, files. |
| **PROJECT_STRUCTURE.md** | Conventions, domain grouping, where to add features. |
| **README.md** | Setup, stack, auth flows, security, PWA, deployment. |
| **DATABASE_MIGRATIONS.md** | How to run and manage Supabase migrations. |
| **ENVIRONMENTS.md** | Sandbox vs production (branches, GitHub, Vercel). |
| **RENDERING.md** | SSR, streaming, first paint, loading behavior. |
| **API_SECURITY.md** | API and auth security practices. |
| **API_BEST_PRACTICES.md** | API design and usage. |
| **FEEDBACK.md** | Feedback feature (form, NPS, storage). |
| **ANALYTICS_DASHBOARD.md** | PostHog and analytics dashboard notes. |

### GitHub Actions

| Workflow | Purpose |
|----------|---------|
| **.github/workflows/supabase-staging.yaml** | Runs Supabase migrations for staging (e.g. on push to develop). |
| **.github/workflows/supabase-production.yaml** | Runs Supabase migrations for production (e.g. on push to main). |

---

## Data flow (summary)

1. **Auth**: Server reads session from cookies (getUserOrNull/requireUser). Sign-in/up/reset/update password via Server Actions; no tokens in localStorage.
2. **Todos**: Server Actions mutate Postgres; React Query (useTodos) holds client cache; InitialDataFetcher prefetches todos for signed-in user so first paint has data.
3. **Time blocks**: Same pattern with useTimeBlocks and time-blocks actions; initial blocks for “today” prefetched.
4. **Navigation**: Dashboard routes (/, /week, /history, /timeblock) use DashboardPathnameContext so tab switches are client-only and instant.
5. **PWA**: Manifest and service worker from app and public; install prompt and splash in layout; orientation lock optional from settings.

This document is the single reference for the Todo PWA codebase structure, components, libraries, and files. For changes over time, keep CODEBASE.md updated when adding routes, components, or lib modules.
