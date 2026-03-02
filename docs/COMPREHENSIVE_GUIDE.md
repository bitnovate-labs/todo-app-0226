# Todo PWA – Comprehensive Guide

This guide explains the **entire codebase** so you can:

- **Use it as a boilerplate** for new Next.js projects (auth, PWA, forms, data layer).
- **Teach or learn** how a production-style Next.js app is structured and how each part works.

For quick reference, see [CODEBASE.md](CODEBASE.md) and [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md). For setup and auth flows, see [README.md](../README.md).

---

## Table of contents

1. [Who this is for](#1-who-this-is-for)
2. [How to use this repo](#2-how-to-use-this-repo)
3. [Tech stack and scripts](#3-tech-stack-and-scripts)
4. [High-level architecture](#4-high-level-architecture)
5. [Directory and file reference](#5-directory-and-file-reference)
6. [What each file does (code-level)](#6-what-each-file-does-code-level)
7. [Key flows (auth, data, PWA)](#7-key-flows-auth-data-pwa)
8. [Teaching notes and concepts](#8-teaching-notes-and-concepts)
9. [Where to go next](#9-where-to-go-next)

---

## 1. Who this is for

- **You want a starter** for a new app: Next.js App Router, Supabase auth (cookie-based), PWA, forms with Zod, React Query, optional analytics.
- **You’re learning Next.js** and want to see how routes, Server Components, Server Actions, and client state fit together.
- **You’re teaching** and need a single place that explains every folder, file, and important code path.

---

## 2. How to use this repo

### As a boilerplate

1. Clone or copy the repo; remove `.next` and run `npm install` and `npm run dev` (see [README.md](../README.md)).
2. Create a Supabase project, set env vars, run schema/migrations (see [README.md](../README.md) and [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)).
3. To rebrand: change `APP_NAME` and theme in `lib/constants.ts`, `lib/theme.ts`, and `tailwind.config.ts` (see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).
4. To add features: follow [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (domain folders under `components/`, Server Actions under `app/actions/`).

### As teaching material

- Walk through **Section 5** (directory map) and **Section 6** (file-by-file) in order.
- Use **Section 7** to trace “what happens when the user signs in” or “what happens when they add a todo.”
- Use **Section 8** for discussion points (SSR vs client, cookies vs localStorage, optimistic updates).

---

## 3. Tech stack and scripts

| Category        | Technology |
|----------------|------------|
| Framework      | Next.js 16 (App Router) |
| Language       | TypeScript 5 |
| UI             | React 19, Tailwind CSS 3 |
| Backend / Auth | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) – Auth + Postgres |
| Data fetching  | TanStack React Query v5 |
| Forms / validation | Zod v4 |
| Date picker    | react-day-picker v9 |
| Drag and drop | @dnd-kit/core, sortable, utilities |
| Analytics      | PostHog (consent-gated) |

**Scripts (package.json):**

- `npm run dev` – Next dev with Webpack (lighter on CPU).
- `npm run dev:turbo` – Next dev with Turbopack (faster, more CPU).
- `npm run build` – Production build.
- `npm run start` – Production server.
- `npm run lint` – Next lint.

---

## 4. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  - Cookies (session; no tokens in localStorage)                  │
│  - React Query cache (todos, time blocks)                       │
└───────────────────────────┬─────────────────────────────────────┘
                             │
┌───────────────────────────▼─────────────────────────────────────┐
│  Next.js (App Router)                                            │
│  - proxy/middleware: refresh Supabase session, protect /settings │
│  - Server Components: layout, page (getUserOrNull, decide view)  │
│  - Server Actions: auth, todos, time-blocks, feedback            │
│  - Route Handler: GET /auth/callback (exchange code → cookies)   │
└───────────────────────────┬─────────────────────────────────────┘
                             │
┌───────────────────────────▼─────────────────────────────────────┐
│  Supabase                                                        │
│  - Auth (email/password, reset, PKCE callback)                   │
│  - Postgres: profiles, todos, time_blocks, feedbacks             │
│  - RLS so each user only sees their own data                     │
└─────────────────────────────────────────────────────────────────┘
```

**Design choices:**

- **Session in cookies only** – So the server can validate every request; no JWT in localStorage.
- **Server Actions for mutations** – Sign-in, sign-up, add/toggle/delete todo, etc. All go through the server; client calls the action and React Query updates the cache.
- **Prefetched data** – For signed-in users, `InitialDataFetcher` loads todos and today’s time blocks on the server and passes them into `QueryProvider` so the first paint already has data (no loading flash).
- **Dashboard pathname in context** – Tabs (Home, Week, History, Time) switch by updating client context, so tab changes don’t require a server round-trip.

---

## 5. Directory and file reference

```
Todo PWA/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (metadata, splash, providers, shell)
│   ├── page.tsx                # Home: welcome or today list by auth
│   ├── globals.css             # Global + Tailwind + safe-area
│   ├── manifest.ts             # PWA manifest
│   ├── error.tsx               # Error boundary UI
│   ├── providers.tsx           # PostHog, consent, pageview
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # signIn, signUp, signOut, resetPassword, updatePassword, getMe
│   │   ├── todos.ts            # CRUD + reorder todos
│   │   ├── time-blocks.ts      # CRUD time blocks
│   │   └── feedback.ts         # Submit feedback (+ optional NPS/images)
│   ├── (auth)/                 # Route group (no URL segment)
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up/confirm/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── reset-password/sent/page.tsx
│   │   └── update-password/page.tsx
│   ├── auth/callback/route.ts  # GET: exchange ?code= for session, set cookies, redirect
│   ├── week/page.tsx           # Week view
│   ├── history/page.tsx        # History of completed todos
│   ├── timeblock/page.tsx      # Time blocks for the day
│   ├── todo/new/page.tsx       # New todo form
│   ├── todo/new/layout.tsx
│   ├── settings/page.tsx + layout.tsx
│   ├── profile/page.tsx        # Protected (requireUser)
│   └── privacy/page.tsx
├── components/
│   ├── analytics/              # PostHog consent, identify, events
│   ├── auth/                   # AuthForm, PasswordReset, UpdatePassword, session handlers
│   ├── feedback/               # FeedbackDrawer, FeedbackForm
│   ├── layout/                 # Navbar, BottomNav, AuthBoundary, InitialDataFetcher, etc.
│   ├── providers/              # QueryProvider, TodosPrefetcher
│   ├── pwa/                    # Install prompt, service worker, splash, orientation
│   ├── settings/               # WeekStartSetting, LockRotationSetting
│   ├── todos/                  # TodayTodoList, WeekView, HistoryView, CreateTodoForm, TimeBlockView
│   ├── ui/                     # Button, Alert, ScrollToTop, PreventSwipeBack, PullToRefresh
│   └── welcome/                # WelcomePage, WelcomeSlides
├── hooks/
│   ├── useTodos.ts             # React Query + mutations for todos
│   ├── useTimeBlocks.ts        # React Query + mutations for time blocks
│   └── useWeekStartsOn.ts      # Week start preference (persisted)
├── lib/
│   ├── supabase/               # server.ts, browser.ts, middleware.ts
│   ├── auth.ts                 # getUserOrNull, requireUser, logAuthEvent
│   ├── constants.ts            # APP_NAME, SITE_URL, Supabase env
│   ├── validations.ts          # Zod schemas (auth, feedback)
│   ├── theme.ts                # THEME.primary etc. (PWA/manifest)
│   ├── query-client.ts         # makeQueryClient()
│   ├── todos.ts                # Todo type, dateKey, week helpers
│   ├── todos-query.ts          # queryKey + fetch for todos
│   ├── time-blocks.ts          # TimeBlock type, colors
│   ├── time-blocks-query.ts    # queryKey + fetch for time blocks
│   ├── orientation.ts          # Lock/unlock screen orientation
│   └── analytics/              # consent, events, track
├── public/                     # sw.js, icons, static assets
├── supabase/                   # schema, migrations, seed
├── docs/                       # All documentation
├── proxy.ts                    # Session refresh + route protection (middleware logic)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Note on middleware:** Session refresh and route protection live in `lib/supabase/middleware.ts` and are invoked from `proxy.ts`. Next.js only runs middleware from a file named `middleware.ts` (or `middleware.js`) at the project root. To enable session refresh and route protection on every request, add a root file `middleware.ts` that contains: `export { proxy as default } from './proxy';` (or `import { proxy } from './proxy'; export default proxy;`). Then the existing `proxy.ts` and its `config.matcher` will apply to all matching requests.

---

## 6. What each file does (code-level)

### 6.1 App (root)

| File | What it does |
|------|----------------|
| **app/layout.tsx** | Root layout. Sets metadata (title, manifest, icons), viewport (theme color, no zoom). Injects a critical script to set background color before paint. Renders the PWA splash div (`#app-splash`), then `SplashHideTrigger` to hide it after mount. Wraps children in `PostHogProvider` → `ScrollToTop`, `PreventSwipeBack`, `OrientationGate` → a max-width shell with `Suspense` and `AuthBoundary` → then `PWAInstallPrompt`, `ServiceWorkerRegister`, `LockOrientation`, `AnalyticsConsentGate`. |
| **app/page.tsx** | Server Component. Calls `getUserOrNull()`. If user: renders `EmailConfirmationHandler` wrapping `TodayTodoList`. If no user: same handler wrapping `WelcomePage`. So one URL `/` shows either home or welcome. |
| **app/globals.css** | Tailwind directives, safe-area utilities, global styles, and any app-specific overrides (e.g. calendar, loading animations). |
| **app/manifest.ts** | Exports the PWA manifest: name, start_url, display standalone, icons, theme_color, background_color, orientation portrait. Used at `/manifest.webmanifest`. |
| **app/error.tsx** | Next.js error boundary: when a route throws, this UI is shown (e.g. retry or message). |
| **app/providers.tsx** | Client-side: initializes PostHog, reads/sets analytics consent cookie, renders `PostHogPageView` for pageviews/time-on-page/session_end. Exports `acceptAnalyticsConsent` and `declineAnalyticsConsent` for the consent banner. |

### 6.2 App – Auth routes

| File | What it does |
|------|----------------|
| **app/(auth)/sign-in/page.tsx** | Renders `AuthForm` in sign-in mode (email + password). Form posts to `signIn` Server Action; on success, redirect to `/`. |
| **app/(auth)/sign-up/page.tsx** | Renders `AuthForm` in sign-up mode (email, password, confirm, optional name). Uses `signUp` action; if email confirmation is required, redirects to `/sign-up/confirm`. |
| **app/(auth)/sign-up/confirm/page.tsx** | “Check your email” message after sign-up when confirmation is enabled. |
| **app/(auth)/reset-password/page.tsx** | Renders `PasswordResetForm` (email only). Action calls `resetPassword`; redirects to `/reset-password/sent`. |
| **app/(auth)/reset-password/sent/page.tsx** | “Check your email for reset link” message. |
| **app/(auth)/update-password/page.tsx** | Page after user clicks reset link. If URL has `?code=`, the page (or a server step) can exchange it server-side; then it checks session and shows `UpdatePasswordForm` or “request new link.” Uses Server Action `updatePassword` to set new password. |
| **app/auth/callback/route.ts** | GET handler. Reads `?code=` and optional `?next=`. Uses Supabase server client to `exchangeCodeForSession(code)`. Collects cookies via `setAll` into an array, then builds `NextResponse.redirect(safeNext)` and sets those cookies on the response (httpOnly, secure in prod, sameSite lax). So the browser never sees the token; session is cookie-only. `getSafeNext` prevents open redirect (only same-origin paths). |

### 6.3 App – Other routes

| File | What it does |
|------|----------------|
| **app/week/page.tsx** | Renders dashboard content for the week view (typically via a shared `DashboardContent` that reads pathname from context). |
| **app/history/page.tsx** | Same idea for history of completed todos. |
| **app/timeblock/page.tsx** | Same for time blocks view. |
| **app/todo/new/page.tsx** | New-todo form; redirects unauthenticated users to sign-in. Uses layout for nav/back. |
| **app/settings/page.tsx** | Settings (week start, lock rotation, etc.) with optional layout. |
| **app/profile/page.tsx** | Calls `requireUser()`; if no session, redirects to sign-in. Then renders profile UI. |
| **app/privacy/page.tsx** | Static privacy/info page. |

### 6.4 Server Actions (app/actions/)

| File | What it does |
|------|----------------|
| **auth.ts** | `getMe()`: server Supabase client → `getUser()` + profiles row; returns `{ user, profile }` or null. `signIn(formData)`: Zod validate email/password → `signInWithPassword` → redirect `/`. `signUp(formData)`: validate → `signUp` with `emailRedirectTo: SITE_URL/auth/callback`; if no session and user exists, handle “already exists”; if confirmation required, redirect `/sign-up/confirm`. `signOut()`: `signOut()` then redirect `/sign-in`. `resetPassword(formData)`: validate email → `resetPasswordForEmail` with `redirectTo: .../auth/callback?next=/update-password` → redirect `/reset-password/sent`. `updatePassword(formData)`: validate → `updateUser({ password })` → redirect `/`. All use `createClient()` from `lib/supabase/server` and log via `logAuthEvent`. |
| **todos.ts** | `getTodosForUser(userId)`: server-only fetch for layout/prefetch (no extra auth). `getTodosAction()`: gets user then `getTodosForUser`. `addTodoAction(title, date, priority)`: get user, insert row, return mapped Todo. `toggleTodoAction`, `updateTodoDateAction`, `updateTodoTitleAction`, `deleteTodoAction`, `updateTodoPriorityAction`: single-table updates by id. `reorderTodosAction(date, todoIds)`: sets `position` 0,1,2,… for each id for that date. All map DB rows to `Todo` (camelCase, createdAt number). |
| **time-blocks.ts** | Server actions for time blocks: get for user+date, create, update, delete. Same pattern: server client, auth check, table operations. |
| **feedback.ts** | Submit feedback (and optional NPS) to `feedbacks` table; optional image upload to storage. |

### 6.5 Lib – Supabase and auth

| File | What it does |
|------|----------------|
| **lib/supabase/server.ts** | `createClient()`: uses `cookies()` from Next.js, passes `getAll`/`setAll` to `createServerClient`. On setAll, sets httpOnly, secure (in prod), sameSite lax. Used in Server Components, Server Actions, Route Handlers — not in middleware. |
| **lib/supabase/browser.ts** | `createBrowserClient()` for Client Components that need to talk to Supabase directly (e.g. realtime). Most of the app uses Server Actions + server client. |
| **lib/supabase/middleware.ts** | `updateSession(request)`: builds Supabase server client using request cookies and response cookie setter. Calls `getUser()` to refresh session. Then: if path is protected (e.g. `/settings`) and no user → redirect to sign-in; if path is sign-in/sign-up and user exists → redirect `/`. Returns NextResponse. |
| **lib/auth.ts** | `getUserOrNull()`: wrapped in `cache()` so one request = one auth call across layout/page. Uses server client `getUser()`, returns user or null. `requireUser()`: calls getUserOrNull, if null redirects to sign-in. `logAuthEvent(event, detail?)`: console log; can be extended to write to a table. |

### 6.6 Lib – App config, validation, data types

| File | What it does |
|------|----------------|
| **lib/constants.ts** | `APP_NAME`, `SITE_URL` (env or window.origin), `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (with fallbacks), `APP_VERSION`. |
| **lib/validations.ts** | Zod schemas: `passwordSchema` (length, upper, lower, number, special), `emailSchema`, `signUpSchema`, `signInSchema`, `updatePasswordSchema`, `resetPasswordSchema`, feedback schemas (categories, NPS, etc.). |
| **lib/theme.ts** | Exports `THEME` (e.g. `primary`) for use in manifest/viewport and anywhere that can’t use Tailwind classes. |
| **lib/todos.ts** | `Todo` type. `dateKey(d)`, `todayKey()`, `addDaysToDateKey`. `formatDateDDMMMFromDate`, `dayNameFromDate`. `WeekStartsOn`, `getCurrentWeekStart`, `weekDatesForWeek` (or similar) for week view. |
| **lib/todos-query.ts** | `todosQueryKey(userId)`, `fetchTodos` (calls getTodosAction or server fetch). Used by `useTodos` and prefetcher. |
| **lib/time-blocks.ts** | `TimeBlock` type, color constants. |
| **lib/time-blocks-query.ts** | `timeBlocksQueryKey(userId, date)`, fetch for time blocks. |
| **lib/query-client.ts** | `makeQueryClient()` – creates TanStack Query client with default stale time etc. |
| **lib/analytics/consent.ts** | Read/set analytics consent cookie. |
| **lib/analytics/events.ts** | Event name constants for PostHog. |
| **lib/analytics/track.ts** | `trackEvent()` – sends to PostHog when consent given. |
| **lib/orientation.ts** | Helpers to lock/unlock screen orientation (portrait). |

### 6.7 Components – Layout

| Component | What it does |
|-----------|----------------|
| **AuthBoundary** | Async Server Component. Calls `getUserOrNull()` and `todayKey()`. If user: wraps children in Suspense → `InitialDataFetcher(user, today)`. If no user: renders minimal main + `QueryProvider(userId=null)` and children (welcome). So the whole app branches on auth inside Suspense. |
| **InitialDataFetcher** | Async. Fetches `getTodosForUser(user.id)` and `getTimeBlocksForUser(user.id, today)` in parallel. Then renders `QueryProvider` with initialTodos, initialTimeBlocks, userId; then `UserProvider`, `TodosPrefetcher`, `PostHogPageView`, `AuthEventTracker`, `IdentifyUser`, `Navbar`, `DashboardPathnameProvider`, main area with `MainContent(userId){children}`, `BottomNavShell` + `BottomNav`. This gives one place that loads initial data and wires the dashboard. |
| **DashboardContent** | Reads pathname from `DashboardPathnameContext`. Renders `TodayTodoList`, `WeekView`, `HistoryView`, or `TimeBlockView` depending on path. So “tab” content is client-switched without a new server request. |
| **DashboardPathnameContext** | React context holding current pathname (e.g. `/`, `/week`) and setter. BottomNav updates pathname on click; DashboardContent reads it to show the right view. |
| **Navbar** | Top bar with back (if applicable) and title. Uses `NavbarTitle` for route-specific titles. |
| **BottomNav** | Bottom tab bar (Home, Week, History, Time, Add, Settings). Uses `BottomNavLinks`; clicking a tab sets pathname in context and may use Next.js Link for real URL. |
| **BottomNavShell** | Wraps the bottom nav in the shell layout. |
| **UserContext** | Provides current user (id, email, etc.) from InitialDataFetcher to children. |
| **ShellFallback** | Loading UI shown while Suspense is pending (matches shell so layout doesn’t jump). |

### 6.8 Components – Auth

| Component | What it does |
|-----------|----------------|
| **AuthForm** | Shared form for sign-in/sign-up: email, password, (sign-up: confirm password, optional name). Uses Server Action (signIn or signUp), shows validation/error messages. |
| **PasswordInput** | Input type password with show/hide toggle. |
| **PasswordResetForm** | Email input; submits to `resetPassword` action. |
| **UpdatePasswordForm** | New password + confirm; submits to `updatePassword` action. |
| **EmailConfirmationHandler** | Wraps children; if user has “unconfirmed” state, shows “confirm your email” and resend option. |
| **RecoverySessionHandler** | Handles recovery (reset) session: hash fragment or query token. Can defer `?code=` to a full-page load to `/update-password?code=...` so the callback runs on the server and sets cookies. Accepts `hasSessionFromServer` when session was already set server-side. |
| **SignOutForm** | Button that calls `signOut` action. |

### 6.9 Components – Todos

| Component | What it does |
|-----------|----------------|
| **TodayTodoList** | Uses `useTodos(userId)`. Renders today’s todos (from `getByDate(todayKey())`). Each row: checkbox (toggle), title, menu (edit, delete, priority). Uses @dnd-kit for sortable list; on drag end calls `reorderTodos(date, newOrder)`. Priority items styled with amber. |
| **WeekView** | Week agenda: todos grouped by day; uses `useWeekStartsOn` for Sunday/Monday start. Can toggle complete and navigate between days. |
| **HistoryView** | List of completed todos; actions to “re-add” to a date or undo complete. |
| **CreateTodoForm** | Form: title, “today” vs “pick date” (DayPicker), optional priority. Submits via `addTodo` from useTodos then redirects to `/`. |
| **TimeBlockView** | Day view of time blocks; add/edit/delete blocks, color picker; uses `useTimeBlocks`. |

### 6.10 Components – Providers, PWA, UI, etc.

| Component | What it does |
|-----------|----------------|
| **QueryProvider** | Creates TanStack Query client (via `makeQueryClient`), seeds it with initialTodos and initialTimeBlocks if provided, wraps children in `QueryClientProvider`. |
| **TodosPrefetcher** | Prefetches todo query on navigation (e.g. link hover) so tab switch is instant. |
| **PWAInstallPrompt** | Listens for `beforeinstallprompt`; shows install banner when available. |
| **ServiceWorkerRegister** | Registers `public/sw.js` for offline shell. |
| **SplashScreen** | `SplashHideTrigger`: after mount + short delay, hides `#app-splash`. |
| **OrientationGate** | Wraps content; can show “rotate to portrait” or similar when orientation is wrong. |
| **LockOrientation** | Applies screen lock (portrait) when enabled in settings. |
| **AnalyticsConsentGate** | Shows consent banner or enables PostHog pageview/session after consent. |
| **ConsentBanner** | Accept/decline analytics; calls accept/decline from providers. |
| **AuthEventTracker** | After auth, tracks sign-in/sign-up (e.g. identify, events). |
| **IdentifyUser** | Identifies user in PostHog when signed in (getMe or user from context). |
| **WeekStartSetting** | Setting for week start (Sunday/Monday); uses `useWeekStartsOn`. |
| **LockRotationSetting** | Toggle for lock screen rotation. |
| **ScrollToTop** | Scrolls to top on route change. |
| **PreventSwipeBack** | Prevents iOS swipe-back where it would break UX. |
| **Button** | Reusable button (primary/secondary/danger, etc.); see DESIGN_SYSTEM. |
| **Alert** | Error/success/info message box. |
| **WelcomePage** | Landing when signed out: slides + sign-in/sign-up entry. |
| **WelcomeSlides** | Onboarding slides content. |
| **FeedbackDrawer** | Drawer that opens feedback form. |
| **FeedbackForm** | Rating, NPS, category, message, optional images; submits via feedback action. |

### 6.11 Hooks

| Hook | What it does |
|------|----------------|
| **useTodos(userId)** | `useQuery(todosQueryKey(userId), fetchTodos)`. Mutations (add, toggle, updateDate, updateTitle, updatePriority, delete, reorder) via Server Actions; each mutation uses optimistic updates (onMutate/onError/onSettled) and invalidates or updates cache. Returns todos, loading, error, addTodo, toggleTodo, deleteTodo, updateTodoDate, updateTodoTitle, updateTodoPriority, reorderTodos, getByDate, mounted. |
| **useTimeBlocks(userId, date)** | Same idea: query key by userId + date, fetch, mutations for add/update/delete; returns blocks and mutation helpers. |
| **useWeekStartsOn()** | Reads/sets week start preference (e.g. localStorage or server); returns [value, setValue, mounted]. |

### 6.12 Config and root

| File | What it does |
|------|----------------|
| **proxy.ts** | Exports `proxy(request)` that calls `updateSession(request)` from `lib/supabase/middleware.ts`. Config matcher excludes static files and images so only HTML/data requests hit it. For Next.js to run this on every request, the root middleware file must be named `middleware.ts` and export this (e.g. `export default proxy`). |
| **next.config.js** | reactStrictMode, turbopack root, headers for `/sw.js` (no cache, Service-Worker-Allowed) and `/manifest.webmanifest` (cache). |
| **tailwind.config.ts** | Content paths, theme (primary, danger, etc.); see DESIGN_SYSTEM. |
| **tsconfig.json** | Strict TypeScript; path alias `@/*` → project root. |
| **lib/theme.ts** | THEME.primary etc. for manifest/viewport; keep in sync with Tailwind. |

### 6.13 Supabase and public

- **supabase/schema.sql**, **schema_todos_full.sql**: Reference schema (profiles, app_users, todos, RLS, triggers).
- **supabase/migrations/*.sql**: Ordered migrations (profiles, feedbacks, todos, time_blocks, indexes, position, priority, etc.).
- **public/sw.js**: Service worker; caches app shell for offline.
- **public/icon-192.png**, **icon-512.png**: PWA icons.

---

## 7. Key flows (auth, data, PWA)

### 7.1 Sign-in flow

1. User opens `/sign-in`, fills email/password, submits.
2. Form calls `signIn` Server Action with FormData.
3. Action: Zod validate → `createClient()` → `signInWithPassword` → redirect `/`.
4. Supabase sets session; server client’s cookie `setAll` writes cookies on the response.
5. Next request: middleware (if used) refreshes session; layout/page get user and render home.

### 7.2 Password reset flow

1. User on `/reset-password` enters email; form calls `resetPassword` action.
2. Action: `resetPasswordForEmail(email, { redirectTo: SITE_URL/auth/callback?next=/update-password })` → redirect `/reset-password/sent`.
3. User clicks link in email → Supabase redirects to `/auth/callback?code=...&next=/update-password`.
4. Route Handler: `exchangeCodeForSession(code)`, collect cookies, `NextResponse.redirect(/update-password)` with Set-Cookie. No token in client.
5. User lands on `/update-password` with session in cookies; form submits `updatePassword` → `updateUser({ password })` → redirect `/`.

### 7.3 Add todo flow

1. User on home; `TodayTodoList` uses `useTodos(userId)`. Data came from InitialDataFetcher (prefetched) or from query fetch.
2. User goes to `/todo/new`, fills form, submits. Form calls `addTodo(title, date, priority)` from hook.
3. Hook runs `addTodoMutation.mutateAsync`; mutation calls `addTodoAction` Server Action.
4. Action: get user, insert into `todos`, return new Todo. Mutation `onSuccess` updates React Query cache with the new todo.
5. Redirect to `/`; home already has the new todo from cache (or refetches).

### 7.4 Toggle todo (optimistic update)

1. User clicks checkbox. `toggleTodo(id)` called.
2. `onMutate`: cancel in-flight queries, snapshot previous list, set cache to “todo id = completed”.
3. Server Action `toggleTodoAction(id, completed)` runs.
4. `onSuccess`: set cache again (same state). `onError`: restore snapshot, invalidate.
5. UI updates immediately; if the request fails, list rolls back.

### 7.5 PWA and first load

1. User opens app. Root layout streams; splash div is visible.
2. `SplashHideTrigger` mounts, short delay, then hides `#app-splash`.
3. Manifest and sw.js are loaded; service worker registers; install prompt may show later.
4. AuthBoundary in Suspense: getUserOrNull; if user, InitialDataFetcher loads todos + time blocks, then renders dashboard with QueryProvider and nav.

---

## 8. Teaching notes and concepts

- **Server vs Client Components** – Most of the app is Server Components (layout, page, AuthBoundary, InitialDataFetcher). Only interactive pieces are Client (“use client”): forms, drag-and-drop, QueryProvider, nav that sets pathname. Good place to show “no useState in layout.tsx” and “use client only where needed.”
- **Server Actions** – All mutations go through Server Actions. Show `'use server'`, FormData, redirect(), and how the client calls them like async functions and then updates React Query.
- **Cookies vs localStorage** – Session is in cookies so the server can read it on every request. Contrast with SPA + localStorage JWT (server can’t read it; need to send token in header).
- **Auth callback** – PKCE: Supabase redirects with `?code=`. Only the server exchanges code for session and sets httpOnly cookies. The client never sees the token. Good for “why we use a Route Handler and not client-side exchange.”
- **Optimistic updates** – useTodos toggle: onMutate updates cache, then server runs; onError rollback. Teaches React Query mutation lifecycle.
- **Prefetching** – InitialDataFetcher runs on the server and passes data into QueryProvider so the first paint has todos. Teaches “reduce loading flashes by seeding the client cache.”
- **Route groups** – `(auth)` groups sign-in/sign-up/reset/update pages without adding a URL segment. Good for “layout without changing the URL.”
- **Domain folders** – components grouped by feature (auth, layout, todos, pwa) not by type (atoms/molecules). See PROJECT_STRUCTURE.md.

---

## 9. Where to go next

- **Setup and auth** – [README.md](../README.md)
- **Conventions and where to add features** – [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick file/component list** – [CODEBASE.md](CODEBASE.md)
- **Theme and shared UI** – [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- **Database migrations** – [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
- **Environments (staging/production)** – [ENVIRONMENTS.md](ENVIRONMENTS.md)
- **Rendering and loading** – [RENDERING.md](RENDERING.md)
- **Security** – [API_SECURITY.md](API_SECURITY.md), [API_BEST_PRACTICES.md](API_BEST_PRACTICES.md)
- **Feedback feature** – [FEEDBACK.md](FEEDBACK.md)
- **Analytics** – [ANALYTICS_DASHBOARD.md](ANALYTICS_DASHBOARD.md)

Keeping this guide updated when you add routes, components, or flows will preserve its value as a boilerplate and teaching reference.
