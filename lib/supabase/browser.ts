import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/constants';

/**
 * Browser Supabase client. Use only in Client Components for auth actions
 * that must run in the browser (e.g. OAuth redirect handling). Prefer server
 * actions for sign-in/sign-up/sign-out. Session is stored in cookies by @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
