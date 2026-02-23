import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthLogEvent =
  | "sign_in"
  | "sign_out"
  | "sign_up"
  | "reset_password_request"
  | "reset_password_confirm"
  | "session_refresh"
  | "auth_error";

/**
 * Log auth events (server-only). Extend to persist to a table if needed.
 */
export function logAuthEvent(event: AuthLogEvent, detail?: string) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[auth] ${ts} ${event}${detail ? ` ${detail}` : ""}`);
}

/**
 * Get current user or null. Use in Server Components / Server Actions.
 * Does NOT throw; use requireUser() when the route must be protected.
 * Wrapped in cache() so layout + page + BottomNav share one auth call per request (SSR).
 */
export const getUserOrNull = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    logAuthEvent("auth_error", error.message);
    return null;
  }
  return user;
});

/**
 * Get current user or redirect to sign-in. Use at the top of protected pages.
 */
export async function requireUser() {
  const user = await getUserOrNull();
  if (!user) {
    logAuthEvent('session_refresh', 'no session, redirecting to sign-in');
    redirect('/sign-in?next=' + encodeURIComponent('/'));
  }
  return user;
}
