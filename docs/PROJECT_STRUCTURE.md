# Project structure

This document describes the directory layout and conventions so the codebase stays maintainable as features grow.

## Principles

- **Domain grouping**: Group by feature/domain (auth, layout, PWA), not by type (atoms/molecules).
- **Colocation**: UI used by only one feature lives in that feature’s folder. Shared UI lives in `components/ui/`.
- **Clear boundaries**: Prefer `@/components/<domain>/ComponentName` so imports show where code lives.

---

## Root layout

```
/app                    # Next.js App Router (routes, layouts, API)
/components             # React components, grouped by domain
/lib                    # Shared utilities, Supabase clients, auth helpers
/docs                   # Project documentation
/public                 # Static assets, PWA worker
```

---

## `/app`

- **Route groups** `(auth)`, `(protected)` etc. for layout segments without affecting the URL.
- **`actions/`** for Server Actions (e.g. `auth.ts`).
- **`api/`** for Route Handlers.
- **`layout.tsx`** and **`page.tsx`** follow Next.js conventions.

Import components from `@/components/<domain>/...`; avoid deep relative paths from app into components.

---

## `/components`

Components are grouped by **domain**. Each domain can have its own UI subcomponents used only there.

| Folder      | Purpose | When to add here |
|------------|---------|-------------------|
| **auth/**  | Sign-in, sign-up, password reset/update, session handlers | Anything tied to authentication flows |
| **layout/**| Navbar, bottom nav, shell, headers | Global or section layout and navigation |
| **welcome/** | Onboarding, landing, first-run experience | Unauthenticated landing / slides |
| **pwa/**   | Install prompt, service worker registration | PWA-only behavior |
| **ui/**    | Buttons, inputs, scroll behavior, shared primitives | Used by **two or more** domains |

### Adding new features

- New feature (e.g. “settings”) → add `components/settings/` and put all settings-related components there.
- Component-only used inside one feature → keep it in that feature’s folder (e.g. `auth/PasswordInput.tsx`).
- Component reused across features → move or add it under `components/ui/`.

### Import convention

- From **app** or another domain: `import { X } from '@/components/auth/X'`.
- Inside the **same domain**: `import { Y } from './Y'` (relative).

---

## `/lib`

- **supabase/** – `server.ts`, `browser.ts`, `middleware.ts` (proxy session), `constants` usage.
- **auth.ts** – `getUserOrNull()`, `requireUser()`, `logAuthEvent()`.
- **constants.ts** – App name, site URL, Supabase URL/keys (env-driven).
- **validations.ts** – Zod schemas for forms.

Add new modules (e.g. `lib/hooks/`, `lib/utils/`) when a clear shared need appears; keep domain logic in the feature that owns it.

---

## Summary

| Add something that…                    | Place it in…                |
|----------------------------------------|-----------------------------|
| Handles auth/session/sign-in/sign-up   | `components/auth/`          |
| Is shell/nav/header/footer             | `components/layout/`        |
| Is onboarding/landing                  | `components/welcome/`       |
| Is PWA-only (install, SW)              | `components/pwa/`           |
| Is shared across 2+ domains            | `components/ui/`            |
| Is new feature-specific UI             | New `components/<feature>/` |

This keeps the app scalable and consistent across future projects.
