import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/constants';

/**
 * Server Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses Next.js cookies() for session; do not use in proxy (use lib/supabase/middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Enhance cookie security: HttpOnly, Secure (in production), SameSite
            const isProduction = process.env.NODE_ENV === 'production';
            const secureOptions = {
              ...options,
              httpOnly: true, // Prevent JavaScript access (XSS protection)
              secure: isProduction, // Only send over HTTPS in production
              sameSite: 'lax' as const, // CSRF protection (lax allows top-level navigation)
            };
            cookieStore.set(name, value, secureOptions);
          });
        } catch {
          // Ignore in Server Component context (e.g. during render); middleware will refresh
        }
      },
    },
  });
}
