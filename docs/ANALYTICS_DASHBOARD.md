# PostHog MVP analytics: dashboard, session recordings, and events

This app sends essential events and user properties to PostHog when the user has accepted analytics. Use this guide to build a single **Key metrics** dashboard, enable **session recordings**, and understand the event catalog.

---

## 1. Create the Key metrics dashboard

1. In [PostHog](https://app.posthog.com) (or your self-hosted instance), go to **Dashboards** → **New dashboard**.
2. Name it **MVP Key metrics** (or similar).
3. Add the following insights (each as a new insight, then “Add to dashboard” → choose this dashboard).

### Active users (DAU / MAU)

- **Insight type:** Trends.
- **Series:** Unique users, event = “Any event” (or “$pageview”).
- **Interval:** Day.
- **Add a second series:** Unique users, same, interval = Month (for MAU).
- **Optional:** Add a calculated “Stickiness” or a single number for DAU and MAU.

### Retention (cohort analysis)

- **Insight type:** Retention.
- **First event:** e.g. `user_signed_up` or `$pageview` (first visit).
- **Return event:** e.g. `$pageview` or `user_signed_in` (return visit).
- **Retention type:** Retention (returning users by week/day).
- Use this to see if users come back after sign-up or first visit.

### Onboarding funnel (where users drop off)

- **Insight type:** Funnel.
- **Steps (in order):**
  1. `welcome_page_view`
  2. `welcome_steps_completed` OR `welcome_steps_skipped` (optional: two parallel paths or “either”)
  3. `user_signed_up` OR `user_signed_in`
  4. `home_viewed` (logged-in home)
- Name the funnel “Onboarding” and add it to the dashboard. Use breakdowns (e.g. by device) to find drop-off points.

### Top 10 events (what users do most)

- **Insight type:** Trends.
- **Series:** Total count, event = “Any event”.
- **Breakdown:** Event name (or “Event”).
- **Display:** Table or bar chart, limit to top 10 by volume.
- This shows the most common actions (e.g. `$pageview`, `home_viewed`, `user_signed_in`, `feedback_submitted`).

### Optional: single-number tiles

- **DAU:** Trends, Unique users, Last 1 day, show as big number.
- **MAU:** Trends, Unique users, Last 30 days, show as big number.
- **Sign-ups (7d):** Trends, Count, event = `user_signed_up`, Last 7 days.

---

## 2. Session recordings

- In PostHog: **Project settings** (or **Product settings**) → **Session recordings**.
- Ensure **Session recording** is **enabled**.
- In this app, recording is enabled in code with masking: `maskAllInputs: true` and `maskTextSelector: '*'` so form and text content are masked by default.
- Use **Session recordings** in the left nav to watch sessions; filter by event (e.g. `checkout_failed`, `error_occurred`) or person to find friction.

---

## 3. Events and user properties reference

### Events implemented in the app

| Event | When it’s sent |
|-------|-------------------------------|
| `onboarding_completed` | Placeholder: call `trackOnboardingCompleted()` when you add onboarding. |
| `user_signed_up` | After sign-up redirect to home (`?from=sign_up`). |
| `user_signed_in` | After sign-in redirect to home (`?from=sign_in`). |
| `user_signed_out` | When user clicks Sign out (profile). |
| `welcome_page_view` | When the welcome (unauthenticated home) is shown. |
| `welcome_steps_completed` | When user taps “Get Started” on last welcome slide. |
| `welcome_steps_skipped` | When user taps “Skip” on welcome. |
| `pwa_install_viewed` | When the PWA install prompt is shown. |
| `pwa_install_installed` | When user accepts install. |
| `pwa_install_dismissed` | When user clicks “Not now”. |
| `feedback_clicked` | When user opens the feedback drawer. |
| `feedback_viewed` | When the feedback drawer is visible. |
| `feedback_submitted` | When feedback form is submitted successfully. |
| `session_start` | When the app loads and consent was already given. |
| `session_end` | On tab hide or page unload (with optional `seconds_in_session`). |
| `app_opened` | Same load as `session_start`. |
| `time_on_page` | When navigating away (path + seconds on previous page). |
| `checkout_started` | Placeholder: call `trackCheckoutStarted()`. |
| `checkout_failed` | Placeholder: call `trackCheckoutFailed(reason)`. |
| `payment_success` | Placeholder: call `trackPaymentSuccess()`. |
| `payment_failed` | Placeholder: call `trackPaymentFailed(reason)`. |
| `subscription_completed` | Placeholder: call `trackSubscriptionCompleted()`. |
| `home_viewed` | When route is `/` (pageview). |
| `profile_viewed` | When route is `/profile`. |
| `error_occurred` | From global error boundary and optional `trackError(message, context)`. |
| `analytics_consent_accepted` | When user clicks Accept on the consent banner. |
| `reset_password_request` | When user submits the reset-password form (Send reset link). |
| `update_password_submit` | When user submits the update-password form (after reset link). |

### User properties (set via `identify`)

| Property | Description |
|----------|-------------|
| `email` | User email. |
| `signup_date` | Date of sign-up (YYYY-MM-DD). |
| `created_at` | Account creation timestamp. |
| `onboarding_completed` | Placeholder (false until you add onboarding). |
| `subscription_status` | Placeholder (e.g. `"none"`). |
| `plan_type` | Placeholder (e.g. `"free"`). |

---

## 4. Consent and privacy

- **Consent banner:** Shown until the user Accepts or Declines. Stored in cookie `analytics_consent` (true/false).
- **Opt-in only:** PostHog is initialized with `opt_out_capturing_by_default: true`; capturing runs only after Accept.
- **Privacy note:** See the in-app **Privacy** page (`/privacy`) and the short notice in the consent banner.

---

## 5. Placeholder events (for later)

When you add flows, call the helpers from `@/lib/analytics/track`:

- **Onboarding:** `trackOnboardingCompleted()` when the user finishes onboarding.
- **Checkout:** `trackCheckoutStarted()`, `trackCheckoutFailed(reason)`.
- **Payment:** `trackPaymentSuccess()`, `trackPaymentFailed(reason)`.
- **Subscription:** `trackSubscriptionCompleted()`.
- **Errors:** `trackError(message, context)` for non-fatal errors (e.g. validation, API errors).

These events are already defined and will appear in the Top 10 and funnels once you use them.
