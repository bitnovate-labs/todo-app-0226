import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
'';

/**
 * Creates a Supabase client for use in Next.js proxy. Refreshes session
 * and writes updated cookies to the response. Use this only in proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      '[Supabase] Missing env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local. See https://supabase.com/dashboard/project/_/settings/api'
    );
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Enhance cookie security: HttpOnly, Secure (in production), SameSite
          const isProduction = process.env.NODE_ENV === 'production';
          const secureOptions = {
            ...options,
            httpOnly: true, // Prevent JavaScript access (XSS protection)
            secure: isProduction, // Only send over HTTPS in production
            sameSite: 'lax' as const, // CSRF protection (lax allows top-level navigation)
          };
          response.cookies.set(name, value, secureOptions);
        });
      },
    },
  });

  // Refresh session if expired; updates cookies on response via onAuthStateChange
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /settings: redirect to sign-in if no session
  const isProtected = request.nextUrl.pathname.startsWith('/settings');
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up') ||
    request.nextUrl.pathname.startsWith('/reset-password');
  const isUpdatePassword = request.nextUrl.pathname.startsWith('/update-password');

  if (isProtected && !user) {
    const signIn = new URL('/sign-in', request.url);
    signIn.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
  // Don't redirect from update-password - recovery session may be in progress
  if (isAuthRoute && user && !isUpdatePassword) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
