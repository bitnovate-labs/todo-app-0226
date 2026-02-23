# Security Analysis: Current User Data Exposure (`getMe()`)

## Is it safe to expose the `getMe()` response structure?

**Short answer:** Mostly safe, but there are privacy considerations for certain fields.

This app fetches the current user and profile via the **`getMe()` Server Action** (in `app/actions/auth.ts`), not a public API route. The same privacy and security principles apply to what that action returns.

---

## Security Protections ✅

### 1. **Authentication Required**
- `getMe()` returns **null** if not authenticated
- Only authenticated users receive their own data
- Session verified server-side (no client tokens)

### 2. **Row-Level Security (RLS)**
- Database policies ensure users can **only read their own profile**
- Even if code has bugs, RLS prevents data leakage
- Policy: `auth.uid() = id` (user can only access their own row)

### 3. **Server-Side Verification**
- Uses `createClient()` from `@/lib/supabase/server`
- Reads session from HTTP-only cookies
- No reliance on client-provided JWTs
- Server Actions use Next.js CSRF protection

---

## Privacy Considerations ⚠️

### Fields Currently Exposed:

| Field | Sensitivity | Risk Level | Recommendation |
|-------|-------------|------------|----------------|
| `user.id` | Low | ✅ Safe | UUID is not sensitive |
| `user.email` | Medium | ⚠️ Consider | PII, but often necessary for display |
| `user.email_confirmed_at` | Low | ✅ Safe | Account status info |
| `user.created_at` | Low | ✅ Safe | Account age |
| `profile.role` | **High** | ⚠️ **Consider** | **Reveals admin status** - security risk |
| `profile.display_name` | Low | ✅ Safe | Public-facing name |
| `profile.phone_number` | **High** | ⚠️ **Consider** | **PII** - sensitive personal data |
| `profile.profile_image_url` | Low | ✅ Safe | Public-facing image |
| `profile.created_at` | Low | ✅ Safe | Timestamp |
| `profile.updated_at` | Low | ✅ Safe | Timestamp |

---

## Security Concerns

### 1. **Phone Number Exposure** ⚠️

**Issue:** `phone_number` is **Personally Identifiable Information (PII)** and sensitive.

**Risk:**
- Phone numbers can be used for spam/phishing
- Privacy regulations (GDPR, CCPA) may require explicit consent
- If phone number is used for 2FA, exposing it could aid social engineering

**Recommendation:**
```typescript
// Option A: Don't include phone_number by default
.select("id, role, display_name, profile_image_url, created_at, updated_at")

// Option B: Only include if user explicitly requests it
// Add query parameter: ?include=phone_number

// Option C: Mask it
phone_number: profile.phone_number 
  ? `${profile.phone_number.slice(0, -4)}****` 
  : null
```

### 2. **Role Exposure** ⚠️

**Issue:** Exposing `role` reveals if user is an admin.

**Risk:**
- Attackers could target admin accounts
- Client-side code might leak this info (XSS, browser extensions)
- If role is used for authorization, exposing it could aid privilege escalation attempts

**Recommendation:**
- Don't expose role to the client in `getMe()`. Handle role checks server-side only (e.g. in Server Actions or Route Handlers).
- If you must expose role, document that it must not be used for client-side authorization.

### 3. **Email Exposure** ⚠️

**Issue:** Email is PII and can be used for spam/phishing.

**Risk:**
- Lower risk than phone number (emails are often public)
- Still subject to privacy regulations
- If email is used for password reset, exposing it could aid attacks

**Recommendation:**
- ✅ **Generally safe** if user needs to see their own email
- Consider masking: `user***@example.com` for display purposes
- Ensure email is only returned to the authenticated user (already protected)

---

## Best Practices Recommendations

### 1. **Minimize Data Exposure**

Only return fields that are **necessary** for the client. The current `getMe()` implementation already limits profile fields to `id, display_name, profile_image_url, created_at, updated_at` (no `phone_number` or `role`).

### 2. **Optional sensitive fields**

If you ever need to return sensitive fields (e.g. phone, role), add an optional parameter to `getMe()` and only include those fields when explicitly requested; avoid returning them by default.

### 3. **Separate Sensitive Data**

Keep sensitive fields out of the default `getMe()` response. If you need role/permissions for server-only logic, check them in Server Actions or Route Handlers, not by exposing them to the client.

### 4. **Add Response Filtering**

Filter sensitive fields based on context:

```typescript
// Don't expose phone_number to client by default
const safeProfile = {
  ...profile,
  phone_number: undefined, // Omit sensitive field
};
```

---

## Recommended Changes

### Option 1: Remove Sensitive Fields (Recommended)

```typescript
// Remove phone_number and role from default response
.select("id, display_name, profile_image_url, created_at, updated_at")
```

### Option 2: Make Fields Optional via Query Params

```typescript
// Only include sensitive fields if explicitly requested
const includeSensitive = searchParams.get('include') === 'sensitive';
const fields = includeSensitive 
  ? "id, role, display_name, phone_number, profile_image_url, created_at, updated_at"
  : "id, display_name, profile_image_url, created_at, updated_at";
```

### Option 3: Mask Sensitive Data

```typescript
return NextResponse.json({
  user: {
    id: user.id,
    email: user.email, // Consider masking: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    email_confirmed_at: user.email_confirmed_at,
    created_at: user.created_at,
  },
  profile: profile ? {
    ...profile,
    phone_number: profile.phone_number 
      ? `${profile.phone_number.slice(0, -4)}****` 
      : null,
  } : null,
});
```

---

## Summary

### ✅ **Safe to Expose:**
- `user.id` (UUID)
- `user.email` (if necessary for display)
- `user.email_confirmed_at`
- `user.created_at`
- `profile.display_name`
- `profile.profile_image_url`
- `profile.created_at`
- `profile.updated_at`

### ⚠️ **Consider Removing/Masking:**
- `profile.phone_number` - **PII, sensitive**
- `profile.role` - **Security risk (reveals admin status)**

### 🔒 **Security Protections Already in Place:**
- ✅ Authentication required (`getMe()` returns null if not authenticated)
- ✅ RLS ensures users can only read their own data
- ✅ Server-side session verification
- ✅ No client tokens; Server Actions use Next.js CSRF protection

**Recommendation:** Keep `phone_number` and `role` out of the default `getMe()` response (they are not returned by the current implementation). This follows the **principle of least privilege** - only expose what's necessary.
