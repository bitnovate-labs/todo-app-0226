# Current User Data: Best Practices (`getMe()`)

This app uses a **Server Action** `getMe()` (in `app/actions/auth.ts`) to return the current user and profile to the client—for example, so the analytics layer can identify the user after sign-in/sign-up. There is no public `/api/me` route; using a Server Action improves security (CSRF protection, no guessable URL) while keeping the same data shape.

When you add **API routes** under `app/api/` (e.g. webhooks, external API), follow the practices below.

---

## What `getMe()` Provides

- **Returns:** `{ user: { id, email, created_at }, profile: { id, display_name, profile_image_url, ... } | null }` or `null` if not authenticated.
- **Used by:** `AuthEventTracker` (PostHog identify + sign-in/sign-up events), and can be used anywhere you need current user in client code.
- **Security:** Session from cookies, verified server-side; no client tokens. Same RLS and auth checks as before.

---

## When You Add API Routes

If you add Route Handlers under `app/api/` (e.g. webhooks, REST for mobile), apply these practices:

### 1. **Auth and profile data**
- Use `createClient()` from `@/lib/supabase/server` and `supabase.auth.getUser()`.
- Return **401** for unauthenticated requests; **500** for server/database errors.
- Return a consistent shape (e.g. `{ user, profile }` or `{ error, message }`).

### 2. **Error handling**
- Use proper HTTP status codes (401, 403, 500).
- Handle edge cases (e.g. profile row missing).
- Top-level try-catch to avoid leaking internal errors.

### 3. **Caching (for GET endpoints)**
- Use `Cache-Control: private, max-age=60, must-revalidate` for user-specific data so CDNs don’t cache it.

### 4. **Documentation**
- Add JSDoc or a short README for each route: purpose, response format, and auth requirements.

---

## Additional Best Practices (for API routes)

When you add Route Handlers under `app/api/`, consider:

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Example: Using a rate limiting library
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await rateLimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // ... rest of handler
}
```

### TypeScript Types

Define response types for your API (and optionally for `getMe()` return type):

```typescript
// types/api.ts
export type MeResponse = {
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
  };
  profile: {
    id: string;
    role: 'user' | 'admin';
    display_name: string | null;
    phone_number: string | null;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
  } | null;
};

export type ApiError = {
  error: string;
  message: string;
};
```

### Request Validation

If you add query parameters or request body later:

```typescript
import { z } from 'zod';

const querySchema = z.object({
  include: z.enum(['app_users', 'preferences']).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = querySchema.safeParse(Object.fromEntries(searchParams));
  
  if (!query.success) {
    return NextResponse.json(
      { error: 'Bad Request', message: query.error.message },
      { status: 400 }
    );
  }
  
  // Use query.data.include to conditionally fetch data
}
```

### Logging

Add structured logging for monitoring (e.g. in API routes or Server Actions):

```typescript
import { logAuthEvent } from '@/lib/auth';

// Log errors (important for debugging)
if (authError) {
  logAuthEvent('auth_error', authError.message);
}
```

---

## When to Use `getMe()` vs `getUserOrNull()`

| Use Case | Approach | Why |
|----------|----------|-----|
| **Client components** (e.g. analytics after redirect) | `getMe()` | Client can't call `getUserOrNull()`; Server Action is the bridge |
| **Server Components** | `getUserOrNull()` | No extra round-trip, direct server access |
| **Server Actions** | `getUserOrNull()` or `createClient()` + `getUser()` | Direct access, better performance |
| **API routes** (when you add them) | `createClient()` + `getUser()` | Same pattern; return 401 if no user |

**Rule of thumb:** Use `getMe()` when a client component needs current user data. Use `getUserOrNull()` (or `requireUser()`) in Server Components and Server Actions.

---

## Security Considerations

✅ **Already in place for `getMe()` and server-side auth:**
- Server-side session verification (no client tokens)
- RLS policies ensure users can only read their own profile
- Server Actions use Next.js CSRF protection

⚠️ **When you add API routes:**
- **Rate limiting** to prevent abuse
- **CORS headers** if called from other origins
- **Input validation** (e.g. Zod) for query/body params
- **Request logging** for monitoring
