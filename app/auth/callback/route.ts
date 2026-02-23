import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Returns a safe redirect path: only allow relative paths (same-origin).
 * Prevents open redirect via ?next=https://evil.com
 */
function getSafeNext(next: string | null, origin: string): string {
  if (!next || next === '/') return '/';
  try {
    const resolved = new URL(next, origin);
    // Only allow same-origin (reject e.g. ?next=https://evil.com)
    if (resolved.origin !== origin) return '/';
    if (!resolved.pathname.startsWith('/')) return '/';
    return resolved.pathname + resolved.search;
  } catch {
    return '/';
  }
}

/**
 * GET /auth/callback — Handles email confirmation and other auth callbacks
 * Supabase redirects here after email confirmation with tokens in the URL
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');
  const safeNext = getSafeNext(nextParam, requestUrl.origin);

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(safeNext);
    }
  }

  redirect('/');
}
