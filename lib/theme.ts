/**
 * Single source of truth for theme values used outside Tailwind (e.g. manifest theme_color, viewport).
 * Tailwind semantic colors are defined in tailwind.config.ts and should match these where relevant.
 */
export const THEME = {
  /** Primary brand color (hex). Used for PWA theme_color, viewport themeColor, and Tailwind primary. */
  primary: "#2563eb",
} as const;

/** Browser chrome / PWA status bar when UI is light. */
export const THEME_COLOR_LIGHT = "#f2f3f5";

/** Browser chrome / PWA status bar when UI is dark. */
export const THEME_COLOR_DARK = "#0c0c0f";
