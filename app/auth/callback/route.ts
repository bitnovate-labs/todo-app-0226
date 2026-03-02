import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/constants';

/**
 * Returns a safe redirect path: only allow relative paths (same-origin).
 * Prevents open redirect via ?next=https://evil.com
 */
function getSafeNext(next: string | null, origin: string): string {
  if (!next || next === '/') return '/';
  try {
    const resolved = new URL(next, origin);
    if (resolved.origin !== origin) return '/';
    if (!resolved.pathname.startsWith('/')) return '/';
    return resolved.pathname + resolved.search;
  } catch {
    return '/';
  }
}

/**
 * GET /auth/callback — Handles email confirmation and password reset (PKCE).
 * Supabase redirects here with ?code=...; we exchange on the server and redirect
 * with session cookies. Must use NextResponse.redirect() so Set-Cookie is sent
 * (redirect() from next/navigation does not include cookies set in Route Handlers).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  const safeNext = getSafeNext(requestUrl.searchParams.get('next'), requestUrl.origin);
  const cookieStore = await cookies();
  const cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        toSet.forEach((c) => cookiesToSet.push(c));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  const redirectUrl = new URL(safeNext, requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);
  const isProduction = process.env.NODE_ENV === 'production';

  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, {
      ...options,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}
