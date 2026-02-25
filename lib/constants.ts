export const APP_NAME = "Todo PWA";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

// Supabase: use publishable key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
// Also supports NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY from dashboard.
// Fallback to anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) for backward compatibility.
// See https://supabase.com/dashboard/project/_/settings/api
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** App version for feedback context (optional env override) */
export const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0';
