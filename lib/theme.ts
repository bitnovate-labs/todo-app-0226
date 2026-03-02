/**
 * Single source of truth for theme values used outside Tailwind (e.g. manifest theme_color, viewport).
 * Tailwind semantic colors are defined in tailwind.config.ts and should match these where relevant.
 */
export const THEME = {
  /** Primary brand color (hex). Used for PWA theme_color, viewport themeColor, and Tailwind primary. */
  primary: '#2563eb',
} as const;
