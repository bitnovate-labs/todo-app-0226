export const THEME_STORAGE_KEY = "todo-pwa-theme" as const;

export type ThemePreference = "light" | "dark" | "system";

export function getStoredThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function prefersDarkScheme(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

/** Effective scheme for display (after resolving "system"). */
export function resolveTheme(
  preference: ThemePreference,
): "light" | "dark" {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return prefersDarkScheme() ? "dark" : "light";
}

export function applyThemeClassToDocument(
  preference: ThemePreference,
): "light" | "dark" {
  const resolved = resolveTheme(preference);
  if (typeof document === "undefined") return resolved;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}
