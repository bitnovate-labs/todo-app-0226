# Design system & maintainability

## Single source of truth for theme colors

- **Tailwind**  
  Semantic colors are defined in **`tailwind.config.ts`** (e.g. `primary`, `primary-hover`, `danger`, `danger-muted`, `warning`). Use these in class names:
  - `bg-primary`, `hover:bg-primary-hover`, `focus:ring-primary-focus`
  - `bg-danger-muted`, `border-danger-border` for error backgrounds
  - `bg-amber-600` / `bg-warning-muted` for warning/priority UI

- **Non-Tailwind**  
  **`lib/theme.ts`** exports values for use outside CSS (e.g. `THEME.primary` for PWA `theme_color` and viewport). Keep this in sync with the primary color in `tailwind.config.ts`.

To rebrand: update `tailwind.config.ts` and `lib/theme.ts`; all components using semantic tokens or shared components will follow.

## Reusable UI components

Prefer these over repeating long class strings:

| Component | Path | Use for |
|-----------|------|--------|
| **Button** | `components/ui/Button.tsx` | Primary/secondary/danger/warning CTAs; supports `as="a"` for link-styled buttons. |
| **Alert** | `components/ui/Alert.tsx` | Error/success/info message boxes (replaces repeated `bg-red-50 border border-red-200`). |

When adding new screens, use `<Button variant="primary">` and `<Alert variant="error">` instead of duplicating button/alert styles. Existing pages can be migrated gradually.

## Avoiding redundancy

- **Buttons**  
  Use `<Button variant="primary" fullWidth>` (or `variant="secondary"`, `"warning"`) instead of repeating `className="... bg-blue-600 ..."`.

- **Alert boxes**  
  Use `<Alert variant="error">{message}</Alert>` instead of custom `div` with red/gray backgrounds.

- **Priority/emphasis**  
  Priority todos and “warning” actions use the same amber/warning palette; consider a shared class or component if the pattern grows (e.g. `PriorityBadge`).

- **Layout**  
  Centered content and max-width forms are repeated; consider a shared `PageCard` or layout wrapper if many pages share the same structure.

## Migrating existing code

Existing components still use raw Tailwind classes (e.g. `bg-blue-600`, `bg-red-50`). They work; migration is optional and can be done incrementally. New code should prefer semantic tokens and shared components.
